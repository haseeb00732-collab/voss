"use client";

import { useId, type CSSProperties } from "react";
import { VEE_H, VEE_PATHS, VEE_SIDES, VEE_W } from "@/lib/vee";

/**
 * One light source for every gold on the site.
 *
 * CSS 165deg points down and slightly right, which in objectBoundingBox
 * coordinates is the vector (0.26, 0.96). The specular stop sits at 38%,
 * not 50% — real foil catches light off-centre, and a symmetric gradient
 * is the thing that reads as CSS rather than as metal.
 */
export function FoilGradient({ id }: { id: string }) {
  return (
    <linearGradient id={id} x1="0.37" y1="0.02" x2="0.63" y2="0.98">
      <stop offset="0%" stopColor="var(--color-gold-700)" />
      <stop offset="22%" stopColor="var(--color-gold-500)" />
      <stop offset="38%" stopColor="var(--color-gold-100)" />
      <stop offset="52%" stopColor="var(--color-gold-300)" />
      <stop offset="74%" stopColor="var(--color-gold-700)" />
      <stop offset="100%" stopColor="var(--color-gold-900)" />
    </linearGradient>
  );
}

/**
 * The V. Two closed fills — one per side — so the mark can draw itself with
 * one beat between them; `data-vee` lets whoever owns the moment select a
 * side without this component knowing anything about the animation.
 *
 * `foil` opts into the gold gradient. Default is `currentColor`, because the
 * mark should inherit ink or paper almost everywhere and only be metal where
 * a foil moment is actually intended.
 */
export function VMark({
  className = "",
  foil = false,
  title,
  style,
}: {
  className?: string;
  foil?: boolean;
  title?: string;
  style?: CSSProperties;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gradId = `foil-${uid}`;
  const fill = foil ? `url(#${gradId})` : "currentColor";

  return (
    <svg
      viewBox={`0 0 ${VEE_W} ${VEE_H}`}
      className={className}
      style={style}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      fill="none"
    >
      {foil && (
        <defs>
          <FoilGradient id={gradId} />
        </defs>
      )}
      {VEE_SIDES.map((side) => (
        <path key={side} data-vee={side} d={VEE_PATHS[side]} fill={fill} />
      ))}
    </svg>
  );
}
