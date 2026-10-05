import { createClient } from 'npm:@supabase/supabase-js@2';

type CartLine = { slug: string; colour: string; quantity: number };
type Customer = { name: string; phone: string; email: string; address: string; city: string; province: string; postcode: string; notes: string };

function response(body: unknown, status = 200) { return Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } }); }
function fail(message: string, status = 400) { return response({ error: message }, status); }
function cartInput(value: unknown): CartLine[] {
  if (!Array.isArray(value) || !value.length || value.length > 50) throw new Error('Choose at least one bag (maximum 50 selections).');
  const merged = new Map<string, CartLine>();
  for (const item of value) {
    if (!item || typeof item.slug !== 'string' || typeof item.colour !== 'string' || !/^[a-z0-9-]{1,80}$/.test(item.slug) || !/^[a-z0-9-]{1,40}$/.test(item.colour) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) throw new Error('Please check your bag quantities and colours.');
    const key = `${item.slug}:${item.colour}`, quantity = (merged.get(key)?.quantity ?? 0) + item.quantity;
    if (quantity > 20) throw new Error('A maximum of 20 of each colour can be ordered.');
    merged.set(key, { slug: item.slug, colour: item.colour, quantity });
  }
  return [...merged.values()].sort((a, b) => `${a.slug}:${a.colour}`.localeCompare(`${b.slug}:${b.colour}`));
}
function customerInput(value: unknown): Customer {
  if (!value || typeof value !== 'object') throw new Error('Add your delivery details.');
  const obj = value as Record<string, unknown>;
  const field = (key: string, min: number, max: number) => { const v = typeof obj[key] === 'string' ? obj[key].trim().replace(/\s+/g, ' ') : ''; if (v.length < min || v.length > max) throw new Error(`Please check your ${key}.`); return v; };
  const phone = field('phone', 10, 20).replace(/[\s()-]/g, '').replace(/^\+92|^0092/, '0');
  if (!/^03\d{9}$/.test(phone)) throw new Error('Enter a Pakistani mobile number, for example 0300 1234567.');
  const email = field('email', 0, 120);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please check your email address.');
  const city = field('city', 2, 80), province = field('province', 3, 40);
  if (city.toLowerCase() !== 'lahore' || province !== 'Punjab') throw new Error('We currently deliver within Lahore only. Please enter a Lahore delivery address.');
  const postcode = field('postcode', 0, 5);
  if (postcode && !/^\d{5}$/.test(postcode)) throw new Error('Enter a five-digit postal code or leave it blank.');
  return { name: field('name', 2, 80), phone, email, address: field('address', 10, 300), city: 'Lahore', province: 'Punjab', postcode, notes: field('notes', 0, 400) };
}
async function requestHash(value: unknown) { const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(value))); return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join(''); }
function errorStatus(message: string) { if (message.includes('several orders')) return 429; if (message.includes('first 30') || message.includes('has changed') || message.includes('already been used')) return 409; return 400; }

Deno.serve(async request => {
  if (request.method !== 'POST') return fail('Method not allowed.', 405);
  if (!request.headers.get('content-type')?.includes('application/json')) return fail('Invalid request format.', 415);
  try {
    const body = await request.json();
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { autoRefreshToken: false, persistSession: false } });
    if (body?.action === 'config') {
      const { data, error } = await admin.from('voss_promotions').select('used,maximum').eq('code', 'FIRST30').single();
      if (error || !data) throw new Error('Checkout is temporarily unavailable.');
      return response({ enabled: true, payment: 'cod', provinces: ['Punjab'], remaining: Math.max(0, data.maximum - data.used) });
    }
    const cart = cartInput(body?.items);
    if (body?.action === 'quote') {
      const { data, error } = await admin.rpc('voss_checkout_quote', { p_lines: cart });
      if (error || !data?.[0]) throw new Error(error?.message || 'Could not check your total.');
      const q = data[0]; return response({ items: q.items, subtotal: q.subtotal, delivery: q.delivery, total: q.total, freeDelivery: q.free_delivery, remaining: q.remaining });
    }
    if (body?.action !== 'place-order' || body?.payment !== 'cod' || body?.consent !== true) return fail('Review your payment method and confirm your delivery details.');
    const customer = customerInput(body.customer);
    if (typeof body.idempotencyKey !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.idempotencyKey)) return fail('Refresh checkout and try again.');
    if (!Number.isSafeInteger(body.expectedTotal) || body.expectedTotal <= 0) return fail('Review your order total first.');
    const hash = await requestHash({ cart, customer, total: body.expectedTotal });
    const { data, error } = await admin.rpc('voss_checkout_place', { p_idempotency: body.idempotencyKey, p_request_hash: hash, p_customer: customer, p_lines: cart, p_expected_total: body.expectedTotal });
    if (error || !data?.[0]) throw new Error(error?.message || 'Could not place your order.');
    const order = data[0]; return response({ reference: order.reference, subtotal: order.subtotal, delivery: order.delivery, total: order.total, freeDelivery: order.free_delivery }, 201);
  } catch (error) { const message = error instanceof Error ? error.message : 'Checkout is temporarily unavailable.'; return fail(message, errorStatus(message)); }
});
