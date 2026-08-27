/**
 * Grade the catalogue into the vitrine, and derive each image's true colour.
 *
 * NON-DESTRUCTIVE: reads the desktop product folders, writes
 * public/products-graded/<slug>/<n>.avif. Originals are never modified.
 *
 * Folder names have changed once already (spaces -> underscores), so the
 * source directory is resolved by scanning rather than hardcoded, and the
 * script fails loudly if a slug finds nothing.
 *
 * Every image gets its own swatch, median-sampled from a tight centre box.
 * product_2 is one bag in five colourways, so a per-FOLDER colour would be
 * wrong there; the colour belongs to the image, not the product.
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const ROOT = "C:/Users/pesum/OneDrive/Desktop/Voss";
const OUT = "public/products-graded";
const SLUGS = ["01", "02", "03", "04", "05", "06"];

/** vitrine grade, matching grade-media.mjs */
const G = { sat: 0.74, lift: [0x0b, 0x0b, 0x0c], white: [250, 246, 236], flatten: 0.1, grain: 0.016 };
const S = 0.25;
const LUT = [0, 1, 2].map((c) => {
  const l = new Uint8Array(256);
  for (let v = 0; v < 256; v++) {
    let x = v / 255;
    x = 0.5 + (x - 0.5) * (1 - G.flatten);
    const s = x * x * (3 - 2 * x);
    x = Math.min(1, Math.max(0, x + S * (s - x)));
    l[v] = Math.round(G.lift[c] + x * (G.white[c] - G.lift[c]));
  }
  return l;
});

const dirs = fs.readdirSync(ROOT).filter((d) => /^product[ _]?\d$/i.test(d));
const find = (n) => dirs.find((d) => d.replace(/[^0-9]/g, "") === String(n));

const manifest = {};
for (const [i, slug] of SLUGS.entries()) {
  const dir = find(i + 1);
  if (!dir) throw new Error(`no source folder for slug ${slug}`);
  const src = path.join(ROOT, dir);
  const files = fs.readdirSync(src).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort();
  if (!files.length) throw new Error(`${dir} is empty`);

  const out = path.join(OUT, slug);
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });

  const swatches = [];
  for (const [n, f] of files.entries()) {
    const { data, info } = await sharp(path.join(src, f)).rotate().removeAlpha()
      .raw().toBuffer({ resolveWithObject: true });
    const { width: W, height: H, channels: C } = info;
    for (let p = 0; p < data.length; p += C) {
      const r = data[p], g = data[p + 1], b = data[p + 2];
      const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const nz = (Math.random() - 0.5) * 255 * G.grain;
      const cl = (v) => Math.min(255, Math.max(0, Math.round(v + nz)));
      data[p] = LUT[0][cl(y + (r - y) * G.sat)];
      data[p + 1] = LUT[1][cl(y + (g - y) * G.sat)];
      data[p + 2] = LUT[2][cl(y + (b - y) * G.sat)];
    }
    await sharp(data, { raw: { width: W, height: H, channels: C } })
      .avif({ quality: 66, effort: 5 })
      .toFile(path.join(out, `${n + 1}.avif`));

    // colour of THIS image, from the bag body
    const keep = [];
    for (let y = Math.floor(H * 0.40); y < H * 0.64; y += 2)
      for (let x = Math.floor(W * 0.38); x < W * 0.62; x += 2) {
        const p2 = (y * W + x) * C;
        keep.push([data[p2], data[p2 + 1], data[p2 + 2]]);
      }
    const med = [0, 1, 2].map((c) => {
      const s2 = keep.map((p) => p[c]).sort((a, b) => a - b);
      return s2[Math.floor(s2.length / 2)];
    });
    swatches.push("#" + med.map((v) => v.toString(16).padStart(2, "0")).join(""));
  }
  manifest[slug] = { from: dir, count: files.length, swatches };
  console.log(slug.padEnd(3), dir.padEnd(11), files.length + " imgs", swatches.join(" "));
}
fs.writeFileSync("src/lib/catalogue.manifest.json", JSON.stringify(manifest, null, 2));
