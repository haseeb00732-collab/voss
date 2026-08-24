import type { CSSProperties } from "react";
import { VEE_ANCHOR, VEE_APERTURE_PTS } from "./vee";

/**
 * Where the mark sits before anything has happened.
 *
 * The threshold curtain and the hero both read these values, which is the
 * only reason the handoff between them is invisible: when the curtain wipes
 * upward it uncovers a mark already standing in exactly the same place at
 * exactly the same size, so nothing appears to move.
 *
 * 46% rather than 50% because the display word below it carries visual
 * weight — geometric centring would read as sitting low.
 */
export const MARK_REST = {
  top: "46%",
  height: "clamp(120px, 16vh, 180px)",
} as const;

export const markRestStyle: CSSProperties = {
  position: "absolute",
  top: MARK_REST.top,
  left: "50%",
  height: MARK_REST.height,
  transform: "translate(-50%, -50%)",
};

/** Resolve the clamp above without reading it back off the DOM. */
export function markRestHeight(vh: number) {
  return Math.min(180, Math.max(120, vh * 0.16));
}

function pointInTriangle(px: number, py: number) {
  const [[ax, ay], [bx, by], [cx, cy]] = VEE_APERTURE_PTS;
  const d = (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
  const s = ((px - ax) * (cy - ay) - (cx - ax) * (py - ay)) / d;
  const t = ((bx - ax) * (py - ay) - (px - ax) * (by - ay)) / d;
  return s >= 0 && t >= 0 && s + t <= 1;
}

/**
 * The smallest scale at which the aperture covers the whole viewport.
 *
 * Hard-coding the design doc's "≈14×" would be wrong at any aspect ratio but
 * the one it was estimated on: a 390px phone needs a very different number
 * from a 21:9 desktop, and guessing high means the reader scrolls through
 * dead travel after the photograph has already filled the screen.
 *
 * Solved by bisection rather than algebraically because the containment test
 * is cheap, this runs once per resize, and a closed form for "triangle
 * contains rectangle" is far more code than it is worth.
 */
export function apertureCoverScale(vw: number, vh: number, cx: number, cy: number) {
  const corners = [
    [0, 0],
    [vw, 0],
    [0, vh],
    [vw, vh],
  ] as const;

  const covers = (s: number) =>
    corners.every(([X, Y]) =>
      pointInTriangle(VEE_ANCHOR[0] + (X - cx) / s, VEE_ANCHOR[1] + (Y - cy) / s)
    );

  let lo = 1;
  let hi = 2;
  while (!covers(hi) && hi < 4096) hi *= 2;

  for (let i = 0; i < 34; i++) {
    const mid = (lo + hi) / 2;
    if (covers(mid)) hi = mid;
    else lo = mid;
  }

  // A little past the exact solution, so the edge is clear of the corner
  // rather than grazing it on a sub-pixel rounding difference.
  return hi * 1.06;
}

/** `translate(cx cy) scale(s) translate(-ax -ay)`, as SVG wants it. */
export function veeTransform(cx: number, cy: number, s: number) {
  return `translate(${cx} ${cy}) scale(${s}) translate(${-VEE_ANCHOR[0]} ${-VEE_ANCHOR[1]})`;
}
