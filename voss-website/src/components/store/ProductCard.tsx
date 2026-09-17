'use client';

import Link from 'next/link';
import { useId, useRef, useState } from 'react';
import { Piece, coverImage, coverSrcSet, colourwayImage, colourwaySrcSet, priceLabel } from '@/lib/catalogue';
import { useBag } from './StoreShell';
import { InstagramOrder } from './InstagramOrder';

export function ProductCard({ piece, priority = false }: { piece: Piece; priority?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [colourKey, setColourKey] = useState(piece.coverColour);
  const [added, setAdded] = useState(false);
  const { items, save, storageError, comparison, toggleComparison } = useBag();
  const colour = piece.colourways.find(c => c.key === colourKey)!;
  const studio = colourKey === piece.coverColour;

  function show(key = piece.coverColour) {
    setColourKey(key);
    setAdded(false);
    setOpen(true);
    dialog.current?.showModal();
  }

  function add() {
    const found = items.find(i => i.slug === piece.slug && i.colour === colourKey);
    save(found
      ? items.map(i => i === found ? { ...i, quantity: Math.min(20, i.quantity + 1) } : i)
      : [...items, { slug: piece.slug, colour: colourKey, quantity: 1 }]);
    setAdded(true);
  }

  return <article className="v-product-card">
    <div className="v-product-stage">
      <span className="v-card-article">{piece.label}</span>
      <button className="v-compare-toggle" aria-label={`Compare ${piece.name}`} aria-pressed={comparison.includes(piece.slug)} disabled={comparison.length === 2 && !comparison.includes(piece.slug)} onClick={() => toggleComparison(piece.slug)}>
        {comparison.includes(piece.slug) ? 'Selected −' : 'Compare +'}
      </button>
      <Link className="v-product-photo" href={`/collection/${piece.slug}`}>
        <div className="v-product-float">
          <div className="v-product-parallax">
          <img src={coverImage(piece)} srcSet={coverSrcSet(piece)}
            sizes="(max-width: 600px) 48vw, (max-width: 1000px) 46vw, 24vw"
            width="1122" height="1402"
            alt={`${piece.name} in ${piece.colourways.find(c => c.key === piece.coverColour)?.name}`}
            loading={priority ? 'eager' : 'lazy'} />
          </div>
        </div>
      </Link>
      <button className="v-quick-trigger" onClick={() => show()} aria-label={`Quick look at ${piece.name}`}>
        <span>Quick look</span><span aria-hidden="true">↗</span>
      </button>
    </div>
    <div className="v-card-meta">
      <h3><Link href={`/collection/${piece.slug}`}>{piece.name}</Link></h3>
      <span>{priceLabel(piece.price)}</span>
    </div>
    <div className="v-card-colours">
      <span>{piece.colourways.length} colours</span>
      <div className="v-card-swatches" aria-label={`Preview ${piece.name} colours`}>
        {piece.colourways.map(c => <button key={c.key} title={c.name}
          aria-label={`Preview ${piece.name} in ${c.name}`} onClick={() => show(c.key)}>
          <i style={{ backgroundColor: c.hex }} />
        </button>)}
      </div>
    </div>
    <dialog ref={dialog} className="v-quick-look" aria-labelledby={titleId}
      onClose={() => setOpen(false)}
      onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      {open && <div className="v-quick-body">
        <button className="v-quick-close" aria-label="Close quick look" onClick={() => dialog.current?.close()}>Close <span aria-hidden="true">×</span></button>
        <div className="v-quick-photo is-studio">
          <img key={colourKey} src={studio ? coverImage(piece) : colourwayImage(piece, colour)}
            srcSet={studio ? coverSrcSet(piece) : colourwaySrcSet(piece, colour)} sizes="(max-width: 760px) 100vw, 480px"
            alt={`${piece.name} in ${colour.name}`} width="1122" height="1402" />
          <span>Studio view · {colour.name}</span>
        </div>
        <div className="v-quick-info">
          <span className="v-kicker">{piece.label} / A closer look</span>
          <h2 id={titleId}>{piece.name}</h2>
          <p className="v-quick-price">{priceLabel(piece.price)} <span>PKR</span></p>
          <p>{piece.note}</p>
          <fieldset className="v-colour-picker">
            <legend>Colour <strong>{colour.name}</strong></legend>
            <div>{piece.colourways.map(c => <button key={c.key} title={c.name} aria-label={c.name}
              aria-pressed={colourKey === c.key} onClick={() => { setColourKey(c.key); setAdded(false); }}>
              <span style={{ backgroundColor: c.hex }} />
            </button>)}</div>
          </fieldset>
          <button className="v-button" onClick={add}>{added ? 'Added to your bag ✓' : 'Add to bag'} <span aria-hidden="true">↗</span></button>
          <p className="v-quick-status" role="status">{storageError || (added ? `${colour.name} added. Your selection is saved.` : 'Select your colour. Confirm availability with VOSS.')}</p>
          <InstagramOrder key={colour.key} piece={piece} colour={colour}/>
          <Link className="v-text-link" href={added ? '/bag' : `/collection/${piece.slug}`} onClick={() => dialog.current?.close()}>
            {added ? 'Review bag & order' : 'View all details'} ↗
          </Link>
        </div>
      </div>}
    </dialog>
  </article>;
}
