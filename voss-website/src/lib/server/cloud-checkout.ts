import { CheckoutError } from './checkout';

// This is a public Supabase browser key, not a database password or service key.
// The VOSS Edge Function verifies it, while the actual database credentials stay
// inside Supabase and are never sent to a shopper's browser.
const endpoint = 'https://porncyiyigtvejpbsjwl.supabase.co/functions/v1/voss-checkout';
const publicKey = process.env.VOSS_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvcm5jeWl5aWd0dmVqcGJzandsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExMTA4NDMsImV4cCI6MjEwNjY4Njg0M30.gqAz1JMvuUVFWQ_3U3PntK7wawGaZoAqvnfc1g2eLFQ';

export async function cloudCheckout<T>(action: 'config' | 'quote' | 'place-order', payload: Record<string, unknown> = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(16000),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicKey}`, apikey: publicKey },
      body: JSON.stringify({ action, ...payload }),
    });
  } catch {
    throw new CheckoutError('Checkout is temporarily unavailable. Your bag is saved. Please try again or contact VOSS on WhatsApp.', 503);
  }
  const body = await response.json().catch(() => ({})) as { error?: unknown } & T;
  if (!response.ok) throw new CheckoutError(typeof body.error === 'string' ? body.error : 'Checkout is temporarily unavailable. Please try again.', response.status);
  return body;
}
