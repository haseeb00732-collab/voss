import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

// Isolated in-memory PostgreSQL. Never connects to the live shop.
const db = new PGlite();
let checks = 0;
const technical=randomUUID(), owner=randomUUID(), stranger=randomUUID(), unverified=randomUUID();
async function checkFailure(sql, args=[], pattern=/permission denied|access|Verify|approved|Technical/i) {
  await assert.rejects(()=>db.query(sql,args),pattern); checks++;
}
async function asUser(id) {
  await db.exec('RESET ROLE');
  await db.query("SELECT set_config('request.jwt.claim.sub',$1,false)",[id]);
  await db.exec('SET ROLE authenticated');
}
const access='SELECT public.voss_business_access() AS data';
const team='SELECT public.voss_business_team($1,$2) AS data';
const overview="SELECT public.voss_business_read('overview','','all',0,NULL)";
const lines=JSON.stringify([{slug:'sample',colour:'black',quantity:1}]);
const quote=()=>db.query('SELECT * FROM public.voss_checkout_quote($1)',[lines]);
const place=(id,total=2999,hash='same',phone='03000000000')=>db.query('SELECT * FROM public.voss_checkout_place($1,$2,$3,$4,$5)',[id,hash,JSON.stringify({name:'Test only',phone,address:'Isolated test address'}),lines,total]);
try {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,email_confirmed_at timestamptz);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    GRANT USAGE ON SCHEMA auth TO authenticated;`);
  for(const file of ['../../voss-website/database/schema.sql','../database/cloud-owner.sql','../database/team-access.sql','../../voss-website/database/cloud-checkout.sql'])
    await db.exec(await readFile(new URL(file,import.meta.url),'utf8'));
  await db.query("INSERT INTO auth.users VALUES($1,'haseeb00732@gmail.com',now()),($2,'owner@example.test',now()),($3,'stranger@example.test',now()),($4,'haseeb00732@gmail.com',NULL)",[technical,owner,stranger,unverified]);
  await db.exec('SET ROLE anon'); await checkFailure(access); await checkFailure('SELECT * FROM public.voss_checkout_quote($1)',[lines]);
  await asUser(unverified); await checkFailure(access); await checkFailure(overview);
  await asUser(stranger); assert.equal((await db.query(access)).rows[0].data.approved,false); checks++;
  await checkFailure(overview); await checkFailure(team,[owner,true]);
  await asUser(technical); assert.equal((await db.query(access)).rows[0].data.role,'technical'); checks++;
  await checkFailure(team,[technical,false],/own access/);
  await asUser(owner); assert.equal((await db.query(access)).rows[0].data.approved,false); checks++;
  await asUser(technical); await db.query(team,[owner,true]);
  await asUser(owner); assert.equal((await db.query(access)).rows[0].data.role,'owner'); checks++;
  await db.query(overview); checks++; await checkFailure(team,[stranger,true]);
  await asUser(technical); await db.query(team,[owner,false]);
  await asUser(owner); await checkFailure(overview); assert.equal((await db.query(access)).rows[0].data.approved,false); checks++;
  await db.exec('RESET ROLE');
  await db.exec(`INSERT INTO voss_products VALUES('sample','99','Sample','Test','Totes',2999,true);
    INSERT INTO voss_variants VALUES('sample','black','Black','#000',true);
    INSERT INTO voss_images VALUES('sample','black',0,'/studio.webp','/white.webp','Primary',960,1200);
    UPDATE voss_promotions SET used=29 WHERE code='FIRST30';`);
  await db.exec('SET ROLE service_role');
  assert.equal((await quote()).rows[0].delivery,0); checks++;
  const freeId=randomUUID(); const free=(await place(freeId)).rows[0];
  assert.equal(free.free_delivery,true); assert.equal(free.total,2999); checks++;
  assert.deepEqual((await place(freeId)).rows[0],free); checks++;
  await checkFailure('SELECT * FROM public.voss_checkout_place($1,$2,$3,$4,$5)',[freeId,'different','{}',lines,2999],/delivery details|already been used/);
  const paidQuote=(await quote()).rows[0]; assert.equal(paidQuote.delivery,150); assert.equal(paidQuote.total,3149); assert.equal(paidQuote.remaining,0); checks++;
  await assert.rejects(()=>place(randomUUID(),2999),/total has changed/); checks++;
  const paidId=randomUUID();const paid=(await place(paidId,3149)).rows[0];
  assert.equal(paid.free_delivery,false); assert.equal(paid.delivery,150); checks++;
  assert.deepEqual((await place(paidId,3149)).rows[0],paid); checks++;
  await assert.rejects(()=>place(paidId,3149,'changed'),/already been used/); checks++;
  await db.exec('RESET ROLE');
  assert.equal((await db.query('SELECT count(*)::int n FROM voss_orders')).rows[0].n,2); checks++;
  assert.equal((await db.query('SELECT used FROM voss_promotions')).rows[0].used,30); checks++;
  assert.equal((await db.query('SELECT count(*)::int n FROM voss_notification_outbox')).rows[0].n,2); checks++;
  await db.query('DELETE FROM voss_private.business_owners WHERE user_id=$1',[technical]);
  await asUser(technical); assert.equal((await db.query(access)).rows[0].data.approved,false); checks++; await checkFailure(overview);
  console.log(`PASS: ${checks} signup, approval, revocation, private data, free-delivery boundary, paid delivery and retry checks. No live orders touched.`);
} finally { await db.close(); }
