"use client";

import {
  useRef,
  type ComponentType,
  type ElementType,
  type ReactNode,
  type Ref,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

/**
 * The three entrance moves on this site, and there are only three.
 *
 * All of them render their FINAL state on the server. GSAP sets the start
 * state on mount and animates forward, so no-JS readers and crawlers get a
 * complete page and nothing can be left permanently invisible by a trigger
 * that failed to fire — the failure mode of the opposite arrangement.
 */

const START = "top 82%";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Seconds after the trigger fires. Body copy trails its heading by 0.2. */
  delay?: number;
};

/**
 * `ElementType` on its own resolves against the whole JSX namespace, and
 * @react-three/fiber augments that namespace with every three.js object. The
 * union of "an h2" and "a <pointLight>" has no common props, so `ref` and
 * `className` collapse to `never` and every call site fails to typecheck.
 *
 * Narrowing to the props these components actually pass fixes it without
 * giving up the polymorphism.
 */
type DomTag = ComponentType<{
  ref?: Ref<HTMLElement>;
  className?: string;
  children?: ReactNode;
}>;

/**
 * Headlines. A mask, never a fade: each line slides up from behind its own
 * clipped box. `autoSplit` re-splits when the display face swaps in or the
 * viewport resizes, which matters because every display size here is fluid.
 */
export function RevealLines({ children, as = "h2", className, delay = 0 }: RevealProps) {
  const Tag = as as unknown as DomTag;
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !ref.current) return;

      const split = SplitText.create(ref.current, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        linesClass: "will-reveal",
        onSplit(self) {
          return gsap.from(self.lines, {
            yPercent: 110,
            duration: 0.9,
            delay,
            ease: "power4.out",
            stagger: 0.07,
            scrollTrigger: { trigger: ref.current, start: START, once: true },
          });
        },
      });

      return () => split.revert();
    },
    { scope: ref, dependencies: [reduced], revertOnUpdate: true }
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

/**
 * Body copy, captions, anything that is not a headline. 12px is deliberately
 * small — a large travel distance on running text reads as a slide deck.
 */
export function RevealCopy({ children, as = "div", className, delay = 0.2 }: RevealProps) {
  const Tag = as as unknown as DomTag;
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !ref.current) return;
      gsap.from(ref.current, {
        opacity: 0,
        y: 12,
        duration: 0.6,
        delay,
        ease: "power4.out",
        scrollTrigger: { trigger: ref.current, start: START, once: true },
      });
    },
    { scope: ref, dependencies: [reduced], revertOnUpdate: true }
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

/**
 * A hairline that measures itself out from the left.
 *
 * This is the site's quietest recurring gesture: it costs one transform, it
 * happens under every eyebrow, and it is the reason the page feels drawn
 * rather than laid out. `scaleX` only — animating `width` would relayout.
 */
export function Hairline({
  className = "",
  delay = 0,
  origin = "left",
}: {
  className?: string;
  delay?: number;
  origin?: "left" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !ref.current) return;
      gsap.from(ref.current, {
        scaleX: 0,
        duration: 0.9,
        delay,
        ease: "power4.out",
        scrollTrigger: { trigger: ref.current, start: "top 92%", once: true },
      });
    },
    { scope: ref, dependencies: [reduced], revertOnUpdate: true }
  );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`rule-h w-full ${className}`}
      style={{ transformOrigin: origin, willChange: "transform" }}
    />
  );
}
