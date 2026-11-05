import { Piece, priceLabel } from '@/lib/catalogue';
export function SalePrice({piece}:{piece:Piece}) {
  return <span className="v-sale-price">{piece.listPrice && <del>{priceLabel(piece.listPrice)}</del>} <span>{priceLabel(piece.price)}</span>{piece.listPrice && <strong>10% OFF</strong>}</span>;
}
