"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useDiagonalWipe } from "@/lib/useDiagonalWipe";
import { scrollVelocity } from "./SmoothScroll";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const WORDS = [
  "Full-grain vachetta",
  "Solid brass",
  "Hand-burnished edges",
  "Vegetable-tanned",
  "Lifetime repair",
];

/**
 * The seam between the vitrine and the paper, with the house's materials
 * running across it. The vitrine retreats along the 31° edge as you scroll —
 * see `useDiagonalWipe` for why this wipes rather than dissolves.
 */
export function Marquee() {
  const root = useRef<HTMLDivElement>(null);
  const dark = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useDiagonalWipe(root, dark, "retreat", !reduced);

  useGSAP(
    () => {
      if (reduced) return;

      // Both tracks are driven by one tween so the two substrates can never
      // drift a pixel apart across the wipe edge.
      const loop = gsap.to("[data-marquee-track]", {
        xPercent: -50,
        duration: 34,
        ease: "none",
        repeat: -1,
      });

      /**
       * Speed is a function of how hard the reader is scrolling, which is what
       * makes the band feel attached to the page rather than played at it.
       * Clamped at 2.4× — past that the words stop being readable and the
       * whole thing turns into a screensaver.
       */
      const drive = () => {
        const v = Math.abs(scrollVelocity());
        const boost = gsap.utils.clamp(1, 2.4, 1 + v / 18);
        const dir = ScrollTrigger.isScrolling() ? (scrollVelocity() < 0 ? -1 : 1) : 1;
        loop.timeScale(gsap.utils.interpolate(loop.timeScale(), boost * dir, 0.08));
      };
      gsap.ticker.add(drive);

      return () => {
        gsap.ticker.remove(drive);
        loop.kill();
      };
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true }
  );

  return (
    <div ref={root} className="relative isolate overflow-hidden">
      {/* Paper, underneath. */}
      <div data-surface="light" className="substrate grain">
        <Band tone="light" />
      </div>

      {/* Vitrine, on top, retreating along the diagonal. Under reduced motion
          no clip is ever written, so the band simply stays dark. */}
      <div
        ref={dark}
        data-surface="dark"
        className="substrate vignette absolute inset-0"
        aria-hidden="true"
      >
        <Band tone="dark" />
      </div>
    </div>
  );
}

function Band({ tone }: { tone: "light" | "dark" }) {
  const text = tone === "dark" ? "text-gold-500" : "text-gold-900";
  const rule = tone === "dark" ? "bg-gold-700/40" : "bg-gold-900/30";
  const dot = tone === "dark" ? "bg-gold-500/70" : "bg-gold-900/60";

  return (
    <div className="above-material relative py-block">
      <div className={`h-px w-full ${rule}`} />
      <div className="overflow-hidden py-7">
        <div data-marquee-track className="flex w-max items-center">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center" aria-hidden={copy === 1 || tone === "light"}>
              {WORDS.map((w) => (
                <span key={w} className="flex items-center">
                  <span className={`eyebrow whitespace-nowrap ${text}`}>{w}</span>
                  <span className={`mx-10 size-1 rotate-45 ${dot}`} />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className={`h-px w-full ${rule}`} />
    </div>
  );
}
