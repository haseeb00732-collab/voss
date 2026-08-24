/**
 * The V mark, as geometry.
 *
 * Measured off the logo rasters in `Voss-Logos/`: the mark is two nested
 * strokes sharing their top tips — an outer V with straight arms falling to
 * a low apex, and an inner V whose arms curve up and away to a higher apex.
 * The straight arm spans 88 across and 150 down, which puts it at 59.6° from
 * horizontal and confirms `--angle-vee: 59deg` against the real artwork
 * rather than the by-eye estimate the design doc flagged as unverified.
 *
 * Everything that draws the mark — the threshold, the nav, the hero aperture,
 * the footer — reads these constants, so the logo can only ever be one shape.
 */

export const VEE_W = 200;
export const VEE_H = 172;

/** Top tips. Both arms of a side meet here, which is what makes it a point. */
const TIP_L = "12,10";
const TIP_R = "188,10";

/** Outer apex sits low; the inner apex rides 55 units above it. */
const APEX_OUTER = "100,160";
const APEX_INNER = "100,105";

/** Control points for the inner sweep — bulging up and out from the chord. */
const CTRL_L = "58,30";
const CTRL_R = "142,30";

/**
 * Each side is ONE path: up the straight outer arm, a mitered turn at the
 * tip, then back down the inner curve. Drawing it as four separate strokes
 * put a butt cap on either side of every junction, and the resulting notch
 * at the tip is exactly the kind of detail that reads as "drawn by software".
 * A miter gives the sharp point the logo actually has.
 *
 * The short stubs at each end (`STUB_*`) run a few units back along the
 * *opposite* side's path, so the two sides overlap at both apexes and those
 * junctions miter to a point too. The stubs are invisible: they lie exactly
 * underneath the other side's stroke.
 */
const STUB_OUTER_L = "105.5,151"; // lies along the right outer arm
const STUB_OUTER_R = "94.5,151"; // lies along the left outer arm
const STUB_INNER_L = "105.1,95.9"; // lies along the right inner curve
const STUB_INNER_R = "94.9,95.9"; // lies along the left inner curve

export const VEE_PATHS = {
  left: `M ${STUB_OUTER_L} L ${APEX_OUTER} L ${TIP_L} Q ${CTRL_L} ${APEX_INNER} L ${STUB_INNER_L}`,
  right: `M ${STUB_OUTER_R} L ${APEX_OUTER} L ${TIP_R} Q ${CTRL_R} ${APEX_INNER} L ${STUB_INNER_R}`,
} as const;

/** Left leads by one beat; §4.4 puts 0.12s between the two strokes. */
export const VEE_SIDES = ["left", "right"] as const;

/**
 * The aperture: the region enclosed by the outer V, closed across the top.
 *
 * The alternative reading — clipping to the two crescents between the outer
 * and inner strokes — is prettier on paper but at rest those slivers are a
 * few pixels wide, so there is nothing to see until the scale is already
 * large. Clipping the outer interior gives a real opening at every scale and
 * leaves the inner curve free to ride on top of the photograph as a hairline,
 * which is what keeps the shape legible as *the mark* all the way through.
 */
export const VEE_APERTURE = `M ${TIP_L} L ${APEX_OUTER} L ${TIP_R} Z`;

/** The three aperture corners, in path units, for the containment solve. */
export const VEE_APERTURE_PTS = [
  [12, 10],
  [100, 160],
  [188, 10],
] as const;

/** The point the mark scales about — its optical centre, not its bbox centre. */
export const VEE_ANCHOR = [100, 86] as const;

/** Stroke weight in viewBox units. Traced at ~11; 8 reads drawn, not printed. */
export const VEE_STROKE = 8;

/** Sharp points need headroom above the default limit of 4. */
export const VEE_MITER = 6;
