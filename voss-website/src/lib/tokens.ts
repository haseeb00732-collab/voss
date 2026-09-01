/**
 * The manifest of every colour token VOSS-VISUAL-TARGET §1.2–§1.6 names.
 *
 * This exists because Tailwind v4's default @theme behaviour fails SILENTLY:
 * a token nothing references is not emitted, so `var(--color-x)` resolves to
 * the empty string and the element simply renders with no colour. Nothing
 * errors, nothing warns, and it looks like a styling bug rather than a
 * missing token. `@theme static` in globals.css is the fix; this list is the
 * proof that the fix is still working, checked by /_tokens on every load.
 *
 * Adding a token to §1.2–§1.6 means adding it here in the same commit. That
 * is the whole contract — the guard can only check what it is told about.
 */

export type TokenGroup = {
  /** The section of VOSS-VISUAL-TARGET this group implements. */
  section: string;
  title: string;
  /** Why these values are what they are — rendered on the proof page. */
  note?: string;
  tokens: readonly string[];
};

export const PALETTE: readonly TokenGroup[] = [
  {
    section: "§1.2",
    title: "Ink — warm black",
    note: "Every stop is warm (R > G > B). A cool ground pushes gold's complement and the house colour comes back green.",
    tokens: [
      "--color-ink-950",
      "--color-ink-900",
      "--color-ink-850",
      "--color-ink-800",
      "--color-ink-700",
      "--color-ink-600",
      "--color-ink-500",
      "--color-cool-shade",
    ],
  },
  {
    section: "§1.3",
    title: "Text on ink",
    note: "pewter is 4.1:1 and is permitted on uppercase mono micro-labels only. Anything a customer reads is smoke or brighter.",
    tokens: ["--color-chalk", "--color-smoke", "--color-pewter"],
  },
  {
    section: "§1.4",
    title: "Gold — the house",
    note: "Never a button fill. Hairlines, small caps, the V-mark, the rule under an active nav item.",
    tokens: [
      "--color-gold-100",
      "--color-gold-300",
      "--color-gold-500",
      "--color-gold-700",
      "--color-gold-900",
    ],
  },
  {
    section: "§1.5",
    title: "Vermilion — the verb",
    note: "Resolve through --text-signal, never these directly. verm-800 is the paper end, derived to clear 4.5:1 on paper-50.",
    tokens: [
      "--color-verm-400",
      "--color-verm-500",
      "--color-verm-600",
      "--color-verm-800",
    ],
  },
  {
    section: "§1.5b",
    title: "Paper substrate",
    note: "Piece pages only. PieceHero computes the substrate from the colourway's own luminance.",
    tokens: [
      "--color-paper-50",
      "--color-paper-100",
      "--color-paper-200",
      "--color-ink-on-paper",
      "--color-smoke-on-paper",
    ],
  },
  {
    section: "§1.6",
    title: "Product hues",
    note: "The six bag colours. Nothing gets a hue unless a bag has that hue.",
    tokens: [
      "--color-hue-olive",
      "--color-hue-black",
      "--color-hue-chocolate",
      "--color-hue-cognac",
      "--color-hue-wine",
      "--color-hue-camel",
    ],
  },
  {
    section: "§1.6",
    title: "Hue — wash (8% over ink-950)",
    note: "Section ground when that colour is active. color-mix against the real ground, so re-grading a hue moves its wash with it.",
    tokens: [
      "--color-hue-olive-wash",
      "--color-hue-black-wash",
      "--color-hue-chocolate-wash",
      "--color-hue-cognac-wash",
      "--color-hue-wine-wash",
      "--color-hue-camel-wash",
    ],
  },
  {
    section: "§1.6",
    title: "Hue — veil (18% over ink-850)",
    note: "Card ground on hover, and on the active colourway.",
    tokens: [
      "--color-hue-olive-veil",
      "--color-hue-black-veil",
      "--color-hue-chocolate-veil",
      "--color-hue-cognac-veil",
      "--color-hue-wine-veil",
      "--color-hue-camel-veil",
    ],
  },
  {
    section: "§1.6",
    title: "Hue — edge (55%, over transparent)",
    note: "Hairline, colour chip, focus ring. Composited over whatever is behind, because a chip must read on a card and on a wash.",
    tokens: [
      "--color-hue-olive-edge",
      "--color-hue-black-edge",
      "--color-hue-chocolate-edge",
      "--color-hue-cognac-edge",
      "--color-hue-wine-edge",
      "--color-hue-camel-edge",
    ],
  },
] as const;

/** The semantic layer, which must resolve on BOTH substrates. */
export const SEMANTIC: readonly string[] = [
  "--surface",
  "--surface-raised",
  "--surface-sunken",
  "--text-primary",
  "--text-secondary",
  "--text-tertiary",
  "--text-accent",
  "--text-signal",
  "--text-signal-hover",
  "--text-signal-press",
  "--border-hairline",
  "--border-strong",
  "--border-neutral",
  "--focus",
  "--link",
  "--link-hover",
  "--disabled-fg",
] as const;

export const SUBSTRATES = ["dark", "paper"] as const;

/** Flat list of every palette token, for the guard. */
export const ALL_PALETTE_TOKENS: readonly string[] = PALETTE.flatMap(
  (g) => g.tokens,
);
