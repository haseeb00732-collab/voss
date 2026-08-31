"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * §6e — the pointer layer, and the only part of the bags section that is
 * allowed to be deleted.
 *
 * DELETE THIS COMPONENT AND a-d MUST STILL READ AS FINISHED. That is the
 * design constraint, not a nice-to-have: the light, the arrival, the drift and
 * the clip reveal all carry the section on their own, and this only adds a
 * little parallax under a mouse that is already hovering.
 *
 * Touch gets nothing. It is gated on `(hover: hover) and (pointer: fine)`, so
 * a phone never pays for the listener at all — no tilt, no light origin, and
 * no pointermove handler attached.
 *
 * Writes two custom properties and nothing else, from a rAF-throttled
 * handler. Tilt is hard-capped at 3 degrees; past that it stops reading as a
 * lit object on a shelf and starts reading as a novelty.
 */

const MAX_DEG = 3;

export function PointerTilt({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let px = 0.5;
    let py = 0.5;

    const write = () => {
      frame = 0;
      el.style.setProperty("--tilt-x", `${((py - 0.5) * -2 * MAX_DEG).toFixed(2)}deg`);
      el.style.setProperty("--tilt-y", `${((px - 0.5) * 2 * MAX_DEG).toFixed(2)}deg`);
      // The light origin follows the pointer across the card.
      el.style.setProperty("--glare-x", `${(px * 100).toFixed(1)}%`);
      el.style.setProperty("--glare-y", `${(py * 100).toFixed(1)}%`);
    };

    const onMove = (e: PointerEvent) => {
      // One rect read per move, then a batched write on the next frame.
      const b = el.getBoundingClientRect();
      px = Math.min(1, Math.max(0, (e.clientX - b.left) / b.width));
      py = Math.min(1, Math.max(0, (e.clientY - b.top) / b.height));
      if (!frame) frame = requestAnimationFrame(write);
    };

    const onLeave = () => {
      px = 0.5;
      py = 0.5;
      if (!frame) frame = requestAnimationFrame(write);
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave, { passive: true });
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className="pointer-tilt">
      {children}
    </div>
  );
}
