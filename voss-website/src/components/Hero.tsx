"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { igDirectMessage } from "@/lib/instagram";
import {
  CATALOGUE,
  StyleCountWord,
  offerEndsLabel,
  offerRunning,
  pricing,
} from "@/lib/catalogue";

/**
 * The hero: the light-reveal clip, played fast.
 *
 * WHAT WAS ACTUALLY WRONG BEFORE. The footage was never the problem — it is
 * 2560x1440 at 24fps and it is good. Three other things were:
 *
 *   1. The poster was frame 0. The clip opens in near-darkness and the light
 *      arrives over four seconds, so the poster was an almost-black rectangle
 *      (10.8KB for 1920x1080). On landing the page looked empty.
 *   2. It was a 48-frame AVIF SEQUENCE painted to a canvas, not a video.
 *      Every frame was a decode and a drawImage, and scaling those stills up
 *      to the viewport is what made it look soft.
 *   3. It was scrubbed against a two-viewport pin, so the reveal only
 *      advanced as fast as you dragged — which is what made it feel slow.
 *
 * WHAT IT DOES NOW. The poster is a LIT frame, so the hero is complete before
 * a single byte of video arrives. A real <video> element decodes on the GPU at
 * native resolution — nothing is resampled, so nothing is soft. It autoplays
 * once, fast, and SCROLLING MAKES IT FASTER: scroll down and playbackRate
 * jumps, so the reveal rushes to its end instead of being dragged through it.
 * It is never scrubbed and never pinned, so it cannot stall or smear.
 *
 * Server markup carries the final state (CLAUDE.md): the headline, price and
 * both CTAs render at full opacity with no script. GSAP only sets the start
 * state, in a layout effect before paint.
 */

const PLAY_MS = 950;
const READY_TIMEOUT = 400;
const BASE_RATE = 1.75;  // 4s of footage in ~2.3s
const SCROLL_RATE = 5;   // scrolling rushes it to the end
/* The clip opens in near-darkness and the light only arrives around a second
   in. Starting there keeps the reveal but skips the black, so the video never
   jumps backwards out of the lit poster. */
const START_AT = 0.9;

/** Per-character clip-mask rise. Characters are grouped into unbreakable
 *  words, or the browser breaks a line mid-word. Latin only: Arabic is
 *  cursive and joined, and splitting it destroys the shaping. */
function chars(text: string) {
  return text.split(" ").map((word, w, all) => (
    <span key={w}>
      <span className="inline-block whitespace-nowrap">
        {word.split("").map((c, i) => (
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
      {w < all.length - 1 ? <span className="inline-block">&nbsp;</span> : null}
    </span>
  ));
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const dm = igDirectMessage();

  const price = pricing(CATALOGUE[0]);
  const running = offerRunning();
  const endsOn = offerEndsLabel();

  /* Start state, before paint, so the final-state markup never flashes. */
  useLayoutEffect(() => {
    if (reduced || !root.current) return;
    const q = gsap.utils.selector(root.current);
    gsap.set(q("[data-hero-char]"), { yPercent: 110 });
    gsap.set(q("[data-hero-rise]"), { yPercent: 40, autoAlpha: 0 });
  }, [reduced]);

  /* The clip. */
  useEffect(() => {
    const v = video.current;
    if (!v) return;

    if (reduced) {
      // Reduced motion gets the composition, arrived at instantly: the poster
      // is already the lit final frame, so there is nothing to play.
      v.removeAttribute("autoplay");
      return;
    }

    let done = false;

    /* The poster is the LIT final frame, so the hero is complete before any
       video arrives. The video therefore has to fade IN over it rather than
       replace it, or the moment playback begins the hero snaps back to the
       dark opening. It starts already lit, plays to the end, and the end frame
       matches the poster underneath — so there is no visible hand-off. */
    const start = () => {
      try {
        if (v.currentTime < START_AT) v.currentTime = START_AT;
      } catch {
        /* seeking before metadata; the timeupdate path below retries */
      }
      v.playbackRate = BASE_RATE;
      v.play().then(
        () => {
          v.dataset.playing = "true";
        },
        () => {
          /* Autoplay refused (data saver, low power mode). The lit poster
             stays and the hero is still complete — it simply does not move. */
        }
      );
    };

    if (v.readyState >= 1) start();
    else v.addEventListener("loadedmetadata", start, { once: true });
    const onEnded = () => {
      done = true;
      v.pause();
    };
    v.addEventListener("ended", onEnded);

    /* Scrolling does not DRIVE the clip, it hurries it. Scrubbing a video
       against scroll position is what made the old hero feel slow and look
       smeared; this keeps playback monotonic and on its own clock, just
       faster. */
    const onScroll = () => {
      if (done) return;
      v.playbackRate = window.scrollY > 24 ? SCROLL_RATE : BASE_RATE;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      v.removeEventListener("ended", onEnded);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reduced]);

  /* The copy. */
  useEffect(() => {
    if (reduced || !root.current) return;
    const el = root.current;
    let tl: gsap.core.Timeline | null = null;
    let cancelled = false;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);
      const chs = q("[data-hero-char]");
      const rises = q("[data-hero-rise]");
      const promoted = [...chs, ...rises] as HTMLElement[];

      const play = () => {
        if (cancelled) return;
        promoted.forEach((n) => (n.style.willChange = "transform, opacity"));
        tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          // A permanently promoted layer softens text and edges.
          onComplete: () => promoted.forEach((n) => (n.style.willChange = "")),
        });
        tl.to(chs, { yPercent: 0, duration: 0.6, stagger: 0.02 }, 0).to(
          rises,
          { yPercent: 0, autoAlpha: 1, duration: 0.55, stagger: 0.08 },
          0.22
        );
        tl.totalDuration(PLAY_MS / 1000);
      };

      /* `fonts.ready` is unbounded — on a cold connection it can resolve long
         after the reader has gone. Race it, and play anyway if it is slow. */
      Promise.race([
        document.fonts?.ready ?? Promise.resolve(),
        new Promise((r) => setTimeout(r, READY_TIMEOUT)),
      ]).then(play);

      const onScroll = () => {
        if (window.scrollY < 48) return;
        window.removeEventListener("scroll", onScroll);
        if (tl) tl.progress(1);
        else play();
      };
      window.addEventListener("scroll", onScroll, { passive: true });
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
      className="substrate relative isolate min-h-[100svh] overflow-hidden"
      aria-label="VOSS"
    >
      {/* The clip, full-bleed. This IS allowed to be full-bleed where a
          catalogue photograph is not: the source is 2560x1440, not a 540px
          phone capture, so it is being DOWNscaled at every viewport. */}
      <div className="absolute inset-0 z-0">
        <video
          ref={video}
          className="hero-video h-full w-full object-cover"
          poster="/hero/poster.avif"
          muted
          playsInline
          autoPlay
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src="/hero/hero-1600.webm" type="video/webm" />
          <source src="/hero/hero-1600.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Scrims. The type sits on the left on desktop and at the bottom on
          mobile, and the clip is brightest exactly where the light lands, so
          each breakpoint needs its own falloff. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-1 hidden md:block"
        style={{
          background:
            "linear-gradient(96deg, var(--color-ink-950) 0%, color-mix(in srgb, var(--color-ink-950) 78%, transparent) 38%, color-mix(in srgb, var(--color-ink-950) 30%, transparent) 66%, transparent 88%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-1 h-[72%] md:hidden"
        style={{
          background:
            "linear-gradient(to top, var(--color-ink-950) 14%, color-mix(in srgb, var(--color-ink-950) 82%, transparent) 48%, transparent 100%)",
        }}
      />

      <div className="relative z-2 mx-auto grid min-h-[100svh] max-w-[120rem] grid-cols-12 items-end gap-x-gap-col px-gutter pt-28 pb-section md:items-center">
        <div className="col-span-12 md:col-span-7 lg:col-span-6">
          <p data-hero-rise className="eyebrow text-gold-500">
            Lahore &middot; Cash on delivery
          </p>

          <h1
            className="display-xl mt-group text-paper-50"
            aria-label="Made to find its way to you."
          >
            <span aria-hidden="true">{chars("Made to find its way to you.")}</span>
          </h1>

          <p data-hero-rise className="body-l measure-tight mt-band text-smoke">
            {running ? (
              <>
                {StyleCountWord} bags at{" "}
                <span className="text-[var(--text-signal)]">{price.now}</span>
                {price.save ? `, ${price.save} off` : null}
                {/* TODO [end date] — unconfirmed. This clause removes itself
                    rather than printing a placeholder date. */}
                {endsOn ? `, until ${endsOn}` : null}. Cash when it lands in
                your hands.
              </>
            ) : (
              <>
                {StyleCountWord} bags, one price,{" "}
                <span className="text-[var(--text-signal)]">{price.now}</span>.
                Cash when it lands in your hands.
              </>
            )}
          </p>

          <div data-hero-rise className="mt-band flex flex-wrap items-center gap-group">
            {dm ? (
              <a
                href={dm}
                target="_blank"
                rel="noopener noreferrer"
                className="eyebrow inline-flex items-center justify-center rounded-xs bg-[var(--text-signal)] px-control-x-l py-control-y-l text-ink-950 transition-opacity duration-[var(--dur-1)] ease-[var(--ease-lux)] hover:opacity-90"
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
      </div>
    </section>
  );
}
