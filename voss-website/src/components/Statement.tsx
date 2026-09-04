import { CATALOGUE, STYLE_COUNT, pricing } from "@/lib/catalogue";
import { Hairline, RevealCopy, RevealLines } from "./Reveal";

/**
 * The statement — type and numbers, between the range and the trust block.
 *
 * It replaces `TheObject`, which was a full-bleed leather macro. That frame
 * was the strongest thing on the site when the site had six product
 * photographs; with twelve styles above it and a campaign band below the hero,
 * a third full-bleed image in the same scroll was one photograph too many.
 * The page did not need more picture there, it needed a change of texture.
 *
 * So this movement is the only one on the page with NO photography at all:
 * one Bodoni line and four counted facts. After twelve product frames that
 * reads as a pause, which is exactly what the position needs.
 *
 * EVERY NUMBER IS COUNTED FROM `catalogue.ts`, NOT WRITTEN HERE. §11.1 — the
 * count of styles, the count of colourways and the price are product facts,
 * and the last time one of them was typed into a component by hand it was
 * still saying "six" after the range had grown to twelve. A reshoot changes
 * these tiles by changing the catalogue and nothing else.
 *
 * §4.4 S6: count/label pairs, y: 16 -> 0, staggered. The reveal is Reveal's,
 * so it inherits the one entrance the rest of the site uses.
 */

/** Total photographed colourways across the range. Counted, never typed. */
const COLOURWAY_COUNT = CATALOGUE.reduce(
  (n, piece) => n + piece.colourways.length,
  0
);

export function Statement() {
  const { now } = pricing(CATALOGUE[0]);

  const tiles: { value: string; label: string }[] = [
    { value: String(STYLE_COUNT), label: "Styles" },
    { value: String(COLOURWAY_COUNT), label: "Colours photographed" },
    { value: now ?? "—", label: "Every one, same price" },
    { value: "COD", label: "You pay the rider" },
  ];

  return (
    <section
      id="statement"
      data-surface="dark"
      aria-labelledby="statement-heading"
      className="relative isolate overflow-hidden px-gutter py-section"
      style={{ ["--wash-hue" as string]: "var(--color-hue-chocolate-wash)" }}
    >
      {/* The section's own ground, on the page-level wash variable so it is
          lit by the same light as everything around it. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(70% 90% at 20% 30%, var(--wash-hue) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto grid max-w-[120rem] grid-cols-4 gap-x-gap-col md:grid-cols-12">
        <p className="mono col-span-4 text-[var(--text-accent)] md:col-span-12">
          Why this one
        </p>

        <RevealLines
          as="h2"
          className="display-2 col-span-4 mt-group text-[var(--text-primary)] md:col-span-9"
        >
          Twelve bags, chosen one at a time. Not a catalogue of forty thousand.
        </RevealLines>

        <RevealCopy
          as="p"
          className="body-l measure col-span-4 mt-band text-[var(--text-secondary)] md:col-span-6"
        >
          Every style here was picked, photographed and priced before it went
          on the page. The number you see is the number you pay, and you pay it
          when the bag is in your hands — not before.
        </RevealCopy>
      </div>

      <Hairline className="mt-band" />

      {/* §4.4 S6 — count/label pairs. */}
      <dl className="mx-auto mt-band grid max-w-[120rem] grid-cols-2 gap-x-gap-col gap-y-band md:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label}>
            <dt className="display-3 text-[var(--text-accent)]">{t.value}</dt>
            <dd className="mono mt-item text-[var(--text-secondary)]">
              {t.label}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
