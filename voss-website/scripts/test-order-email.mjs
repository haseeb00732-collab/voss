import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
import assert from 'node:assert/strict';
let handler, configured=false, calls=0, accepted=true, finished;
const source=(await readFile(new URL('../supabase/functions/voss-order-email/index.ts',import.meta.url),'utf8')).replace(/^import .*createClient.*;\r?\n/m,'');
const code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
runInNewContext(code,{Request,Response,AbortSignal,JSON,
  Deno:{serve:fn=>handler=fn,env:{get:key=>key==='SUPABASE_SERVICE_ROLE_KEY'?'test-service':key==='SUPABASE_URL'?'https://example.test':configured?'test-sender':undefined}},
  createClient:()=>({rpc:async(name,args)=>name==='voss_email_claim'?{data:[{job_id:1,lease:'test-lease',mail_key:'test-key',reference:'VOSS-TEST',total_pkr:2999}],error:null}:(finished=args,{data:true,error:null})}),
  fetch:async(url,options)=>{calls++;const body=JSON.parse(options.body);assert.equal(body.to[0].email,'haseeb00732@gmail.com');assert.equal(body.headers.idempotencyKey,'test-key');assert.doesNotMatch(body.textContent,/test-service|test-sender/);return Response.json(accepted?{messageId:'test-message'}:{code:'unauthorized'},{status:accepted?201:401});}
});
const req=auth=>new Request('https://example.test',{method:'POST',headers:{authorization:`Bearer ${auth}`}});
assert.equal((await handler(req('public-key'))).status,401);assert.equal(calls,0);
assert.equal((await handler(req('test-service'))).status,503);assert.equal(calls,0);
configured=true;assert.equal((await (await handler(req('test-service'))).json()).accepted,1);assert.equal(finished.p_sent,true);
accepted=false;assert.equal((await (await handler(req('test-service'))).json()).failed,1);assert.equal(finished.p_sent,false);
console.log('PASS: private email endpoint, disabled sender, fixed recipient and provider success/failure handling. No live email.');
