'use client';
import { ArrowIcon } from '@/components/ArrowIcon';
import { useState } from 'react';
import { CATALOGUE } from '@/lib/catalogue';
import { AnimatedProductGrid } from './AnimatedProductGrid';

export function CollectionBrowser({initialCategory='All bags'}:{initialCategory?:string}) {
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState('edit');
  const [query, setQuery] = useState('');
  const pieces = CATALOGUE.filter(p => (category === 'All bags' || p.silhouette === category) && `${p.name} ${p.note} ${p.colourways.map(c => c.name).join(' ')}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => sort === 'low' ? (a.price ?? 0) - (b.price ?? 0) : sort === 'high' ? (b.price ?? 0) - (a.price ?? 0) : 0);
  return <>
    <div className="v-filter-bar">
      <div className="v-filter-tabs" aria-label="Filter collection">{['All bags', ...new Set(CATALOGUE.map(p => p.silhouette))].map(c => <button key={c} aria-pressed={category === c} onClick={() => setCategory(c)}>{c}</button>)}</div>
      <div className="v-filter-fields"><input type="search" aria-label="Search bags or colours" placeholder="Search bags or colours" value={query} onChange={e => setQuery(e.target.value)} /><select aria-label="Sort products" value={sort} onChange={e => setSort(e.target.value)}><option value="edit">The VOSS edit</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div>
    </div>
    <p className="v-result-count" role="status">{pieces.length} {pieces.length === 1 ? 'style' : 'styles'}</p>
    <AnimatedProductGrid pieces={pieces} />
    {!pieces.length && <div className="v-empty"><h2>No bags found.</h2><p>Try another shape or colour.</p><button className="v-text-link" onClick={() => { setQuery(''); setCategory('All bags'); }}>Clear filters <ArrowIcon direction="up-right" /></button></div>}
  </>;
}
