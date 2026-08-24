import { Hairline, RevealCopy, RevealLines } from "./Reveal";

/**
 * Placement A, and the whole point is the emptiness.
 *
 * There is no headline in this section. Six of twelve columns are blank and
 * stay blank, the label anchors hard left, the copy sits hard right, and the
 * gap between them is the argument. Centring this, or filling column seven,
 * would cost nothing in pixels and everything in nerve.
 */
export function Manifesto() {
  return (
    <section
      id="manifesto"
      data-surface="light"
      className="substrate grain py-section"
      aria-label="Manifesto"
    >
      <div className="above-material relative mx-auto grid max-w-[120rem] grid-cols-12 gap-x-gap-col px-gutter">
        <div className="col-span-12 md:col-span-5">
          <p className="eyebrow text-gold-900">Manifesto</p>
          <Hairline className="mt-5 max-w-[6rem]" />
        </div>

        {/* Column 7 is deliberately empty. It is not a gutter. */}
        <div className="col-span-12 mt-block md:col-span-5 md:col-start-8 md:mt-0">
          <RevealLines as="p" className="body-l measure text-ink-900">
            We choose one bag at a time, and we choose it&nbsp;slowly.
          </RevealLines>

          <RevealCopy as="p" className="body-l measure mt-group text-clay">
            Full-grain leather from Florence, Italy, and nothing that won&rsquo;t
            outlast the season it was bought in. Nothing&nbsp;else.
          </RevealCopy>
        </div>
      </div>
    </section>
  );
}
