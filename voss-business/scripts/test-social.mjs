import assert from 'node:assert/strict';
import { createSocialHandler, authorizeOwner } from '../supabase/functions/voss-social/handler.mjs';

// Pure mocks: no live accounts, tokens, customer data or network calls.
let checks=0;
const settings={META_PAGE_ACCESS_TOKEN:'MOCK_PRIVATE_TOKEN',META_GRAPH_VERSION:'v99.0',META_FACEBOOK_PAGE_ID:'111',META_INSTAGRAM_ACCOUNT_ID:'222'};
const body=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}});
const request=(data={action:'status',platform:'all'},options={})=>new Request('https://isolated.test/voss-social',{method:'POST',headers:{authorization:'Bearer mock.payload.signature','content-type':'application/json'},body:JSON.stringify(data),...options});
const invoke=async(handler,input)=>{const response=await handler(input||request());return {status:response.status,data:await response.json(),headers:response.headers};};
const success=async()=>({ok:true});
function setup(route,config=settings){
  const calls=[];let envCalls=0;
  const handler=createSocialHandler({authorize:success,env:name=>{envCalls++;return config[name];},fetch:async(url,options)=>{calls.push({url:new URL(url),options});return route(new URL(url),options);}});
  return {handler,calls,envCalls:()=>envCalls};
}

// Invalid or revoked users cannot inspect provider configuration, even when configured.
let reads=0,providerCalls=0;
for(const status of [401,403]){
  const handler=createSocialHandler({authorize:async()=>({ok:false,status,message:'Denied'}),env:()=>{reads++;return 'secret';},fetch:async()=>{providerCalls++;throw new Error('must not fetch');}});
  assert.equal((await invoke(handler)).status,status);checks++;
}
assert.equal(reads,0);assert.equal(providerCalls,0);checks++;
const unavailableAuth=createSocialHandler({authorize:async()=>{throw new Error('DO NOT EXPOSE JWT');},env:()=>{throw new Error('must not inspect');}});
const denied=await invoke(unavailableAuth);assert.equal(denied.status,503);assert.equal(JSON.stringify(denied.data).includes('JWT'),false);checks++;
const disconnected=setup(()=>{throw new Error('must not call');},{});
let result=await invoke(disconnected.handler);assert.equal(result.status,200);assert.equal(result.data.state,'disconnected');assert.deepEqual(result.data.posts,[]);assert.equal(disconnected.calls.length,0);assert.equal(result.headers.get('cache-control'),'private, no-store');checks++;
const invalidConfig=setup(()=>{throw new Error('must not call');},{...settings,META_GRAPH_VERSION:'https://evil.test'});
assert.equal((await invoke(invalidConfig.handler)).data.state,'unavailable');assert.equal(invalidConfig.calls.length,0);checks++;
const status=setup(url=>body(url.pathname.endsWith('/111')?{id:'111',name:'Synthetic Page'}:{id:'222',username:'synthetic_account'}));
result=await invoke(status.handler);assert.equal(result.data.state,'connected');assert.equal(result.data.platforms.facebook.account_name,'Synthetic Page');assert.equal(status.calls.length,2);checks++;
for(const call of status.calls){assert.equal(call.url.origin,'https://graph.facebook.com');assert.equal(call.url.searchParams.has('access_token'),false);assert.equal(call.options.headers.Authorization,'Bearer MOCK_PRIVATE_TOKEN');assert.equal(call.options.method,'GET');assert.equal(call.options.redirect,'error');assert.ok(call.options.signal);}
assert.equal(JSON.stringify(result.data).includes(settings.META_PAGE_ACCESS_TOKEN),false);checks++;
const mismatch=setup(()=>body({id:'999',name:'Wrong account'}));
assert.equal((await invoke(mismatch.handler,request({action:'status',platform:'facebook'}))).data.state,'unavailable');checks++;
const deniedProvider=setup(()=>body({error:{code:190,message:'MOCK_PRIVATE_TOKEN should never appear'}},400));
result=await invoke(deniedProvider.handler);assert.equal(result.data.state,'unavailable');assert.match(result.data.platforms.facebook.message,/expired/);assert.equal(JSON.stringify(result.data).includes('MOCK_PRIVATE_TOKEN'),false);checks++;
const rateLimit=setup(()=>body({error:{code:613,message:'provider payload'}},429));
assert.match((await invoke(rateLimit.handler)).data.platforms.facebook.message,/rate limit/);checks++;
const mixed=setup(url=>url.pathname.endsWith('/111')?body({id:'111',name:'Synthetic Page'}):body({error:{code:10}},403));
assert.equal((await invoke(mixed.handler)).data.state,'partial');checks++;
const malicious=setup(()=>{throw new Error('must not call');});
assert.equal((await invoke(malicious.handler,request({action:'send',platform:'facebook'}))).status,400);
assert.equal((await invoke(malicious.handler,request({action:'comments',platform:'facebook',post_id:'https://evil.test/123'}))).status,400);
assert.equal((await invoke(malicious.handler,request({action:'comments',platform:'all',post_id:'123'}))).status,400);assert.equal(malicious.calls.length,0);checks++;

const postRows=[{id:'333',caption:'Synthetic media',permalink:'https://www.instagram.com/p/synthetic/',timestamp:'2026-10-01T12:00:00Z',like_count:10,comments_count:2}];
const posts=setup(url=>url.pathname.endsWith('/media')?body({data:postRows,paging:{next:'https://evil.test/?access_token=stolen'}}):body({data:[{name:'views',values:[{value:200}]},{name:'reach',values:[{value:100}]},{name:'saved',total_value:{value:3}},{name:'shares',values:[{value:5}]}]}));
result=await invoke(posts.handler,request({action:'posts',platform:'instagram',url:'https://evil.test',next:'https://evil.test'}));
assert.equal(result.data.posts[0].engagement,20);assert.equal(result.data.posts[0].metrics_state,'available');assert.equal(posts.calls.length,2);assert.ok(posts.calls.every(c=>c.url.origin==='https://graph.facebook.com'));checks++;
const partialMetrics=setup(url=>url.pathname.endsWith('/media')?body({data:postRows}):body({error:{code:200}},403));
result=await invoke(partialMetrics.handler,request({action:'posts',platform:'instagram'}));assert.equal(result.data.posts[0].views,null);assert.equal(result.data.posts[0].reach,null);assert.equal(result.data.posts[0].engagement,null);assert.equal(result.data.posts[0].likes,10);assert.match(result.data.posts[0].metric_notice,/permission/);checks++;
const invalidMetrics=setup(url=>url.pathname.endsWith('/media')?body({data:[{...postRows[0],like_count:-1,comments_count:'2',permalink:'javascript:alert(1)'}]}):body({data:[]}));
result=await invoke(invalidMetrics.handler,request({action:'posts',platform:'instagram'}));assert.equal(result.data.posts[0].likes,null);assert.equal(result.data.posts[0].comments,null);assert.equal(result.data.posts[0].url,'');assert.equal(result.data.posts[0].engagement,null);checks++;
const limited=setup(url=>url.pathname.endsWith('/media')?body({data:Array.from({length:100},(_,i)=>({...postRows[0],id:String(500+i)}))}):body({data:[]}));
result=await invoke(limited.handler,request({action:'posts',platform:'instagram'}));assert.equal(result.data.posts.length,6);assert.equal(limited.calls.length,7);checks++;

const conversations=setup(url=>{assert.equal(url.pathname,'/v99.0/111/conversations');assert.equal(url.searchParams.get('platform'),'instagram');return body({data:[{id:'conversation-1',updated_time:'2026-10-01T12:00:00Z',participants:{data:[{id:'private-id',name:'Synthetic participant',email:'do-not-return@example.test'}]},messages:{data:[{id:'message-1',message:'Synthetic message',created_time:'2026-10-01T12:00:00Z',from:{name:'Synthetic participant',email:'do-not-return@example.test'},attachments:{data:[{url:'https://private.test'}]}}]}}]});});
result=await invoke(conversations.handler,request({action:'conversations',platform:'instagram'}));assert.equal(result.data.conversations[0].messages[0].text,'Synthetic message');assert.deepEqual(result.data.conversations[0].participants,['Synthetic participant']);assert.equal(JSON.stringify(result.data).includes('do-not-return'),false);assert.equal(JSON.stringify(result.data).includes('private.test'),false);checks++;
const unauthorizedPost=setup(()=>body({data:[{id:'111_444'}]}));
result=await invoke(unauthorizedPost.handler,request({action:'comments',platform:'facebook',post_id:'999_555'}));assert.equal(result.data.state,'unavailable');assert.equal(unauthorizedPost.calls.length,1);assert.deepEqual(result.data.comments,[]);checks++;
const comments=setup(url=>url.pathname.endsWith('/posts')?body({data:[{id:'111_444'}]}):body({data:[{id:'comment-1',message:'Synthetic comment',created_time:'2026-10-01',like_count:0,from:{name:'Synthetic author'}}]}));
result=await invoke(comments.handler,request({action:'comments',platform:'facebook',post_id:'111_444'}));assert.equal(result.data.comments[0].likes,0);assert.equal(result.data.comments[0].author,'Synthetic author');assert.equal(comments.calls.length,2);checks++;
const transportFailure=setup(()=>{throw new Error('secret token and network internals');});
result=await invoke(transportFailure.handler);assert.equal(result.data.state,'unavailable');assert.equal(JSON.stringify(result.data).includes('network internals'),false);checks++;
const malformedProvider=setup(()=>body({unexpected:'not an empty account'}));
assert.equal((await invoke(malformedProvider.handler,request({action:'posts',platform:'facebook'}))).data.state,'unavailable');checks++;
assert.equal((await invoke(malicious.handler,request({action:'status',padding:'x'.repeat(5000)}))).status,400);checks++;
const preflight=await malicious.handler(new Request('https://isolated.test',{method:'OPTIONS'}));assert.equal(preflight.status,204);assert.equal(malicious.calls.length,0);checks++;

// Auth adapter always validates the token first, then performs the same-JWT RPC.
const authEnv=n=>({SUPABASE_URL:'https://synthetic.supabase.test',SUPABASE_ANON_KEY:'synthetic-publishable-key'})[n];
let authCalls=[];
function clientFactory(user,access,error=null){return(_url,_key,options)=>{authCalls.push(['options',options]);return {auth:{getUser:async token=>{authCalls.push(['user',token]);return {data:{user},error};}},rpc:async name=>{authCalls.push(['rpc',name]);return access;}};};}
let auth=await authorizeOwner(request(),{env:authEnv,createClient:clientFactory({email_confirmed_at:'2026-01-01'},{data:{approved:true,role:'owner'}})});
assert.equal(auth.ok,true);assert.equal(authCalls[1][0],'user');assert.equal(authCalls[2][1],'voss_business_access');assert.equal(authCalls[0][1].global.headers.Authorization,'Bearer mock.payload.signature');checks++;
authCalls=[];auth=await authorizeOwner(request(),{env:authEnv,createClient:clientFactory({email_confirmed_at:null},{data:{approved:true,role:'owner'}})});assert.equal(auth.status,403);assert.equal(authCalls.some(c=>c[0]==='rpc'),false);checks++;
authCalls=[];auth=await authorizeOwner(request(),{env:authEnv,createClient:clientFactory(null,{data:{approved:true,role:'owner'}},{message:'invalid'})});assert.equal(auth.status,401);assert.equal(authCalls.some(c=>c[0]==='rpc'),false);checks++;
auth=await authorizeOwner(request(),{env:authEnv,createClient:clientFactory({email_confirmed_at:'2026-01-01'},{data:{approved:false,role:null}})});assert.equal(auth.status,403);checks++;
auth=await authorizeOwner(new Request('https://isolated.test'),{env:()=>{throw new Error('must not inspect');},createClient:()=>{throw new Error('must not instantiate');}});assert.equal(auth.status,401);checks++;
console.log(`PASS: ${checks} isolated social authorization, privacy, fixed-origin, read-only, configuration, metrics, bounded data and provider-failure checks. No live requests made.`);
