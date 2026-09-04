/**
 * INTERIM HERO — replace when real footage exists.
 *
 * Composes the hero plate from ONE catalogue photograph. Not a full-bleed
 * background: DESIGN-UPGRADE-PROMPT.md §4 forbids full-bleeding a 540px
 * product photo, and the old near-black video poster (10.8KB for 1920x1080)
 * is exactly why the hero read as an empty screen.
 *
 * Three things happen here that CSS must not do at runtime:
 *   1. the phone letterbox is cropped off (the sources are screen captures),
 *   2. the bottom-right corner is trimmed, because the source carries a
 *      device "AI edit" sparkle badge there,
 *   3. the ground is dimmed toward ink at the edges so the plate falls off
 *      into the page instead of ending on a hard rectangle.
 *
 *   node scripts/build-hero.mjs
 */
import sharp from "sharp";

const SRC = "public/products/02/1.jpg";
const OUT = "public/hero/plate.avif";

const LETTERBOX = 215; // measured: rows of pure black top and bottom
const BADGE = 46;      // bottom strip carrying the device AI badge

const src = sharp(SRC);
const { width, height } = await src.metadata();

const cropped = await src
  .extract({
    left: 0,
    top: LETTERBOX,
    width,
    height: height - LETTERBOX * 2 - BADGE,
  })
  .toBuffer();

const { width: W, height: H } = await sharp(cropped).metadata();

/* An inner vignette, baked. Same falloff every time, so the plate can never
   be tuned per-image — that is what makes a set of inconsistent backgrounds
   read as one set. */
const vignette = Buffer.from(
  `<svg width="${W}" height="${H}">
     <defs>
       <radialGradient id="v" cx="50%" cy="42%" r="78%">
         <stop offset="55%" stop-color="#000" stop-opacity="0"/>
         <stop offset="100%" stop-color="#06060700" stop-opacity="0.55"/>
       </radialGradient>
     </defs>
     <rect width="${W}" height="${H}" fill="url(#v)"/>
   </svg>`
);

await sharp(cropped)
  .composite([{ input: vignette, blend: "multiply" }])
  .avif({ quality: 62, effort: 6 })
  .toFile(OUT);

const { size } = await sharp(OUT).metadata();
console.log(`${OUT}  ${W}x${H}  ${(size / 1024).toFixed(1)} KB`);
