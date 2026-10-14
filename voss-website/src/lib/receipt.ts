import type { Receipt } from './server/checkout';

export function isReceipt(value: unknown): value is Receipt {
  if (!value || typeof value !== 'object') return false;
  const r = value as Receipt;
  return typeof r.reference === 'string' && /^VOSS-[A-F0-9]{12}$/.test(r.reference)
    && [r.subtotal,r.delivery,r.total].every(Number.isSafeInteger)
    && r.subtotal > 0 && r.delivery >= 0 && r.total === r.subtotal + r.delivery
    && typeof r.freeDelivery === 'boolean' && (!r.freeDelivery || r.delivery === 0);
}
