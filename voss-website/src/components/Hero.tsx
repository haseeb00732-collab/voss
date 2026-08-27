"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useFrameSequence } from "@/lib/useFrameSequence";
import { waLink } from "@/lib/whatsapp";
import { VMark } from "./VMark";

gsap.registerPlugin(ScrollTrigger);

/**
 * The hero, as one pinned scroll sequence.
 *
 * The clip is NOT a <video> on the page. It is 48 decoded AVIF stills and
 * scroll position picks the frame. That is the difference between a film that
 * plays at you and an object you are turning: the reader controls it, nothing
 * autoplays, it costs one drawImage per frame, and it cannot stall.
 *
 * Choreography across the pin, all from one scrub:
 *   0.00 - 1.00  the light finds the bag, frame by frame
 *   0.00 - 0.55  the V travels from large and centred into the nav's own slot,
 *                shrinking as it goes
 *   0.40 - 0.62  the VOSS wordmark arrives beside it
 *   0.30 - 0.85  the copy wipes up, one line at a time
 *
 * The mark's destination is measured off the real <Nav> mark at runtime rather
 * than eyeballed, so the hand-off lands exactly on the nav logo and survives a
 * resize.
 *
 * Server markup carries the FINAL state (CLAUDE.md): if GSAP never runs the
 * copy is simply visible, and at tier 1 or reduced motion the travelling mark
 * never renders at all.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const mark = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { tier, poster, ready, setProgress } = useFrameSequence(canvas);

  const wa = waLink({ message: "Hi VOSS, I'd like to ask about a bag." });
  const still = reduced || tier === 1;

  useEffect(() => {
    if (still || !root.current) return;
    const el = root.current;

    const ctx = gsap.context(() => {
      /** Where the nav's mark actually sits. Measured, not guessed. */
      const measure = () => {
        const nav = document.querySelector<HTMLElement>("[data-nav-mark]");
        const m = mark.current;
        if (!nav || !m) return null;
        const a = nav.getBoundingClientRect();
        const b = m.getBoundingClientRect();
        if (!a.width || !b.width) return null;
        return {
          x: a.left + a.width / 2 - (b.left + b.width / 2),
          y: a.top + a.height / 2 - (b.top + b.height / 2),
          scale: a.height / b.height,
        };
      };

      let dest = measure();

      /* One V on screen at a time: the nav's own mark stays invisible until
         the travelling one has arrived on top of it. */
      const navMark = document.querySelector<HTMLElement>("[data-nav-mark]");
      if (navMark) navMark.style.opacity = "0";
      if (mark.current) mark.current.style.willChange = "transform";
      const setX = gsap.quickSetter(mark.current, "x", "px");
      const setY = gsap.quickSetter(mark.current, "y", "px");
      const setS = gsap.quickSetter(mark.current, "scale");

      const lines = gsap.utils.toArray<HTMLElement>("[data-hero-line]");
      const word = document.querySelector<HTMLElement>("[data-hero-word]");
      const ease = gsap.parseEase("power2.inOut");

      /* last-written values, so the handler can skip redundant style writes */
      let lastWord = -1;
      let lastHanded: boolean | null = null;
      const lastLine: number[] = [];

      const clamp = (v: number) => Math.min(1, Math.max(0, v));
      const at = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: () => "+=" + window.innerHeight * 2,
        pin: true,
        pinSpacing: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onRefresh: () => {
          dest = measure();
        },
        onUpdate: (self) => {
          const p = self.progress;
          setProgress(p);

          if (dest) {
            const t = ease(at(p, 0, 0.55));
            setX(dest.x * t);
            setY(dest.y * t);
            setS(1 + (dest.scale - 1) * t);
          }

          /* Every write below is guarded. Assigning a style property costs a
             style recalc even when the value is identical, and this handler
             runs on every scroll frame; unguarded it was ~10 writes and 4
             fresh template strings per frame. Rounding the wipe to whole
             percent also means a slow drag re-renders a line ~100 times over
             its reveal rather than once per sub-pixel change. */
          const wv = at(p, 0.4, 0.62);
          if (word && wv !== lastWord) {
            word.style.opacity = String(wv);
            lastWord = wv;
          }

          const handed = p >= 0.55;
          if (handed !== lastHanded) {
            if (navMark) navMark.style.opacity = handed ? "1" : "0";
            if (mark.current) mark.current.style.opacity = handed ? "0" : "1";
            lastHanded = handed;
          }

          for (let i = 0; i < lines.length; i++) {
            const from = 0.3 + i * 0.09;
            const v = Math.round(at(p, from, from + 0.22) * 100);
            if (v === lastLine[i]) continue;
            lastLine[i] = v;
            const l = lines[i];
            l.style.clipPath = v >= 100 ? "none" : `inset(${100 - v}% 0 0 0)`;
            l.style.opacity = v > 0 ? "1" : "0";
          }
        },
      });
    }, el);

    return () => {
      ctx.revert();
      const navMark = document.querySelector<HTMLElement>("[data-nav-mark]");
      if (navMark) navMark.style.opacity = "";
      const word = document.querySelector<HTMLElement>("[data-hero-word]");
      if (word) word.style.opacity = "";
    };
  }, [still, setProgress]);

  const hidden = still ? undefined : { opacity: 0 };

  return (
    <section
      ref={root}
      id="top"
      data-surface="dark"
      className="substrate relative isolate min-h-[100svh] overflow-hidden"
      aria-label="VOSS"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src={poster}
          alt="A black VOSS tote emerging from darkness as a warm light finds it."
          fill
          priority
          unoptimized
          sizes="100vw"
          className={`object-cover transition-opacity duration-[var(--dur-3)] ${
            ready && !still ? "opacity-0" : "opacity-100"
          }`}
        />
        {!still && (
          <canvas
            ref={canvas}
            aria-hidden="true"
            className={`absolute inset-0 h-full w-full transition-opacity duration-[var(--dur-3)] ${
              ready ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
      </div>

      {/* Desktop: darken the left column, where the type lives. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-1 hidden md:block"
        style={{
          background:
            "linear-gradient(96deg, var(--color-ink-950) 0%, color-mix(in srgb, var(--color-ink-950) 70%, transparent) 34%, transparent 64%)",
        }}
      />
      {/* Mobile: the type sits at the bottom, directly over the light pool the
          bag is standing in, so the scrim has to come up from the floor
          instead. Without it the subhead reads over a bright highlight. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-1 h-[62%] md:hidden"
        style={{
          background:
            "linear-gradient(to top, var(--color-ink-950) 12%, color-mix(in srgb, var(--color-ink-950) 78%, transparent) 46%, transparent 100%)",
        }}
      />

      {/* The travelling mark. Only exists where it can actually travel. */}
      {!still && (
        <div
          ref={mark}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[15svh] z-3 -translate-x-1/2"
        >
          <VMark foil className="h-[clamp(56px,9vw,108px)] w-auto" />
        </div>
      )}

      <div className="relative z-2 mx-auto grid min-h-[100svh] max-w-[120rem] grid-cols-12 gap-x-gap-col px-gutter pt-24 pb-band">
        <div className="col-span-12 flex flex-col justify-end self-end md:col-span-6 lg:col-span-5">
          <p data-hero-line className="eyebrow text-gold-500" style={hidden}>
            Handbags &middot; Lahore &middot; Cash on delivery
          </p>

          <h1 data-hero-line className="display-xl mt-group text-paper-50" style={hidden}>
            Carry it your way.
          </h1>

          <p data-hero-line className="body-l measure-tight mt-band text-smoke" style={hidden}>
            Every price, size and material is on the page. Pay when it reaches
            your hands.
          </p>

          <div
            data-hero-line
            className="mt-band flex flex-wrap items-center gap-group"
            style={hidden}
          >
            <a
              href="#bags"
              className="eyebrow inline-flex items-center justify-center rounded-xs bg-vermilion-500 px-control-x-l py-control-y-l text-ink-950 transition-colors duration-[var(--dur-1)] ease-[var(--ease-lux)] hover:bg-vermilion-300"
            >
              See the bags
            </a>
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="eyebrow inline-flex items-center justify-center rounded-xs border border-[var(--border-hairline)] px-control-x-l py-control-y-l text-paper-100 transition-colors duration-[var(--dur-1)] ease-[var(--ease-lux)] hover:border-gold-500 hover:text-gold-500"
              >
                Ask on WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
