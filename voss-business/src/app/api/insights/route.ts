import { requireOwner } from '@/lib/server/owner-auth';
import { checkoutFailure,privateHeaders } from '@/lib/server/http';
import { socialInsights } from '@/lib/server/social';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{requireOwner(request);return Response.json(await socialInsights(),{headers:privateHeaders});}catch(e){return checkoutFailure(e);}}
