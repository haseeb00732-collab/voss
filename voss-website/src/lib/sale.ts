export const SALE_END = '2026-11-17T00:00:00+05:00';
export const saleActive = (now = new Date()) => now >= new Date('2026-11-03T00:00:00+05:00') && now < new Date(SALE_END);
export const SALE_PRICES: Record<string, number> = {
  'floral-embossed-tote': 3509,
  'chevron-quilted-satchel': 3689,
  'textured-dome-satchel': 3644,
  'two-tone-bag-set': 3374,
  chic: 2699,
};
