'use client';

import Link from 'next/link';
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

  return <aside className="v-delivery-announcement" aria-label="Lahore delivery"><span>{remaining === null ? 'Free Lahore delivery on the first 30 qualifying orders.' : remaining > 0 ? 'Free Lahore delivery · First 30 qualifying orders.' : 'Lahore delivery · Rs 150.'}</span><Link href="/shipping">Delivery details ↗</Link></aside>;
}
