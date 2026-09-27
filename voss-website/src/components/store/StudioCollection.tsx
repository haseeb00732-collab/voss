'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CATALOGUE } from '@/lib/catalogue';
import { AnimatedProductGrid } from './AnimatedProductGrid';

export function StudioCollection() {
  const [shape, setShape] = useState('All shapes');
  const [detail,setDetail] = useState(false);
  const pieces = CATALOGUE.filter(p => shape === 'All shapes' || p.silhouette === shape);
  return <section className={`v-section v-edit v-studio-collection ${detail?'is-detail-view':''}`} id="collection">
    <div className="v-section-heading">
      <div><span className="v-kicker">The current edit / 01—{String(CATALOGUE.length).padStart(2, '0')}</span><h2>Find your everyday.</h2></div>
      <p>A favourite starts with a closer look.<br />Explore the colours. Compare your choices.</p>
    </div>
    <div className="v-studio-controls">
      <div className="v-studio-tabs" aria-label="Explore by shape">
        {['All shapes', ...new Set(CATALOGUE.map(p => p.silhouette))].map(name =>
          <button key={name} aria-pressed={name === shape} onClick={() => setShape(name)}>{name}</button>)}
      </div>
      <div className="v-view-controls" aria-label="Product photograph view"><button aria-pressed={!detail} onClick={()=>setDetail(false)}>Full view</button><button aria-pressed={detail} onClick={()=>setDetail(true)}>Detail view</button><span className="v-studio-count" role="status">{String(pieces.length).padStart(2, '0')} bags</span></div>
    </div>
    <AnimatedProductGrid pieces={pieces} priority />
    <div className="v-section-end"><span>Tap a colour. Take a closer look.</span><Link className="v-text-link" href="/collection">Explore all bags ↗</Link></div>
  </section>;
}
