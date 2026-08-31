/**
 * Build the web assets from the ORIGINALS on the desktop.
 *
 * The generated product renders are 1792x2400 (product 1 is 1122x1402). The
 * older set in `public/products/` is 540x1170 phone screen captures — that
 * resolution is the entire reason the design prompt caps product photos at
 * 440 CSS px. These do not need that cap.
 *
 * Writes:
 *   public/products-hd/<slug>/<n>-{440,880,1320}.avif
 *   public/hero/poster.avif        <- a LIT frame, not frame 0
 *   src/lib/media.generated.json   <- per image: dimensions + measured hex
 *
 *   node scripts/build-media.mjs
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const ROOT = "C:/Users/pesum/OneDrive/Desktop/Voss";
const OUT = "public/products-hd";
const SLUGS = ["01", "02", "03", "04", "05", "06"];
const WIDTHS = [440, 880, 1320];

const dirs = fs.readdirSync(ROOT).filter((d) => /^product[ _]?\d$/i.test(d));
const find = (n) => dirs.find((d) => d.replace(/[^0-9]/g, "") === String(n));

/** Median colour of the bag body: a tight centre box, ignoring the ground. */
async function bodyHex(file) {
  const { data, info } = await sharp(file)
    .resize(200, null, { fit: "inside" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const px = [];
  for (let y = Math.floor(H * 0.42); y < H * 0.68; y += 1)
    for (let x = Math.floor(W * 0.34); x < W * 0.66; x += 1) {
      const p = (y * W + x) * C;
      px.push([data[p], data[p + 1], data[p + 2]]);
    }
  const med = [0, 1, 2].map((c) => {
    const s = px.map((p) => p[c]).sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)];
  });
  return "#" + med.map((v) => v.toString(16).padStart(2, "0")).join("");
}

const manifest = {};
for (const [i, slug] of SLUGS.entries()) {
  const dir = find(i + 1);
  if (!dir) throw new Error(`no source folder for ${slug}`);
  const src = path.join(ROOT, dir);
  const files = fs
    .readdirSync(src)
    .filter((f) => /\.(jpe?g|png)$/i.test(f))
    .sort();

  fs.mkdirSync(path.join(OUT, slug), { recursive: true });
  const shots = [];

  for (const [n, f] of files.entries()) {
    const from = path.join(src, f);
    const meta = await sharp(from).metadata();
    for (const w of WIDTHS) {
      // Never upscale: a 1122px source stops at its own width.
      const target = Math.min(w, meta.width);
      await sharp(from)
        .resize(target, null, { fit: "inside", kernel: "lanczos3" })
        .avif({ quality: w >= 1320 ? 55 : 62, effort: 3 })
        .toFile(path.join(OUT, slug, `${n + 1}-${w}.avif`));
    }
    shots.push({
      n: n + 1,
      source: f,
      width: meta.width,
      height: meta.height,
      hex: await bodyHex(from),
    });
    process.stdout.write(".");
  }
  manifest[slug] = { from: dir, shots };
  console.log(` ${slug} ${files.length} images`);
}

fs.writeFileSync("src/lib/media.generated.json", JSON.stringify(manifest, null, 2));

// Report the sizes actually shipped.
let total = 0;
for (const slug of SLUGS)
  for (const f of fs.readdirSync(path.join(OUT, slug)))
    total += fs.statSync(path.join(OUT, slug, f)).size;
console.log(`\n${OUT}: ${(total / 1024 / 1024).toFixed(1)} MB total`);
for (const slug of SLUGS) {
  const f = path.join(OUT, slug, "1-880.avif");
  if (fs.existsSync(f)) console.log(`  ${slug}/1-880.avif ${(fs.statSync(f).size / 1024).toFixed(0)} KB`);
}
