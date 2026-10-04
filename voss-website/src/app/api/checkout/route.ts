import { cartInput, CheckoutError, PROVINCES, quote, settings } from '@/lib/server/checkout';
import { database } from '@/lib/server/database';
import { checkoutFailure, privateHeaders, requestBody } from '@/lib/server/http';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  const config = settings();
  const preview = process.env.NODE_ENV !== 'production' && process.env.VOSS_LOCAL_DATABASE === '1';
  if (!config.enabled) return Response.json({ enabled: false, preview, provinces: PROVINCES }, { headers: privateHeaders });
  try {
    const db = await database();
    const { rows } = await db.query<{ used: number; maximum: number }>("SELECT used, maximum FROM voss_promotions WHERE code='FIRST30'");
    if (!rows[0]) throw new Error('Missing promotion');
    return Response.json({ enabled: true, payment: config.payment, deliveryFee: config.deliveryFee, provinces: PROVINCES, remaining: Math.max(0, rows[0].maximum - rows[0].used) }, { headers: privateHeaders });
  } catch (error) { return checkoutFailure(error); }
}
export async function POST(request: Request) {
  try {
    const config = settings();
    const preview = !config.enabled && process.env.NODE_ENV !== 'production' && process.env.VOSS_LOCAL_DATABASE === '1';
    if (!config.enabled && !preview) throw new CheckoutError('Website checkout is being prepared. You can still order with VOSS on WhatsApp.', 503);
    const body = await requestBody(request);
    return Response.json(await quote(cartInput(body?.items), undefined, preview ? (config.deliveryFee ?? 0) : undefined), { headers: privateHeaders });
  } catch (error) { return checkoutFailure(error); }
}
