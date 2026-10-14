import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { webcrypto } from 'node:crypto';
import ts from 'typescript';
import assert from 'node:assert/strict';
let handler, rpcResult={data:null,error:{message:'database secret details'}};
const source=(await readFile(new URL('../supabase/functions/voss-checkout/index.ts',import.meta.url),'utf8')).replace(/^import .*createClient.*;\r?\n/m,'');
const code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
runInNewContext(code,{Request,Response,TextEncoder,TextDecoder,Uint8Array,crypto:webcrypto,
  Deno:{env:{get:()=> 'test-only'},serve:fn=>{handler=fn;}},
  createClient:()=>({rpc:async()=>rpcResult})
});
const call=body=>handler(new Request('https://example.test',{method:'POST',headers:{'content-type':'application/json'},body:typeof body==='string'?body:JSON.stringify(body)}));
assert.equal((await call('not-json')).status,400);
assert.equal((await call('x'.repeat(24001))).status,413);
assert.equal((await call({action:'quote',items:[]})).status,400);
const input={action:'quote',items:[{slug:'sample',colour:'black',quantity:1}]};
const unavailable=await call(input);assert.equal(unavailable.status,503);assert.doesNotMatch(await unavailable.text(),/secret details/);
rpcResult={data:null,error:{message:'One of your selections is unavailable. Please update your bag.'}};
assert.equal((await call(input)).status,400);
rpcResult={data:[{items:[],subtotal:2999,delivery:150,total:3149,free_delivery:false,remaining:0}],error:null};
assert.equal((await (await call(input)).json()).total,3149);
assert.equal((await call({...input,items:[{slug:'sample',colour:'black',quantity:21}]})).status,400);
console.log('PASS: Edge request limits, malformed JSON, validation and private database-error redaction. No real network or orders.');
