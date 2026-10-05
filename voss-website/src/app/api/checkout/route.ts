import { cartInput, PROVINCES } from '@/lib/server/checkout';
import { cloudCheckout } from '@/lib/server/cloud-checkout';
import { checkoutFailure, privateHeaders, requestBody } from '@/lib/server/http';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const config = await cloudCheckout<{ enabled: boolean; payment: 'cod'; provinces: string[]; remaining: number }>('config');
    return Response.json({ ...config, provinces: PROVINCES }, { headers: privateHeaders });
  } catch (error) { return checkoutFailure(error); }
}
export async function POST(request: Request) {
  try {
    const body = await requestBody(request);
    return Response.json(await cloudCheckout('quote', { items: cartInput(body?.items) }), { headers: privateHeaders });
  } catch (error) { return checkoutFailure(error); }
}
