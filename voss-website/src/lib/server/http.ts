import { CheckoutError } from './checkout';
export const privateHeaders = { 'Cache-Control': 'no-store, private', 'X-Content-Type-Options': 'nosniff' };
export async function requestBody(request: Request) {
  const origin = request.headers.get('origin');
  const expected = new URL(request.url);
  // Next's development server may internally rewrite 127.0.0.1 to localhost.
  // The HTTP Host remains the actual origin the browser is visiting.
  const host = request.headers.get('host');
  if (host) expected.host = host;
  const allowed = new Set([expected.origin]);
  if (process.env.NEXT_PUBLIC_SITE_URL) allowed.add(new URL(process.env.NEXT_PUBLIC_SITE_URL).origin);
  if (!origin || !allowed.has(origin)) throw new CheckoutError('Please submit your order from the VOSS website.', 403);
  if (!request.headers.get('content-type')?.includes('application/json')) throw new CheckoutError('Invalid request format.', 415);
  if (Number(request.headers.get('content-length')) > 24000) throw new CheckoutError('This request is too large.', 413);
  const reader = request.body?.getReader();
  if (!reader) throw new CheckoutError('The request was empty.');
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const { value, done } = await reader.read(); if (done) break;
    size += value.byteLength;
    if (size > 24000) { await reader.cancel(); throw new CheckoutError('This request is too large.', 413); }
    chunks.push(value);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new CheckoutError('Please refresh checkout and try again.'); }
}
export function checkoutFailure(error: unknown) {
  if (error instanceof CheckoutError) return Response.json({ error: error.message }, { status: error.status, headers: privateHeaders });
  // Do not log addresses, phone numbers, connection strings or raw database errors.
  console.error('VOSS checkout service unavailable');
  return Response.json({ error: 'Checkout is temporarily unavailable. Your bag is saved. Please try again or contact VOSS on Instagram.' }, { status: 503, headers: privateHeaders });
}
