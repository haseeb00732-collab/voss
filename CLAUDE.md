# VOSS — project root

This directory is the project root, not the codebase. The Next.js site is
`voss-website/`. Everything else here is source material and direction.

**Read `voss-website/CLAUDE.md` before touching any code.** It holds the
engineering rules and the traps that have already cost time once. This file is
only the map of the root and the document-authority order.

## Which document wins

Design authority, highest first:

1. **`Voss-Design.md`** — v2, 178 lines. Current and authoritative. Records
   decisions, not prohibitions. If something isn't in it, it isn't banned —
   decide it and write down what you chose.
2. `voss-website/CLAUDE.md` — the codebase-level rules. Consistent with v2.
3. `Voss-Design-v1-archive.md` — 834 lines. **Retired.** Kept for reference.
   Where it disagrees with v2, v2 wins.

**`VOSS-CONTEXT.md` is a stale snapshot.** It was assembled 2026-08-24 03:59
and its §1 embeds the full 834-line v1 design system verbatim, labelled "the
approved design system". v2 retired that system the same day at 16:53. The
snapshot is useful for finding *what documents exist*; do not build to the
design rules inside it.

## What does not exist

- **`Voss-Plan.md`** — referenced by the v1 archive as its companion (colour,
  the anti-cheap checklist, section order, the reference teardown). It is not
  on disk. Every decision so far has worked around its absence. Do not cite it.
- No brief, no approved copy document, no competitor/reference list. All copy
  currently in the site is placeholder written by me.
- `Voss-Logos/` is six generated raster JPEGs of the wordmark and V mark.
  **There is no vector source.**

## Source material

- `product 1/`, `Product 2/`, `product 3/`, `product_4/`, `product_5/`,
  `product_6/` — raw unretouched WhatsApp JPEGs. These six photographed styles
  **are** the product. Graded output belongs in `voss-website/public/products/`
  via `voss-website/scripts/grade-media.mjs` — grade the files, don't filter in
  CSS.
- `.agents/product-marketing.md` — positioning and ICP context the marketing
  skills read from.
- `.claude/skills/` — 64 project-scoped skills (marketing + frontend design).
  They resolve inside this project only.

## Working here

- The site is the deliverable. Root-level docs exist to serve it.
- Before adding a new root-level `.md`, check it isn't a fourth copy of the
  design direction. That is how `VOSS-CONTEXT.md` went stale.
