// Matched to the supplier size references supplied on 20 October 2026.
// These measurements describe the main bag, excluding handles and accessories.
// Croc Panel Dome depth is omitted: the reference graphic says 4, its text says 3.5.
export type BagMeasurements = { width: number; height: number; depth?: number; handleDrop?: number };
export const PRODUCT_MEASUREMENTS: Record<string, BagMeasurements> = {
  'jewel-bow-clutch': { width: 8, height: 5 },
  'double-buckle-flap-bag': { width: 8.5, height: 6.5 },
  'square-stitch-box-bag': { width: 10.5, height: 8.5 },
  'bow-charm-zip-satchel': { width: 12.5, height: 10.5 },
  'square-quilted-tote': { width: 14, height: 11, depth: 5, handleDrop: 10 },
  'floral-embossed-tote': { width: 12, height: 10 },
  'croc-panel-tote': { width: 13, height: 11 },
  'croc-top-handle-bag': { width: 13, height: 11 },
  'chevron-quilted-satchel': { width: 13, height: 11 },
  'textured-dome-satchel': { width: 13, height: 11 },
  'two-tone-bag-set': { width: 16, height: 11 },
  'tassel-tote': { width: 17, height: 11 },
};
