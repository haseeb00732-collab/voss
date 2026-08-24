"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { RAW_PRODUCTS, rawProductImages, type RawProduct } from "@/lib/rawProducts";
import { Hairline, RevealLines } from "./Reveal";
import { Button } from "./ui/button";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * The collection, on the homepage, as a rail you can actually push.
 *
 * The original version of this section argued against a horizontal
 * carousel — a fair point for four staged, graded photographs, but the
 * catalogue is six real pieces now, and a reader who wants to see more than
 * one of them at a time needs somewhere to put that motion. `overflow-x` with
 * scroll-snap does the dragging (touch, trackpad, and the two hairline
 * buttons for a mouse); GSAP only handles the one-time slide-in when the
 * rail first reaches the viewport.
 */
export function Collection() {
  const root = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !rail.current) return;

      gsap.from("[data-rail-card]", {
        x: 48,
        opacity: 0,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: rail.current, start: "top 85%", once: true },
      });
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true }
  );

  // A hand-rolled rAF tween rather than `Element.scrollBy({ behavior:
  // "smooth" })`: native smooth-scroll timing varies by browser and OS
  // setting, where this reads exactly like every other tween on the site —
  // same duration scale, same "no overshoot" easing.
  const scrollBy = (dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    const from = el.scrollLeft;
    const delta = dir * el.clientWidth * 0.86;

    if (reduced) {
      el.scrollLeft = from + delta;
      return;
    }

    const duration = 500;
    const start = performance.now();
    const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      el.scrollLeft = from + delta * easeOutCubic(t);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  return (
    <section
      id="collection"
      ref={root}
      data-surface="light"
      className="substrate grain overflow-hidden py-section"
      aria-label="The collection"
    >
      <div className="above-material relative mx-auto max-w-[120rem] px-gutter">
        <div className="grid grid-cols-12 items-end gap-x-gap-col">
          <div className="col-span-12 md:col-span-5">
            <p className="eyebrow text-gold-900">The Collection</p>
            <Hairline className="mt-5 max-w-[6rem]" />
          </div>
          <RevealLines
            as="h2"
            className="display-l col-span-12 mt-group text-ink-900 md:col-span-6 md:col-start-7 md:mt-0"
          >
            Six pieces, one hide at a&nbsp;time.
          </RevealLines>
        </div>

        <div className="mt-block flex items-center justify-between gap-group">
          <p className="body-s text-clay">Available now — drag through, or see the full shop.</p>
          <div className="hidden shrink-0 items-center gap-3 md:flex">
            <RailButton direction={-1} onClick={() => scrollBy(-1)} />
            <RailButton direction={1} onClick={() => scrollBy(1)} />
          </div>
        </div>
      </div>

      <div
        ref={rail}
        className="no-scrollbar mt-block flex snap-x snap-mandatory gap-gap-col overflow-x-auto px-gutter pb-2"
      >
        {RAW_PRODUCTS.map((p, i) => (
          <RailCard key={p.slug} product={p} index={i} />
        ))}

        <Link
          href="/collection"
          data-rail-card
          // `self-start` is load-bearing: flex items stretch to the row's
          // height by default, which is the tallest product card (photo PLUS
          // its caption block). That silently overrode the 4:5 ratio below and
          // left this panel a head taller than every photograph beside it.
          className="group flex w-[70vw] shrink-0 snap-start flex-col items-start justify-center gap-group self-start border border-[var(--border-hairline)] px-8 sm:w-[38vw] lg:w-[22vw]"
          style={{ aspectRatio: "4 / 5" }}
        >
          <span className="eyebrow text-gold-900">See all six</span>
          <span className="display-s text-ink-900">
            The full shop
            <span
              aria-hidden="true"
              className="ml-2 inline-block transition-transform duration-[var(--dur-2)] ease-[var(--ease-lux)] group-hover:translate-x-1"
            >
              &rarr;
            </span>
          </span>
        </Link>
      </div>
    </section>
  );
}

function RailButton({ direction, onClick }: { direction: 1 | -1; onClick: () => void }) {
  return (
    <Button
      size="icon"
      onClick={onClick}
      aria-label={direction === -1 ? "Scroll collection left" : "Scroll collection right"}
    >
      <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={1.2}>
        {direction === -1 ? <path d="M10 2 4 8l6 6" /> : <path d="M6 2l6 6-6 6" />}
      </svg>
    </Button>
  );
}

function RailCard({ product, index }: { product: RawProduct; index: number }) {
  const [cover] = rawProductImages(product.slug, product.imageCount);

  return (
    <Link
      href={`/products/${product.slug}`}
      data-rail-card
      className="group w-[70vw] shrink-0 snap-start sm:w-[38vw] lg:w-[22vw]"
    >
      <div className="plate aspect-[4/5]">
        <Image
          src={cover}
          alt={`${product.label}, product photo`}
          fill
          priority={index === 0}
          sizes="(max-width: 640px) 70vw, (max-width: 1024px) 38vw, 22vw"
          className="object-cover transition-transform duration-[var(--dur-3)] ease-[var(--ease-lux)] group-hover:scale-[1.04]"
        />
      </div>
      <p className="numeral mt-group text-gold-900">{String(index + 1).padStart(2, "0")}</p>
      <div className="rule-h mt-item w-12 transition-[width] duration-[var(--dur-3)] ease-[var(--ease-lux)] group-hover:w-20" />
      <p className="body-base mt-item text-ink-900">{product.label}</p>
      <p className="caption mt-tight text-clay">Inquire for price</p>
    </Link>
  );
}
