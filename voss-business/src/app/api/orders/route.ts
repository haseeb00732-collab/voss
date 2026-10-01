import { requireOwner } from '@/lib/server/owner-auth';
import { readOrders } from '@/lib/server/owner-orders';
import { checkoutFailure, privateHeaders } from '@/lib/server/http';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{requireOwner(request);const url=new URL(request.url);return Response.json(await readOrders(Number(url.searchParams.get('page')||0),url.searchParams.get('status')||'all'),{headers:privateHeaders});}catch(e){return checkoutFailure(e);}}
