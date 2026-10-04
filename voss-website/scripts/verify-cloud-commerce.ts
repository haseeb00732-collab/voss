import { loadEnvConfig } from '@next/env';
import { database } from '../src/lib/server/database';
import { CATALOGUE } from '../src/lib/catalogue';

async function main() {
  loadEnvConfig(process.cwd());
  if (!process.env.DATABASE_URL) throw new Error('A cloud DATABASE_URL must be configured privately. Local preview is not a cloud database.');
  const db = await database();
  try {
    const { rows: products } = await db.query<{slug:string;price_pkr:number}>('SELECT slug,price_pkr FROM voss_products WHERE active');
    for (const product of CATALOGUE) {
      if (!products.some(row => row.slug === product.slug && row.price_pkr === product.price)) throw new Error('Cloud catalogue is missing a product or has an outdated price. Run db:setup.');
    }
    const { rows: missing } = await db.query(`SELECT v.product_slug FROM voss_variants v
      LEFT JOIN voss_images i ON i.product_slug=v.product_slug AND i.colour_key=v.colour_key AND i.position=0
      WHERE v.active AND (i.white_url IS NULL OR i.white_url NOT LIKE '/catalogue-white/%')`);
    if (missing.length) throw new Error('Some colour variants have no approved catalogue image.');
    const { rows: secured } = await db.query<{relname:string;relrowsecurity:boolean}>(`SELECT relname,relrowsecurity FROM pg_class
      WHERE relnamespace='public'::regnamespace AND relname IN
      ('voss_products','voss_variants','voss_images','voss_promotions','voss_orders','voss_order_items','voss_order_history')
      `);
    if (secured.length !== 7 || secured.some(table => !table.relrowsecurity)) throw new Error('A VOSS table or its row level security is missing.');
    const {rows: publicPolicies}=await db.query(`SELECT policyname FROM pg_policies WHERE schemaname='public'
      AND tablename IN ('voss_products','voss_variants','voss_images','voss_promotions','voss_orders','voss_order_items','voss_order_history')
      AND roles && ARRAY['public','anon','authenticated']::name[]`);
    if(publicPolicies.length) throw new Error('Unexpected public access policy on a private VOSS table.');
    const { rows: promotion } = await db.query<{used:number;maximum:number}>("SELECT used,maximum FROM voss_promotions WHERE code='FIRST30'");
    if (promotion[0]?.maximum !== 30) throw new Error('The first-30 delivery promotion has not been configured correctly.');
    const { rows: count } = await db.query<{count:number}>('SELECT count(*)::int AS count FROM voss_orders');
    console.log(JSON.stringify({cloudConnected:true,products:products.length,variantImagesReady:true,rowLevelSecurity:true,freeDeliveryRemaining:Math.max(0,30-promotion[0].used),savedOrderCount:count[0].count}));
    console.log('Read-only check complete. No customer details printed and no orders created. Checkout still requires a separate end-to-end verification before activation.');
  } finally { await db.close?.(); }
}
main().catch(error => {
  console.error('Cloud verification failed:', error instanceof Error && !process.env.DATABASE_URL ? error.message : 'Check the private connection, schema, catalogue prices and RLS configuration.');
  process.exitCode=1;
});
