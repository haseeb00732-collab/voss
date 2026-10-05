import { CheckoutError } from '@/lib/server/checkout';
import { cloudCheckout } from '@/lib/server/cloud-checkout';
import { checkoutFailure, privateHeaders, requestBody } from '@/lib/server/http';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  try {
    const body = await requestBody(request);
    if (!body || typeof body !== 'object' || body.payment !== 'cod' || body.consent !== true) throw new CheckoutError('Review your payment method and confirm your delivery details.');
    return Response.json(await cloudCheckout('place-order', body as Record<string, unknown>), { status: 201, headers: privateHeaders });
  } catch (error) { return checkoutFailure(error); }
}
