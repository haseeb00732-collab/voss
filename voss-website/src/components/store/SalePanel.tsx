import Link from 'next/link';
import { saleActive } from '@/lib/sale';
export function SalePanel(){
  if(!saleActive()) return null;
  return <section className="v-sale-panel" aria-label="November sale"><div><span className="v-kicker">The November edit</span><h2>Five favourites. 10% off.</h2><p>Selected bags, a little less. Prices already reduced.<br/>Through 16 November.</p></div><Link href="/collection?sale=true#sale-results" className="v-text-link">Shop the sale <span aria-hidden="true">↗</span></Link></section>;
}
