import { CATALOGUE } from "@/lib/catalogue";

/**
 * Content pack §3 — "What it is".
 *
 * This ONE section replaces both `Manifesto.tsx` and `TheObject.tsx`.
 *
 * The old Manifesto register — "we choose one bag at a time, and we choose it
 * slowly" — was written for a buyer this shop does not have. The competitor
 * read is unambiguous: this market's tone is warm and plainly informational,
 * and the retailers writing polished English marketing-speak read colder on
 * the page than the ones writing like a person. So the literary voice is gone
 * and what is left is the actual proposition.
 *
 * No manufacturing language anywhere. Nothing here claims a material, a
 * workshop, a country or a hide, because none of that is confirmed.
 */
export function WhatItIs() {
  return (
    <section
      id="what-it-is"
      data-surface="dark"
      className="substrate relative py-section"
      aria-labelledby="what-it-is-title"
    >
      <div className="mx-auto max-w-[120rem] px-gutter">
        <div className="grid grid-cols-12 gap-x-gap-col">
          <h2
            id="what-it-is-title"
            className="display-l col-span-12 text-[var(--text-primary)] md:col-span-4"
          >
            What it is
          </h2>

          <p className="body-l measure col-span-12 mt-band text-[var(--text-primary)] md:col-span-7 md:col-start-6 md:mt-0">
            {CATALOGUE.length === 6 ? "Six bags" : `${CATALOGUE.length} bags`},
            picked one at a time, sold at one price. No 40,000-bag catalogue,
            no DM-for-price. What you see is what you get, and the number is on
            the page before you ask.
          </p>
        </div>
      </div>
    </section>
  );
}
