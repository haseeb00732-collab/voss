import { database, type Database } from './database';
import { CheckoutError } from './checkout';
export const ORDER_STATUSES = ['received','confirmed','shipped','delivered','cancelled'] as const;
export async function readOrders(page: number, status: string, db?: Database) {
  if (!Number.isInteger(page) || page < 0 || page > 10000 || (status !== 'all' && !ORDER_STATUSES.includes(status as typeof ORDER_STATUSES[number]))) throw new CheckoutError('Invalid order filter.');
  return (db ?? await database()).transaction(async client => {
    const { rows: counts } = await client.query<{ status: string; count: number }>('SELECT status, count(*)::int AS count FROM voss_orders GROUP BY status');
    const { rows: orders } = await client.query(`SELECT id,reference,customer_name,phone,email,address,city,province,postcode,notes,status,payment_method,subtotal_pkr,delivery_pkr,total_pkr,created_at FROM voss_orders WHERE ($1='all' OR status=$1) ORDER BY created_at DESC,id DESC LIMIT 25 OFFSET $2`, [status, page * 25]);
    const ids = orders.map(o => o.id);
    const { rows: items } = ids.length ? await client.query('SELECT order_id,name,colour_name,image_url,quantity,unit_price_pkr FROM voss_order_items WHERE order_id=ANY($1::uuid[])', [ids]) : { rows: [] };
    return { counts, orders: orders.map(o => ({ ...o, items: items.filter(i => i.order_id === o.id) })), page };
  });
}
