import { cloud } from './business';
export type SocialPlatform='facebook'|'instagram';
export type SocialState='connected'|'disconnected'|'partial'|'unavailable';
export type SocialPost={id:string;platform:SocialPlatform;text:string;url:string;published:string;likes:number|null;comments:number|null;shares:number|null;saved:number|null;views:number|null;reach:number|null;engagement:number|null;metrics_state:'available'|'partial'|'unavailable';metric_notice:string|null};
export type SocialConversation={id:string;platform:SocialPlatform;updated_at:string|null;participants:string[];messages:{id:string;text:string;created_at:string|null;sender:string|null}[]};
export type SocialComment={id:string;post_id:string;platform:SocialPlatform;text:string;author:string|null;created_at:string|null;likes:number|null};
export type SocialResponse={state:SocialState;checked_at:string;platforms:Record<SocialPlatform,{state:SocialState;message:string;account_name?:string}>;posts:SocialPost[];conversations:SocialConversation[];comments:SocialComment[];notices:string[]};
export async function readSocial(action:'status'|'posts'|'conversations'|'comments'='status',platform:SocialPlatform|'all'='all',postId?:string){
  const {data,error}=await cloud.functions.invoke('voss-social',{body:{action,platform,...(postId?{post_id:postId}:{})}});
  if(error){
    let message='Social accounts are temporarily unavailable. Try again.';
    if(error.context instanceof Response){try{const body=await error.context.json();if(typeof body.error==='string')message=body.error;}catch{/* Keep the safe fallback for non-JSON gateway errors. */}}
    throw new Error(message);
  }
  return data as SocialResponse;
}
