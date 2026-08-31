"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CATALOGUE,
  colourwayImage,
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
 * Six cards, one price, one frame. The six styles were photographed in six
 * different rooms at six different exposures; what makes them read as a set
 * rather than six screenshots is that every card shares ONE aspect ratio, one
 * crop rule, one plate and one vignette. No per-image tuning — that would
 * reintroduce exactly the inconsistency the frame is hiding.
 *
 * FOUR MOTION SYSTEMS, ONE SCROLL WRITER.
 *
 *   a. Light travels the column. `--light-y` tracks the section's own scroll
 *      progress; each card's `--lit` is its nearness to that light, and the
 *      scrim over its photograph fades out as the light arrives. This is
 *      opacity on one element — NOT a second "lit grade" AVIF per bag. Two
 *      files per bag would double the image payload of the page's heaviest
 *      section and require a second grading pass over photography that is
 *      currently placeholder and being reshot. Same read, no extra bytes.
 *
 *   b. Arrival, not appearance. ~24px of travel with a whisper of overshoot,
 *      settled inside 420ms, 60ms apart — bags set down one after another
 *      rather than six things fading in together.
 *
 *   c. Velocity counter-drift. Alternating rows lag the scroll by up to 12px
 *      and spring back to zero at rest. Hard-clamped, and this is the only
 *      place in the site that reads scroll velocity.
 *
 *   d. Clip-path reveal. The frame opens and the photograph inside
 *      counter-moves, so the picture arrives at rest instead of sliding.
 *
 * Every one of them writes only `transform`, `opacity` or a custom property,
 * from a SINGLE rAF-batched scroll listener. There are no per-card scroll
 * handlers and nothing touches layout during a scroll.
 *
 * The pointer layer (§6e) is `PointerTilt` and is deliberately separable:
 * delete that one component and a-d still read as finished. Touch gets
 * nothing extra.
 */
export function Bags() {
  const reduced = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  /* THE ONE SCROLL WRITER.
     Runs at most once per frame, reads layout in a single pass, then writes.
     Everything scroll-derived on this section goes through here. */
  useEffect(() => {
    if (reduced || !section.current) return;
    const el = section.current;
    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-bag-card]"));
    if (!cards.length) return;
    let frame = 0;
    let lastY = window.scrollY;
    let velocity = 0;
    const last = cards.map(() => ({ lit: "", drift: "" }));
    const write = () => {
      frame = 0;
      const y = window.scrollY;
      const raw = y - lastY;
      lastY = y;
      // Spring toward the live velocity, then clamp hard. Unclamped this
      // turns a flick into a jump.
      velocity += (raw - velocity) * 0.2;
      const drift = Math.max(-12, Math.min(12, velocity * 0.6));
      /* READ PHASE. Every rect is measured before a single style is written.
         Interleaving them forces a synchronous layout per card — six per
         frame — and that alone was enough to stall the renderer. */
      const vh = window.innerHeight;
      const rect = el.getBoundingClientRect();
      const boxes = cards.map((c) => c.getBoundingClientRect());
      /* WRITE PHASE. Custom properties only; CSS owns the transforms. */
      // 0 when the section's top reaches the viewport bottom, 1 when its
      // bottom reaches the top: the light's travel down the column.
      const progress = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)));
      el.style.setProperty("--light-y", progress.toFixed(3));
      for (let i = 0; i < cards.length; i++) {
        const box = boxes[i];
        const centre = (box.top + box.height / 2) / vh; // 0 = top of screen
        // Nearness to the light band, falling off over roughly half a screen.
        const lit = Math.max(0, 1 - Math.abs(centre - 0.5) * 2.1);
        // Alternating rows lag opposite ways.
        const d = i % 2 ? -drift : drift;
        /* Guarded. Writing an identical value still costs a style recalc, and
           this runs on every scroll frame across six cards. Quantising also
           means a slow drag repaints a card a handful of times rather than
           once per sub-pixel. */
        const litStr = lit.toFixed(2);
        const dStr = `${d.toFixed(1)}px`;
        if (last[i].lit !== litStr) {
          last[i].lit = litStr;
          cards[i].style.setProperty("--lit", litStr);
        }
        if (last[i].drift !== dStr) {
          last[i].drift = dStr;
          cards[i].style.setProperty("--drift", dStr);
        }
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(write);
    };
    write();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced]);
  /* Arrival. One observer for all six rather than six observers, and it
     disconnects each card once it has arrived — nothing re-animates. */
  useEffect(() => {
    if (reduced || !section.current) return;
    const cards = section.current.querySelectorAll<HTMLElement>("[data-bag-card]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.arrived = "true";
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 }
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [reduced]);
  const running = offerRunning();
  const endsOn = offerEndsLabel();
  return (
    <section
      ref={section}
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
          {/* "Save Rs 1,500" belongs here and in nothing else — three price
              elements on every card is clutter at 390px. */}
          <p className="body-s col-span-12 mt-group text-[var(--text-secondary)] md:col-span-5 md:col-start-8 md:mt-0 md:text-right">
            {running ? (
              <>
                Rs 6,000 each.{" "}
                <span className="text-[var(--text-primary)]">
                  Rs 4,500{endsOn ? ` until ${endsOn}` : ""}
                </span>
                . Pick a colour, message us, pay the rider.
              </>
            ) : (
              <>Rs 6,000 each. Pick a colour, message us, pay the rider.</>
            )}
          </p>
        </div>
        <div className="rule-h mt-band w-full" />
        <div className="mt-band grid grid-cols-1 gap-x-gap-col gap-y-section sm:grid-cols-2 lg:grid-cols-3">
          {CATALOGUE.map((p, i) => (
            <BagCard key={p.slug} piece={p} index={i} reduced={reduced} />
          ))}
        </div>
      </div>
    </section>
  );
}
/** One line per bag, ≤8 words. Assigned by silhouette, not forced. */
const USE_LINE: Record<string, string> = {
  afsun: "The one that goes with everything.",
  gulnaar: "Fits what a workday actually needs.",
  naubahar: "Built for a full day, not a photo.",
  dilara: "Everyday, everywhere it needs to go.",
  mahrooh: "Weekend bag. Doesn't act like a suitcase.",
  meher: "Small enough for a night out.",
};
function BagCard({
  piece,
  index,
  reduced,
}: {
  piece: Piece;
  index: number;
  reduced: boolean;
}) {
  const [shot, setShot] = useState(0);
  const colourways = piece.colourways;
  const i = Math.min(shot, colourways.length - 1);
  const current = colourways[i];
  const dm = igDirectMessage();
  return (
    <article
      data-bag-card
      className="group bag-card"
      style={{ "--stagger": `${index * 60}ms` } as React.CSSProperties}
    >
      <Link href={`/collection/${piece.slug}`} className="block">
        {/* The frame: ONE aspect ratio and one plate for all six. The reveal
            clips this box; the photograph inside counter-moves so it is at
            rest by the time the frame is open.
            PointerTilt is separable by design — remove it and a-d still read
            as finished. */}
        <PointerTilt>
        <div className="bag-frame plate relative aspect-[3/4] overflow-hidden">
          <div className="bag-shot absolute inset-0">
            <Image
              key={i}
              src={colourwayImage(piece, current)}
              alt={`The ${piece.name} in ${current.name}, ${piece.silhouette.toLowerCase()}, front view`}
              fill
              priority={index < 2}
              sizes="(max-width: 640px) min(100vw, 440px), 440px"
              className="object-cover"
              style={{ viewTransitionName: `bag-${piece.slug}` }}
            />
          </div>
          {/* (a) The light. One scrim, opacity only, no second asset. */}
          <div aria-hidden="true" className="bag-scrim absolute inset-0" />
          {/* The baked-in falloff that makes six backgrounds sit in one set. */}
          <div aria-hidden="true" className="bag-vignette absolute inset-0" />
          {/* (e) The light origin, following the pointer. Desktop only. */}
          <div aria-hidden="true" className="bag-glare absolute inset-0" />
        </div>
        </PointerTilt>
      </Link>
      <div className="bag-meta mt-item">
        <div className="flex items-baseline justify-between gap-group">
          <Link
            href={`/collection/${piece.slug}`}
            className="display-s text-[var(--text-primary)]"
          >
            {piece.name}
          </Link>
        </div>
        <PriceRow piece={piece} reduced={reduced} />
        <p className="caption mt-tight text-[var(--text-secondary)]">
          {USE_LINE[piece.slug] ?? piece.note}
        </p>
        {colourways.length > 1 && (
          <div
            role="radiogroup"
            aria-label={`Colour, ${piece.name}`}
            className="mt-item flex flex-wrap items-center gap-x-4 gap-y-3"
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
                  className="group/chip flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-300"
                >
                  <span className="relative block h-6 w-6 shrink-0">
                    <span
                      aria-hidden="true"
                      className={`absolute inset-0 rounded-full transition-transform duration-[var(--dur-2)] ease-[var(--ease-lux)] ${
                        on ? "scale-100" : "scale-[0.78] group-hover/chip:scale-95"
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
                  {/* The colour NAME, always, next to the chip. Colour is never
                      the only differentiator: it fails for anyone who cannot
                      separate olive from chocolate at 24px, and she cannot type
                      a swatch into a DM. */}
                  <span
                    className={`caption transition-colors duration-[var(--dur-1)] ${
                      on ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
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
 * Instagram cannot prefill a message, so the CTA is two affordances, not one:
 * the link that opens the thread, and the line she pastes into it. Without the
 * second, she lands in an empty box and the reply starts with "which one?".
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
      // Clipboard blocked (insecure context, or the browser said no). The link
      // still works and the reference is still on screen to read.
      setCopied(false);
    }
  }, [reference]);
  return (
    <div className="mt-group flex flex-wrap items-center gap-x-group gap-y-tight">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="eyebrow text-[var(--text-signal)] transition-opacity duration-[var(--dur-1)] hover:opacity-80"
      >
        Order on Instagram &rarr;
      </a>
      <button
        type="button"
        onClick={copy}
        className="eyebrow text-[var(--text-secondary)] underline underline-offset-4 transition-colors duration-[var(--dur-1)] hover:text-[var(--text-primary)]"
      >
        {copied ? "Copied" : "Copy your message"}
      </button>
    </div>
  );
}
