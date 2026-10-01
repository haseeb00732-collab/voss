import { loadEnvConfig } from '@next/env';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { CATALOGUE } from '../src/lib/catalogue';
import { database } from '../src/lib/server/database';

async function main() {
loadEnvConfig(process.cwd());
const media = JSON.parse(await readFile('database/media-manifest.json', 'utf8')) as
  { slug: string; colour: string; position: number; white: string; label: string; width: number; height: number }[];
for (const image of media) {
  if (!image.white.startsWith('/catalogue-white/')) throw new Error('Non-white catalogue image in manifest');
  const info = await sharp(path.join('public', image.white)).metadata();
  if (info.width !== image.width || info.height !== image.height) throw new Error(`Image dimensions changed: ${image.white}`);
}
const db = await database();
const schema = await readFile('database/schema.sql', 'utf8');
await db.transaction(async client => {
  for (const statement of schema.replace(/--[^\n]*/g, '').split(';').filter(s => s.trim())) await client.query(statement);
  for (const p of CATALOGUE) {
    await client.query(`INSERT INTO voss_products(slug,article,name,description,category,price_pkr) VALUES($1,$2,$3,$4,$5,$6)
      ON CONFLICT(slug) DO UPDATE SET article=EXCLUDED.article,name=EXCLUDED.name,description=EXCLUDED.description,category=EXCLUDED.category,price_pkr=EXCLUDED.price_pkr`, [p.slug,p.label,p.name,p.description,p.silhouette,p.price]);
    for (const c of p.colourways) await client.query(`INSERT INTO voss_variants(product_slug,colour_key,colour_name,hex) VALUES($1,$2,$3,$4)
      ON CONFLICT(product_slug,colour_key) DO UPDATE SET colour_name=EXCLUDED.colour_name,hex=EXCLUDED.hex`, [p.slug,c.key,c.name,c.hex]);
  }
  for (const image of media) await client.query(`INSERT INTO voss_images(product_slug,colour_key,position,studio_url,white_url,label,width,height) VALUES($1,$2,$3,$4,$5,$6,$7,$8)
    ON CONFLICT(product_slug,colour_key,position) DO UPDATE SET studio_url=EXCLUDED.studio_url,white_url=EXCLUDED.white_url,label=EXCLUDED.label,width=EXCLUDED.width,height=EXCLUDED.height`, [image.slug,image.colour,image.position,image.white,image.white,image.label,image.width,image.height]);
  await client.query("UPDATE voss_images SET studio_url=white_url WHERE studio_url<>white_url");
});
console.log(`Seeded ${CATALOGUE.length} products, ${CATALOGUE.reduce((n,p)=>n+p.colourways.length,0)} colours and ${media.length} white-background photographs. Existing orders and promotion usage preserved.`);
await db.close?.();
process.exit(0);
}
main().catch(error => { console.error('Database setup failed.', error instanceof Error ? error.name : 'Unknown error'); if (!process.env.DATABASE_URL) console.error(error); process.exit(1); });
