import Link from 'next/link';
import type { ReactNode } from 'react';
import { whatsappLink } from '@/lib/whatsapp';

export function PolicyPage({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return <main id="main" className="v-section v-policy-page">
    <div className="v-page-heading"><span className="v-kicker">VOSS / Client care</span><h1>{title}</h1><p>{intro}</p></div>
    <div className="v-policy-layout">
      <nav aria-label="Store policies"><Link href="/terms">Terms & conditions</Link><Link href="/privacy">Privacy</Link><Link href="/shipping">Delivery & payment</Link><Link href="/returns">Returns & exchanges</Link><Link href="/contact">Contact VOSS</Link></nav>
      <div className="v-policy-copy">{children}<section><h2>Speak to VOSS</h2><p>We are an online-only store. For help with an order, send your order reference and a short explanation on <a href={whatsappLink()} target="_blank" rel="noreferrer">WhatsApp: 0310 7417990</a> or <a href="https://www.instagram.com/voss.pk/" target="_blank" rel="noreferrer">Instagram @voss.pk</a>.</p></section></div>
    </div>
  </main>;
}
