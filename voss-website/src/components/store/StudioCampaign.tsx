'use client';

import { ArrowIcon } from '@/components/ArrowIcon';
import Link from 'next/link';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CATALOGUE, coverImage, coverSrcSet } from '@/lib/catalogue';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function StudioCampaign() {
  const root = useRef<HTMLElement>(null);
  const first = CATALOGUE.find(p => p.slug === 'square-quilted-tote')!;
  const second = CATALOGUE.find(p => p.slug === 'textured-dome-satchel')!;
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('.v-campaign-object:first-child', { y: 35 }, { y: -25, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
      gsap.fromTo('.v-campaign-object:last-child', { y: -20 }, { y: 30, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
    });
    return () => media.revert();
  }, { scope: root });

  return <section className="v-studio-campaign" ref={root}>
    <div className="v-campaign-copy"><span className="v-kicker">The everyday, composed</span><h2>Quiet colour.<br /><em>Strong form.</em></h2><p>Warm camel. Deep black.<br />Two ways to make an entrance.</p><Link className="v-text-link" href="/collection">Find your everyday <ArrowIcon direction="up-right" /></Link></div>
    <div className="v-campaign-objects">{[first, second].map((piece, i) => <Link key={piece.slug} href={`/collection/${piece.slug}`} className="v-campaign-object">
      <img src={coverImage(piece)} srcSet={coverSrcSet(piece)} sizes="(max-width:760px) 55vw, 32vw" width="1122" height="1402" loading="lazy" alt={piece.name} />
      <span><b>0{i + 1}</b>{piece.name}<i aria-hidden="true"><ArrowIcon direction="up-right" /></i></span>
    </Link>)}</div>
    <span className="v-campaign-rule" aria-hidden="true" />
  </section>;
}
