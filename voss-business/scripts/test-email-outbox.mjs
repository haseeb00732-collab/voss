import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const db=new PGlite();
try {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE TABLE voss_orders(id uuid PRIMARY KEY,reference text,total_pkr integer);
    CREATE TABLE voss_notification_outbox(id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      order_id uuid,state text DEFAULT 'pending',attempts integer DEFAULT 0,next_attempt_at timestamptz DEFAULT now(),
      last_error text,sent_at timestamptz,created_at timestamptz DEFAULT now());
    INSERT INTO voss_orders VALUES('00000000-0000-4000-8000-000000000001','VOSS-TEST',2999);
    INSERT INTO voss_notification_outbox(order_id) SELECT id FROM voss_orders;`);
  await db.exec(await readFile(new URL('../database/email-outbox.sql',import.meta.url),'utf8'));
  await db.exec('SET ROLE anon');await assert.rejects(()=>db.query('SELECT * FROM voss_email_claim()'),/permission denied/);
  await db.exec('RESET ROLE; SET ROLE authenticated');await assert.rejects(()=>db.query('SELECT * FROM voss_email_claim()'),/permission denied/);
  await db.exec('RESET ROLE; SET ROLE service_role');
  const job=(await db.query('SELECT * FROM voss_email_claim()')).rows[0];
  assert.equal(job.reference,'VOSS-TEST');assert.equal(job.total_pkr,2999);
  assert.equal((await db.query('SELECT * FROM voss_email_claim()')).rows.length,0);
  const finish=(lease,sent)=>db.query('SELECT voss_email_finish($1,$2,$3,$4) ok',[job.job_id,lease,sent,'test-id']);
  assert.equal((await finish('00000000-0000-4000-8000-000000000000',true)).rows[0].ok,false);
  assert.equal((await finish(job.lease,false)).rows[0].ok,true);
  assert.equal((await db.query('SELECT * FROM voss_email_claim()')).rows.length,0);
  await db.exec("RESET ROLE; UPDATE voss_notification_outbox SET next_attempt_at=now()-interval '1 minute'; SET ROLE service_role");
  const retry=(await db.query('SELECT * FROM voss_email_claim()')).rows[0];
  assert.equal(retry.mail_key,job.mail_key);assert.notEqual(retry.lease,job.lease);
  assert.equal((await finish(job.lease,true)).rows[0].ok,false);
  assert.equal((await finish(retry.lease,true)).rows[0].ok,true);
  assert.equal((await db.query('SELECT * FROM voss_email_claim()')).rows.length,0);
  await db.exec("RESET ROLE; UPDATE voss_notification_outbox SET state='sending',first_attempt_at=now()-interval '21 minutes',next_attempt_at=now()-interval '1 minute'; SET ROLE service_role");
  assert.equal((await db.query('SELECT * FROM voss_email_claim()')).rows.length,0);
  console.log('PASS: email queue permissions, leases, delayed retries, stale acknowledgments and deduplication expiry. No live emails.');
}finally{await db.close();}
