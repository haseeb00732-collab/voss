import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { CheckoutError } from './checkout';

export const OWNER_COOKIE = 'voss_business_owner';
export const SESSION_SECONDS = 8 * 60 * 60;
export function ownerConfigured() {
  return /^[a-f0-9]{64}$/.test(process.env.VOSS_OWNER_KEY_HASH || '') && (process.env.VOSS_OWNER_SESSION_SECRET?.length ?? 0) >= 64;
}
function equal(a: string, b: string) { const x = Buffer.from(a); const y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); }
export function validOwnerKey(value: unknown) {
  return ownerConfigured() && typeof value === 'string' && value.length <= 256 && equal(createHash('sha256').update(value).digest('hex'), process.env.VOSS_OWNER_KEY_HASH!);
}
function signature(payload: string) { return createHmac('sha256', process.env.VOSS_OWNER_SESSION_SECRET!).update(payload).digest('base64url'); }
export function issueSession(now = Date.now()) {
  if (!ownerConfigured()) throw new CheckoutError('Owner access has not been configured.', 503);
  const payload = Buffer.from(JSON.stringify({ expires: now + SESSION_SECONDS * 1000, nonce: randomBytes(16).toString('hex') })).toString('base64url');
  return `${payload}.${signature(payload)}`;
}
export function validSession(token: string, now = Date.now()) {
  if (!ownerConfigured() || token.length > 512) return false;
  const [payload, mac, extra] = token.split('.');
  if (!payload || !mac || extra || !equal(mac, signature(payload))) return false;
  try { const data = JSON.parse(Buffer.from(payload, 'base64url').toString()); return typeof data.expires === 'number' && data.expires > now && data.expires <= now + SESSION_SECONDS * 1000; } catch { return false; }
}
export function requireOwner(request: Request) {
  const token = (request.headers.get('cookie') || '').split(';').map(c => c.trim()).find(c => c.startsWith(`${OWNER_COOKIE}=`))?.slice(OWNER_COOKIE.length + 1) || '';
  if (!validSession(token)) throw new CheckoutError('Please sign in to the VOSS owner dashboard.', 401);
}
export function ownerCookie(token: string, maxAge = SESSION_SECONDS) {
  return `${OWNER_COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}
