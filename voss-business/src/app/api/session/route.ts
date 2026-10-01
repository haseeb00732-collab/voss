import { database } from '@/lib/server/database';
import { CheckoutError } from '@/lib/server/checkout';
import { checkoutFailure, privateHeaders, requestBody } from '@/lib/server/http';
import { issueSession, ownerConfigured, ownerCookie, requireOwner, validOwnerKey } from '@/lib/server/owner-auth';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  try { requireOwner(request); return Response.json({ authenticated: true }, { headers: privateHeaders }); }
  catch { return Response.json({ authenticated: false, configured: ownerConfigured() }, { headers: privateHeaders }); }
}
export async function POST(request: Request) {
  try {
    const body = await requestBody(request);
    if (body?.action === 'logout') return Response.json({ ok: true }, { headers: { ...privateHeaders, 'Set-Cookie': ownerCookie('', 0) } });
    if (!ownerConfigured()) throw new CheckoutError('Owner access has not been configured.', 503);
    const db = await database();
    // One owner account; a durable throttle works across Vercel instances.
    const allowed = await db.transaction(async client => {
      const { rows } = await client.query<{ attempts: number; recent: boolean }>("SELECT attempts, started_at > now() - interval '15 minutes' AS recent FROM voss_owner_login WHERE id=1 FOR UPDATE");
      if (!rows[0]) throw new Error('Owner schema missing');
      if (rows[0].recent && rows[0].attempts >= 10) return 'locked';
      const valid = validOwnerKey(body?.key);
      if (valid) await client.query('UPDATE voss_owner_login SET attempts=0, started_at=now() WHERE id=1');
      else await client.query('UPDATE voss_owner_login SET attempts=$1, started_at=CASE WHEN $2 THEN started_at ELSE now() END WHERE id=1', [rows[0].recent ? rows[0].attempts + 1 : 1, rows[0].recent]);
      return valid ? 'ok' : 'invalid';
    });
    if (allowed === 'locked') throw new CheckoutError('Too many sign-in attempts. Try again in 15 minutes.', 429);
    if (allowed !== 'ok') throw new CheckoutError('The owner access key is incorrect.', 401);
    return Response.json({ authenticated: true }, { headers: { ...privateHeaders, 'Set-Cookie': ownerCookie(issueSession()) } });
  } catch (error) { return checkoutFailure(error); }
}
