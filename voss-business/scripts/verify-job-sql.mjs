import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const db=new PGlite();
try{
 await db.exec(`CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;CREATE SCHEMA auth;CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,email_confirmed_at timestamptz);CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;GRANT USAGE ON SCHEMA auth TO authenticated;
 CREATE SCHEMA extensions;CREATE FUNCTION extensions.digest(text,text) RETURNS bytea LANGUAGE sql AS $$ SELECT decode(md5($1),'hex') $$;`);
 // The digest stub exists only inside this disposable test. Production uses pgcrypto SHA-256.
 for(const f of ['../../voss-website/database/schema.sql','../database/cloud-owner.sql','../database/team-access.sql','../database/finance.sql','../database/finance-upgrade.sql','../database/finance-order-costs.sql','../database/order-status-upgrade.sql','../database/viewer-roles.sql','../database/weekly-reports.sql','../database/scheduled-jobs.sql'])await db.exec(await readFile(new URL(f,import.meta.url),'utf8'));
 const secret='a'.repeat(96);await db.query("INSERT INTO voss_private.job_credentials VALUES('worker',encode(extensions.digest($1,'sha256'),'hex'))",[secret]);
 await db.exec('SET ROLE anon');
 await assert.rejects(()=>db.query("SELECT public.voss_job('wrong','backup')"),/authorization/);
 await assert.rejects(()=>db.query("SELECT * FROM voss_private.job_credentials"),/permission/);
 const backup=(await db.query("SELECT public.voss_job($1,'backup') data",[secret])).rows[0].data;
 assert(!('voss_private.job_credentials' in backup.tables));assert(Array.isArray(backup.functions));
 await db.query("SELECT public.voss_job($1,'weekly')",[secret]);
 await db.query("SELECT public.voss_job($1,'social',$2)",[secret,JSON.stringify({state:'disconnected',notice:'Missing credentials',campaigns:[]})]);
 await assert.rejects(()=>db.query("SELECT public.voss_job($1,'arbitrary_sql')",[secret]),/Unsupported/);
 console.log('PASS: additive job SQL, secret authentication, private credential protection, backup exclusions, weekly and disconnected social jobs.');
}finally{await db.close();}
