"use client";

import { useEffect, useRef } from "react";
import { pricing, type Piece } from "@/lib/catalogue";

/**
 * The price, and the one move it makes.
 *
 * Rs 6,000 is already on screen when the card arrives. A 1px rule then wipes
 * through it left to right over 400ms, and at 60% of that wipe — while it is
 * still travelling — Rs 4,500 rises underneath on a per-character clip mask in
 * the signal colour. The two overlap, so it reads as one gesture rather than
 * two events.
 *
 * ONCE PER SESSION PER CARD. It is a way of showing the discount, not a way of
 * nagging: sessionStorage remembers which cards have played, so scrolling back
 * up the page does not replay six of them. No pulse, no flash, no badge, and
 * nothing loops.
 *
 * FAILURE MODE IS THE FINAL STATE. If the observer never fires, if
 * sessionStorage throws (private mode, blocked storage), or if the reader
 * prefers reduced motion, the row renders already-struck and already-red. The
 * price can never be mid-transition and unreadable, and the struck price is
 * never left looking like the price she pays.
 */

const SEEN_KEY = "voss:price-seen";

function seenThisSession(slug: string): boolean {
  try {
    const raw = sessionStorage.getItem(SEEN_KEY);
    return raw ? (JSON.parse(raw) as string[]).includes(slug) : false;
  } catch {
    // Storage blocked. Treat as seen: showing the settled state is always
    // safe, replaying it on every scroll is not.
    return true;
  }
}

function markSeen(slug: string) {
  try {
    const raw = sessionStorage.getItem(SEEN_KEY);
    const list = raw ? (JSON.parse(raw) as string[]) : [];
    if (!list.includes(slug)) {
      list.push(slug);
      sessionStorage.setItem(SEEN_KEY, JSON.stringify(list));
    }
  } catch {
    /* nothing to do; the animation simply may replay next session */
  }
}

export function PriceRow({ piece, reduced }: { piece: Piece; reduced: boolean }) {
  const price = pricing(piece);
  const root = useRef<HTMLParagraphElement>(null);

  /* The play state is a DOM attribute, not React state.
     It starts as "done" in the server markup — the settled, correct price —
     and the effect below only ever arms it on the client. Driving it through
     useState would mean calling setState synchronously inside an effect,
     which cascades a second render of every card on mount for something that
     is purely presentational. This is the case effects are actually for:
     writing to an external system, here the DOM. */
  useEffect(() => {
    const el = root.current;
    if (!el || reduced || !price.was) return;
    if (seenThisSession(piece.slug)) return;

    el.dataset.priceState = "armed";

    const go = () => {
      markSeen(piece.slug);
      el.dataset.priceState = "playing";
    };

    /* Fire the moment ANY part of the row is on screen.
       This started life at `rootMargin: -40%` so the price would rise past
       60% of the viewport, and that was wrong in a way that mattered: the row
       was fully visible while still armed, which renders Rs 6,000 with no
       strike through it and no Rs 4,500 beside it. For the seconds before the
       trigger, the page was quoting the list price as if it were the price
       she pays. A discount animation is never worth showing the wrong number. */
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io.disconnect();
          go();
        }
      },
      { threshold: 0.01 }
    );
    io.observe(el);

    /* Belt and braces: if the observer never fires — a browser quirk, a
       display:none ancestor, anything — settle anyway rather than leaving the
       wrong price on screen indefinitely. */
    const failsafe = setTimeout(() => {
      io.disconnect();
      go();
    }, 1500);

    return () => {
      io.disconnect();
      clearTimeout(failsafe);
    };
  }, [reduced, piece.slug, price.was]);

  // No offer running: one number, no strike, no theatre.
  if (!price.was) {
    return (
      <p className="price-row mt-tight">
        <span className="price text-[1.0625rem] text-[var(--text-primary)]">
          {price.now}
        </span>
      </p>
    );
  }

  return (
    <p ref={root} className="price-row mt-tight" data-price-state="done">
      <span className="price-was">
        <span className="price-was-figure">{price.was}</span>
        <span aria-hidden="true" className="price-strike" />
      </span>

      <span className="price-now">
        {/* Per-character mask so the new number rises rather than fading in.
            aria-label carries it as one string; the split is decoration. */}
        <span className="sr-only">{price.now}</span>
        <span aria-hidden="true" className="price-now-chars">
          {(price.now ?? "").split("").map((c, i) => (
            <span key={i} className="price-char-mask">
              <span
                className="price-char"
                style={{ "--n": i } as React.CSSProperties}
              >
                {c === " " ? " " : c}
              </span>
            </span>
          ))}
        </span>
      </span>
    </p>
  );
}
