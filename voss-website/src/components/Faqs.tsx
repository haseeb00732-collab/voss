import { IG_HANDLE, igProfile } from "@/lib/instagram";

/**
 * Content pack §5 — FAQs.
 *
 * Three of the pack's six questions ship. The other three are answered with a
 * bracketed fact nobody has confirmed, and an FAQ that guesses is worse than
 * an FAQ that is short — especially "is this real leather", where the pack is
 * explicit that "vegan leather" or "PU" is a perfectly sellable answer in this
 * market and the ONLY wrong answer is a guess.
 *
 * Held until confirmed, verbatim from the pack:
 *
 *   TODO **Is cash on delivery really available everywhere?**
 *        [Confirm reach — name the cities, or say "all of Pakistan" only if true.]
 *
 *   TODO **Can I check the bag before I pay?**
 *        [Confirm the open-before-pay policy.]
 *
 *   TODO **Is this real leather?**
 *        [Answer with what is verified. "Vegan leather" or "PU" is a fine,
 *        sellable answer in this market. The only wrong answer is a guess.]
 *
 * Also held: reply hours and who answers the DM, which is why the ordering
 * answer below stops at the handle.
 *
 * The FAQPage schema is generated from the SAME array that renders, so the
 * structured data can never advertise an answer the page does not show.
 */

const FAQS = [
  {
    q: "Why is it Rs 4,500 and not Rs 6,000?",
    a: "It's a launch offer. Rs 6,000 is the list price; Rs 4,500 is what you pay today.",
  },
  {
    q: "What happens when the offer ends?",
    a: "The price returns to Rs 6,000. We'll say so on the page rather than quietly restarting the clock.",
  },
  {
    q: "How do I order?",
    a: `Message us on Instagram — @${IG_HANDLE} — with the bag name and the colour. Every bag on this page has a button that opens the thread and copies that line for you.`,
  },
];

export function Faqs() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section
      id="faqs"
      data-surface="dark"
      className="substrate relative py-section"
      aria-labelledby="faqs-title"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />

      <div className="mx-auto max-w-[120rem] px-gutter">
        <div className="grid grid-cols-12 gap-x-gap-col">
          <h2
            id="faqs-title"
            className="display-l col-span-12 text-[var(--text-primary)] md:col-span-4"
          >
            Questions
          </h2>

          <dl className="col-span-12 mt-band md:col-span-7 md:col-start-6 md:mt-0">
            {FAQS.map((f, i) => (
              <div
                key={f.q}
                className={i === 0 ? "" : "mt-band border-t border-[var(--border-hairline)] pt-band"}
              >
                <dt className="display-s text-[var(--text-primary)]">{f.q}</dt>
                <dd className="body-s measure mt-group text-[var(--text-secondary)]">
                  {f.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="body-s mt-section text-[var(--text-secondary)]">
          Anything else —{" "}
          <a
            href={igProfile()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--link)] underline underline-offset-4"
          >
            ask on Instagram
          </a>
          .
        </p>
      </div>
    </section>
  );
}
