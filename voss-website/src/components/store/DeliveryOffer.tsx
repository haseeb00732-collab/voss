'use client';
import { useEffect, useState } from 'react';
export function DeliveryOffer() {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/checkout', { signal: controller.signal, cache: 'no-store' }).then(r => r.json()).then(data => {
      if (data.enabled && typeof data.remaining === 'number') setRemaining(data.remaining);
    }).catch(() => {});
    return () => controller.abort();
  }, []);
  if (!remaining) return null;
  return <div className="v-delivery-offer"><span>Our first thirty, delivered free.</span><span>Free delivery on the first 30 website orders. Applied at checkout.</span></div>;
}
