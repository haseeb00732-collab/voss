import { VEE_H, VEE_PATHS, VEE_SIDES, VEE_W } from "@/lib/vee";
import { FoilGradient } from "./VMark";

/**
 * The loading state: the V draws itself in gold, then the wordmark arrives.
 *
 * IT DELAYS BEFORE IT APPEARS, AND THAT IS THE WHOLE DESIGN. Every route on
 * this site is statically prerendered, so most navigations resolve in tens of
 * milliseconds. A spinner that paints instantly would flash and vanish on
 * every single click — which reads as a glitch, not as polish, and is worse
 * than showing nothing at all. `loader-veil` is transparent for 180ms and
 * only then fades in, so a fast navigation unmounts it before it was ever
 * visible and a slow one gets a considered hold.
 *
 * The geometry is imported, never redrawn. `vee.ts` is the only place the
 * mark's shape exists, and it splits the V into a left and a right path
 * specifically "so the mark can draw itself in two beats" — this is the
 * moment that comment was written for. The two sides are stroked rather than
 * filled and offset by one beat, so the V is written like a signature rather
 * than fading in like an image.
 *
 * `pathLength="1"` normalises each path to a length of 1 regardless of its
 * real geometry, so the dash animation is expressed in plain fractions and
 * nothing has to measure the path at runtime.
 */
export function Loader({ label = "Loading" }: { label?: string }) {
  return (
    <div
      className="loader-veil fixed inset-0 z-200 flex flex-col items-center justify-center gap-band"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">{label}</span>

      <svg
        viewBox={`0 0 ${VEE_W} ${VEE_H}`}
        className="loader-vee h-16 w-auto sm:h-20"
        aria-hidden="true"
        fill="none"
      >
        <defs>
          <FoilGradient id="loader-foil" />
        </defs>

        {/* The drawn outline. Stroked, dashed, and offset per side. */}
        {VEE_SIDES.map((side) => (
          <path
            key={side}
            data-vee={side}
            d={VEE_PATHS[side]}
            pathLength="1"
            fill="none"
            stroke="url(#loader-foil)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* The fill, arriving under the stroke once the outline has closed —
            so the mark resolves into the solid logo rather than staying a
            wireframe. */}
        {VEE_SIDES.map((side) => (
          <path
            key={`fill-${side}`}
            data-vee-fill={side}
            d={VEE_PATHS[side]}
            fill="url(#loader-foil)"
          />
        ))}
      </svg>

      <span className="loader-word eyebrow text-[var(--text-accent)]">Voss</span>
    </div>
  );
}
