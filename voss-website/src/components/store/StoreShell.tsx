'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { CATALOGUE, getPiece, priceLabel, coverImage } from '@/lib/catalogue';
import { igProfile, igDirectMessage, IG_HANDLE } from '@/lib/instagram';
import { FloatingHeader } from './FloatingHeader';
import { HeaderSearch } from './HeaderSearch';

export type BagItem = { slug: string; colour: string; quantity: number };
const STORAGE = 'voss-bag-v1';
const EMPTY: BagItem[] = [];
let cachedRaw: string | null = null;
let cachedItems = EMPTY;
function snapshot() {
  try {
    const raw = localStorage.getItem(STORAGE);
    if (raw === cachedRaw) return cachedItems;
    cachedRaw = raw;
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cachedItems = Array.isArray(parsed) ? parsed.filter((item): item is BagItem => {
      if (!item || typeof item !== 'object') return false;
      const p = getPiece(item.slug);
      return !!p && p.colourways.some(c => c.key === item.colour) && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 20;
    }) : EMPTY;
    return cachedItems;
  } catch { return cachedItems; }
}
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('voss-bag', callback);
  return () => { window.removeEventListener('storage', callback); window.removeEventListener('voss-bag', callback); };
}
const BagContext = createContext<{ items: BagItem[]; save: (items: BagItem[]) => void; storageError: string; comparison: string[]; toggleComparison: (slug:string) => void }>({items:EMPTY,save:()=>{},storageError:'',comparison:[],toggleComparison:()=>{}});
export const useBag = () => useContext(BagContext);

export function StoreShell({children}: {children: React.ReactNode}) {
  const items = useSyncExternalStore(subscribe, snapshot, () => EMPTY);
  const [storageError, setStorageError] = useState('');
  const pathname = usePathname();
  const menu = useRef<HTMLDialogElement>(null);
  const comparisonDialog = useRef<HTMLDialogElement>(null);
  const [comparison, setComparison] = useState<string[]>([]);
  const toggleComparison = (slug: string) => setComparison(current => current.includes(slug) ? current.filter(item => item !== slug) : current.length < 2 ? [...current, slug] : current);
  function save(next: BagItem[]) {
    cachedItems = next;
    try { localStorage.setItem(STORAGE, JSON.stringify(next)); cachedRaw = JSON.stringify(next); setStorageError(''); }
    catch { setStorageError('Your browser could not save this bag. Keep this tab open while ordering.'); }
    window.dispatchEvent(new Event('voss-bag'));
  }
  useEffect(() => { menu.current?.close(); comparisonDialog.current?.close(); }, [pathname]);
  return <BagContext.Provider value={{items,save,storageError,comparison,toggleComparison}}>
    <div className="voss-site">
      <a href="#main" className="v-skip">Skip to content</a>
      <FloatingHeader>
        <button className="v-menu-trigger" aria-label="Open menu" onClick={() => menu.current?.showModal()}><span/><span/><span className="v-desktop-label">Menu</span></button>
        <nav className="v-header-categories" aria-label="Shop navigation"><Link href="/collection">Handbags</Link><Link href="/collection?shape=Totes">Totes</Link><Link href="/collection?shape=Top%20handle">Top handle</Link><Link href="/collection?shape=Bag%20sets">Bag sets</Link><Link href="/about" aria-current={pathname==='/about'?'page':undefined}>About VOSS</Link></nav>
        <Link href="/" className="v-wordmark" aria-label="VOSS home">VOSS</Link>
        <div className="v-header-tools"><Link className="v-header-care" href="/help">Client care</Link><HeaderSearch/><a className="v-header-instagram" href={igDirectMessage() ?? igProfile()} target="_blank" rel="noreferrer" aria-label="Order with VOSS on Instagram"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.7" r=".7"/></svg></a><Link href="/bag" className="v-bag-link" aria-label={`Shopping bag, ${items.reduce((n,i)=>n+i.quantity,0)} items`}><svg viewBox="0 0 24 26" fill="none" aria-hidden="true"><path d="M4 8h16l1 16H3L4 8Z M8 9V6a4 4 0 0 1 8 0v3"/></svg><span>{items.reduce((n,i)=>n+i.quantity,0)}</span></Link></div>
      </FloatingHeader>
      <dialog ref={menu} className="v-menu" onClick={e=>{if(e.target === e.currentTarget) menu.current?.close();}}>
        <div className="v-menu-inner"><div className="v-menu-top"><span className="v-kicker">The VOSS edit</span><button onClick={()=>menu.current?.close()} aria-label="Close menu">Close ×</button></div>
          <nav aria-label="Main navigation"><Link href="/collection" onClick={()=>menu.current?.close()}>The collection <span>01</span></Link><Link href="/about" onClick={()=>menu.current?.close()}>Our point of view <span>02</span></Link><Link href="/help" onClick={()=>menu.current?.close()}>Here to help <span>03</span></Link><Link href="/bag" onClick={()=>menu.current?.close()}>Your bag <span>04</span></Link></nav>
          <p>Considered shapes. A closer look.</p><a href={igProfile()} target="_blank" rel="noreferrer">@{IG_HANDLE} ↗</a>
        </div>
      </dialog>
      {children}
      {comparison.length > 0 && <aside className="v-compare-tray" aria-label="Selected bags for comparison">
        <span role="status">{comparison.length} / 2 selected</span>
        <button disabled={comparison.length < 2} onClick={() => comparisonDialog.current?.showModal()}>{comparison.length < 2 ? 'Choose one more bag' : 'Compare bags ↗'}</button>
        <button aria-label="Clear comparison" onClick={() => setComparison([])}>×</button>
      </aside>}
      <dialog ref={comparisonDialog} className="v-compare-dialog" aria-labelledby="v-compare-title" onClick={event => { if (event.target === event.currentTarget) comparisonDialog.current?.close(); }}>
        <div className="v-compare-content">
          <div className="v-compare-heading"><div><span className="v-kicker">Two points of view</span><h2 id="v-compare-title">Side by side.</h2></div><button aria-label="Close comparison" onClick={() => comparisonDialog.current?.close()}>Close ×</button></div>
          <p>Find the shape and colour range that feels right for you.</p>
          <div className="v-compare-grid">{comparison.map(slug => { const piece = getPiece(slug)!; return <article key={slug}>
            <img src={coverImage(piece)} width="1122" height="1402" alt={piece.name} />
            <h3>{piece.name}</h3>
            <dl><div><dt>Price</dt><dd>{priceLabel(piece.price)}</dd></div><div><dt>Shape</dt><dd>{piece.silhouette}</dd></div><div><dt>Colours</dt><dd>{piece.colourways.length} options</dd></div></dl>
            <Link href={`/collection/${piece.slug}`} className="v-text-link" onClick={() => comparisonDialog.current?.close()}>Explore this bag ↗</Link>
          </article>; })}</div>
        </div>
      </dialog>
      <footer className="v-footer">
        <div className="v-footer-intro"><span className="v-kicker">A considered way to carry.</span><p>Good form.<br/>Every day.</p><Link className="v-text-link" href="/collection">Find your VOSS <span>↗</span></Link></div>
        <div className="v-footer-links"><div><span className="v-kicker">Explore</span><Link href="/collection">The collection</Link><Link href="/about">About VOSS</Link><Link href="/bag">Your bag</Link></div><div><span className="v-kicker">Client care</span><Link href="/help">Ordering & delivery</Link><Link href="/help#exchanges">Exchanges</Link><Link href="/help#care">Bag care</Link><a href={igDirectMessage() ?? igProfile()} target="_blank" rel="noreferrer">Contact on Instagram ↗</a></div></div>
        <div className="v-footer-wordmark" aria-hidden="true">VOSS</div><div className="v-footer-base"><span>© {new Date().getFullYear()} VOSS</span><span>Pakistan · Prices in PKR</span><a href={igProfile()} target="_blank" rel="noreferrer">Instagram ↗</a></div>
      </footer>
    </div>
  </BagContext.Provider>;
}

export function OrderSummary({text}: {text:string}) {
  const [state,setState] = useState<'idle'|'copied'|'manual'>('idle');
  return <div className="v-order-summary"><p>Copy your selection, then send it to VOSS on Instagram. We’ll confirm availability and delivery before your order is placed.</p><button className="v-button" onClick={async()=>{try { await navigator.clipboard.writeText(text); setState('copied'); } catch {setState('manual');}}}>{state === 'copied' ? 'Selection copied ✓' : '1. Copy order details'}</button><a className="v-button v-button-outline" href={igDirectMessage() ?? igProfile()} target="_blank" rel="noreferrer">2. Open Instagram ↗</a><p role="status">{state === 'copied' ? 'Ready to paste into your message to VOSS.' : state === 'manual' ? 'Copy the details below manually, then open Instagram.' : 'Your order is confirmed in conversation with VOSS.'}</p><details open={state === 'manual'}><summary>View your order details</summary><textarea aria-label="Order details to copy" readOnly value={text} onFocus={e=>e.target.select()}/></details></div>;
}

export function bagMessage(items: BagItem[]) {
  const lines = items.map(item => { const p = CATALOGUE.find(p=>p.slug===item.slug)!; const colour=p.colourways.find(c=>c.key===item.colour)!; return `${p.label} · ${p.name} · ${colour.name} · Quantity ${item.quantity} · ${priceLabel(p.price)} each`; });
  const total=items.reduce((sum,item)=>sum+(getPiece(item.slug)?.price ?? 0)*item.quantity,0);
  return `Hi VOSS, I’d like to order:\n\n${lines.join('\n')}\n\nItems total: ${priceLabel(total)} (PKR).\nPlease confirm availability, delivery charges, payment options and exchange terms.`;
}
