"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { CATALOGUE, pieceImages } from "@/lib/catalogue";

gsap.registerPlugin(useGSAP);

/**
 * The hero. Photography, not geometry.
 *
 * This was a procedural 3D vitrine. It was dropped, and the reason is worth
 * keeping: a handbag is a soft, stitched, irregular object, which is the worst
 * possible subject for primitives. Rounded boxes read as rounded boxes however
 * well they are lit, and a synthetic-looking hero on a page selling hand-
 * finished leather argues against the product.
 *
 * A photograph of the real object does the job the render was pretending to do.
 * The 3D work is parked in `components/three/` rather than deleted — the room
 * geometry is still sound, because rooms *are* boxes. It could return as
 * atmosphere that never has to depict the product itself.
 *
 * Composition: the plate sits right of centre and the headline runs across its
 * lower-left. Type over photograph is what makes a cover a cover.
 */

const HERO_PIECE = CATALOGUE[2];

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [cover] = pieceImages(HERO_PIECE);
  const alt = `${HERO_PIECE.label}, ${HERO_PIECE.silhouette.toLowerCase()}, in full-grain leather`;

  useGSAP(
    () => {
      if (reduced || !root.current) return;

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      // The plate arrives first and alone. One motion per moment.
      tl.from("[data-hero-plate]", { opacity: 0, scale: 1.08, duration: 1.2 })
        // Then the words, staggered — the house entrance for text.
        .from(
          "[data-hero-word]",
          { opacity: 0, yPercent: 60, duration: 0.8, stagger: 0.07 },
          "-=0.75",
        )
        .from("[data-hero-meta]", { opacity: 0, y: 14, duration: 0.6, stagger: 0.08 }, "-=0.4");

      return () => tl.kill();
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section
      ref={root}
      id="top"
      data-surface="dark"
      className="substrate relative min-h-[100svh] overflow-hidden"
      aria-label="VOSS"
    >
      <div className="relative mx-auto grid min-h-[100svh] max-w-[120rem] grid-cols-12 gap-x-gap-col px-gutter pt-[8.5rem] pb-block">
        <p data-hero-meta className="eyebrow col-span-12 self-start text-gold-500">
          Florence &middot; Made to order
        </p>

        {/* The plate. Right of centre, tall, and it runs past the fold. */}
        <div
          data-hero-plate
          className="plate absolute top-[15%] right-gutter bottom-[9%] z-0 hidden w-[40vw] max-w-[36rem] shadow-[var(--elev-3)] md:block"
        >
          <Image src={cover} alt={alt} fill priority sizes="40vw" className="object-cover" />
        </div>

        {/* Mobile gets the plate inline rather than absolutely placed — an
            overlapping collage at 375px is just an occlusion. */}
        <div
          data-hero-plate
          className="plate col-span-12 mt-block aspect-[4/5] shadow-[var(--elev-3)] md:hidden"
        >
          <Image src={cover} alt={alt} fill priority sizes="100vw" className="object-cover" />
        </div>

        {/* Scrim under the type only, so the plate keeps its own contrast. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-1 h-[58%]"
          style={{
            background:
              "linear-gradient(to top, var(--color-ink-950) 10%, color-mix(in srgb, var(--color-ink-950) 62%, transparent) 44%, transparent 100%)",
          }}
        />

        <h1 className="relative z-2 col-span-12 self-end md:col-span-9">
          <span className="display-xl block text-paper-50">
            <span data-hero-word className="inline-block">
              Made
            </span>{" "}
            <span data-hero-word className="inline-block">
              once.
            </span>
          </span>
          <span className="display-xl block text-paper-50">
            <span data-hero-word className="inline-block font-normal italic text-gold-300">
              Carried
            </span>{" "}
            <span data-hero-word className="inline-block">
              for
            </span>{" "}
            <span data-hero-word className="inline-block">
              decades.
            </span>
          </span>
        </h1>

        <div className="relative z-2 col-span-12 mt-block self-end md:col-span-5">
          <p data-hero-meta className="body-l measure-tight text-smoke">
            Six pieces, cut to order in Florence. Full-grain hides, four finishes, and
            nothing made twice the same week.
          </p>

          <div data-hero-meta className="mt-group flex flex-wrap items-center gap-group">
            <Link
              href="/collection"
              className="eyebrow inline-flex items-center justify-center rounded-xs bg-vermilion-500 px-control-x-l py-control-y-l text-ink-950 transition-colors duration-[var(--dur-1)] ease-[var(--ease-lux)] hover:bg-vermilion-300"
            >
              See the collection
            </Link>
            <span className="caption">Six pieces &middot; Four hides</span>
          </div>
        </div>
      </div>
    </section>
  );
}
