import { FINISHES, type Finish } from "./vitrine";

/**
 * The catalogue. Six pieces, photographed, available in four hides each.
 *
 * These are the real product: 35 photographs in `public/products/`, now
 * graded into the vitrine by `scripts/grade-catalogue.mjs` and served from
 * `public/products-graded/` as AVIF. The page is dark-dominant, and the
 * ungraded originals read as bright rectangles punched out of it.
 *
 * The originals are never modified. Re-run the script to regrade; never
 * filter in CSS, so what ships is what was art-directed.
 *
 * Names and prices are set (PKR 4,500 across the range, confirmed 2026-08-27).
 * `priceLabel` still returns null for a null price, and the card still
 * renders no price row in that case. Keep that branch: the brief says a card
 * without a confirmed price does not ship, and section 5 sells "the price is
 * on the page, no DMs" as the promise. Never substitute "Inquire".
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
  /**
   * One colour per photograph, median-sampled from that image's own centre
   * box by `scripts/grade-catalogue.mjs`.
   *
   * Per IMAGE, not per product, and that is the whole point: product_2 is a
   * single bag shot in five colourways, so a per-product colour would be a
   * lie for four of its five photographs. `colourways[i]` always describes
   * `pieceImages(piece)[i]`, so a chip and the photograph it selects cannot
   * contradict. Regenerate by re-running the grade script; never hand-edit.
   *
   * `shotIn` is NOT the source: it records an intended hide and disagrees
   * with several of the images.
   */
  colourways: string[];
  silhouette: string;
  /** One line, used in the grid and as the meta description. */
  note: string;
};

export const CATALOGUE: Piece[] = [
  {
    slug: "01",
    colourways: ["#6a4d41", "#483933", "#31343d", "#9b8570", "#2a2929"],
    name: "Halden",
    label: "Style 01",
    imageCount: 5,
    price: 4500,
    shotIn: "cognac",
    silhouette: "Top handle",
    note: "A structured top-handle with a sculpted flap and a twin-strap front.",
  },
  {
    slug: "02",
    colourways: ["#4f4e57", "#8e867a", "#6c564f", "#8b5c55", "#ac8360"],
    name: "Merrow",
    label: "Style 02",
    imageCount: 5,
    price: 4500,
    shotIn: "noir",
    silhouette: "Shoulder",
    note: "A shoulder bag cut close to the body, unlined, holding its shape empty.",
  },
  {
    slug: "03",
    colourways: ["#394841", "#473131", "#343435", "#795c3f"],
    name: "Solene",
    label: "Style 03",
    imageCount: 4,
    price: 4500,
    shotIn: "cognac",
    silhouette: "Tote",
    note: "The largest bag in the range. Twin handles and a top zip.",
  },
  {
    slug: "04",
    colourways: ["#744e38", "#483b31", "#3e3b31", "#3a3b32", "#916e51", "#3a3930"],
    name: "Corbel",
    label: "Style 04",
    imageCount: 6,
    price: 4500,
    shotIn: "oxblood",
    silhouette: "Box",
    note: "A box bag with a detachable chain. A clutch by night, a shoulder bag by day.",
  },
  {
    slug: "05",
    colourways: ["#383f32", "#282626", "#966d4e", "#372d29"],
    name: "Wren",
    label: "Style 05",
    imageCount: 4,
    price: 4500,
    shotIn: "bone",
    silhouette: "Crossbody",
    note: "The smallest silhouette, architectural and pale, made to read as sculpture.",
  },
  {
    slug: "06",
    colourways: ["#986c48", "#5d6551", "#3b3a39", "#4d3d39", "#b49982"],
    name: "Kestrel",
    label: "Style 06",
    imageCount: 5,
    price: 4500,
    shotIn: "noir",
    silhouette: "Weekend",
    note: "Cut for travel, finished like an evening piece.",
  },
];

/** Every piece is made to order in every hide. */
export const HIDES: Finish[] = FINISHES;

export function pieceImages(piece: Piece): string[] {
  return Array.from(
    { length: piece.imageCount },
    (_, i) => `/products-graded/${piece.slug}/${i + 1}.avif`
  );
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

/** PKR, tabular figures. Null means "no price row", never a placeholder. */
export const priceLabel = (price: number | null) =>
  price === null
    ? null
    : new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        maximumFractionDigits: 0,
      }).format(price);
