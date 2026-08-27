/**
 * Regrade the hero frame sequence.
 *
 * WHY THIS EXISTS
 * `video-to-sequence.mjs` extracts frames faithfully and does no grading. The
 * source clip is a very low-key studio shot: the extracted frames measured a
 * mean luminance of 2.6/255 (1%) with a stdev of 4.4. That is not "moody", it
 * is black. Two scrims then sit on top of it in Hero.tsx, so the bag was
 * invisible on every screen that is not a calibrated OLED in a dark room.
 *
 * The detail is recoverable: max pixel is 153, so the frame is crushed rather
 * than clipped. This script lifts it back into a readable range.
 *
 * THE GRADE
 *   linear(3.2, 2)      lift the whole curve, plus a tiny pedestal so the
 *                       blacks do not stay pinned at absolute zero
 *   gamma(1.2)          open the shadows without blowing the rim highlights
 *   modulate(sat 1.15)  the lift desaturates the aubergine leather; this puts
 *                       the colour back
 *
 * Numbers were picked by measuring: 2.5x still read as black, 6x was visibly
 * noisy (stdev 24.7 on a source with almost no real signal). 3.2x lands at a
 * mean of ~7/255 with the bag legible and the noise still buried.
 *
 * This is a ceiling, not a fix. The frames are a rim-lit silhouette and no
 * grade puts leather grain into them. A reshoot is the real answer.
 *
 * Usage:
 *   node scripts/grade-sequence.mjs [--dry]
 *
 * Originals are NOT kept by this script. Back up public/sequence/ first.
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = "public/sequence/reveal";
const DRY = process.argv.includes("--dry");

// AVIF settings matched to video-to-sequence.mjs so file sizes stay in band.
const AVIF = { quality: 50, effort: 4 };

const grade = (input) =>
  sharp(input)
    .linear(3.2, 2)
    .gamma(1.2)
    .modulate({ saturation: 1.15 })
    .avif(AVIF)
    .toBuffer();

if (!fs.existsSync(ROOT)) {
  console.error(`missing ${ROOT} - run video-to-sequence.mjs first`);
  process.exit(1);
}

const widths = fs
  .readdirSync(ROOT, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

let count = 0;
let before = 0;
let after = 0;

for (const w of widths) {
  const dir = path.join(ROOT, w);
  const frames = fs.readdirSync(dir).filter((f) => f.endsWith(".avif"));

  for (const f of frames) {
    const p = path.join(dir, f);
    const src = fs.readFileSync(p);
    const out = await grade(src);

    before += src.length;
    after += out.length;
    count += 1;

    if (!DRY) fs.writeFileSync(p, out);
  }

  console.log(`${w}: ${frames.length} frames`);
}

const stats = await sharp(path.join(ROOT, widths[0], "f00.avif")).stats();
const mean = stats.channels.slice(0, 3).reduce((a, c) => a + c.mean, 0) / 3;

console.log(
  `\n${DRY ? "[dry] " : ""}${count} frames | ` +
    `${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB | ` +
    `f00 mean luminance now ${mean.toFixed(1)}/255`,
);
