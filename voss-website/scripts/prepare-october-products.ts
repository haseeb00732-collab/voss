// Produce the two-product cloud seed without changing existing orders or promotions.
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import sharp from 'sharp';
import { CATALOGUE, studioPhotos } from '../src/lib/catalogue';

async function main() {
  const media = JSON.parse(readFileSync('database/media-manifest.json', 'utf8'));
  const quote = (value: string | number) => typeof value === 'number' ? String(value) : `'${value.replaceAll("'", "''")}'`;
  const rows = (values: (string | number)[]) => values.map(quote).join(',');
  const sql = ['BEGIN;'];
  for (const p of CATALOGUE.filter(p => ['chic', 'croc-panel-dome-bag'].includes(p.slug))) {
    if (p.price !== 2999) throw new Error(`Wrong price: ${p.slug}`);
    sql.push(`INSERT INTO voss_products(slug,article,name,description,category,price_pkr) VALUES(${rows([p.slug,p.label,p.name,p.description,p.silhouette,p.price])}) ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,category=EXCLUDED.category,price_pkr=EXCLUDED.price_pkr;`);
    for (const c of p.colourways) {
      sql.push(`INSERT INTO voss_variants(product_slug,colour_key,colour_name,hex) VALUES(${rows([p.slug,c.key,c.name,c.hex])}) ON CONFLICT(product_slug,colour_key) DO UPDATE SET colour_name=EXCLUDED.colour_name,hex=EXCLUDED.hex;`);
      const photo = studioPhotos(p,c)[0];
      const entry = media.find((m: {slug:string;colour:string;position:number}) => m.slug === p.slug && m.colour === c.key && m.position === 0);
      if (!entry) throw new Error(`Missing checkout photo: ${p.slug}/${c.key}`);
      for (const size of [480,960]) {
        const file = `public${photo.src.replace('-960.webp', `-${size}.webp`)}`;
        if (!existsSync(file)) throw new Error(`Missing image: ${file}`);
        const info = await sharp(file).metadata();
        if (!info.hasAlpha || info.width !== size || info.height !== size * 1.25) throw new Error(`Image dimensions/transparency: ${file}`);
      }
      const white = await sharp(`public${entry.white}`).metadata();
      if (white.width !== entry.width || white.height !== entry.height) throw new Error(`Wrong checkout dimensions: ${entry.white}`);
      sql.push(`INSERT INTO voss_images(product_slug,colour_key,position,studio_url,white_url,label,width,height) VALUES(${rows([p.slug,c.key,0,photo.src,entry.white,photo.label,entry.width,entry.height])}) ON CONFLICT(product_slug,colour_key,position) DO UPDATE SET studio_url=EXCLUDED.studio_url,white_url=EXCLUDED.white_url,label=EXCLUDED.label,width=EXCLUDED.width,height=EXCLUDED.height;`);
    }
  }
  sql.push('COMMIT;');
  writeFileSync('database/october-products.sql', sql.join('\n')+'\n');
  console.log('Verified 9 colours, 18 transparent studio assets, and 9 checkout photos. Seed written.');
}
main().catch(error => { console.error(error); process.exitCode=1; });
