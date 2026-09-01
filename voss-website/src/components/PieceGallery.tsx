"use client";

import { hdImage, hdSrcSet, type Piece } from "@/lib/catalogue";

/**
 * Every colour of one bag, on its product page.
 *
 * PHONE FIRST: a horizontal scroll-snap rail. Six tall photographs stacked
 * vertically on a 390px screen is roughly four thumb-flicks of scrolling
 * before she reaches the order button, and the colours stop being comparable
 * the moment two of them cannot be on screen together. A rail keeps them side
 * by side, keeps the page short, and matches how she already swipes an
 * Instagram carousel. It uses NATIVE overflow scrolling, so momentum, the
 * scrollbar and keyboard paging all behave the way the platform does.
 *
 * At `md` and up there is room to lay them out properly, so the rail becomes
 * a grid and nothing is hidden off-screen.
 *
 * The reveal runs on `animation-timeline: view()`, like the cards on the home
 * page, so there is no scroll listener and no observer. Under
 * `prefers-reduced-motion`, or in a browser without scroll-driven animations,
 * the photographs simply render in place.
 *
 * Each frame is labelled with its colour NAME, not just shown in it. A swatch
 * cannot be typed into a DM.
 */
export function PieceGallery({ piece }: { piece: Piece }) {
  if (piece.colourways.length < 2) return null;

  return (
    <section
      data-surface="dark"
      className="relative py-section"
      aria-labelledby="gallery-title"
    >
      <div className="mx-auto max-w-[120rem] px-gutter">
        <h2
          id="gallery-title"
          className="display-m max-w-[24ch] text-[var(--text-primary)]"
        >
          Every colour it comes in
        </h2>

        <div className="rule-h mt-band w-full" />
      </div>

      {/* The rail bleeds to the screen edge on purpose: a card half-cut at the
          right edge is what tells her there is more to swipe. Padding is
          restored inside so the first frame still lines up with the page. */}
      <div
        className="gallery-rail mt-band flex snap-x snap-mandatory gap-gap-col overflow-x-auto px-gutter pb-4 md:mx-auto md:grid md:max-w-[120rem] md:grid-cols-3 md:gap-y-band md:overflow-visible md:pb-0 lg:grid-cols-4"
        role="list"
      >
        {piece.colourways.map((c, i) => (
          <figure
            key={c.name}
            role="listitem"
            className="gallery-item w-[74vw] max-w-[22rem] shrink-0 snap-start md:w-auto md:max-w-none"
            style={{ "--i": i } as React.CSSProperties}
          >
            <div className="plate relative aspect-[4/5] overflow-hidden">
              <img
                src={hdImage(piece, c.image)}
                srcSet={hdSrcSet(piece, c.image)}
                sizes="(max-width: 768px) 74vw, (max-width: 1024px) 30vw, 23vw"
                alt={`The ${piece.name} in ${c.name}`}
                width={1792}
                height={2400}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <figcaption className="mt-item flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-4 shrink-0 rounded-full"
                style={{
                  backgroundColor: c.hex,
                  boxShadow: "inset 0 0 0 1px rgb(255 255 255 / 0.2)",
                }}
              />
              <span className="caption text-[var(--text-primary)]">{c.name}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
