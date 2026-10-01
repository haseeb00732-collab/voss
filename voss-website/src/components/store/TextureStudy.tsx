'use client';

import { ArrowIcon } from '@/components/ArrowIcon';
import Link from 'next/link';
import { useId, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CATALOGUE, coverImage, coverSrcSet } from '@/lib/catalogue';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const studies = [
  { slug: 'chevron-quilted-satchel', label: 'Quilted', word: 'Rhythm.', line: 'Follow the lines.', copy: 'A repeating chevron. A curved handle. Small metal accents. Move closer and see how the details come together.' },
  { slug: 'floral-embossed-tote', label: 'Embossed', word: 'Depth.', line: 'Look beyond the outline.', copy: 'Floral detail, pressed into the surface. A quieter kind of pattern, revealed as you move closer.' },
  { slug: 'two-tone-bag-set', label: 'Two tone', word: 'Balance.', line: 'Let contrast do the work.', copy: 'Light panels meet darker edges. One colour story connects the shapes, from the tote to the rounded pouch.' },
];

export function TextureStudy() {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLElement>(null);
  const image = useRef<HTMLDivElement>(null);
  const id = useId();
  const study = studies[active];
  const piece = CATALOGUE.find(p => p.slug === study.slug)!;

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.v-study-art', { opacity: 0.5, y: 12, duration: 0.65, ease: 'power2.out', clearProps: 'transform,opacity' });
    });
    return () => media.revert();
  }, { scope: root, dependencies: [active], revertOnUpdate: true });

  return <section className="v-texture-study" ref={root} aria-labelledby={`${id}-heading`}>
    <div className="v-study-heading"><span className="v-kicker">The detail edit</span><h2 id={`${id}-heading`}>A closer kind of look.</h2><p>Quilting. Texture. Contrast.</p></div>
    <div className="v-study-composition">
      <div className="v-study-stage" id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${active}`}>
        <div className="v-study-art" key={active} ref={image}>
          <img src={coverImage(piece)} srcSet={coverSrcSet(piece)} sizes="(max-width:760px) 100vw, 55vw" width="1122" height="1402" alt={`${piece.name}, ${study.label.toLowerCase()} detail study`} loading="lazy" />
        </div>
        <span className="v-study-corner v-study-corner-a" aria-hidden="true" /><span className="v-study-corner v-study-corner-b" aria-hidden="true" />
        <span className="v-study-caption">{piece.label} <span>{study.label} / In focus</span></span>
        <div className="v-study-zoom"><label htmlFor={`${id}-zoom`}>Move closer <span>＋</span></label>
          <input key={active} id={`${id}-zoom`} type="range" min="1" max="2.3" step="0.05" defaultValue="1" aria-label="Zoom product photograph"
            onInput={event => image.current?.style.setProperty('--study-zoom', event.currentTarget.value)} />
          <div aria-hidden="true"><span>The form</span><span>The detail</span></div>
        </div>
      </div>
      <div className="v-study-editorial">
        <div className="v-study-tabs" role="tablist" aria-label="Texture studies">{studies.map((item, i) =>
          <button key={item.slug} role="tab" id={`${id}-tab-${i}`} aria-selected={active === i} aria-controls={`${id}-panel`} tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)} onKeyDown={event => {
              const next = event.key === 'ArrowRight' ? (i + 1) % studies.length : event.key === 'ArrowLeft' ? (i + studies.length - 1) % studies.length : event.key === 'Home' ? 0 : event.key === 'End' ? studies.length - 1 : null;
              if (next !== null) { event.preventDefault(); setActive(next); document.getElementById(`${id}-tab-${next}`)?.focus(); }
            }}>{item.label}</button>)}</div>
        <div className="v-study-text" key={study.slug}><span className="v-study-number">0{active + 1} / 0{studies.length}</span><div className="v-study-macro" aria-hidden="true"><img src={coverImage(piece)} alt="" width="1122" height="1402" loading="lazy"/></div><h3>{study.word}</h3><h4>{study.line}</h4><p>{study.copy}</p><Link className="v-text-link" href={`/collection/${piece.slug}`}>Explore {piece.name} <ArrowIcon direction="up-right" /></Link></div>
        <p className="v-study-footnote">The same photograph. A different perspective.</p>
      </div>
    </div>
  </section>;
}
