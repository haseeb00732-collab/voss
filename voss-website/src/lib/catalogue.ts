import { FINISHES, type Finish } from "./vitrine";

/**
 * The catalogue. Six bags, one price.
 *
 * THIS FILE IS THE ONLY PLACE any of it is written down. Names, Urdu, slugs,
 * colour chips, image folders and prices all live here, and every component
 * reads them from here. Nothing below is allowed to be repeated in a
 * component — the whole point is that a reshoot or a rename is an edit to
 * this file and nothing else.
 *
 * NAMES (set 2026-08-31) are the six confirmed by Haseeb. `name` is Latin and
 * is primary everywhere — cards, alt text, metadata, slugs, the Instagram
 * message — because it is what she types and what the URL carries. `urdu` is
 * display-only and appears large on product pages; at card size Nastaliq is
 * illegible. See DESIGN-UPGRADE-PROMPT.md §2.
 *
 * Open, and deliberately not blocking: ماہ رُخ transliterates as "Mahrukh"
 * (mah = moon, rukh = face) rather than "Mahrooh". The site is not live and
 * nothing is indexed, so the slug is cheap to change until it is.
 *
 * `dir` is the image folder and `slug` is the URL. They are separate on
 * purpose: the photography is numbered 01–06 and is being reshot, while the
 * URL should read `/collection/afsun`. Changing one must never move the other.
 *
 * PRICE is PKR, list 6000 with a launch offer at 4500. `priceLabel` returns
 * null for a null price and the card renders no price row in that case. Keep
 * that branch: the promise is "the price is on the page, no DMs". Never
 * substitute a placeholder word for a number.
 */

export type Colourway = {
  /** What she would type in a DM: "the black one". Plain English on purpose. */
  name: string;
  /**
   * PLACEHOLDER — re-measure from real photography before launch.
   * Rendered directly as the chip's colour. Never sampled from the image at
   * runtime, so a reshoot changes the photograph without silently changing
   * what the chip claims.
   */
  hex: string;
  /** 1-based file in `public/products/<dir>/`. */
  image: number;
  /** Other photographs of this same colourway, if any. */
  alsoShotAs?: number[];
};

export type Piece = {
  /** URL segment. Lowercase Latin, no diacritics. */
  slug: string;
  /** Image folder under `public/products/`. Not the URL. */
  dir: string;
  /** Latin, primary everywhere. */
  name: string;
  /** Display-only, product pages at 64px+. Never at card size. */
  urdu: string;
  label: string;
  /** Total photographs on disk for this style, colourways and details alike. */
  imageCount: number;
  /** PKR. The price she pays today. Null renders no price row, never a word. */
  price: number | null;
  /** PKR. The list price the offer is struck through from. Null = no offer. */
  listPrice: number | null;
  /** The colours this bag is actually photographed in. */
  colourways: Colourway[];
  /** Photographs that are not a colourway: interiors, detail crops. */
  detailImages?: number[];
  silhouette: string;
  /** One line, used in the grid and as the meta description. */
  note: string;
  /**
   * @deprecated The four-hide system (noir/cognac/bone/oxblood) is a
   * made-to-order remnant. Kept only until `HideSwatches`, `PieceHero` and
   * `CollectionGrid` move to `colourways`.
   */
  shotIn: string;
};

export const CATALOGUE: Piece[] = [
  {
    slug: "afsun",
    dir: "01",
    name: "Afsun",
    urdu: "افسون",
    label: "Style 01",
    imageCount: 5,
    price: 4500,
    listPrice: 6000,
    silhouette: "Top handle",
    note: "A structured top-handle with a sculpted flap and a twin-strap front.",
    colourways: [
      { name: "Tan", hex: "#7a523f", image: 1 },
      { name: "Chocolate", hex: "#4d372c", image: 2 },
      { name: "Navy", hex: "#283041", image: 3 },
      { name: "Sand", hex: "#a58b73", image: 4 },
      { name: "Black", hex: "#232323", image: 5 },
    ],
    shotIn: "cognac",
  },
  {
    slug: "gulnaar",
    dir: "02",
    name: "Gulnaar",
    urdu: "گلنار",
    label: "Style 02",
    imageCount: 5,
    price: 4500,
    listPrice: 6000,
    silhouette: "Shoulder",
    note: "Croc-embossed, with a gold turn-lock at the front.",
    colourways: [
      { name: "Navy", hex: "#454657", image: 1 },
      { name: "Stone", hex: "#887e74", image: 2 },
      { name: "Chocolate", hex: "#6b4e46", image: 3 },
      { name: "Wine", hex: "#90514b", image: 4 },
      { name: "Camel", hex: "#b1794e", image: 5 },
    ],
    shotIn: "noir",
  },
  {
    slug: "naubahar",
    dir: "03",
    name: "Naubahar",
    urdu: "نو بہار",
    label: "Style 03",
    imageCount: 4,
    price: 4500,
    listPrice: 6000,
    silhouette: "Tote",
    note: "The largest bag in the range, with a matching wallet.",
    colourways: [
      { name: "Green", hex: "#243b32", image: 1 },
      { name: "Burgundy", hex: "#3e1f22", image: 2 },
      { name: "Black", hex: "#242526", image: 3 },
      { name: "Ochre", hex: "#724c26", image: 4 },
    ],
    shotIn: "cognac",
  },
  {
    slug: "dilara",
    dir: "04",
    name: "Dilara",
    urdu: "دل آرا",
    label: "Style 04",
    imageCount: 6,
    price: 4500,
    listPrice: 6000,
    silhouette: "Structured tote",
    note: "A quilted grid tote that holds its shape.",
    colourways: [
      { name: "Tan", hex: "#824e2f", image: 1 },
      { name: "Wine", hex: "#52322a", image: 2 },
      { name: "Chocolate", hex: "#3f3429", image: 3 },
      { name: "Green", hex: "#313830", image: 4 },
      { name: "Camel", hex: "#9b6d46", image: 5 },
      { name: "Black", hex: "#2e2e24", image: 6 },
    ],
    shotIn: "oxblood",
  },
  {
    slug: "mahrooh",
    dir: "05",
    name: "Mahrooh",
    urdu: "ماہ رُخ",
    label: "Style 05",
    imageCount: 4,
    price: 4500,
    listPrice: 6000,
    silhouette: "Shopper",
    note: "A soft-sided shopper, croc-embossed, open at the top.",
    colourways: [
      { name: "Green", hex: "#2f3a24", image: 1 },
      { name: "Black", hex: "#181617", image: 2 },
      { name: "Tan", hex: "#9a633a", image: 3 },
      { name: "Chocolate", hex: "#2b1d19", image: 4 },
    ],
    shotIn: "bone",
  },
  {
    slug: "meher",
    dir: "06",
    name: "Meher",
    urdu: "مہر",
    label: "Style 06",
    imageCount: 5,
    price: 4500,
    listPrice: 6000,
    silhouette: "Chevron tote",
    note: "Chevron-quilted, with a matching wallet and a detachable strap.",
    colourways: [
      { name: "Cognac", hex: "#9b6534", image: 1 },
      { name: "Green", hex: "#4f4f38", image: 2 },
      { name: "Black", hex: "#2b2929", image: 3 },
      { name: "Chocolate", hex: "#4b342f", image: 4 },
      { name: "Blush", hex: "#bf9b80", image: 5 },
    ],
    shotIn: "noir",
  },
];

/**
 * @deprecated The four-hide finish library. Still feeds the 3D configurator
 * and the legacy `HideSwatches`; it is NOT the catalogue's colour source.
 */
export const HIDES: Finish[] = FINISHES;

/**
 * IMAGE SOURCES. Two sets, both kept, and this is the only place either is
 * named.
 *
 * `products-hd/` is the GENERATED set, built by `scripts/build-media.mjs` from
 * the 1792x2400 originals on the desktop. It is the catalogue: consistent
 * lighting, one background per style, and enough resolution to render large.
 * Three widths per shot, so the browser picks rather than upscaling.
 *
 * `products/` is the ORIGINAL 540x1170 phone set. Kept, not deleted, and shown
 * as extra gallery frames on a product page. It is why the design prompt caps
 * product photos at 440 CSS px — that cap belongs to THIS set, not to the
 * generated one.
 *
 * A reshoot is still a one-file change: repoint HD_ROOT and re-run the script.
 */
const HD_ROOT = "/products-hd";
const LEGACY_ROOT = "/products";
const HD_WIDTHS = [440, 880, 1320];

/** Largest generated width — the `src` a plain <img> falls back to. */
export function hdImage(piece: Piece, n: number): string {
  return `${HD_ROOT}/${piece.dir}/${n}-1320.avif`;
}

/** Full srcset so the browser downloads the width it will actually paint. */
export function hdSrcSet(piece: Piece, n: number): string {
  return HD_WIDTHS.map((w) => `${HD_ROOT}/${piece.dir}/${n}-${w}.avif ${w}w`).join(", ");
}

/** Every generated shot for a style, in order. */
export function pieceImages(piece: Piece): string[] {
  return Array.from({ length: piece.imageCount }, (_, i) => hdImage(piece, i + 1));
}

/** The photograph a given colourway selects, from the generated set. */
export function colourwayImage(piece: Piece, c: Colourway): string {
  return hdImage(piece, c.image);
}

export function colourwaySrcSet(piece: Piece, c: Colourway): string {
  return hdSrcSet(piece, c.image);
}

/**
 * The original phone-set frames for a style, as extra gallery images. These
 * are 540px wide: never render one above 440 CSS px.
 */
export const LEGACY_COUNTS: Record<string, number> = {
  "01": 6, "02": 6, "03": 8, "04": 6, "05": 4, "06": 5,
};

export function legacyImages(piece: Piece): string[] {
  const n = LEGACY_COUNTS[piece.dir] ?? 0;
  return Array.from({ length: n }, (_, i) => `${LEGACY_ROOT}/${piece.dir}/${i + 1}.jpg`);
}

/** The cover shot: the first colourway, never a detail crop. */
export function coverImage(piece: Piece): string {
  return colourwayImage(piece, piece.colourways[0]);
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

/**
 * PKR, tabular figures, written the way the market writes it: "Rs 4,500".
 * Null means "no price row", never a placeholder.
 */
export const priceLabel = (price: number | null) =>
  price === null
    ? null
    : "Rs " + new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(price);

/**
 * THE LAUNCH OFFER.
 *
 * Rs 4,500 is the confirmed real selling price (2026-08-27), so the offer is
 * live. What is NOT confirmed is when it ends, and the content pack is
 * explicit that the offer must have a real end and Rs 6,000 must be the real
 * price when it is not running.
 *
 * So `endsOn` is null and every piece of copy that would name a date omits the
 * clause entirely rather than printing "until [end date]". Set `endsOn` and the
 * date appears everywhere at once; set `live: false` and the whole site falls
 * back to the offer-ended wording, "Six bags, one price, Rs 6,000".
 *
 * Do not invent a date here. A discount that never ends is the practice this
 * brand's positioning is built against.
 */
export const OFFER = {
  live: true,
  /** TODO [end date] — unconfirmed. ISO yyyy-mm-dd. Null renders no date. */
  endsOn: null as string | null,
  save: 1500,
} as const;

/** Is the launch offer live right now? */
export function offerRunning(now: Date = new Date()): boolean {
  if (!OFFER.live) return false;
  if (!OFFER.endsOn) return true; // live, end date not yet announced
  return now <= new Date(OFFER.endsOn + "T23:59:59");
}

/**
 * "until 30 September" — or an empty string while the date is unconfirmed.
 * Callers must tolerate the empty string; never substitute a placeholder.
 */
export function offerEndsLabel(): string {
  if (!OFFER.endsOn) return "";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" })
    .format(new Date(OFFER.endsOn + "T00:00:00"));
}

/**
 * What a card should show. One place decides whether she sees a struck-through
 * list price or a single number, so the hero, the grid and the product page
 * can never disagree about what the bag costs.
 */
export function pricing(piece: Piece, now?: Date) {
  const running = offerRunning(now) && piece.listPrice !== null;
  return {
    running,
    /** The number she pays. */
    now: priceLabel(running ? piece.price : (piece.listPrice ?? piece.price)),
    /** Struck through. Null when no offer is running. */
    was: running ? priceLabel(piece.listPrice) : null,
    save: running ? priceLabel(OFFER.save) : null,
  };
}
