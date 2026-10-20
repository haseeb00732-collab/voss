import {createProxy} from './index.mjs';

// A branded entrance to the existing app, not a second database or dashboard.
// Auth/RPC traffic uses the same audited proxy directly, on this request's origin.
const APP_ORIGIN='https://voss-business.haseeb00732.workers.dev';
export function createBrandedEntrance(fetcher=fetch){
  const proxy=createProxy({fetch:fetcher});
  return {
    async fetch(request,env={}){
      const incoming=new URL(request.url);
      if(!incoming.pathname.startsWith('/cloud/')&&!['GET','HEAD'].includes(request.method))
        return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD','Cache-Control':'no-store'}});
      return proxy.fetch(request,{...env,ASSETS:{fetch:async()=>{
        const target=new URL(incoming.pathname,APP_ORIGIN);
        // Browser callback codes are consumed locally. Never send them to the asset host.
        if(incoming.pathname.startsWith('/_next/'))target.search=incoming.search;
        try{
          const upstream=await fetcher(target,{method:request.method,headers:{Accept:request.headers.get('accept')||'*/*'},redirect:'manual',signal:AbortSignal.timeout(20000)});
          const headers=new Headers(upstream.headers);
          headers.delete('set-cookie');
          const location=headers.get('location');
          if(location){const destination=new URL(location,APP_ORIGIN);if(destination.origin!==APP_ORIGIN)return new Response('Invalid app redirect',{status:502});destination.host=incoming.host;destination.protocol=incoming.protocol;headers.set('Location',destination.href);}
          headers.set('Cache-Control',incoming.pathname.startsWith('/_next/static/')?'public, max-age=31536000, immutable':'no-store');
          headers.set('X-Content-Type-Options','nosniff');
          return new Response(upstream.body,{status:upstream.status,headers});
        }catch{return new Response('VOSS Business is temporarily unavailable. Please refresh in a moment.',{status:503,headers:{'Cache-Control':'no-store','Content-Type':'text/plain; charset=utf-8'}});}
      }}});
    },
  };
}
export default createBrandedEntrance();
