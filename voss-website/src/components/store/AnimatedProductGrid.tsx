'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Piece } from '@/lib/catalogue';
import { scheduleScrollRefresh } from '@/lib/scrollRefresh';
import { ProductCard } from './ProductCard';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function AnimatedProductGrid({ pieces, priority = false }: { pieces: Piece[]; priority?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const signature = pieces.map(p => p.slug).join('|');

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const cards = gsap.utils.toArray<HTMLElement>('.v-product-card', root.current);
      cards.forEach((card, index) => {
        // Transform only: catalogue content remains visible if a trigger is missed.
        gsap.from(card.querySelector('.v-product-float'), {
          y: 38, scale: 0.96, duration: 1.15, delay: (index % 2) * 0.09,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 94%', once: true },
          clearProps: 'transform',
        });
      });
    });
    media.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const cleanups: (() => void)[] = [];
      root.current?.querySelectorAll<HTMLElement>('.v-product-photo').forEach(photo => {
        const object = photo.querySelector<HTMLElement>('.v-product-parallax');
        if (!object) return;
        const xTo = gsap.quickTo(object, 'x', { duration: 0.65, ease: 'power3.out' });
        const yTo = gsap.quickTo(object, 'y', { duration: 0.65, ease: 'power3.out' });
        const rotateTo = gsap.quickTo(object, 'rotation', { duration: 0.8, ease: 'power3.out' });
        let bounds: DOMRect;
        const enter = () => { bounds = photo.getBoundingClientRect(); };
        const move = (event: PointerEvent) => {
          if (!bounds) return;
          const x = (event.clientX - bounds.left) / bounds.width - 0.5;
          const y = (event.clientY - bounds.top) / bounds.height - 0.5;
          xTo(x * 14); yTo(y * 10); rotateTo(x * 2);
        };
        const leave = () => { xTo(0); yTo(0); rotateTo(0); };
        photo.addEventListener('pointerenter', enter);
        photo.addEventListener('pointermove', move);
        photo.addEventListener('pointerleave', leave);
        cleanups.push(() => { photo.removeEventListener('pointerenter', enter); photo.removeEventListener('pointermove', move); photo.removeEventListener('pointerleave', leave); });
      });
      return () => cleanups.forEach(cleanup => cleanup());
    });
    const cancelRefresh = scheduleScrollRefresh();
    return () => { cancelRefresh(); media.revert(); };
  }, { scope: root, dependencies: [signature], revertOnUpdate: true });

  return <div className="v-product-grid v-animated-grid" ref={root}>
    {pieces.map((piece, i) => <ProductCard key={piece.slug} piece={piece} priority={priority && i < 2} />)}
  </div>;
}
