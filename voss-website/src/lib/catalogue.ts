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
 * substitute "Inquire".
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
  /** PKR. The price she pays today. Null renders no price row — never "Inquire". */
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
    imageCount: 6,
    price: 4500,
    listPrice: 6000,
    silhouette: "Top handle",
    note: "A structured top-handle with a sculpted flap and a twin-strap front.",
    colourways: [
      { name: "Black", hex: "#25262a", image: 1 },
      { name: "Tan", hex: "#785747", image: 2 },
      { name: "Chocolate", hex: "#49352b", image: 3 },
      { name: "Navy", hex: "#2c3349", image: 4 },
      { name: "Sand", hex: "#867a66", image: 5 },
    ],
    detailImages: [6], // interior, black bag, showing compartments
    shotIn: "cognac",
  },
  {
    slug: "gulnaar",
    dir: "02",
    name: "Gulnaar",
    urdu: "گلنار",
    label: "Style 02",
    imageCount: 6,
    price: 4500,
    listPrice: 6000,
    silhouette: "Shoulder",
    note: "Croc-embossed, with a gold turn-lock at the front.",
    colourways: [
      { name: "Sage", hex: "#5a5b55", image: 1 },
      // Image 2 photographs a SMOOTH finish with a zip front and no turn-lock,
      // where the rest of the set is croc-embossed with a lock. Either a second
      // finish or a different bag — confirm before selling it as a colourway.
      { name: "Camel", hex: "#876744", image: 2 },
      { name: "Navy", hex: "#1b2437", image: 3 },
      { name: "Honey", hex: "#7a5835", image: 4 },
      { name: "Chocolate", hex: "#47352b", image: 5 },
      { name: "Crimson", hex: "#7b3635", image: 6 },
    ],
    shotIn: "noir",
  },
  {
    slug: "naubahar",
    dir: "03",
    name: "Naubahar",
    urdu: "نو بہار",
    label: "Style 03",
    imageCount: 8,
    price: 4500,
    listPrice: 6000,
    silhouette: "Tote",
    note: "The largest bag in the range, with a matching wallet.",
    colourways: [
      { name: "Camel", hex: "#573b25", image: 1, alsoShotAs: [6] },
      { name: "Green", hex: "#3a4944", image: 2, alsoShotAs: [8] },
      { name: "Burgundy", hex: "#472925", image: 3, alsoShotAs: [4] },
      { name: "Black", hex: "#282825", image: 5, alsoShotAs: [7] },
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
      { name: "Olive", hex: "#35453a", image: 1 },
      { name: "Black", hex: "#2b2925", image: 2 },
      { name: "Chocolate", hex: "#493a34", image: 3 },
      // Images 4 and 5 carry another brand's name ("AURELIA") on a brass
      // plaque in the background. Do not publish either until they are
      // recropped or replaced.
      { name: "Cognac", hex: "#8b5536", image: 4 },
      { name: "Wine", hex: "#6b3533", image: 5 },
      { name: "Camel", hex: "#ab7c53", image: 6 },
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
      { name: "Espresso", hex: "#271b19", image: 1 },
      { name: "Green", hex: "#34453a", image: 2 },
      { name: "Tan", hex: "#854c28", image: 3 },
      { name: "Black", hex: "#191819", image: 4 },
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
      { name: "Cognac", hex: "#b76a36", image: 1 },
      // Image 2's background carries a boutique sign reading "Brand Name" —
      // AI placeholder text left in frame. Do not publish until replaced.
      { name: "Blush", hex: "#c89877", image: 2 },
      { name: "Black", hex: "#272629", image: 3 },
      { name: "Green", hex: "#5a6a53", image: 4 },
      { name: "Chocolate", hex: "#46322c", image: 5 },
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
 * PLACEHOLDER PHOTOGRAPHY — being reshot.
 *
 * Every image URL on the site is built by these three functions and nowhere
 * else. When the real photographs land, change `IMAGE_ROOT` and `IMAGE_EXT`
 * here and the whole site follows; no component knows where a picture lives.
 */
const IMAGE_ROOT = "/products";
const IMAGE_EXT = "jpg";

export function pieceImages(piece: Piece): string[] {
  return Array.from(
    { length: piece.imageCount },
    (_, i) => `${IMAGE_ROOT}/${piece.dir}/${i + 1}.${IMAGE_EXT}`
  );
}

/** The photograph a given colourway selects. */
export function colourwayImage(piece: Piece, c: Colourway): string {
  return `${IMAGE_ROOT}/${piece.dir}/${c.image}.${IMAGE_EXT}`;
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
