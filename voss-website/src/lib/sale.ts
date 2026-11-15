export const SALE_END = '2026-11-17T00:00:00+05:00';
export const saleActive = (now = new Date()) => now >= new Date('2026-11-03T00:00:00+05:00') && now < new Date(SALE_END);
export const SALE_PRICES: Record<string, number> = {
  'floral-embossed-tote': 2729,
  'chevron-quilted-satchel': 2869,
  'textured-dome-satchel': 2834,
  'two-tone-bag-set': 2624,
  chic: 2099,
};
