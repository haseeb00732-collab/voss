"use client";

import { useId, type CSSProperties } from "react";
import { VEE_H, VEE_MITER, VEE_PATHS, VEE_SIDES, VEE_STROKE, VEE_W } from "@/lib/vee";

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
 * The V, in foil. Two strokes — one per side — so the mark can draw itself
 * with one beat between them; `data-vee` lets whoever owns the moment select
 * a side without this component knowing anything about the animation.
 */
export function VMark({
  className = "",
  stroke = VEE_STROKE,
  title,
  style,
}: {
  className?: string;
  stroke?: number;
  title?: string;
  style?: CSSProperties;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const foil = `foil-${uid}`;

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
      <defs>
        <FoilGradient id={foil} />
      </defs>
      {VEE_SIDES.map((side) => (
        <path
          key={side}
          data-vee={side}
          d={VEE_PATHS[side]}
          stroke={`url(#${foil})`}
          strokeWidth={stroke}
          strokeLinecap="butt"
          strokeLinejoin="miter"
          strokeMiterlimit={VEE_MITER}
        />
      ))}
    </svg>
  );
}
