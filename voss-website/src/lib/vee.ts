/**
 * The V mark, as geometry.
 *
 * Rebuilt 2026-08-25 from the transparent source the client supplied
 * (`bg-1a284f52…png`, 1024², mark in a 382×310 box), sampled at 4× and
 * measured by scanline rather than by eye.
 *
 * The form is two nested chevron bands of equal weight that meet at a sharp
 * point at each tip. All four edges are straight and parallel below the tip
 * region; only the two inner edges curve, and only near the tips. The curve
 * control points are least-squares fitted to the sampled edge with the end
 * tangent pinned to the straight edge, so the join has no corner in it.
 *
 * Measured, superseding the earlier by-eye constants:
 *   arm angle   58.35° from horizontal  (the doc's `--angle-vee: 59deg` was close)
 *   band weight  9.01 units of 100 width
 *   gap          9.68
 *
 * The client also supplied an auto-traced SVG of the same mark: 521 paths,
 * 350 KB, ragged contours, asymmetric. This is 480 bytes and symmetric by
 * construction. Do not replace it with the trace.
 *
 * Everything that draws the mark reads these constants, so the logo can only
 * ever be one shape.
 */

export const VEE_W = 100;
export const VEE_H = 81.152;

/** Arm angle from horizontal, measured. Mirrors `--angle-vee`. */
export const VEE_ANGLE = 58.35;

export const VEE_SIDES = ['left', 'right'] as const;
export type VeeSide = (typeof VEE_SIDES)[number];

/**
 * Each side is a closed fill, split down the centreline, so the mark can draw
 * itself in two beats. Rendered together they are seamless — the shared edge
 * is exactly x = 50 on both.
 */
export const VEE_PATHS: Record<VeeSide, string> = {
  left:
    'M 0.374 0.327 L 50 80.555 L 50 66.562 L 12.432 5.301 ' +
    'C 19.124 8.165, 25.699 11.113, 29.338 17.016 L 50 50.56 L 50 36.236 ' +
    'L 38.125 17.016 C 30.793 5.122, 13.747 1.844, 0.374 0.327 Z',
  right:
    'M 99.626 0.327 L 50 80.555 L 50 66.562 L 87.568 5.301 ' +
    'C 80.876 8.165, 74.301 11.113, 70.662 17.016 L 50 50.56 L 50 36.236 ' +
    'L 61.875 17.016 C 69.207 5.122, 86.253 1.844, 99.626 0.327 Z',
};

/**
 * The whole mark as one path with an even-odd counter. Use this anywhere the
 * two-beat draw isn't needed — favicon, OG image, print.
 */
export const VEE_WHOLE =
  'M 0.374 0.327 L 50 80.555 L 99.626 0.327 ' +
  'C 86.253 1.844, 69.207 5.122, 61.875 17.016 L 50 36.236 L 38.125 17.016 ' +
  'C 30.793 5.122, 13.747 1.844, 0.374 0.327 Z ' +
  'M 12.432 5.301 L 50 66.562 L 87.568 5.301 ' +
  'C 80.876 8.165, 74.301 11.113, 70.662 17.016 L 50 50.56 L 29.338 17.016 ' +
  'C 25.699 11.113, 19.124 8.165, 12.432 5.301 Z';

/**
 * The outer V as a bare triangle — tip, apex, tip.
 *
 * Used by the aperture maths in `heroFrame.ts`, which treats the mark as a
 * hole that scales up to cover the viewport.
 */
export const VEE_APERTURE_PTS = [
  [0.374, 0.327],
  [50, 80.555],
  [99.626, 0.327],
] as const;

/** The point the mark scales about. */
export const VEE_ANCHOR = [50, 40.576] as const;
