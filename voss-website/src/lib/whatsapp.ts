/**
 * WhatsApp is the buy button.
 *
 * For v1 there is no checkout, and a working WhatsApp handoff converts better
 * than a broken cart — especially here, where the customer arrives from
 * Instagram and expects to ask a question before paying.
 *
 * The number is configuration, not code: set NEXT_PUBLIC_WA_NUMBER to an
 * international number with no `+`, spaces or dashes (e.g. 923001234567).
 *
 * If it is not set, `waLink()` returns null and every caller must fall back to
 * the waitlist. Rendering a buy button that opens a dead chat is worse than
 * not rendering one, and a placeholder number next to a price is exactly the
 * failure the brief bans.
 */

const RAW = process.env.NEXT_PUBLIC_WA_NUMBER ?? "";

/** Digits only. Strips a leading `+`, spaces, dashes and brackets. */
const NUMBER = RAW.replace(/[^\d]/g, "");

/** A number short enough to be a typo is treated as unset. */
export const WA_ENABLED = NUMBER.length >= 8;

export type WaContext = {
  /** e.g. "The Onyx Tote" — named so the reply does not start with "which one?" */
  piece?: string;
  /** e.g. "01" — lets us match the message to the catalogue entry */
  slug?: string;
  /** Overrides the generated message entirely. */
  message?: string;
};

function defaultMessage({ piece, slug }: WaContext) {
  if (!piece) return "Hi VOSS, I'd like to ask about a piece.";
  const ref = slug ? ` (${slug})` : "";
  return `Hi VOSS, I'd like to ask about the ${piece}${ref}.`;
}

/**
 * Returns a wa.me deep link, or null when no number is configured.
 * Null is meaningful: callers render the waitlist instead.
 */
export function waLink(ctx: WaContext = {}): string | null {
  if (!WA_ENABLED) return null;
  const text = ctx.message ?? defaultMessage(ctx);
  return `https://wa.me/${NUMBER}?text=${encodeURIComponent(text)}`;
}
