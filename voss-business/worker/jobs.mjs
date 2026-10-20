const PROJECT='https://porncyiyigtvejpbsjwl.supabase.co';
const KEY='sb_publishable_yyzuSdZT41Mlon7BU2XV_g_jNk2gCrq';
export async function jobRpc(env,action,data={},fetcher=fetch){
 if(!env.JOB_SECRET)throw new Error('Job credentials are not configured.');
 const response=await fetcher(`${PROJECT}/rest/v1/rpc/voss_job`,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({p_secret:env.JOB_SECRET,p_action:action,p_data:data}),signal:AbortSignal.timeout(25000)});
 if(!response.ok)throw new Error(`Database job failed (${response.status}).`);
 return response.json();
}
function safeCount(value){const n=Number(value);return Number.isSafeInteger(n)&&n>=0?n:null;}
export async function collectMeta(env,fetcher=fetch,now=new Date()){
 if(!env.META_ACCESS_TOKEN||!/^v\d+\.\d+$/.test(env.META_GRAPH_VERSION||''))return {state:'disconnected',notice:'Meta credentials are not configured. Manual entry and CSV remain available.',campaigns:[]};
 const graph=async(path,params={})=>{
  const url=new URL(`https://graph.facebook.com/${env.META_GRAPH_VERSION}/${path}`);for(const [k,v]of Object.entries(params))url.searchParams.set(k,String(v));
  const r=await fetcher(url,{headers:{Authorization:`Bearer ${env.META_ACCESS_TOKEN}`},signal:AbortSignal.timeout(12000)});
  if(!r.ok){const error=new Error(r.status===401||r.status===400?'Meta needs reconnection or permission review.':'Meta is temporarily unavailable.');error.reconnect=r.status===401;throw error;}
  return r.json();
 };
 const result={state:'ok',notice:'Cached own-account metrics. Unsupported metrics stay unavailable.',campaigns:[],instagram:null,ads:null};
 if(/^\d+$/.test(env.META_IG_ACCOUNT_ID||'')){
  const profile=await graph(env.META_IG_ACCOUNT_ID,{fields:'id,username,followers_count,media_count'});
  const media=await graph(`${env.META_IG_ACCOUNT_ID}/media`,{fields:'id,caption,media_type,media_product_type,permalink,timestamp,like_count,comments_count',limit:12});
  result.instagram={username:profile.username,followers:safeCount(profile.followers_count),media_count:safeCount(profile.media_count),posts:[]};
  for(const item of (media.data||[]).slice(0,12)){
   const post={id:item.id,caption:String(item.caption||'').slice(0,2000),type:item.media_product_type||item.media_type,url:item.permalink,likes:safeCount(item.like_count),comments:safeCount(item.comments_count),views:null,reach:null,saved:null,shares:null,engagement:null};
   try{const metrics=await graph(`${item.id}/insights`,{metric:'views,reach,saved,shares'});for(const m of metrics.data||[])if(['views','reach','saved','shares'].includes(m.name))post[m.name]=safeCount(m.total_value?.value??m.values?.[0]?.value);if(post.reach>0&&[post.likes,post.comments,post.saved,post.shares].every(n=>n!==null))post.engagement=Math.round((post.likes+post.comments+post.saved+post.shares)/post.reach*10000)/100;}catch{/* A metric failure must not lose the account cache. */}
   result.instagram.posts.push(post);
  }
  try{result.instagram.account_metrics=(await graph(`${env.META_IG_ACCOUNT_ID}/insights`,{metric:'reach,views,profile_views',period:'day',since:Math.floor(now.getTime()/1000)-7*86400,until:Math.floor(now.getTime()/1000)})).data;}catch{result.notice+=' Account reach/views/profile visits unavailable for this account or API version.';}
 }
 if(/^\d+$/.test(env.META_AD_ACCOUNT_ID||'')){
  const account=await graph(`act_${env.META_AD_ACCOUNT_ID}`,{fields:'id,currency,name'});
  if(account.currency!=='PKR')throw new Error('Ad account currency is not PKR. Import converted PKR spend manually.');
  const insights=await graph(`act_${env.META_AD_ACCOUNT_ID}/insights`,{fields:'campaign_id,campaign_name,spend,impressions,clicks,date_start,date_stop,actions',level:'campaign',time_increment:1,date_preset:'last_7d',limit:100});
  if(insights.paging?.next)throw new Error('Meta returned more than 100 campaign days. Use a bounded CSV import until pagination is configured.');
  result.campaigns=(insights.data||[]).map(r=>({campaign_key:`meta:${r.campaign_id}`,name:r.campaign_name,day:r.date_start,spend_pkr:Number(r.spend),impressions:safeCount(r.impressions),clicks:safeCount(r.clicks)}));
  result.ads={name:account.name,currency:account.currency,results:(insights.data||[]).map(r=>({campaign_key:`meta:${r.campaign_id}`,day:r.date_start,actions:r.actions||[]}))};
 }
 if(!result.instagram&&!result.ads){result.state='disconnected';result.notice='Add the own-account Instagram or Ads account ID.';}
 return result;
}
export async function runScheduled(event,env){
 const kind=event.cron==='0 3 * * *'?'backup':event.cron==='0 4 * * 1'?'weekly':'social';
 try{
  if(kind==='backup'){
   if(!env.BACKUPS)throw new Error('Private backup storage is not configured.');
   const data=await jobRpc(env,'backup');const body=JSON.stringify(data);
   if(new TextEncoder().encode(body).length>20*1024*1024)throw new Error('Backup exceeded the safe size; split export is required.');
   const key=`daily/${new Date(event.scheduledTime).toISOString().slice(0,10)}.json`;
   await env.BACKUPS.put(key,body,{expirationTtl:14*86400});
   await jobRpc(env,'status',{name:'backup',state:'ok',message:'Private business-data backup saved in Cloudflare; retained for 14 days.'});
  }else if(kind==='weekly')await jobRpc(env,'weekly');
  else await jobRpc(env,'social',await collectMeta(env));
  console.log(JSON.stringify({job:kind,state:'ok'}));
 }catch(error){
  const message=error.message?.startsWith('Meta')||error.message?.startsWith('Ad account')||error.message?.startsWith('Backup')?error.message:`${kind} job failed. Review server configuration.`;
  await jobRpc(env,'status',{name:kind,state:error.reconnect?'reconnect':'error',message}).catch(()=>{});
  console.error(JSON.stringify({job:kind,state:'error',message}));throw new Error(message);
 }
}
