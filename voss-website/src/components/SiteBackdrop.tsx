/**
 * The room the site stands in.
 *
 * Every section was painting flat ink-900 and nothing else, so the page read
 * as a black void with photographs floating on it. This is the vitrine made
 * literal: one key light, the structure of the grid, and the grain of film.
 *
 * THREE LAYERS, ALL FIXED AND ALL INERT.
 *
 *   1. KEY LIGHT. One source, high and slightly left. That is not a taste
 *      choice: `--elev-*` in globals.css already casts its shadows from a
 *      light high and slightly left, and the hero clip is lit from the same
 *      side. A second light source anywhere on this page would contradict
 *      both. It is a wide, very low-opacity gold wash, so it reads as depth
 *      rather than as a gradient.
 *
 *   2. COLUMN RULES. Hairlines on the SAME 12-column grid the content sits
 *      on, not decoration scattered for texture. They are drawn at the real
 *      container gutters, so a card edge and a rule land on the same pixel.
 *      Below `lg` they are hidden: at phone width the grid is one column and
 *      the rules would be lying about a structure that is not there.
 *
 *   3. GRAIN. An SVG turbulence tile at very low opacity, which is what keeps
 *      a large flat dark field from banding on cheap panels.
 *
 * It is `position: fixed` deliberately. Grain on a scrolling container repaints
 * the whole layer every frame and destroys framerate on mobile; fixed, it is
 * composited once and never touched again. Nothing here takes pointer events
 * and nothing here is announced to assistive tech.
 */
export function SiteBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* 1. The key light. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 18% -10%, color-mix(in srgb, var(--color-gold-500) 13%, transparent) 0%, transparent 58%)",
        }}
      />
      {/* A cold counter-fill low and right, so the dark side of the page is
          not a single flat value either. Same light, further away. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 70% at 92% 108%, color-mix(in srgb, var(--color-ink-700) 55%, transparent) 0%, transparent 60%)",
        }}
      />

      {/* 2. The grid it is all built on. */}
      <div className="absolute inset-0 hidden lg:block">
        <div className="mx-auto grid h-full max-w-[120rem] grid-cols-12 gap-x-gap-col px-gutter">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="relative">
              <span className="absolute inset-y-0 left-0 w-px bg-[color-mix(in_srgb,var(--color-gold-700)_9%,transparent)]" />
              {i === 11 && (
                <span className="absolute inset-y-0 right-0 w-px bg-[color-mix(in_srgb,var(--color-gold-700)_9%,transparent)]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Grain. */}
      <div
        className="absolute inset-0 opacity-[0.16] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
        }}
      />
    </div>
  );
}
