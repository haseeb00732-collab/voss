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
 *      The count steps 4 / 8 / 12 with §3.1's breakpoints, so what is drawn
 *      is always the grid the content is actually sitting on.
 *
 *   3. THE HUE WASH. §1.7. A single radial that paints whichever product
 *      colour is currently active, driven by the --wash-hue custom property.
 *      It is registered with @property in globals.css, which is what lets it
 *      CROSS-FADE rather than jump when a section changes it — an unregistered
 *      custom property is not an animatable type and transitions are ignored
 *      on it silently. Phase 4 drives it; the default is cognac, the hero's
 *      hue, so the page is never washless.
 *
 * Grain is NOT here. §1.8 puts one grain layer above everything, so it also
 * covers the photographs; see components/Grain.tsx.
 *
 * It is `position: fixed` deliberately. Grain on a scrolling container repaints
 * the whole layer every frame and destroys framerate on mobile; fixed, it is
 * composited once and never touched again. Nothing here takes pointer events
 * and nothing here is announced to assistive tech.
 */
const RULE = "bg-[color-mix(in_srgb,var(--color-gold-700)_9%,transparent)]";

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
      {/* A counter-fill low and right, so the dark side of the page is not a
          single flat value either. Same light, further away — which is why it
          is warm. The cool direction lives in the body gradient's vertical
          fall toward --color-cool-shade, so the lit side is warm and the
          shadow side goes cool, the way one light actually behaves. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 70% at 92% 108%, color-mix(in srgb, var(--color-ink-700) 55%, transparent) 0%, transparent 60%)",
        }}
      />

      {/* 2. The grid it is all built on.
             The column COUNT steps with §3.1's breakpoint table — 4 at phone,
             8 at md, 12 at lg — so the rules always describe the grid the
             content is actually on. They used to be hidden below lg on the
             argument that a phone has no grid to describe; it has a four
             column one, and drawing it is what carries the editorial
             structure onto the surface that matters most. */}
      <div className="absolute inset-0">
        <div className="relative mx-auto grid h-full max-w-[120rem] grid-cols-4 gap-x-gap-col px-gutter md:grid-cols-8 lg:grid-cols-12">
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className={
                "relative " +
                (i < 4 ? "" : i < 8 ? "hidden md:block" : "hidden lg:block")
              }
            >
              <span className={`absolute inset-y-0 left-0 w-px ${RULE}` } />
            </div>
          ))}
          {/* The closing edge, on the container rather than on a child, so it
              does not have to move between breakpoints. */}
          <span className={`absolute inset-y-0 right-gutter w-px ${RULE}`} />
        </div>
      </div>

      {/* 3. The hue wash, §1.7. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 60% at 50% 40%, var(--wash-hue) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
