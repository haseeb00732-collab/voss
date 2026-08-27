"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { pieceImages, priceLabel, type Piece } from "@/lib/catalogue";
import { HideSwatches } from "./HideSwatches";
import { HIDES } from "@/lib/catalogue";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * The grid. One ratio, one column width, nothing overlapping.
 *
 * Cards lift on hover — the one place a shadow does real work, because it
 * separates the hovered card from five identical neighbours faster than a
 * colour change can. The price is revealed on the same gesture rather than
 * sitting in the grid: six prices in a column turn a catalogue into a
 * spreadsheet, and this house is not competing on price.
 */
export function CollectionGrid({ pieces }: { pieces: Piece[] }) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !root.current) return;
      const cards = root.current.querySelectorAll("[data-card]");
      // Images scale down from 1.08 while fading — the house entrance.
      gsap.from(cards, {
        opacity: 0,
        scale: 1.08,
        duration: 0.9,
        ease: "power4.out",
        stagger: 0.09,
        scrollTrigger: { trigger: root.current, start: "top 82%", once: true },
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <div
      ref={root}
      className="mx-auto grid max-w-[120rem] grid-cols-1 gap-x-gap-col gap-y-band px-gutter pb-section sm:grid-cols-2 lg:grid-cols-3"
    >
      {pieces.map((piece, i) => (
        <Card key={piece.slug} piece={piece} priority={i < 3} />
      ))}
    </div>
  );
}

function Card({ piece, priority }: { piece: Piece; priority: boolean }) {
  const [cover] = pieceImages(piece);
  const hide = HIDES.find((h) => h.id === piece.shotIn);

  return (
    <Link
      href={`/collection/${piece.slug}`}
      data-card
      className="group relative block transition-transform duration-[var(--dur-2)] ease-[var(--ease-lux)] hover:-translate-y-1.5"
    >
      <div className="plate aspect-[4/5] transition-shadow duration-[var(--dur-2)] ease-[var(--ease-lux)] group-hover:shadow-[var(--elev-3)]">
        <Image
          src={cover}
          alt={`${piece.label}, ${piece.silhouette.toLowerCase()} in ${hide?.name ?? "leather"}`}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />

        {/* Price rides in on the same gesture as the lift. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-3 flex items-end justify-between gap-group p-5 opacity-0 transition-opacity duration-[var(--dur-2)] ease-[var(--ease-lux)] group-hover:opacity-100">
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-ink-950/85 to-transparent"
          />
          <span className="relative price text-[1.0625rem]">{priceLabel(piece.price)}</span>
          <span className="relative eyebrow text-paper-100">View</span>
        </div>
      </div>

      <div className="mt-item flex items-baseline justify-between gap-group">
        <p className="body-base text-paper-100">{piece.name ?? piece.label}</p>
        <p className="numeral text-gold-500">{piece.silhouette}</p>
      </div>
      <p className="caption mt-tight">{piece.note}</p>

      {/* Four hides, made to order. The ringed one is the hide photographed. */}
      <div className="mt-item flex items-center justify-between gap-group">
        <HideSwatches shotIn={piece.shotIn} />
        <span className="caption">Four hides</span>
      </div>
    </Link>
  );
}
