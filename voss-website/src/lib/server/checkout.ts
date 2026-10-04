import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { database, databaseConfigured, type Database, type DatabaseClient } from './database';

export class CheckoutError extends Error { constructor(message: string, public status = 400) { super(message); } }
export const PROVINCES = ['Punjab'];
export type CartLine = { slug: string; colour: string; quantity: number };
export type Customer = { name: string; phone: string; email: string; address: string; city: string; province: string; postcode: string; notes: string };
export type PricedLine = CartLine & { name: string; colourName: string; image: string; unitPrice: number };
export type Quote = { items: PricedLine[]; subtotal: number; delivery: number; total: number; freeDelivery: boolean; remaining: number };
export type Receipt = { reference: string; subtotal: number; delivery: number; total: number; freeDelivery: boolean };

export function settings() {
  const fee = process.env.VOSS_DELIVERY_FEE_PKR;
  const deliveryFee = fee !== undefined && /^\d+$/.test(fee) ? Number(fee) : null;
  const configured = databaseConfigured() && process.env.VOSS_CHECKOUT_ENABLED === 'true' && process.env.VOSS_PAYMENT_METHOD === 'cod'
    && (deliveryFee === null || deliveryFee <= 10000) && process.env.VOSS_DELIVERY_CITY === 'Lahore';
  return { enabled: configured, deliveryFee, payment: 'cod' as const };
}
export function cartInput(value: unknown): CartLine[] {
  if (!Array.isArray(value) || !value.length || value.length > 50) throw new CheckoutError('Choose at least one bag (maximum 50 selections).');
  const merged = new Map<string, CartLine>();
  for (const item of value) {
    if (!item || typeof item.slug !== 'string' || typeof item.colour !== 'string' || !/^[a-z0-9-]{1,80}$/.test(item.slug) || !/^[a-z0-9-]{1,40}$/.test(item.colour) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) throw new CheckoutError('Please check your bag quantities and colours.');
    const key = `${item.slug}:${item.colour}`;
    const quantity = (merged.get(key)?.quantity ?? 0) + item.quantity;
    if (quantity > 20) throw new CheckoutError('A maximum of 20 of each colour can be ordered.');
    merged.set(key, { slug: item.slug, colour: item.colour, quantity });
  }
  return [...merged.values()].sort((a, b) => `${a.slug}:${a.colour}`.localeCompare(`${b.slug}:${b.colour}`));
}
export function customerInput(value: unknown): Customer {
  if (!value || typeof value !== 'object') throw new CheckoutError('Add your delivery details.');
  const obj = value as Record<string, unknown>;
  function field(key: string, min: number, max: number) {
    const v = typeof obj[key] === 'string' ? (obj[key] as string).trim().replace(/\s+/g, ' ') : '';
    if (v.length < min || v.length > max) throw new CheckoutError(`Please check your ${key}.`);
    return v;
  }
  const phone = field('phone', 10, 20).replace(/[\s()-]/g, '').replace(/^\+92|^0092/, '0');
  if (!/^03\d{9}$/.test(phone)) throw new CheckoutError('Enter a Pakistani mobile number, for example 0300 1234567.');
  const email = field('email', 0, 120);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new CheckoutError('Please check your email address.');
  const province = field('province', 3, 40);
  const city = field('city', 2, 80);
  if (city.toLowerCase() !== 'lahore' || province !== 'Punjab') throw new CheckoutError('We currently deliver within Lahore only. Please enter a Lahore delivery address.');
  const postcode = field('postcode', 0, 5);
  if (postcode && !/^\d{5}$/.test(postcode)) throw new CheckoutError('Enter a five-digit postal code or leave it blank.');
  return { name: field('name', 2, 80), phone, email, address: field('address', 10, 300), city: 'Lahore', province, postcode, notes: field('notes', 0, 400) };
}
async function quoteWith(client: DatabaseClient, cart: CartLine[], deliveryFee: number | null): Promise<Quote> {
  const items: PricedLine[] = [];
  for (const line of cart) {
    const { rows } = await client.query<{ name: string; price_pkr: number; colour_name: string; white_url: string }>(
      `SELECT p.name, p.price_pkr, v.colour_name, i.white_url FROM voss_products p
       JOIN voss_variants v ON v.product_slug=p.slug
       JOIN voss_images i ON i.product_slug=p.slug AND i.colour_key=v.colour_key AND i.position=0
       WHERE p.slug=$1 AND v.colour_key=$2 AND p.active AND v.active`, [line.slug, line.colour]);
    if (!rows[0]) throw new CheckoutError('One of your selections is unavailable. Please update your bag.');
    const row = rows[0]; items.push({ ...line, name: row.name, colourName: row.colour_name, image: row.white_url, unitPrice: row.price_pkr });
  }
  const { rows: promos } = await client.query<{ used: number; maximum: number }>("SELECT used, maximum FROM voss_promotions WHERE code='FIRST30'");
  if (!promos[0]) throw new Error('VOSS_DATABASE_NOT_MIGRATED');
  const remaining = Math.max(0, promos[0].maximum - promos[0].used);
  if (remaining === 0 && deliveryFee === null) throw new CheckoutError('The first 30 free-delivery orders have been claimed. Please contact VOSS on WhatsApp to confirm delivery for your address before ordering.', 409);
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const delivery = remaining > 0 ? 0 : deliveryFee!;
  return { items, subtotal, delivery, total: subtotal + delivery, freeDelivery: remaining > 0, remaining };
}
export async function quote(cart: CartLine[], db?: Database, fee?: number | null) {
  return (db ?? await database()).transaction(client => quoteWith(client, cart, fee === undefined ? settings().deliveryFee : fee));
}
export async function placeOrder(input: { items: unknown; customer: unknown; idempotencyKey: unknown; expectedTotal: unknown }, db?: Database, fee?: number | null): Promise<Receipt> {
  const cart = cartInput(input.items), customer = customerInput(input.customer);
  if (typeof input.idempotencyKey !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.idempotencyKey)) throw new CheckoutError('Refresh checkout and try again.');
  if (!Number.isSafeInteger(input.expectedTotal) || Number(input.expectedTotal) <= 0) throw new CheckoutError('Review your order total first.');
  const requestHash = createHash('sha256').update(JSON.stringify({ cart, customer, total: input.expectedTotal })).digest('hex');
  return (db ?? await database()).transaction(async client => {
    // All allocations and inserts share one transaction and lock. The 31st order cannot get slot 30.
    await client.query("SELECT code FROM voss_promotions WHERE code='FIRST30' FOR UPDATE");
    const { rows: existing } = await client.query<{ reference: string; subtotal_pkr: number; delivery_pkr: number; total_pkr: number; promotion_code: string | null; request_hash: string }>('SELECT reference, subtotal_pkr, delivery_pkr, total_pkr, promotion_code, request_hash FROM voss_orders WHERE idempotency_key=$1', [input.idempotencyKey]);
    if (existing[0]) {
      const row = existing[0];
      if (row.request_hash !== requestHash) throw new CheckoutError('This order attempt has already been used. Start a new checkout.', 409);
      return { reference: row.reference, subtotal: row.subtotal_pkr, delivery: row.delivery_pkr, total: row.total_pkr, freeDelivery: row.promotion_code === 'FIRST30' };
    }
    const { rows: recent } = await client.query<{ count: string }>("SELECT count(*) FROM voss_orders WHERE phone=$1 AND created_at > now() - interval '1 hour'", [customer.phone]);
    if (Number(recent[0].count) >= 3) throw new CheckoutError('You have already placed several orders. Contact VOSS for help before ordering again.', 429);
    const q = await quoteWith(client, cart, fee === undefined ? settings().deliveryFee : fee);
    if (q.total !== input.expectedTotal) throw new CheckoutError('Your total has changed. Please review the updated price and delivery charge before placing your order.', 409);
    const id = randomUUID(), reference = `VOSS-${randomBytes(6).toString('hex').toUpperCase()}`;
    await client.query(`INSERT INTO voss_orders(id,reference,idempotency_key,request_hash,customer_name,phone,email,address,city,province,postcode,notes,payment_method,subtotal_pkr,delivery_pkr,total_pkr,promotion_code)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'cod',$13,$14,$15,$16)`, [id, reference, input.idempotencyKey, requestHash, customer.name, customer.phone, customer.email || null, customer.address, customer.city, customer.province, customer.postcode || null, customer.notes, q.subtotal, q.delivery, q.total, q.freeDelivery ? 'FIRST30' : null]);
    for (const line of q.items) await client.query('INSERT INTO voss_order_items(order_id,product_slug,colour_key,name,colour_name,image_url,quantity,unit_price_pkr) VALUES($1,$2,$3,$4,$5,$6,$7,$8)', [id,line.slug,line.colour,line.name,line.colourName,line.image,line.quantity,line.unitPrice]);
    if (q.freeDelivery) await client.query("UPDATE voss_promotions SET used=used+1 WHERE code='FIRST30'");
    return { reference, subtotal: q.subtotal, delivery: q.delivery, total: q.total, freeDelivery: q.freeDelivery };
  });
}
