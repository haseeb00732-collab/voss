'use client';
import { ArrowIcon } from '@/components/ArrowIcon';
import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useBag, OrderSummary, bagMessage } from './StoreShell';
import { priceLabel } from '@/lib/catalogue';
import { whatsappLink } from '@/lib/whatsapp';
import type { Quote, Receipt } from '@/lib/server/checkout';
import './Checkout.css';

type Config = { enabled: boolean; preview?: boolean; provinces: string[]; remaining?: number; error?: string };
export function Checkout() {
  const { items, save } = useBag();
  const [config, setConfig] = useState<Config | null>(null);
  const [priced, setPriced] = useState<{ signature: string; quote: Quote } | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [revision, setRevision] = useState(0);
  const [step, setStep] = useState<1 | 2>(1);
  const [customer, setCustomer] = useState<Record<string, string>>({});
  const stepHeading = useRef<HTMLHeadingElement>(null);
  const key = useRef('');
  const signature = JSON.stringify(items);
  const quote = priced?.signature === signature ? priced.quote : null;
  const errorBox = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (step === 2) { stepHeading.current?.focus(); stepHeading.current?.scrollIntoView({ block: 'start', behavior: 'instant' }); } }, [step]);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/checkout', { signal: controller.signal, cache: 'no-store' }).then(r => r.json()).then(setConfig).catch(e => { if (e.name !== 'AbortError') setConfig({ enabled: false, provinces: [] }); });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if ((!config?.enabled && !config?.preview) || signature === '[]' || receipt) return;
    const controller = new AbortController();
    fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: JSON.parse(signature) }), signal: controller.signal }).then(async r => {
      const data = await r.json(); if (!r.ok) throw new Error(data.error); return data;
    }).then(data => { setPriced({ signature, quote: data }); }).catch(e => { if (e.name !== 'AbortError') { setPriced(null); setError(e.message || 'Could not check your total. Please try again.'); } });
    return () => controller.abort();
  }, [signature, config, revision, receipt]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy || !quote) return;
    const form = new FormData(event.currentTarget);
    if (step === 1) {
      const details = Object.fromEntries(['name', 'phone', 'email', 'address', 'city', 'province', 'postcode', 'notes'].map(name => [name, String(form.get(name) ?? '').trim()]));
      if (!/^03\d{9}$/.test(details.phone.replace(/[\s()-]/g, '').replace(/^\+92|^0092/, '0'))) { setError('Please enter a Pakistani mobile number, like 0300 1234567.'); return; }
      setCustomer(details); setStep(2); setError(''); return;
    }
    if (!config?.enabled) return;
    const payload = { items, customer, expectedTotal: quote.total, payment: 'cod', consent: form.get('consent') === 'on' };
    // Persist only the retry key and a hash, never the address or phone.
    const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(payload))))].map(b => b.toString(16).padStart(2, '0')).join('');
    try { const old = JSON.parse(sessionStorage.getItem('voss-checkout-attempt') || 'null'); key.current = old?.hash === hash ? old.key : crypto.randomUUID(); sessionStorage.setItem('voss-checkout-attempt', JSON.stringify({ hash, key: key.current })); } catch { key.current ||= crypto.randomUUID(); }
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/orders', { signal: AbortSignal.timeout(20000), method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, idempotencyKey: key.current }) });
      const data = await response.json();
      if (!response.ok) { if (response.status === 409) setRevision(n => n + 1); throw new Error(data.error); }
      setReceipt(data); save([]);
      try { sessionStorage.removeItem('voss-checkout-attempt'); } catch {}
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (e) { setError(e instanceof Error ? e.message : 'Your order could not be submitted. Please retry.'); requestAnimationFrame(() => errorBox.current?.focus()); }
    finally { setBusy(false); }
  }
  if (receipt) return <section className="v-order-received" aria-live="polite"><span className="v-kicker">Thank you for choosing VOSS</span><h2>Your order is in.</h2><p>Keep this reference: <strong>{receipt.reference}</strong></p><p>Pay <strong>{priceLabel(receipt.total)}</strong> on delivery. {receipt.freeDelivery ? 'Your delivery is free.' : `Delivery: ${priceLabel(receipt.delivery)}.`}</p><p>Delivery in 3–8 days.</p><p>VOSS will contact you on the mobile number provided to confirm your order and arrange delivery.</p><a className="v-button" href={whatsappLink(`Hi VOSS, I placed order ${receipt.reference}. Total: ${priceLabel(receipt.total)}. Please confirm my order.`)} target="_blank" rel="noreferrer">Share order reference on WhatsApp <ArrowIcon direction="up-right" /></a><p>Your order is already saved. WhatsApp opens a draft; tap Send to share it with VOSS.</p><Link className="v-text-link" href="/collection">Back to the collection <ArrowIcon direction="up-right" /></Link></section>;
  if (!items.length) return <div className="v-empty"><h2>Choose your first bag.</h2><Link className="v-button" href="/collection">Explore the collection <ArrowIcon direction="up-right" /></Link></div>;
  if (!config) return <p role="status">Preparing checkout…</p>;
  if (!config.enabled && !config.preview) return <div className="v-checkout-unavailable"><h2>Order with VOSS.</h2><p>Website checkout is being prepared. Send your selection on WhatsApp to confirm availability and delivery.</p><a className="v-button" href={whatsappLink(bagMessage(items))} target="_blank" rel="noreferrer">Send selection on WhatsApp <ArrowIcon direction="up-right" /></a><p>WhatsApp opens a draft. Tap Send there. This request is not saved as a website order.</p><OrderSummary text={bagMessage(items)} /></div>;
  return <><nav className="v-checkout-progress" aria-label="Checkout progress"><button type="button" aria-current={step === 1 ? 'step' : undefined} onClick={() => {setStep(1);setError('');}} disabled={busy}><span>01</span> Delivery details</button><span aria-hidden="true"><ArrowIcon direction="right" /></span><span aria-current={step === 2 ? 'step' : undefined}><b>02</b> Review & order</span></nav><form className="v-checkout-layout" onSubmit={submit}>
    <div className="v-checkout-fields">{!config.enabled && <p className="v-checkout-preview" role="status">Local design preview. Orders are disabled until payment, delivery and the production database are configured. Cash on delivery is shown for review.</p>}<div className="v-checkout-step"><span className="v-kicker">Step {step} of 2</span><h2 ref={stepHeading} tabIndex={-1}>{step === 1 ? 'Where shall we send it?' : 'Everything look good?'}</h2></div>
      <fieldset disabled={busy || step !== 1} hidden={step !== 1}><legend className="v-visually-hidden">Contact and delivery address</legend><div className="v-checkout-field-grid">
        <label>Full name<input name="name" autoComplete="name" required minLength={2} maxLength={80} /></label>
        <label>Mobile number<input name="phone" type="tel" autoComplete="tel" placeholder="0300 1234567" required maxLength={20} /></label>
        <label className="v-field-wide">Email <span>(optional)</span><input name="email" type="email" autoComplete="email" maxLength={120} /></label>
        <label className="v-field-wide">Street address<textarea name="address" autoComplete="street-address" placeholder="House, street, area and a nearby landmark" required minLength={10} maxLength={300} rows={2} /></label>
        <label>City<input name="city" autoComplete="address-level2" required minLength={2} maxLength={80} /></label>
        <label>Province / territory<select name="province" autoComplete="address-level1" required defaultValue=""><option value="" disabled>Select your region</option>{config.provinces.map(p => <option key={p}>{p}</option>)}</select></label>
        <label>Postal code <span>(optional)</span><input name="postcode" autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{5}" maxLength={5} /></label>
        <label className="v-field-wide">Delivery note <span>(optional)</span><textarea name="notes" maxLength={400} rows={2} /></label>
      </div></fieldset>
      {step === 2 && <><section className="v-delivery-review"><div><span className="v-kicker">Deliver to</span><button type="button" onClick={() => setStep(1)} disabled={busy}>Edit details <ArrowIcon direction="up-right" /></button></div><h3>{customer.name}</h3><p>{customer.address}<br />{customer.city}, {customer.province} {customer.postcode}</p><p>{customer.phone}{customer.email && <><br />{customer.email}</>}</p>{customer.notes && <p>Delivery note: {customer.notes}</p>}</section><div className="v-checkout-step"><span className="v-kicker">Payment</span><h2>Cash on delivery.</h2><p>Pay the order total when your parcel arrives. Delivery in 3–8 days.</p></div></>}
      <p className="v-checkout-privacy">Your contact and address details are used to process your order, contact you and arrange delivery.</p>
    </div>
    <aside className="v-checkout-summary"><span className="v-kicker">Your selection</span><Link className="v-checkout-edit" href="/bag">Edit bag <ArrowIcon direction="up-right" /></Link>
      {!quote ? <p role="status">Checking prices and delivery…</p> : <><div className="v-checkout-lines">{quote.items.map(line => <article key={`${line.slug}-${line.colour}`}><img src={line.image} alt={`${line.name} in ${line.colourName}`} width="88" height="110" /><div><h3>{line.name}</h3><p>{line.colourName} · Qty {line.quantity}</p><strong>{priceLabel(line.unitPrice * line.quantity)}</strong></div></article>)}</div>
      {quote.freeDelivery && <p className="v-checkout-offer">A little welcome from VOSS.<br /><strong>Free delivery on the first 30 website orders.</strong><small>Confirmed when your order is placed.</small></p>}
      <dl><div><dt>Subtotal</dt><dd>{priceLabel(quote.subtotal)}</dd></div><div><dt>Delivery</dt><dd>{quote.delivery === 0 ? 'Complimentary' : priceLabel(quote.delivery)}</dd></div><div className="v-checkout-total"><dt>Total <small>PKR</small></dt><dd>{priceLabel(quote.total)}</dd></div></dl>
      {step === 2 && <label className="v-checkout-consent"><input type="checkbox" name="consent" required disabled={busy} />My selection, delivery details and total are correct.</label>}</>}
      {error && <p role="alert" tabIndex={-1} ref={errorBox} className="v-checkout-error">{error}</p>}
      {step === 2 && !config.enabled && <p id="checkout-preview-reason" className="v-checkout-preview" role="status"><strong>Preview only — no order has been placed.</strong><br />Website ordering is not active yet. Your delivery details have not been submitted.</p>}
      <button className="v-button" aria-busy={busy} aria-describedby={step === 2 && !config.enabled ? 'checkout-preview-reason' : undefined} disabled={busy || !quote || (step === 2 && !config.enabled)} type="submit">{step === 1 ? 'Review my order' : !config.enabled ? 'Ordering not active yet' : busy ? 'Placing your order…' : 'Order now'} <span><ArrowIcon direction="up-right" /></span></button>
      {step === 2 && !config.enabled && <><a className="v-text-link" href={whatsappLink(`${bagMessage(items)}\n\nDelivery details:\n${customer.name}\n${customer.phone}\n${customer.address}\n${customer.city}, ${customer.province} ${customer.postcode || ''}${customer.notes ? `\nNote: ${customer.notes}` : ''}`)} target="_blank" rel="noreferrer">Send order request on WhatsApp <ArrowIcon direction="up-right" /></a><p className="v-checkout-note">Opens a draft with your selection and delivery details. Tap Send in WhatsApp. VOSS will confirm the request; it is not yet a website order.</p></>}
      <p className="v-checkout-note">No payment is collected online.</p>
    </aside>
  </form></>;
}
