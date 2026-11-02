import { Piece } from '@/lib/catalogue';
import { ProductCard } from './ProductCard';

export function AnimatedProductGrid({ pieces, priority = false }: { pieces: Piece[]; priority?: boolean }) {
  // Keep the product bases still when scrolling and pointing at the catalogue.
  return <div className="v-product-grid">
    {pieces.map((piece, i) => <ProductCard key={piece.slug} piece={piece} priority={priority && i < 2} />)}
  </div>;
}
