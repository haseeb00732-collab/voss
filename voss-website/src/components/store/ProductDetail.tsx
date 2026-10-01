'use client';
import { ArrowIcon } from '@/components/ArrowIcon';
import Link from 'next/link';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Piece,studioPhotos,studioPhotoSrcSet,priceLabel} from '@/lib/catalogue';
import {useBag} from './StoreShell';
import {InstagramOrder} from './InstagramOrder';

export function ProductDetail({piece}: {piece:Piece}) {
  const router = useRouter();
  const [colourKey,setColourKey]=useState(piece.coverColour);
  const [frame,setFrame]=useState(0);
  const [added,setAdded]=useState(false);
  const {items,save,storageError}=useBag();
  const colour=piece.colourways.find(c=>c.key===colourKey)!;
  const images=studioPhotos(piece,colour);
  const photo=images[Math.min(frame,images.length-1)];
  function add() { const found=items.find(i=>i.slug===piece.slug&&i.colour===colourKey); save(found?items.map(i=>i===found?{...i,quantity:Math.min(20,i.quantity+1)}:i):[...items,{slug:piece.slug,colour:colourKey,quantity:1}]); setAdded(true); }
  return <div className="v-detail">
    <div className="v-gallery">
      <div className="v-main-photo v-studio-photo">
        <img key={photo.src} src={photo.src} srcSet={studioPhotoSrcSet(photo)} sizes="(max-width: 760px) 100vw, 55vw" alt={`${piece.name}, ${colour.name} — ${photo.label}`} width="1122" height="1402" fetchPriority="high"/>
        <span className="v-image-index">{String(frame+1).padStart(2,'0')} / {String(images.length).padStart(2,'0')}</span>
      </div>
      {images.length>1&&<div className="v-gallery-thumbs">{images.map((image,i)=><button key={image.src} aria-label={`View ${image.label.toLowerCase()}`} aria-pressed={frame===i} onClick={()=>setFrame(i)}><img src={image.src} alt="" width="64" height="80" loading="lazy"/></button>)}</div>}
      <p className="v-photo-note">{photo.label} · Colours may vary with lighting and screen settings.</p>
    </div>
    <div className="v-product-info">
      <div className="v-kicker">{piece.label} / {piece.silhouette}</div>
      <h1>{piece.name}</h1>
      <p className="v-product-price">{priceLabel(piece.price)} <span>PKR</span></p>
      <p className="v-product-description">{piece.description}</p>
      <fieldset className="v-colour-picker"><legend>Colour <strong>{colour.name}</strong></legend><div>{piece.colourways.map(c=><button key={c.key} aria-label={c.name} aria-pressed={colourKey===c.key} title={c.name} onClick={()=>{setColourKey(c.key);setFrame(0);setAdded(false);}}><span style={{backgroundColor:c.hex}}/></button>)}</div></fieldset>
      <div className="v-buy-actions"><button className="v-button" onClick={() => { if (!items.some(i => i.slug === piece.slug && i.colour === colourKey)) add(); router.push('/checkout'); }}>Order now <span><ArrowIcon direction="up-right" /></span></button><button className="v-text-link" onClick={add}>{added ? 'Add another to bag +' : 'Add to bag +'}</button>{added&&<Link className="v-text-link" href="/bag">View my bag <ArrowIcon direction="up-right" /></Link>}<span role="status">{storageError || (added?`${piece.name} in ${colour.name} is in your bag.`:'Choose your colour. Order in two easy steps.')}</span></div>
      <InstagramOrder key={colour.key} piece={piece} colour={colour}/>
      <div className="v-accordions">
        <details open><summary>A closer look</summary><p>{piece.note}</p><p>Explore the studio photographs for your chosen colour. Ask VOSS to confirm dimensions, material and included accessories before ordering.</p></details>
        <details><summary>Ordering & delivery</summary><p>Add your selection to your bag and continue to checkout. Pay cash on delivery. Delivery takes 3–8 days; the delivery charge is shown before you place your order. You can also contact VOSS on Instagram for help.</p><Link href="/help">Read the ordering guide <ArrowIcon direction="up-right" /></Link></details>
        <details><summary>Exchanges & care</summary><p>Confirm the exchange terms before placing your order. For care advice, use the instructions appropriate to your bag’s confirmed material.</p><Link href="/help#care">More about bag care <ArrowIcon direction="up-right" /></Link></details>
      </div>
    </div>
  </div>;
}
