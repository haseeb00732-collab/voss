'use client';
import { useEffect, useState } from 'react';
import {DELIVERY_ESTIMATE} from '@/lib/website-copy';
export function DeliveryOffer() {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/checkout', { signal: controller.signal, cache: 'no-store' }).then(r => r.json()).then(data => {
      if (data.enabled && typeof data.remaining === 'number') setRemaining(data.remaining);
    }).catch(() => {});
    return () => controller.abort();
  }, []);
  if (remaining === null || remaining === 0) return <div className="v-delivery-offer"><span>Made for your every day.</span><span>Lahore delivery · {DELIVERY_ESTIMATE} · Cash on delivery</span></div>;
  return <div className="v-delivery-offer"><span>Our first thirty, delivered free.</span><span>Complimentary Lahore delivery on the first 30 eligible website orders.</span></div>;
}
