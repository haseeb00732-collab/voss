import { CheckoutError } from '@/lib/server/checkout';
import { isReceipt } from '@/lib/receipt';
import { cloudCheckout } from '@/lib/server/cloud-checkout';
import { checkoutFailure, privateHeaders, requestBody } from '@/lib/server/http';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  try {
    const body = await requestBody(request);
    if (!body || typeof body !== 'object' || body.payment !== 'cod' || body.consent !== true) throw new CheckoutError('Review your payment method and confirm your delivery details.');
    const receipt = await cloudCheckout('place-order', {
      items: body.items, customer: body.customer, expectedTotal: body.expectedTotal,
      payment: 'cod', consent: true, idempotencyKey: body.idempotencyKey,
    });
    if (!isReceipt(receipt)) throw new CheckoutError('We could not confirm the response. Retry the same order safely.', 502);
    return Response.json(receipt, { status: 201, headers: privateHeaders });
  } catch (error) { return checkoutFailure(error); }
}
