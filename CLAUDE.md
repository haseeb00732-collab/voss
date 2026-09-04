# VOSS — project root

This directory is the project root, not the codebase. The Next.js site is
`voss-website/`. Everything else here is source material and direction.

**Read `voss-website/CLAUDE.md` before touching any code.** It holds the
engineering rules and the traps that have already cost time once. This file is
only the map of the root and the document-authority order.

## Which document wins

Design authority, highest first:

1. **`VOSS-VISUAL-TARGET.md`** (v3, 658 lines) — current and authoritative.
   Every number in it is a decision. If a value is not in it, decide it, build
   it, and add it there in the same commit.
2. `voss-website/CLAUDE.md` — the codebase-level engineering rules and traps.

`Voss-Design.md` is now a one-line pointer at the target. `Voss-Design-v1-archive.md`
and `VOSS-CONTEXT.md` were deleted in Phase 0 (2026-09-01) — both were stale
copies of retired design systems and both are recoverable from git.

**Mobile at 390 x 844 is the primary surface.** A decision that is good on
desktop and bad at 390px is a bad decision.

## What does not exist

- **`Voss-Plan.md`** — cited by the retired v1 archive as its companion. It is
  not on disk and never was. Do not cite it.
- No brief, no competitor/reference list. Confirmed copy lives in
  `voss-content-pack-2026-08-30.md`; everything else in the site is placeholder.
- `Voss-Logos/` is six generated raster JPEGs of the wordmark and V mark.
  **There is no vector source.** The V mark that ships is drawn in code
  (`voss-website/src/lib/vee.ts`).

## Source material

- `product 1/` and `product_2/` .. `product_12/`, plus `shoot-out/` — raw
  unretouched source photography. The six photographed styles **are** the
  product.
- Graded output belongs in `voss-website/public/products-hd/` via
  `voss-website/scripts/build-media.mjs` — grade the files, never filter in CSS.
- `.agents/product-marketing.md` — positioning and ICP context, and the two
  hard rules (origin, material) that govern what any copy may claim.
- `.claude/skills/` — 10 project-scoped skills, cut from 64 on 2026-09-01
  because every skill's description is context paid for on every turn. The
  full 64 are still in `.agents/skills/`; restore one with
  `mklink /J .claude\skills\<name> .agents\skills\<name>` and add it back to
  `skills-lock.json`.

## Working here

- The site is the deliverable. Root-level docs exist to serve it.
- Before adding a new root-level `.md`, check it isn't a fourth copy of the
  design direction. That is how `VOSS-CONTEXT.md` went stale.

## How to work here

**Briefs.** At the end of every task, append a BRIEF to `VOSS-PROGRESS.md`:
what you did, what you verified and with what number, what you could not do,
and any decision you made on Haseeb's behalf. Tick the phase box only when
every line of that phase's verify list passes. Never tick a box on an
unverified claim.

**Autonomy.** Decide and act. Log the decision under "Decisions I made" in
`VOSS-PROGRESS.md` and keep going. Do not stop the phase to ask a question
that `VOSS-VISUAL-TARGET.md` already answers, and do not stop to ask
permission for a deletion — branch, checkpoint, delete.

**Code standard.** `VOSS-VISUAL-TARGET.md` §11 governs every file: one scroll
controller, one product source, one `gsap.context` per component with a real
`revert()` cleanup, behaviour in hooks, zero magic numbers, zero hard-coded hex
outside `globals.css`, no dead code, no commented-out blocks, no `any`, no file
over ~200 lines. Comment the why, never the what. Answer §11.6's four
questions in every brief.
