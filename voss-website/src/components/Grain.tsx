/**
 * The film grain, §1.8.
 *
 * ONE layer for the whole site, fixed, above everything. There used to be
 * three — a `@utility grain` on two sections plus a fourth copy inside
 * SiteBackdrop at 0.16 — which meant the texture changed density depending on
 * which section you were looking at, and the sections that had it read as a
 * different material from the ones that did not.
 *
 * Above everything rather than behind, because that is the point: it has to
 * sit over the photographs too, or the images look pasted onto the page
 * instead of printed with it. `mix-blend-mode: overlay` at 0.035 is far below
 * the threshold where anyone can name it, and it is what stops a large flat
 * dark gradient from banding on a cheap panel.
 *
 * Inline data URI, so it costs one paint and zero network requests.
 */
const NOISE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.86' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='128' height='128' filter='url(%23n)'/%3E%3C/svg%3E";

export function Grain() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-200"
      style={{
        backgroundImage: `url("${NOISE}")`,
        backgroundRepeat: "repeat",
        opacity: "var(--grain-paper)",
        mixBlendMode: "overlay",
      }}
    />
  );
}
