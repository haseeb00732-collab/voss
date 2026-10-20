// Portable, dependency-injected implementation; isolated tests never call Meta.
const GRAPH_ORIGIN='https://graph.facebook.com';
const ID=/^\d{1,40}$/;
const POST_ID=/^\d{1,40}(?:_\d{1,40})?$/;
const PLATFORMS=['facebook','instagram'];
const CORS={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS','Cache-Control':'private, no-store','Vary':'Origin','X-Content-Type-Options':'nosniff'};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{...CORS,'Content-Type':'application/json; charset=utf-8'}});
const text=(value,max=2000)=>typeof value==='string'?value.slice(0,max):'';
const count=value=>typeof value==='number'&&Number.isFinite(value)&&value>=0?value:null;
const rows=value=>Array.isArray(value?.data)?value.data:[];
const name=value=>text(value?.name||value?.username,120)||null;
const safeURL=value=>{try{const u=new URL(value);return u.protocol==='https:'&&['facebook.com','www.facebook.com','m.facebook.com','instagram.com','www.instagram.com'].includes(u.hostname)?u.href:'';}catch{return '';}};

async function boundedJSON(response,maxBytes){
  if(Number(response.headers.get('content-length'))>maxBytes)throw new Error('oversized response');
  const reader=response.body?.getReader();if(!reader)throw new Error('empty response');
  let size=0;const chunks=[];
  try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>maxBytes)throw new Error('oversized response');chunks.push(value);}}
  finally{await reader.cancel().catch(()=>{});}
  const buffer=new Uint8Array(size);let offset=0;for(const chunk of chunks){buffer.set(chunk,offset);offset+=chunk.length;}
  return JSON.parse(new TextDecoder().decode(buffer));
}

export async function authorizeOwner(request,{env,createClient}){
  const authorization=request.headers.get('authorization')||'';
  const match=/^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/i.exec(authorization);
  if(!match||authorization.length>8192)return {ok:false,status:401,message:'Sign in to access social accounts.'};
  const url=env('SUPABASE_URL'),key=env('SUPABASE_ANON_KEY')||env('SUPABASE_PUBLISHABLE_KEY');
  if(!url||!key)return {ok:false,status:503,message:'Account verification is temporarily unavailable.'};
  try{
    const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:{headers:{Authorization:authorization},fetch:(input,init)=>fetch(input,{...init,signal:AbortSignal.timeout(12000)})}});
    const {data,error}=await client.auth.getUser(match[1]);
    if(error||!data?.user)return {ok:false,status:401,message:'Your session has expired. Sign in again.'};
    if(!data.user.email_confirmed_at)return {ok:false,status:403,message:'Verify your email before accessing social accounts.'};
    const access=await client.rpc('voss_business_access');
    if(access.error||access.data?.approved!==true||!['owner','technical'].includes(access.data?.role))return {ok:false,status:403,message:'Approved owner access is required.'};
    return {ok:true};
  }catch{return {ok:false,status:503,message:'Account verification is temporarily unavailable.'};}
}

class ProviderError extends Error{
  constructor(message){super(message);this.name='ProviderError';}
}
function requiredRows(value){
  if(!Array.isArray(value?.data)||value.data.some(row=>!row||typeof row!=='object'||Array.isArray(row)))throw new ProviderError('Meta returned an unexpected data format. Try again later.');
  return value.data;
}
function providerMessage(code,status){
  if(code===190)return 'The Meta connection has expired. Replace the server access token.';
  if([10,200,294].includes(code)||status===403)return 'Meta permission or App Review approval is missing for this data.';
  if([4,17,32,613].includes(code)||status===429)return 'Meta rate limit reached. Try again later.';
  return 'Meta could not provide this data. Check account IDs, permissions and the configured Graph API version.';
}
function overall(platforms,selected){
  const states=selected.map(p=>platforms[p].state);
  if(states.every(s=>s==='connected'))return 'connected';
  if(states.some(s=>s==='connected'||s==='partial'))return 'partial';
  return states.some(s=>s==='unavailable')?'unavailable':'disconnected';
}
export function createSocialHandler({authorize,env,fetch:fetcher=globalThis.fetch}){
  return async function handler(request){
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:CORS});
    // Authenticate before reading provider configuration or returning its state.
    let auth;try{auth=await authorize(request);}catch{auth={ok:false,status:503,message:'Account verification is temporarily unavailable.'};}
    if(!auth?.ok)return json({error:auth?.message||'Approved owner access is required.'},auth?.status||403);
    if(request.method!=='POST')return json({error:'Use a POST request.'},405);
    let input;try{input=await boundedJSON(request,4096);}catch{return json({error:'Use a small valid JSON request.'},400);}
    if(!input||Array.isArray(input)||!['status','posts','conversations','comments'].includes(input.action)||!['all',...PLATFORMS].includes(input.platform||'all'))return json({error:'Choose a supported read action and platform.'},400);
    const selected=input.platform&&input.platform!=='all'?[input.platform]:PLATFORMS;
    if(input.action==='comments'&&(selected.length!==1||!POST_ID.test(input.post_id||'')))return json({error:'Choose one platform and a valid post ID.'},400);
    const token=env('META_PAGE_ACCESS_TOKEN'),version=env('META_GRAPH_VERSION');
    const ids={facebook:env('META_FACEBOOK_PAGE_ID'),instagram:env('META_INSTAGRAM_ACCOUNT_ID')};
    const result={state:'disconnected',checked_at:new Date().toISOString(),platforms:{facebook:{state:'disconnected',message:'Facebook is not configured.'},instagram:{state:'disconnected',message:'Instagram is not configured.'}},posts:[],conversations:[],comments:[],notices:[]};
    const deadline=AbortSignal.timeout(14000);
    async function graph(edge,params={}){
      // No caller-provided host, URL, version or paging URL is ever followed.
      if(!/^[\d_]+(?:\/(?:posts|media|insights|conversations|comments))?$/.test(edge))throw new ProviderError('Invalid provider object.');
      const url=new URL(`${GRAPH_ORIGIN}/${version}/${edge}`);
      for(const [key,value]of Object.entries(params))url.searchParams.set(key,value);
      try{
        const response=await fetcher(url,{method:'GET',headers:{Authorization:`Bearer ${token}`,Accept:'application/json'},redirect:'error',cache:'no-store',signal:AbortSignal.any([deadline,AbortSignal.timeout(12000)])});
        const body=await boundedJSON(response,1048576);
        if(!response.ok||body?.error)throw new ProviderError(providerMessage(body?.error?.code,response.status));
        return body;
      }catch(error){
        if(error instanceof ProviderError)throw error;
        throw new ProviderError(deadline.aborted?'Meta request timed out. Try again later.':'Meta is temporarily unavailable. Try again later.');
      }
    }
    async function posts(platform,limit='6'){
      return requiredRows(await graph(`${ids[platform]}/${platform==='instagram'?'media':'posts'}`,{fields:platform==='instagram'?'id,caption,permalink,timestamp,like_count,comments_count':'id,message,permalink_url,created_time,reactions.limit(0).summary(true),comments.limit(0).summary(true),shares',limit})).slice(0,Number(limit));
    }
    await Promise.all(selected.map(async platform=>{
      const accountId=ids[platform];
      if(!token||!version||!accountId){result.platforms[platform]={state:'disconnected',message:'A server access token, Graph API version and account ID are required.'};return;}
      if(!/^v\d{1,3}\.\d{1,2}$/.test(version)||!ID.test(accountId)){result.platforms[platform]={state:'unavailable',message:'The server Graph API version or account ID is invalid.'};return;}
      if(platform==='instagram'&&input.action==='conversations'&&!ID.test(ids.facebook||'')){result.platforms[platform]={state:'disconnected',message:'A linked Facebook Page ID is required for Instagram conversations.'};return;}
      try{
        let accountName;
        if(input.action==='status'){
          const account=await graph(accountId,{fields:platform==='instagram'?'id,username':'id,name'});
          if(account.id!==accountId)throw new ProviderError('Meta returned an unexpected account. Verify the configured account ID.');
          accountName=platform==='instagram'?text(account.username,120):text(account.name,120);
        }else if(input.action==='posts'){
          const found=await posts(platform);
          const mapped=await Promise.all(found.map(async row=>{
            const id=text(row.id,100);if(!POST_ID.test(id))return null;
            const likes=count(platform==='instagram'?row.like_count:row.reactions?.summary?.total_count),comments=count(platform==='instagram'?row.comments_count:row.comments?.summary?.total_count);
            const item={id,platform,text:text(platform==='instagram'?row.caption:row.message,5000),url:safeURL(platform==='instagram'?row.permalink:row.permalink_url),published:text(platform==='instagram'?row.timestamp:row.created_time,60),likes,comments,shares:platform==='facebook'?count(row.shares?.count):null,saved:null,views:null,reach:null,engagement:null,metrics_state:'partial',metric_notice:platform==='facebook'?'Facebook reactions include all reaction types. Views, reach and saves are unavailable in this connection.':null};
            if(platform==='instagram')try{
              const insights=requiredRows(await graph(`${id}/insights`,{metric:'views,reach,saved,shares'}));
              for(const key of ['views','reach','saved','shares']){const m=insights.find(x=>x.name===key);item[key]=count(m?.total_value?.value??m?.values?.[0]?.value);}
              if(item.reach>0&&[likes,comments,item.shares,item.saved].every(n=>n!==null))item.engagement=Math.round((likes+comments+item.shares+item.saved)/item.reach*10000)/100;
              if([likes,comments,item.shares,item.saved,item.views,item.reach].every(n=>n!==null))item.metrics_state='available';
              else item.metric_notice='Some metrics were not returned by Meta for this media.';
            }catch(error){item.metric_notice=error.message;}
            return item;
          }));
          result.posts.push(...mapped.filter(Boolean));
          if(mapped.some(p=>p?.metric_notice))result.notices.push(`${platform==='instagram'?'Instagram':'Facebook'}: unavailable metrics are shown as a dash, never zero.`);
        }else if(input.action==='conversations'){
          const response=await graph(`${platform==='instagram'?ids.facebook:accountId}/conversations`,{platform:platform==='instagram'?'instagram':'messenger',fields:'id,updated_time,participants,messages.limit(5){id,message,created_time,from}',limit:'12'});
          for(const row of requiredRows(response).slice(0,12))result.conversations.push({id:text(row.id,100),platform,updated_at:text(row.updated_time,60)||null,participants:rows(row.participants).map(name).filter(Boolean).slice(0,20),messages:rows(row.messages).slice(0,5).map(m=>({id:text(m.id,150),text:text(m.message,5000),created_at:text(m.created_time,60)||null,sender:name(m.from)}))});
        }else{
          // The object must belong to the configured account's bounded recent window.
          const recent=await posts(platform,'50');
          if(!recent.some(row=>row.id===input.post_id))throw new ProviderError('Choose a post from the latest 50 posts on this connected account.');
          const response=await graph(`${input.post_id}/comments`,{fields:platform==='instagram'?'id,text,timestamp,username,like_count':'id,message,created_time,from,like_count',limit:'25'});
          for(const row of requiredRows(response).slice(0,25))result.comments.push({id:text(row.id,100),post_id:input.post_id,platform,text:text(platform==='instagram'?row.text:row.message,5000),author:platform==='instagram'?text(row.username,120)||null:name(row.from),created_at:text(platform==='instagram'?row.timestamp:row.created_time,60)||null,likes:count(row.like_count)});
        }
        result.platforms[platform]={state:'connected',message:input.action==='status'?'Account verified. Each data feature is checked separately when opened.':'Meta returned this data successfully.',...(accountName?{account_name:accountName}:{})};
      }catch(error){result.platforms[platform]={state:'unavailable',message:error instanceof ProviderError?error.message:'Meta data is temporarily unavailable.'};}
    }));
    result.state=overall(result.platforms,selected);
    if(input.action==='posts')result.notices.push('Latest 6 posts per account. Counts are the lifetime values Meta returned; reach is per post and must not be summed as unique people. Engagement is interactions divided by reach when every required metric is available.');
    if(input.action==='conversations')result.notices.push('Latest 12 conversations per account, with up to 5 messages each. This is a limited read-only view, not a complete inbox or unread count.');
    return json(result);
  };
}
