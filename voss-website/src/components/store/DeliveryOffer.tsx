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
  if (remaining === 0) return <div className="v-delivery-offer"><span>Made for your every day.</span><span>Lahore delivery · 3–8 days · Cash on delivery</span></div>;
  return <div className="v-delivery-offer"><span>Our first thirty, delivered free.</span><span>Free delivery on the first 30 website orders · Lahore only</span></div>;
}
