import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { CATALOGUE, coverImage, studioPhotos } from '../src/lib/catalogue';

async function main() {
  const retired = new Set(['croc-panel-dome-bag', 'structured-trio-bag-set']);
  const manifest = JSON.parse(await readFile('database/media-manifest.json', 'utf8')) as {
    slug: string; colour: string; position: number; white: string; width: number; height: number;
  }[];
  const keys = new Set<string>();
  for (const row of manifest) {
    const key = `${row.slug}/${row.colour}/${row.position}`;
    assert(!keys.has(key), `Duplicate checkout photograph: ${key}`);
    keys.add(key);
    assert(!retired.has(row.slug), `Retired product in checkout manifest: ${row.slug}`);
    const product = CATALOGUE.find(p => p.slug === row.slug);
    assert(product?.colourways.some(c => c.key === row.colour), `Unknown product/colour: ${key}`);
    assert(row.white.startsWith('/catalogue-white/'), `Unexpected checkout image path: ${row.white}`);
    const info = await sharp(path.join('public', row.white)).metadata();
    assert.equal(info.width, row.width, `Checkout image width: ${key}`);
    assert.equal(info.height, row.height, `Checkout image height: ${key}`);
  }
  let galleries = 0;
  for (const product of CATALOGUE) {
    assert(!retired.has(product.slug), `Retired product in catalogue: ${product.slug}`);
    assert(product.colourways.some(c => c.key === product.coverColour), `Missing cover colour: ${product.slug}`);
    assert(coverImage(product), `Missing cover image: ${product.slug}`);
    for (const colour of product.colourways) {
      const photos = studioPhotos(product, colour);
      assert(photos?.length, `Empty gallery: ${product.slug}/${colour.key}`);
      assert(keys.has(`${product.slug}/${colour.key}/0`), `No checkout cover: ${product.slug}/${colour.key}`);
      for (const photo of photos) {
        assert(/^\/(studio-colours-v1|studio-cutouts)\//.test(photo.src), `Unexpected gallery path: ${photo.src}`);
        for (const width of [480, 960]) {
          await access(path.join('public', photo.src.replace('-960.webp', `-${width}.webp`)));
        }
      }
      galleries++;
    }
  }
  console.log(`Verified ${CATALOGUE.length} available styles, ${galleries} colour galleries and ${manifest.length} checkout photographs. Retired styles are absent.`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
