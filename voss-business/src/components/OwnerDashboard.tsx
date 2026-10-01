'use client';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { priceLabel } from '@/lib/catalogue';
import { customerWhatsApp, FACEBOOK_PAGE, META_INBOX, WHATSAPP_NUMBER } from '@/lib/whatsapp';
import { igProfile } from '@/lib/instagram';
import './OwnerDashboard.css';
import { SocialInsights } from './SocialInsights';
const statuses = ['received','confirmed','shipped','delivered','cancelled'];
type Order = { id: string; reference: string; customer_name: string; phone: string; email: string | null; address: string; city: string; province: string; postcode: string | null; notes: string; status: string; total_pkr: number; delivery_pkr: number; payment_method: string; created_at: string; items: { name: string; colour_name: string; image_url: string; quantity: number; unit_price_pkr: number }[] };
type Data = { orders: Order[]; counts: { status: string; count: number }[] };
async function api(url: string, init?: RequestInit) { const response = await fetch(url, { ...init, cache: 'no-store' }); const body = await response.json(); if (!response.ok) throw Object.assign(new Error(body.error || 'Please try again.'), { status: response.status }); return body; }
export function OwnerDashboard() {
  const [auth, setAuth] = useState<boolean | null>(null), [configured,setConfigured] = useState(true);
  const [data,setData] = useState<Data | null>(null), [error,setError] = useState(''), [busy,setBusy] = useState(false);
  const [filter,setFilter] = useState('all'), [page,setPage] = useState(0), [updated,setUpdated] = useState('');
  useEffect(() => { api('/api/session').then(v => {setAuth(v.authenticated);setConfigured(v.configured ?? true);}).catch(() => {setAuth(false);setError('Could not connect to owner access. Please refresh.');}); }, []);
  const refresh = useCallback(async (signal?: AbortSignal) => {
    try { const result = await api(`/api/orders?page=${page}&status=${filter}`, { signal }); setData(result); setUpdated(new Date().toLocaleTimeString());setError(''); }
    catch(e) { if (e instanceof Error && e.name === 'AbortError') return; if ((e as {status?:number}).status === 401) {setAuth(false);setData(null);} setError(e instanceof Error ? e.message : 'Could not load orders.'); }
  }, [page, filter]);
  useEffect(() => { if (!auth) return; const controller=new AbortController(); const initial=setTimeout(()=>void refresh(controller.signal),0); const timer=setInterval(() => {if(document.visibilityState==='visible') void refresh(controller.signal);},30000); return () => {controller.abort();clearTimeout(initial);clearInterval(timer);}; },[auth,refresh]);
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form=event.currentTarget; setBusy(true);setError('');
    try { await api('/api/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:new FormData(form).get('key')})});form.reset();setAuth(true); }
    catch(e) {setError(e instanceof Error?e.message:'Sign-in failed.');} finally {setBusy(false);}
  }
  async function logout() {setBusy(true);try{await api('/api/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'logout'})});setAuth(false);setData(null);}catch{setError('Sign-out failed. Please try again.');}finally{setBusy(false);}}
  const total=data?.counts.reduce((sum,c)=>sum+c.count,0);
  const filteredTotal=filter==='all'?(total??0):data?.counts.find(c=>c.status===filter)?.count??0;
  return <div className="v-owner"><div className="v-owner-title"><div><span className="v-kicker">VOSS / owner access</span><h1>Your business, in view.</h1></div>{auth&&<button onClick={logout} disabled={busy}>Sign out</button>}</div>
    {error&&<p role="alert" className="v-owner-alert">{error}</p>}
    {auth===null?<p role="status">Checking owner access…</p>:!auth?<form className="v-owner-login" onSubmit={login}><h2>Sign in to view your business.</h2><p>This area contains private customer information.</p>{configured?<><label>Owner access key<input name="key" type="password" autoComplete="current-password" required maxLength={256}/></label><button className="v-button" disabled={busy}>{busy?'Signing in…':'Open dashboard ↗'}</button></>:<p>Owner access needs to be configured before sign-in is available.</p>}</form>:<>
      <section className="v-owner-channels" aria-label="Business channels"><div><span className="v-kicker">Your messages</span><h2>One social inbox.</h2><p>Facebook, Instagram and WhatsApp messages are managed in Meta Business Suite after the accounts are linked. Website orders are listed below.</p><a className="v-text-link" href={META_INBOX} target="_blank" rel="noreferrer">Open Meta Business Suite inbox ↗</a><small>Account linking is pending. This link opens Meta; messages are not synced into this dashboard.</small></div><div><h3>VOSS accounts</h3><a href={FACEBOOK_PAGE} target="_blank" rel="noreferrer">Facebook / Vosspk ↗</a><a href={igProfile()} target="_blank" rel="noreferrer">Instagram / @voss.pk ↗</a><p>WhatsApp Business / +{WHATSAPP_NUMBER}</p><small>Automatic WhatsApp order alerts are not connected. New website orders appear here; this page refreshes every 30 seconds while open.</small></div></section>
      <SocialInsights/><div className="v-owner-metrics"><div><strong>{total??'—'}</strong><span>Total orders</span></div><div><strong>{data?.counts.find(c=>c.status==='received')?.count??(data?0:'—')}</strong><span>New / to confirm</span></div><div><strong>{data?.counts.find(c=>c.status==='shipped')?.count??(data?0:'—')}</strong><span>On the way</span></div></div>
      <div className="v-owner-tools"><label>Show orders<select value={filter} onChange={e=>{setData(null);setFilter(e.target.value);setPage(0);}}><option value="all">All orders</option>{statuses.map(s=><option key={s}>{s}</option>)}</select></label><button onClick={()=>void refresh()} disabled={busy}>Refresh orders ↻</button><span role="status">{updated?`Last checked ${updated}`:'Loading orders…'}</span></div>
      {data?.orders.length===0&&<div className="v-owner-empty"><h2>No {filter==='all'?'':filter+' '}orders yet.</h2><p>Once live checkout is connected, customer orders and delivery details will appear here. No sample orders are mixed into this list.</p></div>}
      <div className="v-owner-orders">{data?.orders.map(order=><details key={order.id} className="v-owner-order"><summary><span><strong>{order.reference}</strong><small>{new Date(order.created_at).toLocaleString('en-PK',{timeZone:'Asia/Karachi'})}</small></span><span>{order.customer_name}<small>{order.city}</small></span><span className="v-owner-status">{order.status}</span><strong>{priceLabel(order.total_pkr)}</strong></summary><div className="v-owner-order-body"><section><h3>Customer & delivery</h3><p>{order.customer_name}<br/>{order.address}<br/>{order.city}, {order.province} {order.postcode}</p><a href={`tel:${order.phone}`}>{order.phone}</a>{order.email&&<p>{order.email}</p>}{order.notes&&<p>Note: {order.notes}</p>}{customerWhatsApp(order.phone)&&<a className="v-text-link" href={customerWhatsApp(order.phone)!} target="_blank" rel="noreferrer">Contact customer on WhatsApp ↗</a>}</section><section><h3>Items & payment</h3>{order.items.map((item,i)=><div className="v-owner-item" key={i}><img src={new URL(item.image_url, process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://www.voss.pk').href} alt={`${item.name} in ${item.colour_name}`} width="64" height="80"/><div>{item.name}<small>{item.colour_name} · Qty {item.quantity}</small><span>{priceLabel(item.unit_price_pkr*item.quantity)}</span></div></div>)}<p>Cash on delivery · Delivery: {priceLabel(order.delivery_pkr)}</p><strong>Total: {priceLabel(order.total_pkr)}</strong></section><section><h3>Order status</h3><p>{order.status}</p><small>Recorded status from your order database.</small></section></div></details>)}</div>
      <div className="v-owner-pagination"><button disabled={page===0||busy} onClick={()=>{setData(null);setPage(p=>p-1);}}>Previous</button><span>Page {page+1}</span><button disabled={(page+1)*25>=filteredTotal||busy} onClick={()=>{setData(null);setPage(p=>p+1);}}>Next</button></div>
    </>}
  </div>;
}
