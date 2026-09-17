'use client';
import {useState} from 'react';
import {Piece,Colourway} from '@/lib/catalogue';
import {igDirectMessage,igProfile,orderReference} from '@/lib/instagram';

export function InstagramOrder({piece,colour}:{piece:Piece;colour:Colourway}) {
  const [copied,setCopied]=useState(false);
  const [manual,setManual]=useState(false);
  const text=orderReference({piece:piece.name,slug:piece.slug,colourway:colour.name});
  return <details className="v-instagram-order">
    <summary>Order this bag on Instagram <span aria-hidden="true">↗</span></summary>
    <div className="v-instagram-order-inner">
      <p>Copy your selection, then paste it into your message to VOSS.</p>
      <div><button onClick={async()=>{try{await navigator.clipboard.writeText(text);setCopied(true);setManual(false);}catch{setManual(true);}}}>{copied?'Details copied ✓':'1. Copy bag details'}</button><a href={igDirectMessage() ?? igProfile()} target="_blank" rel="noreferrer">2. Open Instagram ↗</a></div>
      <p role="status">{copied?'Ready to paste. VOSS will confirm availability and delivery.':manual?'Copy the selection below, then open Instagram.':'Your selected colour and price are included.'}</p>
      {manual&&<textarea aria-label="Instagram order details" readOnly value={text} onFocus={e=>e.target.select()}/>}
    </div>
  </details>;
}
