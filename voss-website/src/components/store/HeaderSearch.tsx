'use client';
import Link from 'next/link';
import {useRef,useState} from 'react';
import {CATALOGUE,coverImage,priceLabel} from '@/lib/catalogue';

export function HeaderSearch(){
  const dialog=useRef<HTMLDialogElement>(null);
  const input=useRef<HTMLInputElement>(null);
  const [query,setQuery]=useState('');
  const pieces=CATALOGUE.filter(p=>`${p.name} ${p.silhouette} ${p.colourways.map(c=>c.name).join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <>
    <button className="v-header-search-trigger" aria-label="Search VOSS bags" aria-haspopup="dialog" onClick={()=>{dialog.current?.showModal();input.current?.focus();}}><span>Search</span><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg></button>
    <dialog ref={dialog} className="v-header-search" aria-labelledby="v-search-title" onClick={e=>{if(e.target===e.currentTarget)dialog.current?.close();}}>
      <div className="v-search-inner"><div className="v-search-heading"><h2 id="v-search-title">Find your VOSS.</h2><button aria-label="Close search" onClick={()=>dialog.current?.close()}>Close ×</button></div>
        <input ref={input} type="search" aria-label="Search by bag, shape or colour" placeholder="Search by bag, shape or colour" value={query} onChange={e=>setQuery(e.target.value)}/>
        <p role="status">{query.trim()?`${pieces.length} ${pieces.length===1?'match':'matches'}`:'Explore the collection'}</p>
        <div className="v-search-results">{pieces.map(piece=><Link href={`/collection/${piece.slug}`} key={piece.slug} onClick={()=>dialog.current?.close()}><img src={coverImage(piece)} width="1122" height="1402" alt="" loading="lazy"/><span>{piece.name}</span><small>{priceLabel(piece.price)}</small></Link>)}</div>
        {!pieces.length&&<div className="v-search-empty"><p>No bags found. Try “tote”, “black” or “quilted”.</p><button onClick={()=>{setQuery('');input.current?.focus();}}>Clear search</button></div>}
        <Link className="v-text-link" href="/collection" onClick={()=>dialog.current?.close()}>View all handbags ↗</Link>
      </div>
    </dialog>
  </>;
}
