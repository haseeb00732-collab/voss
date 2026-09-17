'use client';
import Link from 'next/link';
import {getPiece,colourwayImage,priceLabel} from '@/lib/catalogue';
import {useBag,bagMessage,OrderSummary} from './StoreShell';

export function Bag() {
  const {items,save,storageError}=useBag();
  const total=items.reduce((sum,i)=>sum+(getPiece(i.slug)?.price??0)*i.quantity,0);
  if (!items.length) return <div className="v-empty"><h2>A little room for good form.</h2><p>Your bag is empty. Take a closer look at the collection.</p><Link className="v-button" href="/collection">Explore the collection ↗</Link></div>;
  return <div className="v-bag-layout"><div>{items.map((item,index)=>{const p=getPiece(item.slug)!;const c=p.colourways.find(c=>c.key===item.colour)!;return <article className="v-bag-row" key={`${item.slug}-${item.colour}`}><Link href={`/collection/${p.slug}`}><img src={colourwayImage(p,c)} alt={`${p.name} in ${c.name}`} width="112" height="140"/></Link><div><span className="v-kicker">{p.label}</span><h2><Link href={`/collection/${p.slug}`}>{p.name}</Link></h2><p>{c.name}</p><label>Quantity <select aria-label={`Quantity for ${p.name} in ${c.name}`} value={item.quantity} onChange={e=>save(items.map((it,n)=>n===index?{...it,quantity:Number(e.target.value)}:it))}>{Array.from({length:20},(_,n)=><option key={n+1}>{n+1}</option>)}</select></label><button className="v-remove" onClick={()=>save(items.filter((_,n)=>n!==index))} aria-label={`Remove ${p.name} in ${c.name}`}>Remove</button></div><span className="v-line-total">{priceLabel((p.price??0)*item.quantity)}</span></article>;})}<p role="status">{storageError}</p></div><aside className="v-bag-summary"><span className="v-kicker">Your selection</span><div className="v-total"><span>Items total</span><strong>{priceLabel(total)}</strong></div><p>Prices in PKR. Delivery charges confirmed by VOSS.</p><OrderSummary text={bagMessage(items)}/></aside></div>;
}
