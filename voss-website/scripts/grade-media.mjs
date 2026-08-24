/**
 * VOSS image grading — bakes Voss-Design.md §7.1 into the asset files.
 *
 * Seven steps, in order, two variants:
 *   1 desaturate            paper 88%   / vitrine 82%
 *   2 lift the blacks       -> --ink    / --onyx        (never pure black)
 *   3 warm the highlights   -> --bone   / --gold-100 @ 35%
 *   4 no cool shadows       (we only ever warm; nothing here adds blue)
 *   5 flatten midtones -8/-12%, then a gentle S at the extremes
 *   6 grain, monochrome     paper 3%    / vitrine 2%
 *   7 frame hairline        -- CSS, not baked (see .plate in globals.css)
 *
 * Steps 2,3,5 collapse into one per-channel LUT; 1 and 6 are cross-channel
 * and run inline in the same raw pass, so every pixel is touched once.
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SRC = process.argv[2];
const OUT = process.argv[3];

/**
 * Deviation from §7.1, deliberate: the doc specifies 88% / 82% saturation,
 * which assumes a normally-graded source. Every free stock frame here is
 * pushed hard to sell, so 88% still landed orange enough to read as stock.
 * These values hit the intent the doc states ("real fashion imagery isn't
 * oversaturated") rather than its literal number.
 */
const GRADES = {
  paper: {
    sat: 0.72,
    lift: [0x14, 0x13, 0x12], // --ink
    white: [241, 237, 228], // --bone
    flatten: 0.08,
    grain: 0.03,
  },
  vitrine: {
    sat: 0.64,
    lift: [0x0b, 0x0b, 0x0c], // --onyx
    // --gold-100 at low amount: 35% of the way from white toward the foil.
    white: [250, 246, 236],
    flatten: 0.12,
    grain: 0.02,
  },
};

const S_AMOUNT = 0.25; // gentle S at the extremes, not a punchy curve

/** Per-channel tone LUT: flatten midtones -> gentle S -> map into [lift, white]. */
function buildLut({ lift, white, flatten }) {
  return [0, 1, 2].map((c) => {
    const lut = new Uint8Array(256);
    for (let v = 0; v < 256; v++) {
      let x = v / 255;
      x = 0.5 + (x - 0.5) * (1 - flatten); // 5a: flatten the midtones
      const s = x * x * (3 - 2 * x); // smoothstep
      x = x + S_AMOUNT * (s - x); // 5b: gentle S
      x = Math.min(1, Math.max(0, x));
      lut[v] = Math.round(lift[c] + x * (white[c] - lift[c])); // 2 + 3
    }
    return lut;
  });
}

/**
 * Deterministic value noise. Math.random would re-grain differently on every
 * run, so an identical rebuild would produce a different file for no reason.
 */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function grade(inPath, outPath, { grade: g, ratio, position = "centre", width, sat }) {
  // A couple of sources are far hotter than the rest; `sat` pulls just those
  // back so the swatch row reads as one hide rather than four dye lots.
  const cfg = { ...GRADES[g], ...(sat !== undefined ? { sat } : {}) };
  const [rw, rh] = ratio.split(":").map(Number);
  const height = Math.round((width * rh) / rw);

  const { data, info } = await sharp(inPath)
    .resize(width, height, { fit: "cover", position })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const lut = buildLut(cfg);
  const rand = mulberry32(
    // Seed off the filename so each image grains differently but repeatably.
    [...path.basename(outPath)].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) | 0, 7)
  );
  const amp = cfg.grain * 255;

  for (let i = 0; i < data.length; i += 3) {
    const r = data[i], gr = data[i + 1], b = data[i + 2];

    // 1 — desaturate toward luma
    const L = 0.2126 * r + 0.7152 * gr + 0.0722 * b;
    let R = L + (r - L) * cfg.sat;
    let G = L + (gr - L) * cfg.sat;
    let B = L + (b - L) * cfg.sat;

    // 2/3/5 — tone map
    R = lut[0][Math.min(255, Math.max(0, Math.round(R)))];
    G = lut[1][Math.min(255, Math.max(0, Math.round(G)))];
    B = lut[2][Math.min(255, Math.max(0, Math.round(B)))];

    // 6 — one monochrome delta per pixel; colour noise reads as a bad sensor
    const n = (rand() - 0.5) * 2 * amp;
    data[i] = Math.min(255, Math.max(0, R + n));
    data[i + 1] = Math.min(255, Math.max(0, G + n));
    data[i + 2] = Math.min(255, Math.max(0, B + n));
  }

  await sharp(data, { raw: { width: info.width, height: info.height, channels: 3 } })
    .jpeg({ quality: 86, chromaSubsampling: "4:4:4", mozjpeg: true })
    .toFile(outPath);

  return `${path.basename(outPath)} ${info.width}x${info.height} ${g}`;
}

const PLAN = JSON.parse(fs.readFileSync(process.argv[4], "utf8"));
fs.mkdirSync(OUT, { recursive: true });

for (const item of PLAN) {
  const src = path.join(SRC, `${item.id}.jpg`);
  if (!fs.existsSync(src)) {
    console.log(`MISSING ${item.id}`);
    continue;
  }
  console.log(await grade(src, path.join(OUT, `${item.out}.jpg`), item));
}
