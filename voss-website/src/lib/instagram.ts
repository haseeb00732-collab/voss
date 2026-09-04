/**
 * Instagram is the buy button.
 *
 * She arrives from Instagram, so the shortest path back to a conversation is
 * Instagram — not a phone number she has to save first. There is no checkout;
 * the order closes in the DM and she pays the rider.
 *
 * ONE LIMITATION, AND IT SHAPES THE UI: Instagram deep links CANNOT PREFILL A
 * MESSAGE. WhatsApp's `wa.me?text=` carried "I'd like to ask about Saba (01)"
 * into the thread for her. `ig.me` drops her into an empty box. So the bag
 * identity has to survive the jump some other way, or the reply starts with
 * "which one?" — the exact failure the old whatsapp.ts was written to avoid.
 *
 * The answer here: `orderReference()` produces a short line the UI can put on
 * a copy button next to the CTA, so she can paste it as her first message.
 * Never render a CTA that leaves her with nothing to say.
 */

import { CATALOGUE, pricing } from "./catalogue";

/** Public handle. Override per-environment if the account is ever renamed. */
const HANDLE = (process.env.NEXT_PUBLIC_IG_HANDLE ?? "voss.pk").replace(/^@/, "");

/** The public handle, without the @. Copy that names it must read it here. */
export const IG_HANDLE = HANDLE;

export const IG_ENABLED = HANDLE.length > 0;

export const igProfile = () => `https://www.instagram.com/${HANDLE}/`;

/**
 * Instagram's direct-message deep link. Opens the app on mobile and the web
 * inbox on desktop. Falls back to the profile if the handle is unset.
 */
export const igDirectMessage = () => (IG_ENABLED ? `https://ig.me/m/${HANDLE}` : null);

export type OrderContext = {
  /** e.g. "Saba" */
  piece?: string;
  /** e.g. "01" */
  slug?: string;
  /** e.g. "Black" */
  colourway?: string;
};

/**
 * The line she pastes into the empty DM. Carries everything the reply needs:
 * which bag, which colour, and the price she saw — so the price she was shown
 * and the price she is quoted cannot drift apart in the thread.
 */
export function orderReference({ piece, slug, colourway }: OrderContext = {}): string {
  if (!piece) return "Hi VOSS — I'd like to order a bag.";
  const ref = slug ? ` (${slug})` : "";
  const colour = colourway ? ` in ${colourway}` : "";
  /* Read the number, never write it. A literal here survives the offer
     ending and then quotes her a price the page no longer shows — the drift
     this function was written to prevent. Every bag is one price, so the
     first piece answers for all six. */
  const price = pricing(CATALOGUE[0]).now;
  return `Hi VOSS — I'd like to order the ${piece}${ref}${colour}, ${price}, cash on delivery.`;
}
