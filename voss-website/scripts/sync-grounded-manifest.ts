import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { CATALOGUE, studioPhotos } from '../src/lib/catalogue';

async function main() {
  const location = 'database/media-manifest.json';
  const backup = 'outputs/media-grounding/media-manifest-before.json';
  if (!fs.existsSync(backup)) fs.copyFileSync(location, backup);
  const previous = JSON.parse(fs.readFileSync(backup, 'utf8'));
  const manifest = CATALOGUE.flatMap(piece => piece.colourways.flatMap(colour => studioPhotos(piece, colour).map((photo, position) => {
    const original = previous.find((row: {slug:string;colour:string;label:string}) => row.slug === piece.slug && row.colour === colour.key && row.label === photo.label);
    return {slug:piece.slug, colour:colour.key, position, white:photo.src.startsWith('/studio-grounded-v2/') ? photo.src : original?.white, label:photo.label, width:original?.width, height:original?.height};
  })));
  let changed = 0;
  for (const row of manifest) {
    const piece = CATALOGUE.find(piece => piece.slug === row.slug)!;
    const colour = piece.colourways.find(colour => colour.key === row.colour)!;
    const photo = studioPhotos(piece, colour)[row.position];
    if (!photo.src.startsWith('/studio-grounded-v2/')) continue;
    const metadata = await sharp(path.join('public', photo.src)).metadata();
    row.white = photo.src;
    row.width = metadata.width;
    row.height = metadata.height;
    row.label = photo.label;
    changed++;
  }
  fs.writeFileSync(location, JSON.stringify(manifest, null, 2) + '\n');
  const payload = JSON.stringify(manifest).replaceAll("'", "''");
  fs.writeFileSync('outputs/media-grounding/sync-checkout.sql', `BEGIN;
CREATE TEMP TABLE grounded_media AS SELECT * FROM jsonb_to_recordset('${payload}'::jsonb)
AS x(slug text, colour text, position integer, white text, label text, width integer, height integer);
INSERT INTO public.voss_images (product_slug,colour_key,position,studio_url,white_url,label,width,height)
SELECT slug,colour,position,white,white,label,width,height FROM grounded_media
ON CONFLICT (product_slug,colour_key,position) DO UPDATE SET studio_url=excluded.studio_url,
white_url=excluded.white_url,label=excluded.label,width=excluded.width,height=excluded.height;
SELECT count(*) AS matching_images FROM public.voss_images AS target JOIN grounded_media AS source
ON target.product_slug = source.slug AND target.colour_key = source.colour AND target.position = source.position
WHERE target.white_url = source.white AND target.width = source.width AND target.height = source.height;
COMMIT;\n`);
  console.log(`Prepared ${changed} transparent checkout images; ${manifest.length - changed} dimension graphics retained. SQL prepared only, not applied.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
