import { CATALOGUE } from "@/lib/catalogue";
import { RangeCard } from "./RangeCard";

/**
 * The range, on a deliberately broken grid.
 *
 * Sixteen columns, twelve bags, and no two cards the same size or the same
 * aspect. The point of the asymmetry is that the eye has to travel — a
 * uniform grid of identical frames reads as a catalogue page, and this reads
 * as a spread. It is the "editorial, broken grid" line in CLAUDE.md made
 * literal.
 *
 * PLACEMENT LIVES HERE, NOT ON THE BAG. A card does not know where it sits;
 * `catalogue.ts` holds product facts and this holds composition. Re-ordering
 * the range is an edit to this array and nothing else.
 *
 * Mobile keeps §5.3's two columns rather than inheriting the broken grid.
 * Sixteen columns at 390px is four bags' worth of nothing between two
 * postage stamps — the asymmetry needs width to be legible as composition
 * instead of as a mistake.
 */

/**
 * col-span / aspect per bag, desktop only. Index matches CATALOGUE order.
 *
 * Six rows of two, alternating wide-left/narrow-right with narrow-left/
 * wide-right, and never the same aspect twice in a row. The asymmetry is the
 * composition: a uniform grid of identical frames reads as a catalogue page.
 * Placement lives here and not on the bag — catalogue.ts holds product facts.
 */
const PLACEMENT = [
  { span: "md:col-span-7 md:col-start-1", ratio: "3 / 4" },
  { span: "md:col-span-6 md:col-start-10", ratio: "4 / 5" },
  { span: "md:col-span-5 md:col-start-1", ratio: "4 / 5" },
  { span: "md:col-span-9 md:col-start-8", ratio: "1 / 1" },
  { span: "md:col-span-8 md:col-start-2", ratio: "1 / 1" },
  { span: "md:col-span-5 md:col-start-12", ratio: "3 / 4" },
  { span: "md:col-span-6 md:col-start-1", ratio: "1 / 1" },
  { span: "md:col-span-7 md:col-start-9", ratio: "3 / 4" },
  { span: "md:col-span-9 md:col-start-1", ratio: "16 / 10" },
  { span: "md:col-span-5 md:col-start-11", ratio: "4 / 5" },
  { span: "md:col-span-5 md:col-start-2", ratio: "3 / 4" },
  { span: "md:col-span-8 md:col-start-8", ratio: "1 / 1" },
] as const;

export function Range() {
  return (
    <section
      id="bags"
      data-surface="dark"
      aria-labelledby="range-heading"
      className="relative px-gutter py-section"
    >
      <header className="mb-band">
        <p className="mono text-[var(--text-accent)]">
          The range · Twelve bags
        </p>
        <h2 id="range-heading" className="display-2 mt-item">
          Products
        </h2>
      </header>

      <div className="grid grid-cols-2 gap-x-gap-col gap-y-band md:grid-cols-16 md:gap-y-section">
        {CATALOGUE.map((piece, i) => {
          const place = PLACEMENT[i] ?? PLACEMENT[0];
          return (
            <RangeCard
              key={piece.slug}
              piece={piece}
              ratio={place.ratio}
              className={place.span}
              /* Only the first row can be the LCP element. */
              priority={i < 2}
            />
          );
        })}
      </div>
    </section>
  );
}
