'use client';

import { useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function FloatingHeader({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useGSAP(() => {
    const update = (trigger: ScrollTrigger) => root.current?.classList.toggle('is-scrolled', trigger.scroll() > 24);
    const trigger = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: update, onRefresh: update });
    update(trigger);
  }, { scope: root, dependencies: [pathname], revertOnUpdate: true });

  return <div className="v-header-space"><header ref={root} className="v-header">
    {children}
  </header></div>;
}
