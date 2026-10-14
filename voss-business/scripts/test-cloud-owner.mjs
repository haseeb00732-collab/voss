import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const db=new PGlite();
const owner='10000000-0000-4000-8000-000000000001', stranger='10000000-0000-4000-8000-000000000002';
const order='20000000-0000-4000-8000-000000000001';
let checks=0;
async function denied(sql,params=[],pattern=/Owner access|permission denied/){await assert.rejects(()=>db.query(sql,params),pattern);checks++;}
async function asUser(id){await db.exec('RESET ROLE');await db.query("SELECT set_config('request.jwt.claim.sub',$1,false)",[id]);await db.exec('SET ROLE authenticated');}
const read="SELECT public.voss_business_read('overview','','all',0,NULL) AS data";
const update="SELECT public.voss_business_update($1,$2,$3,$4,$5,$6,$7) AS data";
const change=(version,action,value='',note='',courier='',tracking='')=>db.query(update,[order,version,action,value,note,courier,tracking]);
try{
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY); CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; GRANT USAGE ON SCHEMA auth TO authenticated;`);
  await db.exec(await readFile(new URL('../../voss-website/database/schema.sql',import.meta.url),'utf8'));
  await db.exec(await readFile(new URL('../database/cloud-owner.sql',import.meta.url),'utf8'));
  await db.query('INSERT INTO auth.users(id) VALUES($1),($2)',[owner,stranger]);
  await db.query('INSERT INTO voss_private.business_owners(user_id) VALUES($1)',[owner]);
  await db.query(`INSERT INTO voss_orders(id,reference,idempotency_key,request_hash,customer_name,phone,address,city,province,payment_method,subtotal_pkr,delivery_pkr,total_pkr) VALUES($1,'TEST-ONLY',$1,'hash','Sample buyer','03000000000','Test address','Lahore','Punjab','cod',3100,0,3100)`,[order]);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM voss_notification_outbox')).rows[0].n,1);checks++;
  await db.exec('SET ROLE anon');await denied(read);await denied('SELECT * FROM voss_orders');
  await asUser(stranger);await denied(read);await denied(update,[order,1,'status','confirmed','','','']);await denied('SELECT * FROM voss_orders');
  await denied('INSERT INTO voss_private.business_owners(user_id) VALUES(auth.uid())');
  await asUser(owner);const initial=(await db.query(read)).rows[0].data;
  assert.equal(initial.metrics.received,1);assert.equal(initial.metrics.pending_cod,3100);assert.equal(initial.metrics.collected,0);checks++;
  await denied(update,[order,1,'status','delivered','','',''],/status change/);
  await denied(update,[order,1,'status','cancelled','','',''],/reason/);
  await denied(update,[order,1,'payment','collected','','',''],/Only mark/);
  let result=(await change(1,'status','confirmed')).rows[0].data;
  assert.equal(result.status,'confirmed');assert.equal(result.version,2);assert.equal(result.events.length,1);assert.equal(result.request_hash,undefined);checks++;
  await denied(update,[order,1,'status','confirmed','','',''],/Order changed/);
  await change(2,'note','','Internal only');await change(3,'courier','','','Local courier','TRACK-001');
  await change(4,'status','packed');await change(5,'status','shipped');result=(await change(6,'status','delivered')).rows[0].data;
  assert.equal(result.payment_status,'pending');checks++;
  await change(7,'payment','collected');let summary=(await db.query(read)).rows[0].data;
  assert.equal(summary.metrics.collected,3100);assert.equal(summary.metrics.pending_cod,0);checks++;
  await denied(update,[order,8,'status','returned','Reason supplied','',''],/status change/);
  await denied(update,[order,8,'courier','','','Changed courier','Changed tracking'],/closed/);
  await denied("SELECT public.voss_business_read('orders','','all',-1,NULL)",[],/Invalid filters/);
  await denied('UPDATE voss_orders SET total_pkr=1');
  await db.exec('RESET ROLE');await db.query('DELETE FROM voss_private.business_owners WHERE user_id=$1',[owner]);await asUser(owner);await denied(read);
  await db.exec('RESET ROLE');await db.exec('BEGIN');await db.query(`INSERT INTO voss_orders(id,reference,idempotency_key,request_hash,customer_name,phone,address,city,province,payment_method,subtotal_pkr,delivery_pkr,total_pkr) VALUES($1,'ROLLBACK-ONLY',$1,'hash','Sample buyer','03000000000','Test address','Lahore','Punjab','cod',3100,0,3100)`,['20000000-0000-4000-8000-000000000002']);await db.exec('ROLLBACK');
  assert.equal((await db.query('SELECT count(*)::int AS n FROM voss_notification_outbox')).rows[0].n,1);checks++;
  console.log(`PASS: ${checks} owner access, status, COD, conflict, privacy and outbox checks. No production orders created.`);
}finally{await db.close();}
