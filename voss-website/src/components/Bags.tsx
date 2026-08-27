"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CATALOGUE, pieceImages, priceLabel, type Piece } from "@/lib/catalogue";
import { waLink } from "@/lib/whatsapp";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Section 2 — THE BAGS. Built to VOSS-SECTION-BRIEF.md.
 *
 * ONE interaction system, not six. The brief's own warning is that combining
 * every effect reads cheap, so this commits to a single idea: a fixed stage
 * with the bag held at a constant size, and the six variants swapped beneath
 * a crossfade. Nothing tilts, nothing floats, nothing follows the cursor.
 * The bag is the only thing that moves, and it only ever dissolves.
 *
 * Why a stage rather than a grid: the six pieces were photographed in six
 * different rooms at six different exposures. Side by side that reads as six
 * screenshots. One at a time, at one size, in one frame, it reads as a
 * campaign.
 *
 * Proportions are preserved by giving the stage a fixed aspect ratio and
 * letting every image `object-cover` into it, so switching never reflows.
 *
 * PRICE: `priceLabel` returns null while prices are unconfirmed and the row
 * simply does not render. The brief forbids a placeholder, and section 5
 * sells "the price is on the page" as the promise, so "Inquire" would break
 * the brand claim rather than fill a gap.
 */
export function Bags() {
  const reduced = useReducedMotion();

  // per-card state lives in BagCard; this section only lays them out.

  return (
    <section
      id="bags"
      data-surface="dark"
      className="substrate relative py-section"
      aria-label="The bags"
    >
      <div className="mx-auto max-w-[120rem] px-gutter">
        <div className="grid grid-cols-12 items-end gap-x-gap-col">
          <h2 className="display-l col-span-12 text-[var(--text-primary)] md:col-span-6">
            The bags
          </h2>
          <p className="body-s col-span-12 mt-group text-[var(--text-secondary)] md:col-span-4 md:col-start-9 md:mt-0 md:text-right">
            Six bags. Cash on delivery.
          </p>
        </div>

        <div className="rule-h mt-band w-full" />

        {/* All six, each with its own colourways. A single-bag stage hid five
            of the six behind a click; the shop is the page's actual job. */}
        <div className="mt-band grid grid-cols-1 gap-x-gap-col gap-y-band sm:grid-cols-2 lg:grid-cols-3">
          {CATALOGUE.map((p, i) => (
            <BagCard key={p.slug} piece={p} index={i} reduced={reduced} />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * One bag. Its colour chips select one of ITS OWN photographs, and each chip's
 * colour is sampled from the photograph it selects, so a chip can never
 * describe a picture it does not show. State is per-card so six cards can be
 * on screen at once without fighting over a shared index.
 */
function BagCard({ piece, index, reduced }: { piece: Piece; index: number; reduced: boolean }) {
  const [shot, setShot] = useState(0);
  const shots = pieceImages(piece);
  const i = Math.min(shot, shots.length - 1);
  const price = priceLabel(piece.price);
  const wa = waLink({ piece: piece.name ?? piece.label, slug: piece.slug });

  return (
    <article className="group">
      <Link href={`/collection/${piece.slug}`} className="block">
        <div className="plate relative aspect-[3/4] overflow-hidden">
          <Image
            key={i}
            src={shots[i]}
            alt={`The ${piece.name ?? piece.label}, ${piece.silhouette.toLowerCase()}, front view`}
            fill
            priority={index < 2}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={reduced ? "object-cover" : "voss-dissolve object-cover"}
          />
        </div>
      </Link>

      <div className="mt-item flex items-baseline justify-between gap-group">
        <Link href={`/collection/${piece.slug}`} className="display-s text-[var(--text-primary)]">
          {piece.name ?? piece.label}
        </Link>
        {price && <span className="price text-[1.0625rem]">{price}</span>}
      </div>

      <p className="caption mt-tight text-[var(--text-secondary)]">{piece.note}</p>

      {shots.length > 1 && (
        <div
          role="radiogroup"
          aria-label={`Colour, ${piece.name ?? piece.label}`}
          className="mt-item flex flex-wrap items-center gap-3"
        >
          {shots.map((_, n) => {
            const on = n === i;
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={`Colour ${n + 1} of ${shots.length}`}
                onClick={() => setShot(n)}
                className="relative h-7 w-7 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-300"
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-0 rounded-full transition-transform duration-[var(--dur-2)] ease-[var(--ease-lux)] ${
                    on ? "scale-100" : "scale-[0.78] hover:scale-95"
                  }`}
                  style={{
                    backgroundColor: piece.colourways[n] ?? "#333",
                    boxShadow: "inset 0 0 0 1px rgb(255 255 255 / 0.18)",
                  }}
                />
                <span
                  aria-hidden="true"
                  className={`absolute -inset-[4px] rounded-full ring-1 transition-opacity duration-[var(--dur-2)] ${
                    on ? "opacity-100 ring-gold-500" : "opacity-0 ring-transparent"
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}

      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="eyebrow mt-item inline-block text-[var(--text-secondary)] transition-colors duration-[var(--dur-1)] hover:text-gold-500"
        >
          Ask on WhatsApp
        </a>
      )}
    </article>
  );
}
