"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { HIDES, pieceImages, priceLabel, type Piece } from "@/lib/catalogue";

gsap.registerPlugin(useGSAP);

/**
 * The product hero: an editorial collage, and a page that changes colour.
 *
 * Photography only — no canvas on this route. The homepage is where the 3D
 * argues for the house; here the reader is deciding whether to spend money,
 * and a real photograph of the real object is worth more than a rendering of
 * an approximation of it.
 *
 * Choosing a hide floods the **whole page** with it. The photograph does not
 * change, because it cannot — each style was shot in exactly one hide, and
 * there are no per-colour plates. Pretending otherwise would be a lie the
 * reader discovers on delivery. So the copy says "made to order in", the room
 * takes the colour, and the photograph stays honest about which one was shot.
 */

/** Relative luminance, so a pale hide flips the page to its light substrate. */
function isLight(hex: string) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.34;
}

export function PieceHero({ piece }: { piece: Piece }) {
  const images = useMemo(() => pieceImages(piece), [piece]);
  const [hide, setHide] = useState(HIDES.find((h) => h.id === piece.shotIn) ?? HIDES[0]);
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const light = isLight(hide.leather);

  /* The takeover. The background is the only thing tweened — the semantic
     tokens flip instantly via data-surface, because a half-resolved text
     colour mid-transition is unreadable in a way a half-resolved background
     is not. */
  useGSAP(
    () => {
      if (!root.current) return;
      gsap.to(root.current, {
        backgroundColor: hide.leather,
        duration: reduced ? 0 : 0.6,
        ease: "power2.inOut",
      });
    },
    { dependencies: [hide.leather, reduced] },
  );

  return (
    <section
      ref={root}
      data-surface={light ? "light" : "dark"}
      className="substrate relative pt-[8.5rem]"
      style={{ backgroundColor: hide.leather }}
      aria-label={piece.name ?? piece.label}
    >
      <div className="mx-auto max-w-[120rem] px-gutter pb-section">
        {/* The collage. Three crops, three scales, none of them aligned to the
            same baseline — the grid is there to be broken against. */}
        <div className="relative grid grid-cols-12 gap-x-gap-col">
          <div className="plate col-span-12 aspect-[4/5] shadow-[var(--elev-3)] md:col-span-7">
            <Image
              src={images[0]}
              alt={`${piece.label}, ${piece.silhouette.toLowerCase()}`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 58vw"
              className="object-cover"
            />
          </div>

          {images[1] && (
            <div className="plate relative z-2 col-span-8 col-start-4 -mt-block aspect-square shadow-[var(--elev-3)] md:col-span-4 md:col-start-8 md:mt-block">
              <Image
                src={images[1]}
                alt=""
                fill
                sizes="(max-width: 768px) 66vw, 33vw"
                className="object-cover"
              />
            </div>
          )}

          {images[2] && (
            <div className="plate col-span-6 col-start-1 mt-group aspect-[3/2] shadow-[var(--elev-2)] md:col-span-3 md:col-start-9 md:-mt-block">
              <Image
                src={images[2]}
                alt=""
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* Name below, small. The image led; it does not need announcing. */}
        <div className="mt-block grid grid-cols-12 gap-x-gap-col">
          <div className="col-span-12 md:col-span-5">
            <p className="eyebrow text-[var(--text-accent)]">{piece.silhouette}</p>
            <h1 className="display-m mt-item text-[var(--text-primary)]">
              {piece.name ?? piece.label}
            </h1>
            <p className="body-l measure mt-group text-[var(--text-secondary)]">{piece.note}</p>
          </div>

          <div className="col-span-12 mt-block md:col-span-4 md:col-start-8 md:mt-0">
            <p className="eyebrow text-[var(--text-secondary)]">Made to order in</p>

            <div className="mt-item flex flex-wrap gap-tight">
              {HIDES.map((h) => {
                const on = h.id === hide.id;
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setHide(h)}
                    aria-pressed={on}
                    className={[
                      "size-11 rounded-xs transition-shadow duration-[var(--dur-1)] ease-[var(--ease-snap)]",
                      on
                        ? "shadow-[0_0_0_2px_var(--surface),0_0_0_4px_var(--text-primary)]"
                        : "shadow-[inset_0_0_0_1px_rgb(255_255_255/0.25)] hover:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.55)]",
                    ].join(" ")}
                    style={{ backgroundColor: h.leather }}
                  >
                    <span className="sr-only">{h.name}</span>
                  </button>
                );
              })}
            </div>

            <p className="caption mt-item">
              {hide.name}
              {hide.id !== piece.shotIn && (
                <> — shown in {HIDES.find((h) => h.id === piece.shotIn)?.name}</>
              )}
            </p>

            <div className="mt-block flex flex-wrap items-baseline gap-group">
              <span className="price text-[1.75rem]">{priceLabel(piece.price)}</span>
            </div>

            <button
              type="button"
              className="eyebrow mt-group w-full rounded-xs bg-vermilion-500 px-control-x-l py-control-y-l text-ink-950 transition-colors duration-[var(--dur-1)] ease-[var(--ease-lux)] hover:bg-vermilion-300 sm:w-auto"
            >
              {piece.price === null ? "Inquire" : "Add to bag"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
