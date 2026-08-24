"use client";

import { useEffect, type RefObject } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** tan(31°) — the complement of `--angle-vee`, and the only other diagonal. */
const DIAGONAL = 0.6009;

/**
 * The substrate change, as one hard edge travelling at 31°.
 *
 * The marquee uses this to take the vitrine away and reveal paper beneath.
 * `mode: "advance"` (the mirror image, covering rather than uncovering) is
 * kept for the next section that needs a tonal change to go the other way.
 *
 * A wipe rather than the cross-dissolve the design doc specifies, because a
 * dissolve puts mid-grey type on a mid-grey ground for the middle second of
 * the transition. Here every pixel is either fully one substrate or fully the
 * other, so the gold can invert across the edge exactly as §1.3 requires and
 * nothing is ever half-legible.
 *
 * @param mode `retreat` uncovers what is beneath as you scroll down;
 *             `advance` covers it.
 */
export function useDiagonalWipe(
  section: RefObject<HTMLElement | null>,
  layer: RefObject<HTMLElement | null>,
  mode: "retreat" | "advance",
  enabled = true
) {
  useEffect(() => {
    const root = section.current;
    const el = layer.current;
    if (!root || !el || !enabled) return;

    const wipe = (raw: number) => {
      const p = mode === "retreat" ? raw : 1 - raw;
      const h = root.offsetHeight;
      const drop = root.offsetWidth * DIAGONAL;
      // Travelling from fully below the box to fully above it. Both vertices
      // move the same distance, which holds the edge at a constant angle.
      const yTop = h - p * (h + drop);
      el.style.clipPath = `polygon(0px 0px, 100% 0px, 100% ${yTop + drop}px, 0px ${yTop}px)`;
    };

    const st = ScrollTrigger.create({
      trigger: root,
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
      invalidateOnRefresh: true,
      onRefresh: (self) => wipe(self.progress),
      onUpdate: (self) => wipe(self.progress),
    });

    return () => {
      st.kill();
      el.style.clipPath = "";
    };
  }, [section, layer, mode, enabled]);
}
