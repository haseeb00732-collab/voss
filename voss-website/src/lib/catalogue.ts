/**
 * The catalogue. Seven bags, one price.
 *
 * THIS FILE IS THE ONLY PLACE any of it is written down. Names, slugs,
 * colour chips, image folders and prices all live here, and every component
 * reads them from here. Nothing below is allowed to be repeated in a
 * component — the whole point is that a reshoot or a rename is an edit to
 * this file and nothing else.
 *
 * NAME is a DESCRIPTIVE English name (set 2026-09-02, replacing the Urdu-word
 * names set 2026-08-31), in the register rtwcreation.com uses:
 * COLOUR-less TEXTURE/DETAIL + USE/SIZE + BAG TYPE — colour is never in the
 * name because the card offers 4-9 colours and a colour in a multi-colour
 * listing's name is a lie on every click but one. Every word was checked
 * against the actual restaged photography, not assumed: "sculpted flap" was
 * in style 01's note and there is no flap in the photograph, so it is gone;
 * "tassel" was claimed for style 05 and there are no tassels in the shot, so
 * the note now says what is actually there (a two-tone croc body). `name` is
 * primary everywhere — cards, alt text, page title, meta description,
 * JSON-LD, the Instagram DM line — because it is what she types and what
 * search sees.
 *
 * URDU IS REMOVED (2026-09-02, Haseeb's call). The `urdu` field, the large
 * Nastaliq block on the product page, the font and its subsetter are all
 * gone. It cost a font file on every product page and a whole RTL text path
 * to render a word that no longer had anything to do with the product's
 * name. scripts/subset-fonts.py now has no consumer for Nastaliq; it is kept
 * only for Jost. If Urdu ever returns it returns as a deliberate brand
 * decision, not as a leftover.
 *
 * `label` ("Style 0N") is kept in the data as the short internal code the
 * naming brief allows, but nothing renders it except as a fallback when
 * `name` is somehow absent — it was never actually reaching the page.
 *
 * SLUGS ARE UNCHANGED (afsun, gulnaar, ...) — a deliberate scope cut. The
 * naming brief's own Step 3 offers kebab-casing the new name into the URL
 * with redirects from the old slugs; that is a bigger, separately-approvable
 * change (every product URL moves) and was not asked for here. Revisit if
 * the descriptive names are meant to carry SEO weight in the URL too.
 *
 * COLOURWAY HEXES 07-12 were read off the restaged photography by eye, not
 * sampled: the pipeline's automatic sampler returned the BACKDROP for several
 * shots (style 11 came back as five shades of the tan wall behind a navy bag),
 * so the measured values were not usable. Re-measure before launch.
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
};

export const CATALOGUE: Piece[] = [
  {
    slug: "afsun",
    dir: "01",
    name: "Structured Workplace Handbag",
    label: "Style 01",
    imageCount: 5,
    price: 4500,
    listPrice: 6000,
    silhouette: "Top handle",
    note: "A structured top-handle bag with a twin-strap front and a gold nameplate.",
    colourways: [
      { name: "Tan", hex: "#7a523f", image: 1 },
      { name: "Chocolate", hex: "#4d372c", image: 2 },
      { name: "Navy", hex: "#283041", image: 3 },
      { name: "Sand", hex: "#a58b73", image: 4 },
      { name: "Black", hex: "#232323", image: 5 },
    ],
  },
  {
    slug: "naubahar",
    dir: "03",
    name: "Croc Office Tote Bag",
    label: "Style 03",
    imageCount: 4,
    price: 4500,
    listPrice: 6000,
    silhouette: "Tote",
    note: "A croc-embossed tote with a matching wallet.",
    colourways: [
      { name: "Green", hex: "#243b32", image: 1 },
      { name: "Burgundy", hex: "#3e1f22", image: 2 },
      { name: "Black", hex: "#242526", image: 3 },
      { name: "Ochre", hex: "#724c26", image: 4 },
    ],
  },
  {
    slug: "dilara",
    dir: "04",
    name: "Box Quilted Tote Bag",
    label: "Style 04",
    imageCount: 6,
    price: 4500,
    listPrice: 6000,
    silhouette: "Structured tote",
    note: "A box-quilted tote that holds its structured shape.",
    colourways: [
      { name: "Tan", hex: "#824e2f", image: 1 },
      { name: "Wine", hex: "#52322a", image: 2 },
      { name: "Chocolate", hex: "#3f3429", image: 3 },
      { name: "Green", hex: "#313830", image: 4 },
      { name: "Camel", hex: "#9b6d46", image: 5 },
      { name: "Black", hex: "#2e2e24", image: 6 },
    ],
  },
  {
    slug: "mahrooh",
    dir: "05",
    name: "Croc Two-Tone Shopper Bag",
    label: "Style 05",
    imageCount: 4,
    price: 4500,
    listPrice: 6000,
    silhouette: "Shopper",
    note: "A croc-embossed shopper in two tones, open at the top.",
    colourways: [
      { name: "Green", hex: "#2f3a24", image: 1 },
      { name: "Black", hex: "#181617", image: 2 },
      { name: "Tan", hex: "#9a633a", image: 3 },
      { name: "Chocolate", hex: "#2b1d19", image: 4 },
    ],
  },
  {
    slug: "meher",
    dir: "06",
    name: "Chevron Quilted Handbag",
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
  },
  {
    slug: "shabnam",
    dir: "09",
    name: "Three-Piece Tote Set",
    label: "Style 09",
    imageCount: 4,
    price: 4500,
    listPrice: 6000,
    silhouette: "Three-piece set",
    note: "A structured tote, a crossbody pouch and a chain purse. Three bags.",
    colourways: [
      { name: "Black", hex: "#212122", image: 1 },
      { name: "Navy", hex: "#1b2f47", image: 2 },
      { name: "Grey", hex: "#8d8681", image: 3 },
      { name: "Cream", hex: "#d6c6ad", image: 4 },
    ],
  },
  {
    slug: "saba",
    dir: "10",
    name: "Two-Tone Tassel Tote Set",
    label: "Style 10",
    imageCount: 5,
    price: 4500,
    listPrice: 6000,
    silhouette: "Two-tone tote set",
    note: "A two-tone tote with a tasselled pouch and a rounded purse.",
    colourways: [
      { name: "Cream", hex: "#cfc4b4", image: 1 },
      { name: "Grey", hex: "#6d6c6b", image: 2 },
      { name: "Tan", hex: "#ac6740", image: 3 },
      { name: "Blush", hex: "#b98a7c", image: 4 },
      { name: "Wine", hex: "#653c3d", image: 5 },
    ],
  },
];

/**
 * The four finish hexes carried over from the deleted 3D configurator
 * (`lib/vitrine.ts`), retained per VOSS-VISUAL-TARGET §6.
 *
 * These are NOT the catalogue's colour source — `Piece.colourways` is, and it
 * is measured from the actual photography. These four are a retired
 * made-to-order finish library, kept only so the values are not lost, and
 * they are a different set from the six product hues in §1.6.
 *
 * They have no consumer today. If §1.6's `--hue-*` tokens supersede them,
 * delete this block rather than finding it a job.
 */
export const HUE_TOKENS: Record<string, string> = {
  noir: "#14100e",
  cognac: "#7a4423",
  bone: "#c8bba8",
  oxblood: "#5a1f26",
};

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
  "01": 6, "03": 8, "04": 6, "05": 4, "06": 5,
};

export function legacyImages(piece: Piece): string[] {
  const n = LEGACY_COUNTS[piece.dir] ?? 0;
  return Array.from({ length: n }, (_, i) => `${LEGACY_ROOT}/${piece.dir}/${i + 1}.jpg`);
}

/**
 * How many styles ship, as a number and as an English word.
 *
 * NEVER write this count into a component. It was hard-coded as "Six" in
 * seven places — the hero twice, both collection pages, and three metadata
 * descriptions — and adding styles 07-12 left every one of them lying, in the
 * page title and the Open Graph card included. §11.1: no component holds a
 * product fact of its own, and a count is a product fact.
 */
export const STYLE_COUNT = CATALOGUE.length;

const COUNT_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six",
  "seven", "eight", "nine", "ten", "eleven", "twelve",
];

/** Lowercase, for running copy. Capitalise at the call site if a line opens with it. */
export const styleCountWord =
  COUNT_WORDS[STYLE_COUNT] ?? String(STYLE_COUNT);

/** Capitalised, for a sentence opening. */
export const StyleCountWord =
  styleCountWord.charAt(0).toUpperCase() + styleCountWord.slice(1);

/** The cover shot: the first colourway, never a detail crop. */
export function coverImage(piece: Piece): string {
  return colourwayImage(piece, piece.colourways[0]);
}

export function getPiece(slug: string): Piece | undefined {
  return CATALOGUE.find((p) => p.slug === slug);
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
