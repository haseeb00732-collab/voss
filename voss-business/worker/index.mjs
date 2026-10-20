import {runScheduled} from './jobs.mjs';
// Fixed-project connectivity proxy. It adds no privileges and stores no sessions.
const UPSTREAM='https://porncyiyigtvejpbsjwl.supabase.co';
const PUBLIC_KEY='sb_publishable_yyzuSdZT41Mlon7BU2XV_g_jNk2gCrq';
const MAX_BODY=32768;
const AUTH_METHODS=new Map([
  ['/auth/v1/settings',['GET']],['/auth/v1/authorize',['GET']],
  ['/auth/v1/token',['POST']],['/auth/v1/user',['GET','PUT']],
  ['/auth/v1/logout',['POST']],['/auth/v1/callback',['GET']],
]);
const RPCS=new Set(['voss_business_access','voss_business_read','voss_business_update','voss_business_team','voss_finance_read','voss_finance_save','voss_inventory_save','voss_team_role','voss_weekly_reports','voss_campaign_save','voss_order_finance_read','voss_order_finance_save','voss_system_status']);
const FORWARD_HEADERS=['authorization','content-type','accept','x-client-info','x-supabase-api-version'];
const RESPONSE_HEADERS=['content-type','retry-after','www-authenticate','x-supabase-api-version','content-range'];
const SECURITY_HEADERS={
  'Cache-Control':'private, no-store','CDN-Cache-Control':'no-store','Cloudflare-CDN-Cache-Control':'no-store',
  Pragma:'no-cache',Expires:'0','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer',
  'Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
  Vary:'Origin',
};
class ProxyError extends Error{
  constructor(status,message){super(message);this.status=status;}
}
function methodsFor(path){
  if(AUTH_METHODS.has(path))return AUTH_METHODS.get(path);
  if(path==='/functions/v1/voss-social')return ['POST'];
  if(path.startsWith('/rest/v1/rpc/')&&RPCS.has(path.slice('/rest/v1/rpc/'.length)))return ['POST'];
  return null;
}
function originFor(request,url,env){
  const origin=request.headers.get('origin');
  if(origin&&origin!==url.origin&&!(env.ALLOW_LOCALHOST==='true'&&origin==='http://localhost:3001'))throw new ProxyError(403,'This connection accepts requests from the dashboard only.');
  const site=request.headers.get('sec-fetch-site');
  const callback=url.pathname==='/cloud/auth/v1/callback'&&request.method==='GET'&&request.headers.get('sec-fetch-mode')==='navigate';
  if(!origin&&site==='cross-site'&&!callback)throw new ProxyError(403,'This connection accepts requests from the dashboard only.');
  return origin||url.origin;
}
function responseHeaders(origin){return new Headers({...SECURITY_HEADERS,...(origin?{'Access-Control-Allow-Origin':origin}:{})});}
function failure(error,origin){
  const headers=responseHeaders(origin);headers.set('Content-Type','application/json; charset=utf-8');
  return new Response(JSON.stringify({error:error instanceof ProxyError?error.message:'The secure connection is temporarily unavailable. Try again.'}),{status:error instanceof ProxyError?error.status:502,headers});
}
function selfRedirect(value,origin){
  try{const url=new URL(value);return url.origin===origin&&!url.username&&!url.password&&!url.pathname.startsWith('/cloud')?url:null;}catch{return null;}
}
function validateQuery(url,path,origin){
  if(url.search.length>16384)throw new ProxyError(414,'The request URL is too long.');
  // API credentials belong in headers; query credentials are never forwarded.
  if(url.searchParams.has('apikey')||url.searchParams.has('access_token'))throw new ProxyError(400,'Use the supported authentication headers.');
  const redirects=url.searchParams.getAll('redirect_to');
  if(redirects.length>1||(redirects.length===1&&!selfRedirect(redirects[0],origin)))throw new ProxyError(400,'The sign-in return address must be this dashboard.');
  if(path==='/auth/v1/authorize'){
    if(url.searchParams.getAll('provider').length!==1||url.searchParams.get('provider')!=='google')throw new ProxyError(400,'Only Google sign-in is supported here.');
    // redirect_uri is selected by Supabase and must match Google's configured URI.
    // Never accept an override or rewrite it in the returned Google Location.
    if(url.searchParams.has('redirect_uri'))throw new ProxyError(400,'The provider callback address cannot be overridden.');
    if(redirects.length===0)url.searchParams.set('redirect_to',`${origin}/`);
  }
}
async function boundedBody(request,signal){
  const declared=request.headers.get('content-length');
  if(declared!==null&&(!/^\d+$/.test(declared)||Number(declared)>MAX_BODY))throw new ProxyError(413,'Request body exceeds the 32 KB limit.');
  if(!request.body)return undefined;
  const reader=request.body.getReader();const chunks=[];let size=0;let abortListener;
  const aborted=new Promise((_,reject)=>{abortListener=()=>reject(new ProxyError(504,'The secure connection timed out. Try again.'));signal.addEventListener('abort',abortListener,{once:true});});
  try{
    if(signal.aborted)throw new ProxyError(504,'The secure connection timed out. Try again.');
    for(;;){
      const {done,value}=await Promise.race([reader.read(),aborted]);if(done)break;
      size+=value.byteLength;if(size>MAX_BODY)throw new ProxyError(413,'Request body exceeds the 32 KB limit.');
      chunks.push(value);
    }
    const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
    return bytes;
  }finally{signal.removeEventListener('abort',abortListener);await reader.cancel().catch(()=>{});}
}
function safeLocation(location,path,origin){
  let target;try{target=new URL(location,UPSTREAM);}catch{throw new ProxyError(502,'The sign-in provider returned an invalid redirect.');}
  if(path==='/auth/v1/authorize'&&target.protocol==='https:'&&target.hostname==='accounts.google.com'&&!target.port&&!target.username&&!target.password&&['/o/oauth2/v2/auth','/o/oauth2/auth'].includes(target.pathname))return location;
  if(path==='/auth/v1/callback'&&selfRedirect(target.href,origin))return target.href;
  throw new ProxyError(502,'The sign-in provider returned an unexpected redirect. Check the configured return address.');
}

export function createProxy({fetch:fetcher=globalThis.fetch}={}){
  return {
    async fetch(request,env){
      const incoming=new URL(request.url);
      if(incoming.pathname!=='/cloud'&&!incoming.pathname.startsWith('/cloud/'))return env.ASSETS.fetch(request);
      let origin;
      try{
        origin=originFor(request,incoming,env);
        const path=incoming.pathname.slice('/cloud'.length);
        const allowed=methodsFor(path);
        if(!allowed)throw new ProxyError(404,'This cloud route is not available.');
        if(request.method==='OPTIONS'){
          const method=request.headers.get('access-control-request-method');
          if(method&&!allowed.includes(method))throw new ProxyError(405,'This request method is not supported.');
          const requestedHeaders=(request.headers.get('access-control-request-headers')||'').toLowerCase().split(',').map(s=>s.trim()).filter(Boolean);
          if(requestedHeaders.some(h=>![...FORWARD_HEADERS,'apikey'].includes(h)))throw new ProxyError(400,'This request header is not supported.');
          const headers=responseHeaders(origin);headers.set('Access-Control-Allow-Methods',allowed.join(', '));headers.set('Access-Control-Allow-Headers',[...FORWARD_HEADERS,'apikey'].join(', '));
          return new Response(null,{status:204,headers});
        }
        if(!allowed.includes(request.method))throw new ProxyError(405,'This request method is not supported.');
        validateQuery(incoming,path,incoming.origin);
        const target=new URL(path,UPSTREAM);target.search=incoming.search;
        const headers=new Headers({apikey:PUBLIC_KEY});
        for(const key of FORWARD_HEADERS){const value=request.headers.get(key);if(value!==null){if(value.length>8192)throw new ProxyError(400,'This request header is too long.');headers.set(key,value);}}
        const authorization=headers.get('authorization');
        if(authorization&&!/^Bearer [A-Za-z0-9._-]+$/i.test(authorization))throw new ProxyError(400,'Use a valid Bearer authorization header.');
        const signal=AbortSignal.any([AbortSignal.timeout(25000),request.signal]);
        const bytes=request.method==='GET'?undefined:await boundedBody(request,signal);
        let upstream;
        try{upstream=await fetcher(target,{method:request.method,headers,body:bytes,redirect:'manual',signal,cache:'no-store'});}
        catch{throw new ProxyError(signal.aborted?504:502,signal.aborted?'The secure connection timed out. Try again.':'The secure connection could not reach the account service. Try again.');}
        const outgoing=responseHeaders(origin);
        for(const key of RESPONSE_HEADERS){const value=upstream.headers.get(key);if(value!==null)outgoing.set(key,value);}
        const location=upstream.headers.get('location');
        if(upstream.status>=300&&upstream.status<400){
          if(!location){await upstream.body?.cancel().catch(()=>{});throw new ProxyError(502,'The sign-in provider returned an incomplete redirect.');}
          let destination;try{destination=safeLocation(location,path,incoming.origin);}finally{await upstream.body?.cancel().catch(()=>{});}
          outgoing.set('Location',destination);
          return new Response(null,{status:upstream.status,headers:outgoing});
        }
        // Directly stream the response. The same timeout also aborts its body.
        // Set-Cookie, provider CORS and cache headers are deliberately not copied.
        return new Response(upstream.body,{status:upstream.status,statusText:upstream.statusText,headers:outgoing});
      }catch(error){return failure(error,origin);}
    },
  };
}
export default {...createProxy(),scheduled(event,env,ctx){ctx.waitUntil(runScheduled(event,env));}};
