"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import {
  colourwayImage,
  pieceImages,
  type Colourway,
  type Piece,
} from "@/lib/catalogue";
import { PriceRow } from "./PriceRow";
import { igDirectMessage, orderReference } from "@/lib/instagram";

gsap.registerPlugin(useGSAP);

/**
 * The product hero: an editorial collage, and a page that changes colour.
 *
 * Photography only — no canvas on this route. The homepage is where the 3D
 * argues for the house; here the reader is deciding whether to spend money,
 * and a real photograph of the real object is worth more than a rendering of
 * an approximation of it.
 *
 * Choosing a COLOUR floods the whole page with it AND swaps the photograph,
 * because every colour offered here is a colour that was actually
 * photographed — `piece.colourways` comes from the real shots, one hex per
 * frame.
 *
 * This replaced a selector for a hide system that does not exist, under a
 * production claim that was never true. That control offered colours no
 * photograph showed, which is a lie the reader discovers on delivery. The
 * Urdu name lives here too — this is the one place with enough size for
 * Nastaliq to be legible, let alone beautiful.
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
  const [cw, setCw] = useState<Colourway>(piece.colourways[0]);
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const dm = igDirectMessage();

  const light = isLight(cw.hex);

  /* The takeover. The background is the only thing tweened — the semantic
     tokens flip instantly via data-surface, because a half-resolved text
     colour mid-transition is unreadable in a way a half-resolved background
     is not. */
  useGSAP(
    () => {
      if (!root.current) return;
      gsap.to(root.current, {
        backgroundColor: cw.hex,
        duration: reduced ? 0 : 0.6,
        ease: "power2.inOut",
      });
    },
    { dependencies: [cw.hex, reduced] },
  );

  return (
    <section
      ref={root}
      data-surface={light ? "light" : "dark"}
      className="substrate relative pt-[8.5rem]"
      style={{ backgroundColor: cw.hex }}
      aria-label={piece.name ?? piece.label}
    >
      <div className="mx-auto max-w-[120rem] px-gutter pb-section">
        {/* The collage. Three crops, three scales, none of them aligned to the
            same baseline — the grid is there to be broken against. */}
        <div className="relative grid grid-cols-12 gap-x-gap-col">
          <div className="plate col-span-12 aspect-[4/5] w-full max-w-[440px] shadow-[var(--elev-3)] md:col-span-7">
            <Image
              src={colourwayImage(piece, cw)}
              alt={`The ${piece.name} in ${cw.name}, ${piece.silhouette.toLowerCase()}`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 440px"
              className="object-cover"
              style={{ viewTransitionName: `bag-${piece.slug}` }}
            />
          </div>

          {images[1] && (
            <div className="plate relative z-2 col-span-8 col-start-4 -mt-band aspect-square w-full max-w-[340px] shadow-[var(--elev-3)] md:col-span-4 md:col-start-8 md:mt-band">
              <Image
                src={images[1]}
                alt=""
                fill
                sizes="(max-width: 768px) 66vw, 340px"
                className="object-cover"
              />
            </div>
          )}

          {images[2] && (
            <div className="plate col-span-6 col-start-1 mt-group aspect-[3/2] w-full max-w-[300px] shadow-[var(--elev-2)] md:col-span-3 md:col-start-9 md:-mt-band">
              <Image
                src={images[2]}
                alt=""
                fill
                sizes="(max-width: 768px) 50vw, 300px"
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* Name below, small. The image led; it does not need announcing. */}
        <div className="mt-band grid grid-cols-12 gap-x-gap-col">
          <div className="col-span-12 md:col-span-5">
            <p className="eyebrow text-[var(--text-accent)]">{piece.silhouette}</p>

            {/* The Urdu, large. This is the ONE place it appears: at card size
                Nastaliq is illegible, and it needs size to be beautiful.
                `lang` and `dir` are required, and `unicode-bidi: isolate`
                (in the .urdu utility) keeps adjacent Latin and digits from
                reordering around the RTL run. */}
            <p
              lang="ur"
              dir="rtl"
              // dir="rtl" governs shaping and character order, which is what
              // must be correct. Alignment is a layout choice: left, so the
              // Urdu and the Latin name share one optical left edge instead of
              // drifting to opposite sides of the column.
              className="urdu urdu-display mt-item text-left text-[var(--text-primary)]"
            >
              {piece.urdu}
            </p>

            <h1 className="display-m mt-tight text-[var(--text-primary)]">
              {piece.name ?? piece.label}
            </h1>
            <p className="body-l measure mt-group text-[var(--text-secondary)]">{piece.note}</p>
          </div>

          <div className="col-span-12 mt-band md:col-span-4 md:col-start-8 md:mt-0">
            <p className="eyebrow text-[var(--text-secondary)]">Colours</p>

            <div
              role="radiogroup"
              aria-label={`Colour, ${piece.name}`}
              className="mt-item flex flex-col gap-tight"
            >
              {piece.colourways.map((c) => {
                const on = c.name === cw.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setCw(c)}
                    className="flex items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)]"
                  >
                    <span
                      aria-hidden="true"
                      className={[
                        "size-8 shrink-0 rounded-xs transition-shadow duration-[var(--dur-1)]",
                        on
                          ? "shadow-[0_0_0_2px_var(--surface),0_0_0_4px_var(--text-primary)]"
                          : "shadow-[inset_0_0_0_1px_rgb(255_255_255/0.25)] hover:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.55)]",
                      ].join(" ")}
                      style={{ backgroundColor: c.hex }}
                    />
                    {/* The name always rides with the chip. She cannot type a
                        swatch into a DM. */}
                    <span
                      className={
                        on
                          ? "body-s text-[var(--text-primary)]"
                          : "body-s text-[var(--text-secondary)]"
                      }
                    >
                      {c.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-band">
              <PriceRow piece={piece} reduced={reduced} />
            </div>

            {/* A real link, never a dead button. There is no cart on this
                site; the order closes in the DM and she pays the rider. The
                old control did nothing at all, and its fallback label broke
                the one promise this shop makes: the price is on the page. */}
            {dm && (
              <div className="mt-group flex flex-col items-start gap-tight">
                <a
                  href={dm}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="eyebrow inline-flex w-full items-center justify-center rounded-xs bg-[var(--text-signal)] px-control-x-l py-control-y-l text-ink-950 transition-opacity duration-[var(--dur-1)] ease-[var(--ease-lux)] hover:opacity-90 sm:w-auto"
                >
                  Order on Instagram
                </a>
                <CopyLine
                  text={orderReference({
                    piece: piece.name,
                    slug: piece.slug,
                    colourway: cw.name,
                  })}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Instagram deep links cannot prefill a message, so the reader needs the line
 * to paste. Without it she lands in an empty box and the reply starts with
 * "which one?".
 */
function CopyLine({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          setCopied(false);
        }
      }}
      className="eyebrow text-[var(--text-secondary)] underline underline-offset-4 transition-colors duration-[var(--dur-1)] hover:text-[var(--text-primary)]"
    >
      {copied ? "Copied" : "Copy your message"}
    </button>
  );
}
