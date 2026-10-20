import assert from 'node:assert/strict';
import { createProxy } from '../worker/index.mjs';

// Isolated HTTP objects and mocked fetch. No live sessions or project requests.
const ORIGIN='https://dashboard.example.test';
const PUBLIC_KEY='sb_publishable_yyzuSdZT41Mlon7BU2XV_g_jNk2gCrq';
let checks=0;
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json',...headers}});
const req=(path,options={})=>new Request(ORIGIN+path,options);
function setup(handler=()=>json({ok:true})){
  const calls=[],assets=[];
  const worker=createProxy({fetch:async(url,options)=>{calls.push({url:new URL(url),options});return handler(new URL(url),options);}});
  const env={ASSETS:{fetch:async request=>{assets.push(request.url);return new Response('static asset');}}};
  return {calls,assets,env,fetch:(request,overrides={})=>worker.fetch(request,{...env,...overrides})};
}
let mock=setup();let response=await mock.fetch(req('/'));
assert.equal(await response.text(),'static asset');assert.equal(mock.assets.length,1);assert.equal(mock.calls.length,0);checks++;

mock=setup(()=>json({external:{google:true}},200,{'Cache-Control':'public,max-age=3600','Set-Cookie':'private=discard','Access-Control-Allow-Origin':'*'}));
response=await mock.fetch(req('/cloud/auth/v1/settings',{headers:{Origin:ORIGIN,Cookie:'app_session=never-forward',apikey:'ATTACKER_KEY','X-Admin':'do-not-forward','Accept-Profile':'voss_private'}}));
assert.equal(response.status,200);assert.equal((await response.json()).external.google,true);assert.equal(mock.calls[0].url.href,'https://porncyiyigtvejpbsjwl.supabase.co/auth/v1/settings');
assert.equal(mock.calls[0].options.headers.get('apikey'),PUBLIC_KEY);assert.equal(mock.calls[0].options.headers.get('cookie'),null);assert.equal(mock.calls[0].options.headers.get('x-admin'),null);assert.equal(mock.calls[0].options.headers.get('accept-profile'),null);assert.equal(mock.calls[0].options.redirect,'manual');assert.equal(mock.calls[0].options.cache,'no-store');assert.ok(mock.calls[0].options.signal);checks++;
assert.equal(response.headers.get('cache-control'),'private, no-store');assert.equal(response.headers.get('set-cookie'),null);assert.equal(response.headers.get('access-control-allow-origin'),ORIGIN);assert.equal(response.headers.get('x-content-type-options'),'nosniff');checks++;

mock=setup();response=await mock.fetch(req('/cloud/rest/v1/rpc/voss_finance_save',{method:'POST',headers:{Origin:ORIGIN,Authorization:'Bearer mock.jwt.signature','Content-Type':'application/json','X-Supabase-Api-Version':'2024-01-01'},body:'{"p_entry":{"amount_pkr":1}}'}));
assert.equal(response.status,200);assert.equal(mock.calls[0].options.headers.get('authorization'),'Bearer mock.jwt.signature');assert.equal(new TextDecoder().decode(mock.calls[0].options.body),'{"p_entry":{"amount_pkr":1}}');assert.equal(mock.calls[0].options.headers.get('x-supabase-api-version'),'2024-01-01');checks++;
for(const name of ['voss_business_access','voss_business_read','voss_business_update','voss_business_team','voss_finance_read','voss_inventory_save']){
  assert.equal((await mock.fetch(req(`/cloud/rest/v1/rpc/${name}`,{method:'POST',body:'{}'}))).status,200);
}
assert.equal((await mock.fetch(req('/cloud/functions/v1/voss-social',{method:'POST',body:'{"action":"status"}'}))).status,200);checks++;

mock=setup();
for(const path of ['/cloud','/cloud/','/cloud/rest/v1/voss_orders','/cloud/rest/v1/rpc/arbitrary_sql','/cloud/rest/v1/rpc/voss_business_admin','/cloud/auth/v1/admin/users','/cloud/storage/v1/object/private','/cloud/functions/v1/other-function','/cloud/rest/v1/rpc/voss_business_read/extra','/cloud/rest/v1/rpc/voss%5fbusiness_read','/cloud//auth/v1/settings','/cloud/auth/v1/signup']){
  assert.equal((await mock.fetch(req(path,{method:'POST',body:'{}'}))).status,404);
}
assert.equal(mock.calls.length,0);checks++;
for(const [path,method] of [['/cloud/auth/v1/settings','POST'],['/cloud/auth/v1/token','GET'],['/cloud/rest/v1/rpc/voss_finance_read','GET'],['/cloud/functions/v1/voss-social','DELETE']]){
  assert.equal((await mock.fetch(req(path,{method,...(method!=='GET'?{body:'{}'}:{})}))).status,405);
}
assert.equal(mock.calls.length,0);checks++;

response=await mock.fetch(req('/cloud/auth/v1/settings',{headers:{Origin:'https://evil.example'}}));assert.equal(response.status,403);assert.equal(response.headers.has('access-control-allow-origin'),false);checks++;
response=await mock.fetch(req('/cloud/auth/v1/settings',{headers:{Origin:'null'}}));assert.equal(response.status,403);checks++;
response=await mock.fetch(req('/cloud/auth/v1/settings',{headers:{'Sec-Fetch-Site':'cross-site','Sec-Fetch-Mode':'cors'}}));assert.equal(response.status,403);checks++;
response=await mock.fetch(req('/cloud/auth/v1/settings',{headers:{Origin:'http://localhost:3001'}}));assert.equal(response.status,403);checks++;
response=await mock.fetch(req('/cloud/auth/v1/settings',{headers:{Origin:'http://localhost:3001'}}),{ALLOW_LOCALHOST:'true'});assert.equal(response.status,200);assert.equal(response.headers.get('access-control-allow-origin'),'http://localhost:3001');checks++;

mock=setup();response=await mock.fetch(req('/cloud/rest/v1/rpc/voss_finance_read',{method:'OPTIONS',headers:{Origin:ORIGIN,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'authorization,apikey,content-type'}}));
assert.equal(response.status,204);assert.equal(response.headers.get('access-control-allow-methods'),'POST');assert.equal(mock.calls.length,0);checks++;
assert.equal((await mock.fetch(req('/cloud/auth/v1/settings',{method:'OPTIONS',headers:{Origin:ORIGIN,'Access-Control-Request-Method':'DELETE'}}))).status,405);
assert.equal((await mock.fetch(req('/cloud/auth/v1/settings',{method:'OPTIONS',headers:{Origin:ORIGIN,'Access-Control-Request-Headers':'Cookie'}}))).status,400);checks++;

mock=setup();
for(const query of ['apikey=arbitrary','access_token=privileged','redirect_to=https%3A%2F%2Fevil.example%2F','redirect_to=%2F%2Fevil.example%2F','redirect_to=https%3A%2F%2Fdashboard.example.test.evil.example%2F','redirect_to=https%3A%2F%2Fdashboard.example.test%2F&redirect_to=https%3A%2F%2Fevil.example%2F']){
  assert.equal((await mock.fetch(req('/cloud/auth/v1/authorize?provider=google&'+query))).status,400);
}
for(const query of ['provider=github','provider=google&provider=github','provider=google&redirect_uri=https%3A%2F%2Fevil.example%2F'])assert.equal((await mock.fetch(req('/cloud/auth/v1/authorize?'+query))).status,400);
assert.equal(mock.calls.length,0);checks++;

const google='https://accounts.google.com/o/oauth2/v2/auth?client_id=synthetic&redirect_uri=https%3A%2F%2Fporncyiyigtvejpbsjwl.supabase.co%2Fauth%2Fv1%2Fcallback&state=synthetic-signed-state';
mock=setup(()=>new Response(null,{status:302,headers:{Location:google}}));
response=await mock.fetch(req('/cloud/auth/v1/authorize?provider=google&code_challenge=synthetic&code_challenge_method=s256&prompt=select_account'));
assert.equal(response.status,302);assert.equal(response.headers.get('location'),google);assert.equal(mock.calls[0].url.searchParams.get('redirect_to'),ORIGIN+'/');assert.equal(mock.calls[0].url.searchParams.get('code_challenge'),'synthetic');assert.equal(mock.calls.length,1);checks++;
for(const location of ['https://evil.example/','https://accounts.google.com.evil.example/o/oauth2/v2/auth','http://accounts.google.com/o/oauth2/v2/auth','https://accounts.google.com:444/o/oauth2/v2/auth','https://accounts.google.com/url?continue=https://evil.example/']){
  mock=setup(()=>new Response(null,{status:302,headers:{Location:location}}));assert.equal((await mock.fetch(req('/cloud/auth/v1/authorize?provider=google'))).status,502);
}
checks++;

mock=setup(()=>new Response(null,{status:302,headers:{Location:ORIGIN+'/?code=synthetic-code'}}));
response=await mock.fetch(req('/cloud/auth/v1/callback?code=synthetic-provider-code&state=synthetic-state',{headers:{'Sec-Fetch-Site':'cross-site','Sec-Fetch-Mode':'navigate'}}));
assert.equal(response.status,302);assert.equal(response.headers.get('location'),ORIGIN+'/?code=synthetic-code');checks++;
for(const path of ['/cloud/auth/v1/callback','/cloud/auth/v1/token']){
  mock=setup(()=>new Response(null,{status:302,headers:{Location:'https://evil.example/?code=never-leak'}}));
  const options=path.endsWith('/token')?{method:'POST',body:'{}'}:{};
  response=await mock.fetch(req(path,options));assert.equal(response.status,502);assert.equal(response.headers.has('location'),false);
}
checks++;

mock=setup();response=await mock.fetch(req('/cloud/auth/v1/token?grant_type=pkce',{method:'POST',body:'x'.repeat(32769)}));assert.equal(response.status,413);assert.equal(mock.calls.length,0);checks++;
response=await mock.fetch(req('/cloud/auth/v1/token',{method:'POST',headers:{'Content-Length':'9999999'},body:'x'}));assert.equal(response.status,413);checks++;
const oversizedStream=new ReadableStream({start(controller){controller.enqueue(new Uint8Array(20000));controller.enqueue(new Uint8Array(20000));controller.close();}});
response=await mock.fetch(req('/cloud/auth/v1/token',{method:'POST',body:oversizedStream,duplex:'half'}));assert.equal(response.status,413);assert.equal(mock.calls.length,0);checks++;
response=await mock.fetch(req('/cloud/auth/v1/token',{method:'POST',body:'x'.repeat(32768)}));assert.equal(response.status,200);assert.equal(mock.calls[0].options.body.byteLength,32768);checks++;

mock=setup(()=>{throw new Error('DO NOT LEAK private upstream details');});
response=await mock.fetch(req('/cloud/auth/v1/settings'));assert.equal(response.status,502);assert.equal((await response.text()).includes('private upstream'),false);assert.equal(response.headers.get('cache-control'),'private, no-store');checks++;
mock=setup(()=>json({message:'Owner access required'},403,{'Cache-Control':'public'}));
response=await mock.fetch(req('/cloud/rest/v1/rpc/voss_finance_read',{method:'POST',body:'{}'}));assert.equal(response.status,403);assert.equal((await response.json()).message,'Owner access required');assert.equal(response.headers.get('cache-control'),'private, no-store');checks++;
const controller=new AbortController();controller.abort();mock=setup((_url,options)=>{options.signal.throwIfAborted();return json({});});
response=await mock.fetch(req('/cloud/auth/v1/settings',{signal:controller.signal}));assert.equal(response.status,504);checks++;

// Responses are streamed rather than eagerly buffered or copied into app state.
let responseReads=0;
mock=setup(()=>new Response(new ReadableStream({pull(stream){responseReads++;stream.enqueue(new TextEncoder().encode('{"streamed":true}'));stream.close();}}),{headers:{'Content-Type':'application/json'}}));
response=await mock.fetch(req('/cloud/auth/v1/settings'));assert.equal(response.bodyUsed,false);assert.equal((await response.json()).streamed,true);assert.ok(responseReads<=1);checks++;
console.log(`PASS: ${checks} isolated proxy routing, public-key, JWT passthrough, origin, body limit, streaming, cache, OAuth redirect and privacy checks. No live requests made.`);
