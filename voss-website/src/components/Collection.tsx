"use client";

import { useRef } from "react";
import Image from "next/image";
import { HideSwatches } from "./HideSwatches";
import { getPiece, priceLabel } from "@/lib/catalogue";
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
 * buttons for a mouse). GSAP owns three things on top of that: the clip-path
 * reveal as each card enters, a scrubbed vertical drift so the row reads as
 * depth, and a pointer-follow on the crop inside each frame.
 */
export function Collection() {
  const root = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !rail.current) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-rail-card]");

      /**
       * 1. The photograph is UNCOVERED, not moved.
       *
       * v1's image-reveal recipe: a clip-path inset wiping up, with the image
       * counter-scaling from 1.12 so the crop appears to hold still while the
       * mask travels. A plain opacity fade is the single most common template
       * tell, which is exactly why this is a mask.
       */
      cards.forEach((card, i) => {
        const media = card.querySelector<HTMLElement>("[data-rail-media]");
        if (!media) return;
        const img = media.querySelector<HTMLElement>("img");

        const tl = gsap.timeline({
          scrollTrigger: { trigger: card, start: "top 88%", once: true },
          delay: (i % 4) * 0.06,
        });

        tl.fromTo(
          media,
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.05, ease: "expo.out" }
        );
        if (img) tl.fromTo(img, { scale: 1.12 }, { scale: 1, duration: 1.2, ease: "expo.out" }, 0);
      });

      /**
       * 2. The rail breathes. Alternate cards drift at different rates as the
       * section passes, so the row reads as depth rather than a printed strip.
       * ±22px, scrubbed — a depth cue, not a ride.
       */
      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: i % 2 === 0 ? 22 : -14 },
          {
            y: i % 2 === 0 ? -22 : 14,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          }
        );
      });
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true }
  );

  /**
   * 3. The card looks back at the pointer.
   *
   * A small counter-translate on the photograph inside its own clip, so the
   * crop shifts against the frame as you move across it. Transform only, and
   * `overwrite: "auto"` plus a reset on leave means nothing here can strand a
   * card mid-gesture if the pointer leaves the window.
   */
  const onCardMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduced) return;
    const card = e.currentTarget;
    const img = card.querySelector<HTMLElement>("[data-rail-media] img");
    if (!img) return;
    const b = card.getBoundingClientRect();
    const dx = (e.clientX - b.left) / b.width - 0.5;
    const dy = (e.clientY - b.top) / b.height - 0.5;
    gsap.to(img, { x: dx * -18, y: dy * -14, duration: 0.6, ease: "power3.out", overwrite: "auto" });
  };

  const onCardLeave = (e: React.PointerEvent<HTMLElement>) => {
    const img = e.currentTarget.querySelector<HTMLElement>("[data-rail-media] img");
    if (img) gsap.to(img, { x: 0, y: 0, duration: 0.7, ease: "power3.out", overwrite: "auto" });
  };

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
      data-surface="dark"
      className="substrate grain overflow-hidden py-section"
      aria-label="The collection"
    >
      <div className="above-material relative mx-auto max-w-[120rem] px-gutter">
        <div className="grid grid-cols-12 items-end gap-x-gap-col">
          <div className="col-span-12 md:col-span-5">
            <Hairline className="mt-5 max-w-[6rem]" />
          </div>
          <RevealLines
            as="h2"
            className="display-l col-span-12 mt-group text-[var(--text-primary)] md:col-span-6 md:col-start-7 md:mt-0"
          >
            Six pieces, one hide at a&nbsp;time.
          </RevealLines>
        </div>

        <div className="mt-band flex items-center justify-between gap-group">
          <p className="body-s text-[var(--text-secondary)]">Available now. Drag through, or see the full shop.</p>
          <div className="hidden shrink-0 items-center gap-3 md:flex">
            <RailButton direction={-1} onClick={() => scrollBy(-1)} />
            <RailButton direction={1} onClick={() => scrollBy(1)} />
          </div>
        </div>
      </div>

      <div
        ref={rail}
        className="no-scrollbar mt-band flex snap-x snap-mandatory gap-gap-col overflow-x-auto px-gutter pb-2"
      >
        {RAW_PRODUCTS.map((p, i) => (
          <RailCard key={p.slug} product={p} index={i} onMove={onCardMove} onLeave={onCardLeave} />
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
          <span className="eyebrow text-[var(--text-accent)]">See all six</span>
          <span className="display-s text-[var(--text-primary)]">
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

function RailCard({
  product,
  index,
  onMove,
  onLeave,
}: {
  product: RawProduct;
  index: number;
  onMove: (e: React.PointerEvent<HTMLElement>) => void;
  onLeave: (e: React.PointerEvent<HTMLElement>) => void;
}) {
  const [cover] = rawProductImages(product.slug, product.imageCount);

  return (
    <Link
      href={`/collection/${product.slug}`}
      data-rail-card
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="group w-[70vw] shrink-0 snap-start sm:w-[38vw] lg:w-[22vw]"
    >
      {/* the mask the reveal travels across, and the frame the crop shifts in */}
      <div data-rail-media className="plate aspect-[4/5] overflow-hidden">
        <Image
          src={cover}
          alt={`${product.label}, product photo`}
          fill
          priority={index === 0}
          sizes="(max-width: 640px) 70vw, (max-width: 1024px) 38vw, 22vw"
          className="object-cover transition-transform duration-[var(--dur-3)] ease-[var(--ease-lux)] group-hover:scale-[1.04]"
        />
      </div>
      <p className="numeral mt-group text-[var(--text-accent)]">{String(index + 1).padStart(2, "0")}</p>
      <div className="rule-h mt-item w-12 transition-[width] duration-[var(--dur-3)] ease-[var(--ease-lux)] group-hover:w-20" />
      <p className="body-base mt-item text-[var(--text-primary)]">{product.label}</p>
      <p className="caption mt-tight text-[var(--text-secondary)]">
        {priceLabel(getPiece(product.slug)?.price ?? null)}
      </p>

      {/* DEPRECATED, unmounted. Kept per instruction, but the copy below
          no longer claims a hide system that does not exist. */}
      <div className="mt-item flex items-center justify-between gap-group">
        <HideSwatches shotIn={getPiece(product.slug)?.shotIn ?? "noir"} />
        <span className="caption text-[var(--text-secondary)]">Colours</span>
      </div>
    </Link>
  );
}
