/**
 * Content pack §4 — "Before you pay".
 *
 * THIS SECTION SHIPS SHORT ON PURPOSE, AND THAT IS THE POINT.
 *
 * The content pack lists four checkable claims. Exactly one of them is
 * currently confirmed, and the other three are bracketed facts nobody has
 * verified. They are written out below as TODOs, verbatim, and they are NOT on
 * the page — because the whole reason this section exists is that COD fraud is
 * a live trust problem in this market and specific, checkable COD language is
 * what wins. A promise the rider will not honour does more damage here than no
 * promise at all, and it is the same failure as the invented European origin
 * claim that had to be pulled out of this site once already.
 *
 * Fill these in and add them back — each is a two-line change:
 *
 *   TODO **Open it before you pay.**
 *        [Confirm riders actually permit this. Do not claim it otherwise.]
 *
 *   TODO **Delivery across [all of Pakistan / the cities actually served].**
 *        [Confirm window, e.g. 3-5 working days.]
 *
 *   TODO **Wrong bag, wrong colour — [confirm exchange window].**
 */

const CLAIMS = [
  {
    title: "Cash on delivery.",
    body: "Pay the rider, not before. Nothing leaves your hands until the bag is in them.",
  },
  {
    // Verifiable from this page itself, which is the only reason it can ship
    // while the delivery facts cannot.
    title: "The price is on the page.",
    body: "No DM for a number. What you see here is what you are quoted in the thread.",
  },
];

export function BeforeYouPay() {
  return (
    <section
      id="before-you-pay"
      data-surface="dark"
      className="substrate relative py-section"
      aria-labelledby="before-you-pay-title"
    >
      <div className="mx-auto max-w-[120rem] px-gutter">
        <h2
          id="before-you-pay-title"
          className="display-l text-[var(--text-primary)]"
        >
          Before you pay
        </h2>

        <div className="rule-h mt-band w-full" />

        <ul className="mt-band grid grid-cols-1 gap-x-gap-col gap-y-band md:grid-cols-2">
          {CLAIMS.map((c) => (
            <li key={c.title} className="grid grid-cols-12 gap-x-gap-col">
              <span
                aria-hidden="true"
                className="col-span-12 h-px w-10 bg-[var(--text-accent)]"
              />
              <div className="col-span-12 mt-group">
                <h3 className="display-s text-[var(--text-primary)]">{c.title}</h3>
                <p className="body-s measure-tight mt-tight text-[var(--text-secondary)]">
                  {c.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
