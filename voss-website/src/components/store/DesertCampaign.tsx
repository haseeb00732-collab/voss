import Link from 'next/link';
import { ArrowIcon } from '@/components/ArrowIcon';

export function DesertCampaign() {
  return <section className="v-desert-campaign" aria-labelledby="desert-campaign-title">
    <img src="/campaign/tassel-desert-1776.webp"
      srcSet="/campaign/tassel-desert-640.webp 640w, /campaign/tassel-desert-1024.webp 1024w, /campaign/tassel-desert-1776.webp 1776w"
      sizes="100vw" width="1776" height="888" loading="lazy" decoding="async"
      alt="The Cognac Tassel Tote on sunlit sandstone in a desert-inspired VOSS campaign." />
    <div className="v-desert-copy"><span className="v-kicker">VOSS / In a different light</span>
      <h2>Carry your<br />own style.</h2>
      <p>The Tassel Tote. A warm cognac, a familiar shape.</p>
      <Link className="v-text-link" href="/collection/tassel-tote">Explore the Tassel Tote <ArrowIcon direction="up-right" /></Link>
    </div>
  </section>;
}
