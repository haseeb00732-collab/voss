import Link from 'next/link';
import { ArrowIcon } from '@/components/ArrowIcon';
import { CATALOGUE, coverImage, coverSrcSet } from '@/lib/catalogue';
import { saleActive, SALE_PRICES } from '@/lib/sale';
import { SalePrice } from './SalePrice';

export function SalePanel() {
  if (!saleActive()) return null;
  const featured = CATALOGUE.filter(piece => Object.hasOwn(SALE_PRICES, piece.slug));
  return <section className="v-sale-panel" aria-labelledby="november-edit">
    <div className="v-sale-heading">
      <div>
        <span className="v-kicker">The November edit</span>
        <h2 id="november-edit">Five favourites. 10% off.</h2>
        <p>Prices already reduced. Through 16 November.</p>
      </div>
      <Link href="/collection?sale=true#sale-results" className="v-text-link">Shop the sale <ArrowIcon /></Link>
    </div>
    <ul className="v-sale-featured">
      {featured.map(piece => <li key={piece.slug}>
        <Link href={`/collection/${piece.slug}`}>
          <img src={coverImage(piece)} srcSet={coverSrcSet(piece)} sizes="(max-width: 760px) 42vw, 17vw"
            alt="" width="960" height="1200" loading="lazy" />
          <span className="v-sale-featured-name">{piece.name}</span>
          <SalePrice piece={piece} />
        </Link>
      </li>)}
    </ul>
  </section>;
}
