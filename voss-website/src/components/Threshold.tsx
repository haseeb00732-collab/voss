"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { READY_EVENT } from "@/lib/scrollRefresh";
import { VMark } from "./VMark";
import { MARK_REST, markRestStyle } from "@/lib/heroFrame";

gsap.registerPlugin(useGSAP);

const SEEN_KEY = "voss:threshold";

/**
 * The threshold — the first ten seconds of the site, and the only part of it
 * that the reader does not drive.
 *
 * The mark draws itself, VOSS resolves beneath it, and then **nothing happens
 * for 0.6 seconds.** That hold is the point. Every generated hero animates
 * continuously because continuous motion is what a template can do; stillness
 * costs nothing, cannot be faked, and is the clearest signal of confidence on
 * the page. Do not fill it.
 *
 * The reveal is a pair of doors parting from the centre line the mark stands
 * on, rather than a curtain wiping off in one direction — it reads as the
 * boutique opening around the mark instead of a screen being wiped clean, and
 * it is a deliberately different gesture from the diagonal wipes used
 * everywhere else on the page, reserved for this one moment. The mark itself
 * does not move: the hero underneath is already holding an identical mark at
 * identical coordinates (both read `markRestStyle`), so nothing appears to
 * move when the doors clear it.
 */
export function Threshold() {
  const reduced = useReducedMotion();

  // Once per session. A curtain you have to sit through twice is a toll.
  //
  // Desktop only. The visitor arrives from Instagram on a phone, on mobile
  // data, already knowing what the bag looks like — a branded curtain between
  // that tap and the product is a wall, not a welcome. Coarse pointer or a
  // narrow viewport means we skip it entirely and the hero is the first thing.
  const [armed] = useState(() => {
    if (typeof window === "undefined") return true;
    const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
    if (coarse || window.innerWidth < 768) return false;
    try {
      return sessionStorage.getItem(SEEN_KEY) !== "1";
    } catch {
      return true;
    }
  });

  const root = useRef<HTMLDivElement>(null);
  const doorL = useRef<HTMLDivElement>(null);
  const doorR = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const finish = () => {
        try {
          sessionStorage.setItem(SEEN_KEY, "1");
        } catch {
          /* private mode — the curtain simply plays again */
        }
        document.body.style.overflow = "";
        window.dispatchEvent(new Event(READY_EVENT));
        setGone(true);
      };

      // Skipped entirely under reduced motion (§4.5), and after the first view.
      if (reduced || !armed) {
        finish();
        return;
      }

      document.body.style.overflow = "hidden";
      window.scrollTo(0, 0);

      const strokes = el.querySelectorAll<SVGPathElement>("[data-vee]");
      const letters = el.querySelectorAll<HTMLElement>("[data-letter]");

      strokes.forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });

      const tl = gsap.timeline({ onComplete: finish });

      // 0.2s — the outer arm begins, left leading the right by one beat.
      tl.to(strokes, {
        strokeDashoffset: 0,
        duration: 0.8,
        ease: "expo.out",
        stagger: 0.08,
        delay: 0.1,
      });

      // Starts at 60% of the draw-on, so the word arrives while the mark is
      // still resolving rather than queuing politely behind it.
      tl.from(
        letters,
        {
          opacity: 0,
          letterSpacing: "0.5em",
          duration: 0.6,
          ease: "power4.out",
          stagger: 0.02,
        },
        "<0.5"
      );

      // The hold. Long enough to register, short enough not to be a toll.
      tl.to({}, { duration: 0.15 });

      // The doors part from the mark's own centre line, each carrying its
      // half of the seam hairline with it — the line doesn't fade, it splits.
      tl.to(
        [doorL.current, doorR.current],
        {
          xPercent: (i) => (i === 0 ? -100 : 100),
          duration: 0.7,
          ease: "expo.out",
        },
        ">"
      );

      return () => {
        tl.kill();
        document.body.style.overflow = "";
      };
    },
    { dependencies: [reduced, armed] }
  );

  if (gone) return null;

  return (
    <div ref={root} aria-hidden="true" className="fixed inset-0 z-90 overflow-hidden">
      <div
        ref={doorL}
        className="substrate hide absolute inset-y-0 left-0 w-1/2"
        style={{ "--surface": "var(--color-hide)" } as React.CSSProperties}
      >
        <div className="rule-h absolute inset-y-0 right-0 w-px bg-gold-700/50" />
      </div>
      <div
        ref={doorR}
        className="substrate hide absolute inset-y-0 right-0 w-1/2"
        style={{ "--surface": "var(--color-hide)" } as React.CSSProperties}
      >
        <div className="rule-h absolute inset-y-0 left-0 w-px bg-gold-700/50" />
      </div>

      <VMark className="pointer-events-none absolute z-1 w-auto" style={markRestStyle} />

      <p
        className="wordmark pointer-events-none absolute left-1/2 z-1 -translate-x-1/2 text-[clamp(0.9rem,1.4vw,1.15rem)] text-paper-100"
        style={{ top: `calc(${MARK_REST.top} + ${MARK_REST.height} * 0.72)` }}
      >
        {"Voss".split("").map((c, i) => (
          <span key={i} data-letter className="inline-block">
            {c}
          </span>
        ))}
      </p>
    </div>
  );
}
