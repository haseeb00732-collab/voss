'use client';

import { ArrowIcon } from '@/components/ArrowIcon';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CATALOGUE, colourwayImage, colourwaySrcSet, priceLabel } from '@/lib/catalogue';
import './ColourCampaign.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);
const piece = CATALOGUE[8];
const colours = ['cognac', 'burgundy', 'black'].map(key => piece.colourways.find(c => c.key === key)!);

export function ColourCampaign() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(colours.findIndex(c => c.key === piece.coverColour));
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.v-colour-campaign-copy > *', { y: 24, opacity: 0, stagger: .08, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: root.current, start: 'top 80%', once: true }, clearProps: 'transform,opacity' });
      gsap.fromTo('.v-colour-campaign-art', { y: 28, rotation: -3 }, { y: -20, rotation: 2, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: .7 } });
    });
    media.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const stage = root.current!.querySelector<HTMLElement>('.v-colour-campaign-stage')!;
      const x = gsap.quickTo('.v-colour-campaign-follow', 'x', { duration: .7, ease: 'power3.out' });
      const y = gsap.quickTo('.v-colour-campaign-follow', 'y', { duration: .7, ease: 'power3.out' });
      let bounds: DOMRect;
      const enter = () => { bounds = stage.getBoundingClientRect(); };
      const move = (e: PointerEvent) => { if (bounds) { x(((e.clientX - bounds.left) / bounds.width - .5) * 28); y(((e.clientY - bounds.top) / bounds.height - .5) * 20); } };
      const leave = () => { x(0); y(0); };
      stage.addEventListener('pointerenter', enter); stage.addEventListener('pointermove', move); stage.addEventListener('pointerleave', leave);
      return () => { stage.removeEventListener('pointerenter', enter); stage.removeEventListener('pointermove', move); stage.removeEventListener('pointerleave', leave); };
    });
    return () => media.revert();
  }, { scope: root });
  return <section className="v-colour-campaign" ref={root} aria-labelledby="colour-campaign-title">
    <div className="v-colour-campaign-copy"><span className="v-kicker">The colour story / VOSS</span><h2 id="colour-campaign-title">Same bag.<br /><em>Different mood.</em></h2><p>A warm cognac. A deep burgundy. An always-right black.<br />Make the everyday your own.</p>
      <div className="v-campaign-swatches" aria-label="Explore the Tassel Tote colours">{colours.map((c, i) => <button key={c.key} aria-label={`Show ${c.name} Tassel Tote`} aria-pressed={active === i} onClick={() => setActive(i)}><i style={{ background: c.hex }} /><span>{c.name}</span></button>)}</div>
      <Link className="v-text-link" href={`/collection/${piece.slug}`}>Discover the Tassel Tote <span><ArrowIcon direction="up-right" /></span></Link>
    </div>
    <div className="v-colour-campaign-stage"><span className="v-campaign-outline" aria-hidden="true">V</span><div className="v-colour-campaign-art"><div className="v-colour-campaign-follow">{colours.map((c, i) => <img key={c.key} className={active === i ? 'is-active' : ''} src={colourwayImage(piece, c)} srcSet={colourwaySrcSet(piece, c)} sizes="(max-width:760px) 90vw, 44vw" width="1122" height="1402" alt={active === i ? `${piece.name} in ${c.name}` : ''} aria-hidden={active !== i} loading="lazy" />)}</div></div><div className="v-campaign-caption" aria-live="polite"><span>{colours[active].name} / Article 09</span><span>{priceLabel(piece.price)}</span></div></div>
  </section>;
}
