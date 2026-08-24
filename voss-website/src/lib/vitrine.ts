/**
 * The configurator's material library.
 *
 * Every value here is lifted from the real catalogue in `products.ts` rather
 * than invented, so a finish the reader picks in the vitrine is a finish the
 * house actually sells. When the catalogue gains a hide, it gains a finish.
 *
 * These are *linear-friendly* hexes — three.js works in linear space and will
 * convert on assignment, so the colours read a shade richer in the scene than
 * they do as CSS swatches. That is expected; do not "correct" it by lightening
 * the hex, or the swatch and the object stop matching.
 */

export type Finish = {
  id: string;
  name: string;
  /** Body leather. */
  leather: string;
  /** Gusset and edge trim. */
  trim: string;
  /** 0 = patent, 1 = raw suede. Full-grain sits around 0.6. */
  roughness: number;
  /** Vegetable-tanned hides catch a sheen that box calf does not. */
  sheen: number;
};

export type Hardware = {
  id: string;
  name: string;
  color: string;
  metalness: number;
  roughness: number;
};

export const FINISHES: Finish[] = [
  {
    id: "noir",
    name: "Noir",
    leather: "#14100e",
    trim: "#241d19",
    roughness: 0.52,
    sheen: 0.35,
  },
  {
    id: "cognac",
    name: "Cognac",
    leather: "#7a4423",
    trim: "#5c3119",
    roughness: 0.68,
    sheen: 0.6,
  },
  {
    id: "bone",
    name: "Bone",
    leather: "#c8bba8",
    trim: "#a89880",
    roughness: 0.74,
    sheen: 0.2,
  },
  {
    id: "oxblood",
    name: "Oxblood",
    leather: "#5a1f26",
    trim: "#3d151a",
    roughness: 0.44,
    sheen: 0.7,
  },
];

export const HARDWARES: Hardware[] = [
  { id: "brass", name: "Brushed brass", color: "#c9a227", metalness: 1, roughness: 0.34 },
  { id: "nickel", name: "Polished nickel", color: "#d8d4cc", metalness: 1, roughness: 0.14 },
  { id: "gunmetal", name: "Gunmetal", color: "#4a4a52", metalness: 1, roughness: 0.42 },
];

/** The room itself is configurable — it is the thing we can actually build. */
export type Vitrine = {
  id: string;
  name: string;
  /** Niche interior. */
  wall: string;
  /** Floor and plinth stone. */
  stone: string;
  /** Key light colour. Warm boutique versus cold gallery. */
  key: string;
};

export const VITRINES: Vitrine[] = [
  { id: "salon", name: "Salon", wall: "#1a1614", stone: "#2a2724", key: "#ffe6c2" },
  { id: "gallery", name: "Gallery", wall: "#e8e4db", stone: "#cfc9bd", key: "#ffffff" },
  { id: "vault", name: "Vault", wall: "#0c0d10", stone: "#17181c", key: "#cfe0ff" },
];

export const DEFAULT_CONFIG = {
  finish: FINISHES[1],
  hardware: HARDWARES[0],
  vitrine: VITRINES[0],
};

export type Config = typeof DEFAULT_CONFIG;
