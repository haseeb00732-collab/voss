import { createClient } from '@supabase/supabase-js';

// Publishable key only. Every operation is checked against the private owner allowlist.
// Keep database traffic on the dashboard connection in browsers. The Worker
// forwards only the named owner APIs and never adds privileged credentials.
export const supabaseUrl = typeof window === 'undefined'
  ? 'https://porncyiyigtvejpbsjwl.supabase.co'
  : `${window.location.origin}/cloud`;
export const supabasePublishableKey = 'sb_publishable_yyzuSdZT41Mlon7BU2XV_g_jNk2gCrq';
export const cloud = createClient(
  supabaseUrl,
  supabasePublishableKey,
  { auth: { storage: typeof window === 'undefined' ? undefined : window.sessionStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: init?.signal ? AbortSignal.any([init.signal, AbortSignal.timeout(20000)]) : AbortSignal.timeout(20000) }) } }
);
export const statuses = ['received','confirmed','packed','shipped','delivered','cancelled','returned','refused'] as const;
export type Status = typeof statuses[number];
export const statusLabel: Record<Status,string> = { received: 'New order', confirmed: 'Confirmed', packed: 'Packed', shipped: 'Dispatched', delivered: 'Delivered', cancelled: 'Cancelled', returned: 'Returned', refused:'Refused' };
export const nextStatuses: Record<Status, Status[]> = { received:['confirmed','cancelled'],confirmed:['packed','cancelled'],packed:['shipped','cancelled'],shipped:['delivered','returned','refused'],delivered:['returned'],cancelled:[],returned:[],refused:[] };
export type Item = {name:string; colour_name:string; quantity:number; image_url:string; unit_price_pkr:number};
export type Order = {id:string;reference:string;customer_name:string;phone:string;city:string;status:Status;payment_status:'pending'|'collected';total_pkr:number;created_at:string;version:number;items:Item[]};
export type Event = {id:number; action:string; old_value:string|null;new_value:string|null;note:string;created_at:string};
export type Detail = Order & {email:string|null;address:string;province:string;postcode:string|null;notes:string;subtotal_pkr:number;delivery_pkr:number;courier_name:string;tracking_number:string;events:Event[];alert_state:string|null};
export type Data = {orders:Order[];total:number;metrics:{total:number;received:number;to_pack:number;shipped:number;pending_cod:number;collected:number;delivered:number};promotion:{used:number;maximum:number};alerts:{pending:number;sent:number}};
export type Product = {slug:string;article:string;name:string;price_pkr:number;active:boolean;category:string;variants:{colour_key:string;colour_name:string;hex:string;active:boolean;image_url:string|null}[]};
export function money(value:number) { return `Rs ${value.toLocaleString('en-PK')}`; }
export function date(value:string) { return new Date(value).toLocaleString('en-PK',{timeZone:'Asia/Karachi',day:'numeric',month:'short',hour:'numeric',minute:'2-digit'}); }
export function imageUrl(value:string|null) { if(!value) return ''; try { const url=new URL(value,'https://www.voss.pk'); return url.origin==='https://www.voss.pk' ? url.href : ''; } catch { return ''; } }
export async function readBusiness<T>(view:string, options:Record<string,unknown>={}) {
  const {data,error}=await cloud.rpc('voss_business_read',{p_view:view,...options});
  if(error) throw new Error(error.code==='42501'?'This account does not have owner access.':error.message);
  return data as T;
}
export async function updateBusiness(order:Detail, action:string, value='', note='', courier='', tracking='') {
  const {data,error}=await cloud.rpc('voss_business_update',{p_order_id:order.id,p_version:order.version,p_action:action,p_value:value,p_note:note,p_courier:courier,p_tracking:tracking});
  if(error) throw new Error(error.message);
  return data as Detail;
}
// Prevent spreadsheet formulas in customer-supplied values.
export function csvCell(value:unknown) { const raw=String(value??''); const safe=/^[\s]*[=+@-]/.test(raw)?`'${raw}`:raw; return `"${safe.replaceAll('"','""')}"`; }
export function ordersCsv(orders:Order[]) {
  const rows=[['Order','Customer','Phone','City','Status','Payment','Total PKR','Placed'],...orders.map(o=>[o.reference,o.customer_name,o.phone,o.city,statusLabel[o.status],o.payment_status,o.total_pkr,o.created_at])];
  return '\uFEFF'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n');
}
