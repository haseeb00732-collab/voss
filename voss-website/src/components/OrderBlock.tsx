import { IG_HANDLE, igDirectMessage, igProfile } from "@/lib/instagram";
import { StyleCountWord } from "@/lib/catalogue";

/**
 * The order block — §5.8. The last thing on the page before the footer, and
 * the only place the page asks for the sale outright.
 *
 * It replaces the waitlist section §5.8 cuts: a newsletter signup on a
 * cash-on-delivery shop with no backend is a dead end wearing a form. What
 * this does instead is hand her the actual next action — the Instagram
 * thread — because that IS the checkout on this shop.
 *
 * ONE vermilion element, §1.5c. The handle is a real link but it is gold, so
 * the fill below it is the only thing in the viewport wearing the buy colour.
 *
 * The hue is wine, per §5.8, set on --wash-hue so the page-level wash resolves
 * to it as the block enters rather than this painting its own ground.
 */
export function OrderBlock() {
  const dm = igDirectMessage();

  return (
    <section
      id="order"
      data-surface="dark"
      aria-labelledby="order-heading"
      className="relative isolate overflow-hidden px-gutter py-section"
      style={{ ["--wash-hue" as string]: "var(--color-hue-wine-wash)" }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(90% 70% at 50% 60%, var(--wash-hue) 0%, transparent 70%)",
        }}
      />

      <p className="mono text-[var(--text-accent)]">Order</p>

      <h2 id="order-heading" className="display-1 measure-tight mt-item">
        Pick one. Pay the rider.
      </h2>

      <p className="body-l measure mt-group text-[var(--text-secondary)]">
        {StyleCountWord} bags, Rs 4,500 each. Message us with the name and the
        colour — the price you see is the price you pay, and you pay when it is
        in your hands.
      </p>

      <div className="mt-band flex flex-wrap items-center gap-x-band gap-y-group">
        {dm && (
          <a
            href={dm}
            target="_blank"
            rel="noreferrer noopener"
            className="eyebrow inline-flex min-h-11 items-center justify-center rounded-sm bg-[var(--text-signal)] px-control-x-l py-control-y-l text-ink-950 transition-opacity duration-[var(--dur-1)] ease-[var(--ease-out)] hover:opacity-90"
          >
            Order on Instagram
          </a>
        )}

        <a
          href={igProfile()}
          target="_blank"
          rel="noreferrer noopener"
          className="display-3 text-[var(--link)] underline-offset-[0.2em] transition-colors duration-[var(--dur-2)] hover:text-[var(--link-hover)] hover:underline"
        >
          @{IG_HANDLE}
        </a>
      </div>
    </section>
  );
}
