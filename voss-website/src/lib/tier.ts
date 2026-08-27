/* Device tier.
   3 — cinema: everything, including the full frame sequence at w1280.
   2 — standard: the sequence at w480, all scroll work intact.
   1 — essential: one composed still. Reduced motion, save-data, slow
       networks and low-memory devices land here by design, not by failure.

   The runtime sampler in useFrameSequence can demote 3 → 2 → 1 mid-session
   if frames actually drop; detection alone is a guess, measurement isn't. */

export type Tier = 1 | 2 | 3;

type Conn = {
  saveData?: boolean;
  effectiveType?: string;
};

export function detectTier(): Tier {
  if (typeof window === 'undefined') return 2;

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return 1;

  const nav = navigator as Navigator & {
    connection?: Conn;
    deviceMemory?: number;
  };
  const conn = nav.connection;

  if (conn?.saveData) return 1;
  if (conn?.effectiveType && /(^|-)(slow-)?2g$/.test(conn.effectiveType)) return 1;

  const mem = nav.deviceMemory ?? 4;
  const cores = navigator.hardwareConcurrency ?? 4;

  if (mem <= 2 || cores <= 2) return 1;
  if (conn?.effectiveType === '3g') return 2;
  if (mem <= 4 || cores <= 4) return 2;

  // Coarse pointer with a small viewport is a phone; give it the lighter set
  // even when it reports plenty of cores, because thermal throttling is real.
  const phone = window.matchMedia?.('(pointer: coarse)').matches && window.innerWidth < 900;
  if (phone) return 2;

  return 3;
}

export const tierWidth = (t: Tier): 720 | 1280 => (t >= 3 ? 1280 : 720);
