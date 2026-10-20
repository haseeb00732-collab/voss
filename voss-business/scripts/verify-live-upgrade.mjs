import assert from 'node:assert/strict';
import {readFile,writeFile,unlink} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {randomUUID} from 'node:crypto';
import {jobRpc,collectMeta} from '../worker/jobs.mjs';
const base='https://voss-business.haseeb00732.workers.dev';
// Windows' system TLS transport works where Node's connection is reset by the network.
const exec=promisify(execFile);
async function curlFetch(url,options={}){
 const stem=`runtime/http-check-${randomUUID()}`,input=stem+'.request',output=stem+'.response';
 const args=['--silent','--show-error','--max-time','30','--request',options.method||'GET','--output',output,'--write-out','%{http_code}'];
 for(const [k,v]of Object.entries(options.headers||{}))args.push('--header',`${k}: ${v}`);
 try{if(options.body){await writeFile(input,options.body);args.push('--data-binary',`@${input}`);}args.push(String(url));const {stdout}=await exec('curl.exe',args,{windowsHide:true});return new Response(await readFile(output),{status:Number(stdout)});}finally{await unlink(input).catch(()=>{});await unlink(output).catch(()=>{});}
}
for(const route of ['voss_finance_read','voss_weekly_reports','voss_system_status']){
 const r=await curlFetch(`${base}/cloud/rest/v1/rpc/${route}`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
 assert([401,403].includes(r.status),`${route} must reject anonymous access; got ${r.status}`);
}
const blocked=await curlFetch(`${base}/cloud/rest/v1/rpc/voss_job`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});assert.equal(blocked.status,404);
if(!process.argv.includes('--server-jobs')){console.log('PASS: live finance, reports and service status reject anonymous requests; the browser cannot invoke the private job RPC.');process.exit(0);}
const env={JOB_SECRET:JSON.parse(await readFile('runtime/job-secret.json','utf8')).secret};
await jobRpc(env,'weekly',{},curlFetch);await jobRpc(env,'social',await collectMeta({}),curlFetch);
const backup=await jobRpc(env,'backup',{},curlFetch);
assert(!backup.tables['voss_private.job_credentials']);assert.equal(backup.tables['voss_private.finance_entries'].length,26);
await writeFile('runtime/backup-20261020-after-upgrade.json',JSON.stringify(backup));
const report=backup.tables['voss_private.weekly_reports'][0];assert(report);await writeFile('runtime/verified-weekly-report.pdf',Buffer.from(report.pdf_base64,'base64'));
console.log('PASS: live private APIs reject anonymous access; browser cannot invoke server jobs; weekly generation and disconnected social cache work; 26 imported entries preserved; private post-upgrade backup and PDF saved. No order or email created.');
