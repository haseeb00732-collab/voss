"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  CATALOGUE,
  colourwayImage,
  colourwaySrcSet,
  offerEndsLabel,
  offerRunning,
  type Piece,
} from "@/lib/catalogue";
import { igDirectMessage, orderReference } from "@/lib/instagram";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { PriceRow } from "./PriceRow";
import { PointerTilt } from "./PointerTilt";

/**
 * Section 2 — THE BAGS.
 *
 * PHONE FIRST, AND NOT AS A FIGURE OF SPEECH. She arrives from an Instagram
 * link on a phone, so 390px is the design, and the desktop grid is the
 * variation. Everything that decides a sale — the photograph, the price, the
 * colour she wants, the button that opens the DM — is sized and spaced for a
 * thumb before a single desktop rule is written.
 *
 * WHAT THE MOTION RUNS ON. There is no scroll listener here any more. Card
 * arrival, the counter-move inside the frame, the meta rise and the light
 * travelling down the column are all `animation-timeline: view()` — the
 * compositor drives them off the scroll position directly. The previous
 * version measured six cards on every frame from a rAF-batched listener,
 * which is main-thread work a mid-range Android does not have to spare. It is
 * all behind `@supports` and `prefers-reduced-motion`: where either fails the
 * cards render finished and fully legible.
 *
 * THE GRID. One aspect ratio for all six, always. The six styles were shot in
 * six different rooms, and a shared frame is what makes them read as a set
 * rather than as six screenshots. What varies is column span and vertical
 * offset, and only at `lg` and above — a broken grid needs width to read as
 * deliberate, and at 390px it would just look misaligned.
 */

/* Column span and vertical offset per card, desktop only. Six identical
   tiles in three neat columns is the layout that makes a shop look like a
   template; this staggers them against a 12-column grid so the eye moves
   down the page instead of scanning rows. */
const DESKTOP_LAYOUT = [
  "lg:col-span-5 lg:col-start-1",
  "lg:col-span-4 lg:col-start-7 lg:mt-[7rem]",
  "lg:col-span-4 lg:col-start-2 lg:-mt-[3rem]",
  "lg:col-span-5 lg:col-start-7 lg:mt-[2rem]",
  "lg:col-span-4 lg:col-start-1 lg:mt-[1rem]",
  "lg:col-span-5 lg:col-start-6 lg:mt-[5rem]",
];

/** One line per bag, 8 words or fewer, assigned by silhouette. */
const USE_LINE: Record<string, string> = {
  afsun: "The one that goes with everything.",
  gulnaar: "Fits what a workday actually needs.",
  naubahar: "Built for a full day, not a photo.",
  dilara: "Everyday, everywhere it needs to go.",
  mahrooh: "Weekend bag. Doesn't act like a suitcase.",
  meher: "Small enough for a night out.",
};

export function Bags() {
  const reduced = useReducedMotion();
  const running = offerRunning();
  const endsOn = offerEndsLabel();

  return (
    <section
      id="bags"
      data-surface="dark"
      className="relative py-section"
      aria-label="The bags"
    >
      <div className="mx-auto max-w-[120rem] px-gutter">
        {/* Stacked, not split. A big headline on the left with a small
            paragraph floating top-right is the section header every generated
            site ships. */}
        <div className="max-w-[34ch]">
          <h2 className="display-l text-[var(--text-primary)]">The bags</h2>
          <p className="body-s mt-group text-[var(--text-secondary)]">
            {running ? (
              <>
                Rs 6,000 each,{" "}
                <span className="text-[var(--text-primary)]">
                  Rs 4,500 today{endsOn ? ` until ${endsOn}` : ""}
                </span>
                . Pick a colour, message us, pay the rider.
              </>
            ) : (
              <>Rs 6,000 each. Pick a colour, message us, pay the rider.</>
            )}
          </p>
        </div>

        <div className="rule-h mt-band w-full" />

        <div className="mt-band grid grid-cols-1 gap-x-gap-col gap-y-section sm:grid-cols-2 lg:grid-cols-12 lg:gap-y-0">
          {CATALOGUE.map((p, i) => (
            <BagCard
              key={p.slug}
              piece={p}
              index={i}
              reduced={reduced}
              className={DESKTOP_LAYOUT[i] ?? ""}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function BagCard({
  piece,
  index,
  reduced,
  className,
}: {
  piece: Piece;
  index: number;
  reduced: boolean;
  className: string;
}) {
  const [shot, setShot] = useState(0);
  const colourways = piece.colourways;
  const i = Math.min(shot, colourways.length - 1);
  const current = colourways[i];
  const dm = igDirectMessage();

  return (
    <article className={`bag-card group ${className}`}>
      <Link href={`/collection/${piece.slug}`} className="block">
        {/* PointerTilt is separable by design: delete it and the card still
            reads as finished. It attaches nothing on touch. */}
        <PointerTilt>
          <div className="bag-frame plate relative aspect-[4/5] overflow-hidden">
            <div className="bag-shot absolute inset-0">
              <img
                key={i}
                src={colourwayImage(piece, current)}
                srcSet={colourwaySrcSet(piece, current)}
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 38vw"
                alt={`The ${piece.name} in ${current.name}, ${piece.silhouette.toLowerCase()}, front view`}
                width={1792}
                height={2400}
                loading={index < 2 ? "eager" : "lazy"}
                fetchPriority={index < 2 ? "high" : "auto"}
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ viewTransitionName: `bag-${piece.slug}` }}
              />
            </div>

            {/* The light travelling the column. One scrim, opacity only. */}
            <div aria-hidden="true" className="bag-scrim absolute inset-0" />
            {/* The falloff that makes six backgrounds sit in one set. */}
            <div aria-hidden="true" className="bag-vignette absolute inset-0" />
            {/* The light origin under a pointer. Desktop only. */}
            <div aria-hidden="true" className="bag-glare absolute inset-0" />
          </div>
        </PointerTilt>
      </Link>

      <div className="bag-meta mt-item">
        {/* Name and price on one line, the way a price tag reads. */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-group gap-y-tight">
          <Link
            href={`/collection/${piece.slug}`}
            className="display-s text-[var(--text-primary)]"
          >
            {piece.name}
          </Link>
          <PriceRow piece={piece} reduced={reduced} />
        </div>

        <p className="caption mt-tight text-[var(--text-secondary)]">
          {USE_LINE[piece.slug] ?? piece.note}
        </p>

        {colourways.length > 1 && (
          <div
            role="radiogroup"
            aria-label={`Colour, ${piece.name}`}
            className="mt-group flex flex-wrap items-center gap-x-4 gap-y-2"
          >
            {colourways.map((c, n) => {
              const on = n === i;
              return (
                <button
                  key={c.name}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setShot(n)}
                  /* min-h-11 is a thumb, not a mouse. 44px is the smallest
                     target a finger hits reliably, and these six sit close
                     together. */
                  className="group/chip -mx-1 flex min-h-11 items-center gap-2 px-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
                >
                  <span className="relative block size-6 shrink-0">
                    <span
                      aria-hidden="true"
                      className={`absolute inset-0 rounded-full transition-transform duration-[var(--dur-2)] ease-[var(--ease-lux)] ${
                        on ? "scale-100" : "scale-[0.76] group-hover/chip:scale-95"
                      }`}
                      style={{
                        backgroundColor: c.hex,
                        boxShadow: "inset 0 0 0 1px rgb(255 255 255 / 0.18)",
                      }}
                    />
                    <span
                      aria-hidden="true"
                      className={`absolute -inset-[4px] rounded-full ring-1 transition-opacity duration-[var(--dur-2)] ${
                        on ? "opacity-100 ring-gold-500" : "opacity-0 ring-transparent"
                      }`}
                    />
                  </span>
                  {/* The name rides with the chip, always. Colour alone fails
                      anyone who cannot separate olive from chocolate at this
                      size, and she cannot type a swatch into a DM. */}
                  <span
                    className={`caption transition-colors duration-[var(--dur-1)] ${
                      on
                        ? "text-[var(--text-primary)]"
                        : "text-[var(--text-secondary)]"
                    }`}
                  >
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {dm && <OrderCta piece={piece} colourway={current.name} href={dm} />}
      </div>
    </article>
  );
}

/**
 * Instagram cannot prefill a message, so this is two affordances rather than
 * one: the link that opens the thread, and the line she pastes into it.
 * Without the second she lands in an empty box and the reply starts with
 * "which one?".
 *
 * On a phone the link is a full-width bar. A text link the width of its own
 * label is a small target at the exact moment she has decided to buy.
 */
function OrderCta({
  piece,
  colourway,
  href,
}: {
  piece: Piece;
  colourway: string;
  href: string;
}) {
  const [copied, setCopied] = useState(false);
  const reference = orderReference({
    piece: piece.name,
    slug: piece.slug,
    colourway,
  });

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked. The link still works and the reference is on screen.
      setCopied(false);
    }
  }, [reference]);

  return (
    <div className="mt-group flex flex-col gap-tight sm:flex-row sm:items-center sm:gap-group">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="eyebrow inline-flex min-h-11 items-center justify-center rounded-xs border border-[var(--text-signal)] px-control-x py-control-y text-[var(--text-signal)] transition-colors duration-[var(--dur-1)] ease-[var(--ease-lux)] hover:bg-[var(--text-signal)] hover:text-ink-950 sm:min-h-0"
      >
        Order on Instagram
      </a>
      <button
        type="button"
        onClick={copy}
        className="eyebrow inline-flex min-h-11 items-center text-[var(--text-secondary)] underline underline-offset-4 transition-colors duration-[var(--dur-1)] hover:text-[var(--text-primary)] sm:min-h-0"
      >
        {copied ? "Copied" : "Copy your message"}
      </button>
    </div>
  );
}
