import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

// In-memory PostgreSQL only. No production credentials or orders.
const db=new PGlite();
const owner=randomUUID(),stranger=randomUUID(); let checks=0;
async function asUser(id){await db.exec('RESET ROLE');await db.query("SELECT set_config('request.jwt.claim.sub',$1,false)",[id]);await db.exec('SET ROLE authenticated');}
async function rejected(sql,args=[],pattern=/permission denied|Owner access/){await assert.rejects(()=>db.query(sql,args),pattern);checks++;}
const read=async(from=null,to=null)=>(await db.query('SELECT public.voss_finance_read($1,$2) AS data',[from,to])).rows[0].data;
const save=async(entry)=>(await db.query('SELECT public.voss_finance_save($1) AS data',[JSON.stringify({...entry,...(entry.kind==='sale'&&!entry.id?{request_key:entry.request_key??randomUUID()}: {})})])).rows[0].data;
const inventory=async(item)=>(await db.query('SELECT public.voss_inventory_save($1) AS data',[JSON.stringify(item)])).rows[0].data;
const expense={kind:'expense',entry_date:'2026-10-12',category:'marketing',description:'Campaign test',amount_pkr:100.10,payer:'Test payer A',payment_status:'paid',quantity:1,unit_cost_pkr:null,notes:''};
async function websiteOrder(status='shipped',payment='pending',amount=3100){
  await db.exec('RESET ROLE');const id=randomUUID();
  await db.query(`INSERT INTO public.voss_orders(id,reference,idempotency_key,request_hash,customer_name,phone,address,city,province,payment_method,subtotal_pkr,delivery_pkr,total_pkr,status,payment_status,created_at)
  VALUES($1::uuid,$1::text,$1::uuid,'isolated','Test buyer','03000000000','Test only','Lahore','Punjab','cod',$2::integer-100,100,$2::integer,$3,$4,'2026-10-01T12:00:00Z')`,[id,amount,status,payment]);
  await db.query(`INSERT INTO public.voss_order_items VALUES($1,'test-tote','black','Test tote','Black','/test.webp',2,1500)`,[id]);
  await asUser(owner);return id;
}
try{
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,email_confirmed_at timestamptz);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    GRANT USAGE ON SCHEMA auth TO authenticated;`);
  for(const file of ['../../voss-website/database/schema.sql','../database/cloud-owner.sql','../database/team-access.sql','../database/finance.sql']) await db.exec(await readFile(new URL(file,import.meta.url),'utf8'));
  await db.exec(await readFile(new URL('./fixtures/finance-import.sql',import.meta.url),'utf8'));
  await db.query("INSERT INTO auth.users VALUES($1,'owner@example.test',now()),($2,'stranger@example.test',now())",[owner,stranger]);
  await db.query('INSERT INTO voss_private.business_owners(user_id) VALUES($1)',[owner]);
  await db.exec(`INSERT INTO public.voss_products VALUES('test-tote','90','Test tote','Test','Totes',1500,true); INSERT INTO public.voss_variants VALUES('test-tote','black','Black','#000',true)`);
  await db.exec('SET ROLE anon'); await rejected('SELECT public.voss_finance_read()');await rejected('SELECT public.voss_finance_save($1)',[expense]);await rejected('SELECT public.voss_inventory_save($1)',[{}]);
  await asUser(stranger);await rejected('SELECT public.voss_finance_read()');await rejected('SELECT public.voss_finance_save($1)',[expense]);await rejected('SELECT public.voss_inventory_save($1)',[{}]);
  await asUser(owner);
  for(const t of ['finance_entries','finance_audit','inventory_counts','order_cost_snapshots']) await rejected(`SELECT * FROM voss_private.${t}`);
  let data=await read();assert.equal(data.entries.length,3);assert.equal(data.summary.expenses_pkr,350.30);assert.equal(data.import.original_total_pkr,350.30);assert.equal(data.import.flagged_dates,1);checks++;
  assert.ok(data.entries.every(e=>e.packaging_cost_pkr===0&&e.delivery_charged_pkr===0&&!e.free_delivery_offer));assert.equal(data.promotion.used,0);checks++;
  const future=data.entries.find(e=>e.source_key==='inventory-pdf-v1:03');assert.equal(future.entry_date,'2030-01-15');assert.match(future.date_flag,/preserved/);assert.equal(future.payer,'Test payer A');assert.deepEqual(data.payers.map(p=>p.payer).sort(),['Test payer A','Test payer B']);checks++;
  assert.equal(data.inventory[0].stock_on_hand,null);assert.equal(data.inventory[0].version,0);checks++;
  const first=await inventory({product_slug:'test-tote',colour_key:'black',version:0,stock_on_hand:0,unit_cost_pkr:500.25,note:'Opening physical count'});
  assert.equal(first.stock_on_hand,0);checks++;
  await rejected('SELECT public.voss_inventory_save($1)',[{...first,version:0,note:'Stale edit'}],/Inventory changed/);
  await rejected('SELECT public.voss_inventory_save($1)',[{...first,stock_on_hand:-1,note:'Bad count'}],/check constraint/);
  await rejected('SELECT public.voss_inventory_save($1)',[{...first,unit_cost_pkr:500.251,note:'Bad precision'}],/maximum two decimals/);
  let entry=await save(expense);assert.equal(entry.amount_pkr,100.10);checks++;
  await rejected('SELECT public.voss_finance_save($1)',[{...expense,amount_pkr:0}],/positive PKR/);
  await rejected('SELECT public.voss_finance_save($1)',[{...expense,amount_pkr:1.001}],/positive PKR/);
  await rejected('SELECT public.voss_finance_save($1)',[{...expense,amount_pkr:'NaN'}],/positive PKR/);
  await rejected('SELECT public.voss_finance_save($1)',[{...expense,source_key:'forged'}],/provenance/);
  await rejected('SELECT public.voss_finance_save($1)',[{...expense,order_id:randomUUID()}],/Website sales/);
  entry=await save({...expense,id:entry.id,version:1,amount_pkr:120.20});assert.equal(entry.version,2);checks++;
  await rejected('SELECT public.voss_finance_save($1)',[{...expense,id:entry.id,version:1}],/Entry changed/);
  await rejected('SELECT public.voss_finance_save($1)',[{id:entry.id,version:2,void_reason:''}],/reason/);
  const voided=await save({id:entry.id,version:2,void_reason:'Duplicate test entry'});assert.equal(voided.version,3);assert.ok(voided.voided_at);checks++;
  await rejected('SELECT public.voss_finance_save($1)',[{...expense,id:entry.id,version:3}],/Voided/);
  const sale=await save({...expense,kind:'sale',category:'product',description:'Offline sale only',amount_pkr:2000,quantity:2,unit_cost_pkr:null,product_slug:'test-tote',colour_key:'black',payment_status:'collected'});
  assert.equal(sale.cogs_pkr,1000.50);checks++;
  const live=await websiteOrder();await db.query("SELECT public.voss_business_update($1,1,'status','delivered','','','')",[live]);
  data=await read();assert.equal(data.summary.revenue_pkr,5100);assert.equal(data.summary.website_revenue_pkr,3100);assert.equal(data.summary.manual_revenue_pkr,2000);assert.equal(data.summary.cash_collected_pkr,2000);assert.equal(data.summary.pending_cod_pkr,3100);assert.equal(data.summary.known_cogs_pkr,2001);assert.equal(data.summary.gross_profit_estimate_pkr,3099);checks++;
  await inventory({...first,version:1,stock_on_hand:10,unit_cost_pkr:900,note:'New purchase unit cost'});
  assert.equal((await read()).summary.known_cogs_pkr,2001);checks++;
  await db.query("SELECT public.voss_business_update($1,2,'payment','collected','','','')",[live]);data=await read();assert.equal(data.summary.cash_collected_pkr,5100);assert.equal(data.summary.pending_cod_pkr,0);checks++;
  // Historical delivered order was never costed: today's cost must not be substituted.
  await websiteOrder('delivered','pending',1100);data=await read();assert.equal(data.summary.gross_profit_estimate_pkr,null);assert.equal(data.summary.net_profit_estimate_pkr,null);assert.equal(data.summary.missing_cost_sales,1);assert.equal(data.summary.estimated_order_dates,1);checks++;
  const oct=await read('2026-10-01','2026-10-31');assert.ok(oct.entries.every(e=>e.entry_date.startsWith('2026-10')));assert.equal(oct.entries.some(e=>e.id===future.id),false);assert.ok(oct.weekly.every(w=>new Date(`${w.week_start}T12:00:00Z`).getUTCDay()===1));checks++;
  const futureOnly=await read('2030-01-15','2030-01-15');assert.equal(futureOnly.summary.expenses_pkr,50);checks++;
  // Legacy status history has the real delivery date, even without newer events.
  const historical=await websiteOrder('delivered','pending',700);
  await db.exec('RESET ROLE');
  await db.query("INSERT INTO public.voss_order_history(order_id,old_status,new_status,changed_at) VALUES($1,'shipped','delivered','2026-10-20T20:15:00Z')",[historical]);
  await asUser(owner);
  const oldBooking=await read('2026-10-01','2026-10-01'),legacyDelivery=await read('2026-10-21','2026-10-21');
  assert.equal(oldBooking.summary.website_revenue_pkr,1100);assert.equal(legacyDelivery.summary.website_revenue_pkr,700);
  assert.equal(legacyDelivery.summary.estimated_order_dates,0);assert.equal(legacyDelivery.weekly[0].week_start,'2026-10-19');checks++;
  // Cash moves on the actual settlement day, not on an earlier sale/purchase date.
  const later=await save({...expense,kind:'sale',category:'product',description:'Separate settlement date',entry_date:'2028-01-01',amount_pkr:500,unit_cost_pkr:100,payment_status:'pending'});
  await save({...expense,id:later.id,version:later.version,kind:'sale',category:'product',description:'Separate settlement date',entry_date:'2028-01-01',amount_pkr:500,unit_cost_pkr:100,payment_status:'collected',settled_date:'2028-01-10'});
  const booking=await read('2028-01-01','2028-01-01'),collection=await read('2028-01-10','2028-01-10');
  assert.equal(booking.summary.revenue_pkr,500);assert.equal(booking.summary.cash_collected_pkr,0);assert.equal(collection.summary.revenue_pkr,0);assert.equal(collection.summary.cash_collected_pkr,500);checks++;
  // Product purchases do not reduce profit twice when sale COGS is also recorded.
  await save({...expense,entry_date:'2028-01-01',category:'product',amount_pkr:200,description:'Purchase inventory'});
  const costReport=await read('2028-01-01','2028-01-10');assert.equal(costReport.summary.product_purchases_pkr,200);assert.equal(costReport.summary.operating_expenses_pkr,0);assert.equal(costReport.summary.net_profit_estimate_pkr,400);assert.equal(costReport.summary.cash_balance_pkr,300);checks++;
  // Whole-order additional costs accrue once; customer shipping adds revenue.
  const breakdown={...expense,kind:'sale',category:'product',entry_date:'2029-02-01',description:'Synthetic order breakdown',amount_pkr:3000,quantity:2,unit_cost_pkr:500,payment_status:'collected',
    packaging_cost_pkr:100,delivery_cost_pkr:150,marketing_cost_pkr:50,other_cost_pkr:25,delivery_charged_pkr:200,costs_paid:true,costs_settled_date:'2029-02-03',cost_payer:'Test cost payer',request_key:randomUUID()};
  const detailed=await save(breakdown);let detailedReport=await read('2029-02-01','2029-02-07');
  assert.equal(detailedReport.summary.revenue_pkr,3200);assert.equal(detailedReport.summary.delivery_revenue_pkr,200);assert.equal(detailedReport.summary.cash_collected_pkr,3200);
  assert.equal(detailedReport.summary.known_cogs_pkr,1000);assert.equal(detailedReport.summary.operating_expenses_pkr,325);assert.equal(detailedReport.summary.expenses_pkr,325);
  assert.equal(detailedReport.summary.cash_spent_pkr,325);assert.equal(detailedReport.summary.gross_profit_estimate_pkr,2200);assert.equal(detailedReport.summary.net_profit_estimate_pkr,1875);assert.equal(detailedReport.summary.cash_balance_pkr,2875);checks++;
  assert.equal(detailedReport.categories.find(c=>c.category==='packaging').amount_pkr,100);assert.equal(detailedReport.categories.find(c=>c.category==='delivery').amount_pkr,150);
  assert.equal(detailedReport.payers.find(p=>p.payer==='Test cost payer').amount_pkr,325);assert.equal(detailedReport.weekly[0].net_profit_estimate_pkr,1875);checks++;
  const costDay=await read('2029-02-03','2029-02-03');assert.equal(costDay.summary.cash_spent_pkr,325);assert.equal(costDay.summary.expenses_pkr,0);checks++;
  const repeated=await save(breakdown);assert.equal(repeated.id,detailed.id);assert.equal(repeated.version,1);assert.equal((await read('2029-02-01','2029-02-07')).summary.revenue_pkr,3200);checks++;
  await rejected('SELECT public.voss_finance_save($1)',[{...breakdown,amount_pkr:4000}],/already used with different data/);
  await rejected('SELECT public.voss_finance_save($1)',[{...expense,kind:'sale',payment_status:'collected'}],/request key/);
  for(const patch of [{packaging_cost_pkr:-1},{delivery_cost_pkr:1.001},{marketing_cost_pkr:'NaN'},{delivery_charged_pkr:100,free_delivery_offer:true}])
    await rejected('SELECT public.voss_finance_save($1)',[{...breakdown,...patch,request_key:randomUUID()}],/nonnegative PKR|cannot charge delivery/);
  const unpaidCosts=await save({...breakdown,entry_date:'2029-03-01',request_key:randomUUID(),payment_status:'pending',costs_paid:false});
  detailedReport=await read('2029-03-01','2029-03-07');assert.equal(detailedReport.summary.revenue_pkr,3200);assert.equal(detailedReport.summary.cash_collected_pkr,0);assert.equal(detailedReport.summary.cash_spent_pkr,0);assert.equal(detailedReport.summary.net_profit_estimate_pkr,1875);checks++;
  await save({...breakdown,id:unpaidCosts.id,version:unpaidCosts.version,entry_date:'2029-03-01',payment_status:'pending',costs_paid:true,costs_settled_date:'2029-03-05'});
  assert.equal((await read('2029-03-05','2029-03-05')).summary.cash_spent_pkr,325);checks++;
  // Only explicit qualifying offline sales reserve FIRST30 slots.
  assert.equal((await read()).promotion.used,0);checks++;
  const offer={...breakdown,request_key:randomUUID(),entry_date:'2029-04-01',free_delivery_offer:true,delivery_charged_pkr:0};
  const offered=await save(offer);assert.equal((await read()).promotion.used,1);assert.equal((await save(offer)).id,offered.id);assert.equal((await read()).promotion.used,1);checks++;
  const editedOffer=await save({...offer,id:offered.id,version:1,description:'Edited qualifying order'});assert.equal((await read()).promotion.used,1);checks++;
  await rejected('SELECT public.voss_finance_save($1)',[{...offer,id:offered.id,version:1,free_delivery_offer:false}],/Entry changed/);assert.equal((await read()).promotion.used,1);checks++;
  const released=await save({...offer,id:offered.id,version:editedOffer.version,free_delivery_offer:false});assert.equal((await read()).promotion.used,0);checks++;
  const reservedAgain=await save({...offer,id:offered.id,version:released.version});assert.equal((await read()).promotion.used,1);checks++;
  await save({id:reservedAgain.id,version:reservedAgain.version,void_reason:'Synthetic void releases offer'});assert.equal((await read()).promotion.used,0);assert.equal((await read('2029-04-01','2029-04-01')).summary.revenue_pkr,0);checks++;
  await rejected('SELECT public.voss_finance_save($1)',[{id:reservedAgain.id,version:reservedAgain.version,void_reason:'Repeated void'}],/Entry changed|Voided/);assert.equal((await read()).promotion.used,0);checks++;
  // A failed insert rolls back its promotion reservation in the same transaction.
  await rejected('SELECT public.voss_finance_save($1)',[{...offer,request_key:randomUUID(),payer:'x'.repeat(101)}],/check constraint/);assert.equal((await read()).promotion.used,0);checks++;
  await db.exec('RESET ROLE');await db.exec("UPDATE public.voss_promotions SET used=29 WHERE code='FIRST30'");await asUser(owner);
  const finalSlot=await Promise.allSettled([save({...offer,request_key:randomUUID()}),save({...offer,request_key:randomUUID()})]);
  assert.equal(finalSlot.filter(r=>r.status==='fulfilled').length,1);assert.equal(finalSlot.filter(r=>r.status==='rejected').length,1);assert.equal((await read()).promotion.used,30);checks++;
  const lastReserved=finalSlot.find(r=>r.status==='fulfilled').value;
  await save({id:lastReserved.id,version:lastReserved.version,void_reason:'Synthetic final-slot release'});assert.equal((await read()).promotion.used,29);checks++;
  await rejected('SELECT public.voss_finance_read($1,$2)',['2026-10-31','2026-10-01'],/Start date/);
  await db.exec('RESET ROLE');
  assert.equal((await db.query('SELECT count(*)::int n FROM voss_private.finance_audit WHERE entity_id=$1',[entry.id])).rows[0].n,3);checks++;
  await rejected('UPDATE voss_private.finance_audit SET entity=\'forged\'',[],/immutable/);
  await rejected('DELETE FROM voss_private.finance_entries',[],/immutable/);
  await rejected('UPDATE voss_private.order_cost_snapshots SET unit_cost_pkr=1',[],/immutable/);
  // Reapplying the SQL never duplicates imports, resets edits or rewrites history.
  const before=(await db.query('SELECT count(*)::int n FROM voss_private.finance_audit')).rows[0].n;
  await db.exec(await readFile(new URL('../database/finance.sql',import.meta.url),'utf8'));
  await db.exec(await readFile(new URL('./fixtures/finance-import.sql',import.meta.url),'utf8'));
  assert.equal((await db.query('SELECT count(*)::int n FROM voss_private.finance_audit')).rows[0].n,before);assert.equal((await db.query("SELECT count(*)::int n FROM voss_private.finance_entries WHERE source_key IS NOT NULL")).rows[0].n,3);checks++;
  await db.query('DELETE FROM voss_private.business_owners WHERE user_id=$1',[owner]);await asUser(owner);await rejected('SELECT public.voss_finance_read()');
  console.log(`PASS: ${checks} isolated finance access, import, precision, conflict, audit, void, stock, COGS snapshot, COD, date and rerun checks. No live orders touched.`);
}finally{await db.close();}

// Optional local-only provenance test. Both inputs are gitignored and never logged.
if(process.env.VOSS_TEST_PRIVATE_IMPORT==='1') {
  const privateDb=new PGlite();
  try {
    const expected=JSON.parse(await readFile(new URL('../runtime/finance-import.expected.json',import.meta.url),'utf8'));
    const privateSql=await readFile(new URL('../runtime/finance-import.sql',import.meta.url),'utf8');
    await privateDb.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA auth;
      CREATE TABLE auth.users(id uuid PRIMARY KEY);
      CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT NULL::uuid $$;`);
    for(const file of ['../../voss-website/database/schema.sql','../database/cloud-owner.sql','../database/finance.sql']) await privateDb.exec(await readFile(new URL(file,import.meta.url),'utf8'));
    await privateDb.exec(privateSql);await privateDb.exec(privateSql);
    const result=(await privateDb.query(`SELECT count(*)::int AS count,sum(amount_pkr)::text AS total,
      count(*) FILTER(WHERE date_flag<>'')::int AS flagged_dates,min(entry_date) FILTER(WHERE date_flag<>'')::text AS flagged_date
      FROM voss_private.finance_entries WHERE source_key LIKE 'inventory-pdf-v1:%'`)).rows[0];
    assert.equal(result.count,expected.count);assert.equal(Number(result.total),expected.total);
    assert.equal(result.flagged_dates,expected.flagged_dates);assert.equal(result.flagged_date,expected.flagged_date);
    console.log('PASS: local private import totals, source date and idempotency verified. No private values logged.');
  } finally {await privateDb.close();}
}
