'use client';
import { useState } from 'react';
import { ArrowIcon } from '@/components/ArrowIcon';
import Link from 'next/link';
import { DELIVERY_ESTIMATE, EXCHANGE_SUMMARY } from '@/lib/website-copy';
import { getPiece, colourwayImage, priceLabel } from '@/lib/catalogue';
import { changeBagColour } from '@/lib/bag-selection';
import { useBag, bagMessage, OrderSummary } from './StoreShell';
import './Bag.css';

export function Bag() {
  const { items, save, storageError } = useBag();
  const [message, setMessage] = useState('');
  const total = items.reduce((sum, item) => sum + (getPiece(item.slug)?.price ?? 0) * item.quantity, 0);
  if (!items.length) return <div className="v-empty"><h2>A little room for good form.</h2><p>Your bag is empty. Take a closer look at the collection.</p><Link className="v-button" href="/collection">Explore the collection <ArrowIcon direction="up-right" /></Link></div>;
  return <div className="v-bag-layout"><div>
    <p className="v-bag-instructions">Check your colours and quantities, then continue to delivery details.</p>
    {items.map((item, index) => {
      const piece = getPiece(item.slug)!;
      const colour = piece.colourways.find(option => option.key === item.colour)!;
      return <article className="v-bag-row" key={`${item.slug}-${item.colour}`}>
        <Link href={`/collection/${piece.slug}`}><img src={colourwayImage(piece, colour)} alt={`${piece.name} in ${colour.name}`} width="112" height="140" /></Link>
        <div><span className="v-kicker">{piece.label}</span><h2><Link href={`/collection/${piece.slug}`}>{piece.name}</Link></h2>
          <p>{priceLabel(piece.price)} each</p>
          <div className="v-bag-options"><label>Colour <select aria-label={`Colour for ${piece.name} in ${colour.name}`} value={item.colour} onChange={event => {
            try { save(changeBagColour(items, index, event.target.value)); setMessage('Colour updated. Your total is shown below.'); }
            catch (error) { setMessage(error instanceof Error ? error.message : 'Could not update this colour.'); }
          }}>{piece.colourways.map(option => <option key={option.key} value={option.key}>{option.name}</option>)}</select></label>
          <label>Quantity <select aria-label={`Quantity for ${piece.name} in ${colour.name}`} value={item.quantity} onChange={event => { save(items.map((entry, position) => position === index ? { ...entry, quantity: Number(event.target.value) } : entry)); setMessage('Quantity and total updated.'); }}>{Array.from({ length: 20 }, (_, number) => <option key={number + 1}>{number + 1}</option>)}</select></label></div>
          <button type="button" className="v-remove" onClick={() => { save(items.filter((_, position) => position !== index)); setMessage(`${piece.name} in ${colour.name} removed.`); }} aria-label={`Remove ${piece.name} in ${colour.name}`}>Remove</button>
        </div><span className="v-line-total">{priceLabel((piece.price ?? 0) * item.quantity)}</span>
      </article>;
    })}
    <p role="status">{storageError || message}</p><Link className="v-text-link" href="/collection">Continue shopping <ArrowIcon direction="up-right" /></Link>
  </div><aside className="v-bag-summary"><span className="v-kicker">Your selection</span><div className="v-total"><span>Items total</span><strong>{priceLabel(total)}</strong></div>
    <p>Cash on delivery · Lahore only.<br />Delivery: {DELIVERY_ESTIMATE}.</p><p>Delivery is Rs 150, or free for the first 30 eligible website orders. Review your final total at checkout.</p>
    <Link className="v-button" href="/checkout">Continue to checkout <ArrowIcon direction="up-right" /></Link><p>No payment is collected online. Review everything before placing your order.</p>
    <p className="v-bag-policy">{EXCHANGE_SUMMARY} <Link href="/returns">Read Returns & Exchanges ↗</Link></p>
    <details className="v-instagram-alternative"><summary>Prefer to order on Instagram?</summary><OrderSummary text={bagMessage(items)} /></details>
  </aside></div>;
}
