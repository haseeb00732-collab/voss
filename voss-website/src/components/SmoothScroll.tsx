"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { scheduleScrollRefresh } from "@/lib/scrollRefresh";

gsap.registerPlugin(ScrollTrigger);

/** Read by the marquee so it can lag behind the wheel. */
let velocity = 0;
export const scrollVelocity = () => velocity;

/**
 * Lenis, driven by GSAP's ticker rather than its own rAF loop.
 *
 * Two clocks reading two slightly different timestamps is what produces the
 * one-frame jitter between smoothed scroll and scrubbed animation, so the
 * ticker owns the frame and Lenis is stepped from inside it. `lagSmoothing(0)`
 * stops GSAP from silently swallowing a long frame, which would desync the
 * scrub from the scroll position it is supposed to track.
 */
export function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    const stopRefresh = scheduleScrollRefresh();

    // Lenis reads the media query itself, but being explicit means the
    // component's behaviour is legible without knowing that.
    if (reduced) return stopRefresh;

    const lenis = new Lenis({ lerp: 0.1, duration: 1.2 });

    const onScroll = () => {
      velocity = lenis.velocity;
      ScrollTrigger.update();
    };
    lenis.on("scroll", onScroll);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      velocity = 0;
      stopRefresh();
    };
  }, [reduced]);

  return null;
}
