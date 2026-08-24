import { FINISHES, type Finish } from "./vitrine";

/**
 * The catalogue. Six pieces, photographed, available in four hides each.
 *
 * These are the real product — 35 unretouched photographs in
 * `public/products/`. They are served as plain URLs rather than statically
 * imported because they have not been through `grade-media.mjs`; when they are
 * graded, move them into `src/media` and this file gains a static import
 * instead of a string.
 *
 * `name` and `price` are deliberately null. The house has not named or priced
 * these yet, and a placeholder price is worse than no price — it teaches the
 * reader a number that will change. The grid says "Inquire" until real values
 * land, which is the same thing v1 did and the one thing v1 got right about
 * this data.
 */

export type Piece = {
  slug: string;
  /** Null until the house names it. `label` is what actually renders. */
  name: string | null;
  label: string;
  imageCount: number;
  /** USD. Null renders as "Inquire". */
  price: number | null;
  /** The hide this piece was photographed in — the others are made to order. */
  shotIn: string;
  silhouette: string;
  /** One line, used in the grid and as the meta description. */
  note: string;
};

export const CATALOGUE: Piece[] = [
  {
    slug: "01",
    name: null,
    label: "Style 01",
    imageCount: 6,
    price: null,
    shotIn: "cognac",
    silhouette: "Top handle",
    note: "A structured top-handle with a sculpted flap and hand-burnished edges.",
  },
  {
    slug: "02",
    name: null,
    label: "Style 02",
    imageCount: 6,
    price: null,
    shotIn: "noir",
    silhouette: "Shoulder",
    note: "A shoulder bag cut close to the body, unlined, holding its shape empty.",
  },
  {
    slug: "03",
    name: null,
    label: "Style 03",
    imageCount: 8,
    price: null,
    shotIn: "cognac",
    silhouette: "Tote",
    note: "The largest piece in the house. Vegetable-tanned, and it relaxes with use.",
  },
  {
    slug: "04",
    name: null,
    label: "Style 04",
    imageCount: 6,
    price: null,
    shotIn: "oxblood",
    silhouette: "Box",
    note: "A box bag with a detachable chain — a clutch by night, a shoulder bag by day.",
  },
  {
    slug: "05",
    name: null,
    label: "Style 05",
    imageCount: 4,
    price: null,
    shotIn: "bone",
    silhouette: "Crossbody",
    note: "The smallest silhouette, architectural and pale, made to read as sculpture.",
  },
  {
    slug: "06",
    name: null,
    label: "Style 06",
    imageCount: 5,
    price: null,
    shotIn: "noir",
    silhouette: "Weekend",
    note: "Cut for travel and finished like an evening piece. Full-grain throughout.",
  },
];

/** Every piece is made to order in every hide. */
export const HIDES: Finish[] = FINISHES;

export function pieceImages(piece: Piece): string[] {
  return Array.from({ length: piece.imageCount }, (_, i) => `/products/${piece.slug}/${i + 1}.jpg`);
}

export function getPiece(slug: string): Piece | undefined {
  return CATALOGUE.find((p) => p.slug === slug);
}

export function getHide(id: string): Finish {
  return HIDES.find((h) => h.id === id) ?? HIDES[0];
}

/** Neighbours, wrapping, for the "related pieces" rail below a product. */
export function relatedPieces(slug: string, count = 3): Piece[] {
  const i = CATALOGUE.findIndex((p) => p.slug === slug);
  if (i < 0) return CATALOGUE.slice(0, count);
  return Array.from({ length: count }, (_, k) => CATALOGUE[(i + k + 1) % CATALOGUE.length]);
}

export const priceLabel = (price: number | null) =>
  price === null
    ? "Inquire"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(price);
