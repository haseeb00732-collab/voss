import { CheckoutError, placeOrder, settings } from '@/lib/server/checkout';
import { checkoutFailure, privateHeaders, requestBody } from '@/lib/server/http';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  try {
    if (!settings().enabled) throw new CheckoutError('Website checkout is being prepared. You can still order with VOSS on Instagram.', 503);
    const body = await requestBody(request);
    if (!body || typeof body !== 'object' || body.payment !== 'cod' || body.consent !== true) throw new CheckoutError('Review your payment method and confirm your delivery details.');
    return Response.json(await placeOrder(body), { status: 201, headers: privateHeaders });
  } catch (error) { return checkoutFailure(error); }
}
