export type Post = { id:string; platform:'Instagram'|'Facebook'; text:string; url:string; published:string; likes:number|null; comments:number|null; shares:number|null; saved:number|null; views:number|null; reach:number|null; engagement:number|null };
export type SocialData = { connected:boolean; checkedAt:string; posts:Post[]; notices:string[] };
type GraphData = { data?: Record<string,unknown>[]; error?:{code?:number}; [key:string]:unknown };
export const count=(v:unknown):number|null=>typeof v==='number'&&Number.isFinite(v)&&v>=0?v:null;
export function engagement(likes:number|null,comments:number|null,shares:number|null,saved:number|null,reach:number|null){return reach&&[likes,comments,shares,saved].every(n=>n!==null)?Math.round(((likes!+comments!+shares!+saved!)/reach)*10000)/100:null;}
async function graph(edge:string,params:Record<string,string>):Promise<GraphData>{
  const version=process.env.META_GRAPH_VERSION;
  if(!/^v\d+\.\d+$/.test(version||''))throw new Error('Choose the API version configured in your Meta app.');
  const url=new URL(`https://graph.facebook.com/${version}/${edge}`);
  Object.entries(params).forEach(([k,v])=>url.searchParams.set(k,v));
  const r=await fetch(url,{headers:{Authorization:`Bearer ${process.env.META_PAGE_ACCESS_TOKEN}`},cache:'no-store',signal:AbortSignal.timeout(12000)});
  const body:GraphData=await r.json();
  if(!r.ok||body.error)throw new Error('Meta could not provide this data. Check token expiry, account IDs and permissions.');
  return body;
}
async function metric(id:string,name:string){try{const result=await graph(`${id}/insights`,{metric:name});const item=result.data?.[0] as {values?:{value?:unknown}[];total_value?:{value?:unknown}}|undefined;return count(item?.total_value?.value??item?.values?.[0]?.value);}catch{return null;}}
const cache=globalThis as typeof globalThis&{vossInsights?:{expires:number;value:SocialData};vossInsightsPending?:Promise<SocialData>};
export async function socialInsights():Promise<SocialData>{
  if(!process.env.META_PAGE_ACCESS_TOKEN||!process.env.META_GRAPH_VERSION)return {connected:false,checkedAt:new Date().toISOString(),posts:[],notices:['Meta is not connected. Add the server-side Page access token, Graph API version and account IDs.']};
  if(cache.vossInsights&&cache.vossInsights.expires>Date.now())return cache.vossInsights.value;
  if(cache.vossInsightsPending)return cache.vossInsightsPending;
  cache.vossInsightsPending=load().then(value=>{cache.vossInsights={expires:Date.now()+300000,value};return value;}).finally(()=>{cache.vossInsightsPending=undefined;});
  return cache.vossInsightsPending;
}
async function load():Promise<SocialData>{
  const posts:Post[]=[],notices:string[]=[];let connected=false;
  const ig=process.env.META_INSTAGRAM_ACCOUNT_ID,fb=process.env.META_FACEBOOK_PAGE_ID;
  if(ig&&/^\d+$/.test(ig))try{
    const response=await graph(`${ig}/media`,{fields:'id,caption,permalink,timestamp,like_count,comments_count',limit:'12'});connected=true;
    // A bounded recent-post window; individual unavailable metrics stay null.
    for(const row of response.data||[]){const id=String(row.id);if(!/^\d+$/.test(id))continue;
      const [views,reach,saved,shares]=await Promise.all(['views','reach','saved','shares'].map(m=>metric(id,m)));
      const likes=count(row.like_count),comments=count(row.comments_count);
      posts.push({id,platform:'Instagram',text:String(row.caption||''),url:String(row.permalink||''),published:String(row.timestamp||''),likes,comments,shares,saved,views,reach,engagement:engagement(likes,comments,shares,saved,reach)});
    }
  }catch{notices.push('Instagram data is unavailable. Check the professional account connection, token and insights permission.');}
  else notices.push('Instagram account ID is not configured.');
  if(fb&&/^\d+$/.test(fb))try{
    const response=await graph(`${fb}/posts`,{fields:'id,message,permalink_url,created_time,reactions.limit(0).summary(true),comments.limit(0).summary(true),shares',limit:'12'});connected=true;
    for(const row of response.data||[]){const reactions=row.reactions as {summary?:{total_count?:number}}|undefined,comments=row.comments as {summary?:{total_count?:number}}|undefined,shares=row.shares as {count?:number}|undefined;
      posts.push({id:String(row.id),platform:'Facebook',text:String(row.message||''),url:String(row.permalink_url||''),published:String(row.created_time||''),likes:count(reactions?.summary?.total_count),comments:count(comments?.summary?.total_count),shares:count(shares?.count),views:null,reach:null,saved:null,engagement:null});
    }
  }catch{notices.push('Facebook data is unavailable. Check the Page ID, token and Page read permissions.');}
  else notices.push('Facebook Page ID is not configured.');
  notices.push('Latest 12 posts per account. Counts are lifetime totals reported by Meta. A dash means unavailable, not zero. Facebook reactions include all reaction types; Facebook views and reach are not connected.');
  return {connected,checkedAt:new Date().toISOString(),posts,notices};
}
