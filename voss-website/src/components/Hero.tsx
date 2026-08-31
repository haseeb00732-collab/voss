"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { igDirectMessage } from "@/lib/instagram";
import {
  CATALOGUE,
  HERO_IMAGE,
  offerEndsLabel,
  offerRunning,
  pricing,
} from "@/lib/catalogue";

/**
 * The hero, as a one-shot playthrough.
 *
 * WHAT THIS REPLACED, AND WHY. The previous hero was a 48-frame AVIF sequence
 * scrubbed against a two-viewport pin, with its copy shipped at `opacity: 0`.
 * Both faults had one symptom: on landing the page was a near-black rectangle
 * with no headline, no price and no button, and it stayed that way until you
 * scrolled. The old poster was a 10.8KB 1920x1080 video still — almost pure
 * black — so even the image gave you nothing. Every part of that is gone: no
 * pin, no scrub, no frame sequence, no travelling V mark, no runtime
 * measurement of the nav's logo slot.
 *
 * THE ONE RULE THAT MATTERS HERE (CLAUDE.md): server markup carries the FINAL
 * state. Everything below renders at full opacity, in position, from the
 * server. GSAP sets the start state in a layout effect — before paint, so
 * there is no flash — and if GSAP never runs, or JS is off, or the timeline
 * throws, the reader still gets a complete, readable hero. A trigger that
 * fails to fire must never be able to hide content.
 *
 * WHEN IT PLAYS. As soon as the things it animates are actually ready: fonts
 * loaded (a swap mid-animation reflows the text and you see the jump) and the
 * hero image decoded (a decode stall on frame one is the usual cause of a
 * janky first play). Both awaits are RACED AGAINST A 400ms TIMEOUT, because
 * `fonts.ready` and `decode()` are unbounded — on a cold connection they can
 * resolve long after the reader has scrolled away, and §5's own promise of a
 * sub-second hero cannot survive an unbounded gate. If the race times out the
 * timeline plays anyway; the worst case is a font swap, not a blank screen.
 *
 * A scroll past 48px force-finishes whatever is still running, so scrolling
 * during the playthrough can never strand an element half-revealed. The
 * timeline is otherwise on its own clock: scrolling never pauses, reverses or
 * restarts it, and it never re-fires.
 *
 * Total duration is ~950ms with the distance front-loaded — most of the travel
 * happens in the first 40%, then a long quiet settle. That is what makes
 * motion read as fast without actually being shorter. Nothing overshoots.
 */

const PLAY_MS = 950;
const READY_TIMEOUT = 400;

/** Split a string into per-character spans for a clip-mask rise.
 *
 *  Characters are grouped into WORDS first, and the word is the inline-block.
 *  Without that grouping the browser treats every character as its own
 *  inline-block and will happily break a line mid-word — the headline read
 *  "Carry it y / our way." until this was fixed.
 *
 *  Latin only. Arabic is cursive and joined, so splitting it per character
 *  breaks the shaping — Urdu reveals as a whole-word mask instead, and never
 *  appears in the hero at all. */
function chars(text: string) {
  return text.split(" ").map((word, w, all) => (
    <span key={w}>
      <span className="inline-block whitespace-nowrap">
        {word.split("").map((c, i) => (
          // The mask needs room for descenders — clipped tight to the line
          // box it cut the tail off every "y". The padding is cancelled by an
          // equal negative margin so the leading is unchanged.
          <span
            key={i}
            className="inline-block overflow-hidden align-bottom pb-[0.16em] -mb-[0.16em]"
          >
            <span data-hero-char className="inline-block">
              {c}
            </span>
          </span>
        ))}
      </span>
      {/* The gap is its own element. Trailing whitespace inside an
          inline-block is trimmed, which ran the words together. */}
      {w < all.length - 1 ? <span className="inline-block">&nbsp;</span> : null}
    </span>
  ));
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const dm = igDirectMessage();

  /* Price comes from the catalogue, never from a string in this file, so the
     hero and the cards cannot disagree about what a bag costs. All six are
     one price, so the first piece speaks for the range. */
  const price = pricing(CATALOGUE[0]);
  const running = offerRunning();
  const endsOn = offerEndsLabel();

  /* Start state, set before paint so the final-state markup never flashes. */
  useLayoutEffect(() => {
    if (reduced || !root.current) return;
    const el = root.current;
    const q = gsap.utils.selector(el);
    gsap.set(q("[data-hero-char]"), { yPercent: 110 });
    gsap.set(q("[data-hero-rise]"), { yPercent: 40, autoAlpha: 0 });
    gsap.set(q("[data-hero-plate]"), { scale: 1.08, autoAlpha: 0 });
  }, [reduced]);

  useEffect(() => {
    if (reduced || !root.current) return;
    const el = root.current;
    let tl: gsap.core.Timeline | null = null;
    let cancelled = false;

    const settle = () => {
      const promises: Promise<unknown>[] = [
        document.fonts?.ready ?? Promise.resolve(),
      ];
      const img = el.querySelector<HTMLImageElement>("[data-hero-plate] img");
      if (img) promises.push(img.decode().catch(() => undefined));
      // Unbounded promises get a hard cap; see the note at the top.
      return Promise.race([
        Promise.all(promises),
        new Promise((r) => setTimeout(r, READY_TIMEOUT)),
      ]);
    };

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);
      const chs = q("[data-hero-char]");
      const rises = q("[data-hero-rise]");
      const plate = q("[data-hero-plate]");
      const promoted = [...chs, ...rises, ...plate] as HTMLElement[];

      const play = () => {
        if (cancelled) return;
        promoted.forEach((n) => (n.style.willChange = "transform, opacity"));

        tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          onComplete: () => {
            // A permanently promoted layer softens text and edges.
            promoted.forEach((n) => (n.style.willChange = ""));
          },
        });

        /* Front-loaded: the headline covers its distance in the first ~40% of
           the run, everything after it is settle. Stagger keeps the count of
           simultaneously moving elements under 8 even though the headline is
           17 characters. */
        tl.to(chs, { yPercent: 0, duration: 0.6, stagger: 0.02 }, 0)
          .to(plate, { scale: 1, autoAlpha: 1, duration: 0.95 }, 0)
          .to(rises, { yPercent: 0, autoAlpha: 1, duration: 0.55, stagger: 0.08 }, 0.22);

        tl.totalDuration(PLAY_MS / 1000);
      };

      settle().then(play);

      /* Scrolling never drives the timeline — it only guarantees it finishes.
         If the reader is already past the hero there is nothing to watch, so
         jump it to the end rather than leaving anything mid-reveal. */
      const onScroll = () => {
        if (window.scrollY < 48) return;
        window.removeEventListener("scroll", onScroll);
        if (tl) tl.progress(1);
        else play();
      };
      window.addEventListener("scroll", onScroll, { passive: true, once: false });
      return () => window.removeEventListener("scroll", onScroll);
    }, el);

    return () => {
      cancelled = true;
      ctx.revert();
    };
  }, [reduced]);

  return (
    <section
      ref={root}
      id="top"
      data-surface="dark"
      className="substrate relative isolate overflow-hidden"
      aria-label="VOSS"
    >
      <div className="mx-auto grid min-h-[100svh] max-w-[120rem] grid-cols-12 items-center gap-x-gap-col gap-y-band px-gutter pt-28 pb-band lg:pt-24">
        {/* Type first in the DOM: it is the content, and on mobile it reads
            above the photograph rather than on top of it. */}
        <div className="col-span-12 lg:col-span-6 xl:col-span-5">
          <p data-hero-rise className="eyebrow text-gold-500">
            Handbags &middot; Lahore &middot; Cash on delivery
          </p>

          {/* aria-label carries the real sentence; the split spans are
              decoration and are hidden from assistive tech. */}
          <h1
            className="display-xl mt-group text-paper-50"
            aria-label="Carry it your way."
          >
            <span aria-hidden="true">{chars("Carry it your way.")}</span>
          </h1>

          <p data-hero-rise className="body-l measure-tight mt-band text-chalk">
            {running ? (
              <>
                Six bags at{" "}
                <span className="text-[var(--text-signal)]">{price.now}</span>
                {price.save ? ` — ${price.save} off` : null}
                {/* TODO [end date] — unconfirmed. `offerEndsLabel()` returns
                    an empty string until OFFER.endsOn is set, and this clause
                    disappears rather than printing a placeholder date. */}
                {endsOn ? `, until ${endsOn}` : null}. Cash when it lands in
                your hands.
              </>
            ) : (
              <>
                Six bags, one price,{" "}
                <span className="text-[var(--text-signal)]">{price.now}</span>.
                Cash when it lands in your hands.
              </>
            )}
          </p>

          <div data-hero-rise className="mt-band flex flex-wrap items-center gap-group">
            {/* Signal is reserved for price and the order CTA. The secondary
                action is a hairline, so only one accent is ever in view. */}
            {dm ? (
              <a
                href={dm}
                target="_blank"
                rel="noopener noreferrer"
                className="eyebrow inline-flex items-center justify-center rounded-xs bg-[var(--text-signal)] px-control-x-l py-control-y-l text-ink-950 transition-colors duration-[var(--dur-1)] ease-[var(--ease-lux)] hover:bg-signal-300"
              >
                Order on Instagram
              </a>
            ) : null}
            <a
              href="#bags"
              className="eyebrow inline-flex items-center justify-center rounded-xs border border-[var(--border-hairline)] px-control-x-l py-control-y-l text-paper-100 transition-colors duration-[var(--dur-1)] ease-[var(--ease-lux)] hover:border-gold-500 hover:text-gold-500"
            >
              See the bags
            </a>
          </div>
        </div>

        {/* The plate. NOT full-bleed and never wider than 440px: the source is
            540px across, so a full-bleed hero is the single fastest way to
            make this photography look broken. Framed on a hairline instead,
            which is also what makes six inconsistent backgrounds read as a
            set. */}
        <div className="col-span-12 lg:col-span-6 xl:col-span-6 xl:col-start-7">
          <div
            data-hero-plate
            className="relative mx-auto w-full max-w-[min(440px,86vw)] border border-[var(--border-hairline)] bg-ink-800 shadow-[var(--elev-3)]"
          >
            <Image
              src={HERO_IMAGE}
              alt="A grey croc-embossed VOSS shoulder bag with a gold padlock, photographed against a plain wall."
              width={540}
              height={694}
              priority
              fetchPriority="high"
              sizes="(min-width: 1024px) 440px, 86vw"
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
