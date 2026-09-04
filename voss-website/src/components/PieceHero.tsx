"use client";

import { useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import {
  colourwayImage,
  colourwaySrcSet,
  hdSrcSet,
  pieceImages,
  type Colourway,
  type Piece,
} from "@/lib/catalogue";
import { PriceRow } from "./PriceRow";
import { igDirectMessage, orderReference } from "@/lib/instagram";

gsap.registerPlugin(useGSAP);

/**
 * The product page.
 *
 * ONE GROUND, ALWAYS. This page used to repaint its entire background to the
 * selected colourway's hex and flip `data-surface` between dark and paper on
 * a luminance test, so picking Cream turned the whole page to paper and
 * picking Black turned it back. Two things were wrong with that. The obvious
 * one is that the page looked like a different site every third tap. The
 * subtle one is worse: the hexes are swatch values sampled off photographs,
 * not designed surface colours, so the "background" was an arbitrary muddy
 * brown or grey that no token controls and no contrast ratio was ever checked
 * against — text on it was legible by luck.
 *
 * The colour still has to go somewhere, because a selector that changes
 * nothing but the photograph feels broken. It goes into a WASH behind the
 * image — the same `--wash-hue` mechanism the homepage uses — so the room
 * warms toward the colour you picked while the page itself stays the one
 * ground the rest of the site is on, and every token keeps resolving against
 * a substrate that never moves.
 */

export function PieceHero({ piece }: { piece: Piece }) {
  const images = useMemo(() => pieceImages(piece), [piece]);
  const [cw, setCw] = useState<Colourway>(piece.colourways[0]);
  const root = useRef<HTMLElement>(null);
  const lead = useRef<HTMLImageElement>(null);
  const reduced = useReducedMotion();
  const dm = igDirectMessage();

  /* The wash follows the selection; the ground does not. Tweening a custom
     property works here because --wash-hue is registered as <color> in
     globals.css — an unregistered one has no animatable type and the
     transition is silently dropped. */
  useGSAP(
    () => {
      if (!root.current) return;
      gsap.to(root.current, {
        "--wash-hue": cw.hex,
        duration: reduced ? 0 : 0.6,
        ease: "power2.inOut",
      });
    },
    { dependencies: [cw.hex, reduced] },
  );

  /* The photograph arrives rather than cuts. Same language as the range
     card's wipe: it lands from slightly over-scaled and over-exposed, so a
     colour change reads as the light changing on one object instead of as
     two unrelated pictures swapping. */
  useGSAP(
    () => {
      if (reduced || !lead.current) return;
      gsap.fromTo(
        lead.current,
        { opacity: 0, scale: 1.05, filter: "brightness(1.35)" },
        {
          opacity: 1,
          scale: 1,
          filter: "brightness(1)",
          duration: 0.55,
          ease: "power3.out",
        },
      );
    },
    { dependencies: [cw.image, reduced] },
  );

  return (
    <section
      ref={root}
      data-surface="dark"
      className="substrate relative isolate overflow-hidden pt-[8.5rem]"
      style={{ ["--wash-hue" as string]: piece.colourways[0].hex }}
      aria-label={piece.name ?? piece.label}
    >
      {/* The only place the chosen colour touches the page. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(70% 55% at 30% 25%, color-mix(in srgb, var(--wash-hue) 30%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-[120rem] px-gutter pb-section">
        <div className="relative grid grid-cols-12 gap-x-gap-col">
          {/* Shrunk. It was col-span-7 at 4:5, which on a laptop is most of
              the fold and on a phone was a full-width portrait you had to
              scroll past before reading anything. A capped height keeps it a
              photograph rather than a wall. */}
          <div className="piece-lead plate relative col-span-12 aspect-[4/5] max-h-[62svh] w-full overflow-hidden shadow-[var(--elev-3)] sm:col-span-9 md:col-span-5 md:max-h-[70svh]">
            <img
              ref={lead}
              src={colourwayImage(piece, cw)}
              srcSet={colourwaySrcSet(piece, cw)}
              sizes="(max-width: 768px) 92vw, 40vw"
              alt={`${piece.name} in ${cw.name}, ${piece.silhouette.toLowerCase()}, front view`}
              width={1792}
              height={2400}
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ viewTransitionName: `bag-${piece.slug}` }}
            />
          </div>

          {images[1] && (
            <div className="plate relative z-2 col-span-7 col-start-5 -mt-band aspect-square w-full max-h-[34svh] shadow-[var(--elev-3)] md:col-span-3 md:col-start-7 md:mt-band md:max-h-none">
              <img
                src={images[1]}
                srcSet={hdSrcSet(piece, 2)}
                sizes="(max-width: 768px) 58vw, 24vw"
                alt=""
                width={1792}
                height={2400}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          )}

          {images[2] && (
            <div className="plate col-span-5 col-start-1 mt-group aspect-[3/2] w-full shadow-[var(--elev-2)] md:col-span-3 md:col-start-10 md:-mt-band">
              <img
                src={images[2]}
                srcSet={hdSrcSet(piece, 3)}
                sizes="(max-width: 768px) 42vw, 22vw"
                alt=""
                width={1792}
                height={2400}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          )}
        </div>

        <div className="mt-band grid grid-cols-12 gap-x-gap-col">
          <div className="col-span-12 md:col-span-5">
            <p className="mono text-[var(--text-accent)]">{piece.silhouette}</p>

            <h1 className="display-2 mt-item text-[var(--text-primary)]">
              {piece.name ?? piece.label}
            </h1>
            <p className="body-l measure mt-group text-[var(--text-secondary)]">
              {piece.note}
            </p>
          </div>

          <div className="col-span-12 mt-band md:col-span-4 md:col-start-8 md:mt-0">
            <p className="mono text-[var(--text-secondary)]">
              Colours · {piece.colourways.length}
            </p>

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
                    /* The whole row is the target, not just the 32px chip —
                       a swatch alone is under the 44px minimum and this list
                       is read with a thumb. */
                    className="group/cw flex min-h-11 items-center gap-3 text-left transition-transform duration-[var(--dur-1)] ease-[var(--ease-out)] hover:translate-x-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)]"
                  >
                    <span
                      aria-hidden="true"
                      className={[
                        "size-8 shrink-0 rounded-xs transition-all duration-[var(--dur-2)] ease-[var(--ease-out)]",
                        on
                          ? "scale-110 shadow-[0_0_0_2px_var(--surface),0_0_0_4px_var(--text-primary)]"
                          : "shadow-[inset_0_0_0_1px_rgb(255_255_255/0.25)] group-hover/cw:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.55)]",
                      ].join(" ")}
                      style={{ backgroundColor: c.hex }}
                    />
                    <span
                      className={
                        on
                          ? "body-s text-[var(--text-primary)]"
                          : "body-s text-[var(--text-secondary)] group-hover/cw:text-[var(--text-primary)]"
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

            {dm && (
              <div className="mt-group flex flex-col items-start gap-tight">
                <a
                  href={dm}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="eyebrow inline-flex w-full items-center justify-center rounded-sm bg-[var(--text-signal)] px-control-x-l py-control-y-l text-ink-950 transition-transform duration-[var(--dur-1)] ease-[var(--ease-snap)] hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
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
