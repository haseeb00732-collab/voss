'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { saleActive } from '@/lib/sale';

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

  return <aside className="v-promotion-strip" aria-label="Current offers">{saleActive() && <Link href="/collection"><strong>10% OFF 5 SELECTED BAGS</strong><span>Sale prices shown · Ends 16 November</span></Link>}<div><strong>{remaining === null ? 'FREE DELIVERY ON THE FIRST 30 QUALIFYING ORDERS' : remaining > 0 ? 'FREE LAHORE DELIVERY' : 'LAHORE DELIVERY · RS 150'}</strong><span>{remaining !== null && remaining > 0 ? `${remaining} qualifying deliveries remaining · ` : ''}{DELIVERY_ESTIMATE} · Cash on delivery</span></div></aside>;

}

