@AGENTS.md

# VOSS — working rules

Full direction is `../VOSS-VISUAL-TARGET.md`, and §11 of it is the code
standard. This file is the short version: the things that are easy to break by
accident, and the traps that have already cost time once.

**Mobile at 390 x 844 is the primary surface.** Desktop is the adaptation.

## The direction, in five lines

- Dark-dominant. The whole site reads as the vitrine.
- Editorial: big Bodoni display, broken grid, overlapping crops.
- Gold is the house; **vermilion is the buy button and almost nothing else.**
- Sharp images, round buttons. Deliberately mixed.
- It has to sell. If beauty and the sale disagree, the sale wins.

## Tokens

Everything lives in `app/globals.css`. Use the semantic layer, not the
primitives: `--text-accent`, `--border-hairline`, `--link`, `--text-signal`
resolve per `data-surface`, and the gold ramp genuinely inverts across
substrates — `gold-500` on ink, `gold-900` on paper. Hard-coding either one
works until the section flips substrate, and then it is 2.0:1 and illegible.

Shadows are allowed. One light source, high and slightly left — `--elev-*`
matches the vitrine's key light. Do not introduce a second direction.

## Motion

- Every duration is a multiple of the 200ms beat (`--dur-1` … `--dur-6`).
- Entrances never overshoot. `--ease-snap` is only for something just clicked.
- Text enters word-by-word; images scale down from 1.08 while fading in.
- **One pinned section on the whole site.** If you are adding a second, you
  are probably solving the wrong problem.

**Server markup carries the FINAL state.** GSAP sets the start state on mount.
Never the reverse — a trigger that fails to fire must not be able to leave
content permanently invisible. This is the one v1 rule that survives intact,
because it was guarding a real failure rather than a taste.

Reduced motion is not a degraded site: same composition, arrived at instantly.

## There is no 3D

`components/three/`, `lib/vitrine.ts` and the `three`/`@react-three/*`
dependencies were deleted in Phase 0 (2026-09-01). The canvas was built and
never mounted. Product pages are photography and the homepage is a video hero.

If 3D is ever reconsidered, the constraint that made the old build viable still
holds and is worth reading out of git: nothing was fetched at runtime — no
`.glb`, no `.hdr`, no textures — because `<Environment preset="...">` pulls
megabytes off a CDN and is the fastest way to undo the whole performance
argument.

## ScrollTrigger

Pinned sections change document height, so anything measured before them
caches offsets from a shorter document.

**Don't reach for `refreshPriority` to fix that.** ScrollTrigger already
refreshes in document order, which is correct when the page has more than one
pin. Setting `refreshPriority: 1` on a later pin inverts that and it caches a
start position too high — the pin then holds for one viewport while reserving
three, and the reader falls through empty page. Raise priority only on a
trigger genuinely earlier in the document than the one it must precede.

Use pixel values, not percentages, for a pin's `end`
(`() => "+=" + window.innerHeight * n`). A percentage is measured against the
trigger's own height, which `pinSpacing` has already changed by the time it is
re-read.

`lib/scrollRefresh.ts` re-runs `ScrollTrigger.refresh()` at every point layout
can still move. Leave it wired up.

## TypeScript

`Reveal.tsx` narrows its polymorphic `as` prop to a `ComponentType` with the
props actually passed, rather than a bare `ElementType`. That was originally a
workaround for `@react-three/fiber` augmenting the global JSX namespace — the
dependency is gone, but the narrower type is still the better one and there is
no reason to widen it back.

## Images

`lib/catalogue.ts` is the **only** product source — names, Urdu, slugs,
colourways, image folders, prices. No component holds a product fact of its own.

Two image sets, both live, both named only in `catalogue.ts`:
`public/products-hd/` is the generated AVIF catalogue (three widths per shot,
built by `scripts/build-media.mjs`) and is what the grid renders;
`public/products/` is the original 540px phone set, kept as extra gallery
frames and **never rendered above 440 CSS px**.

Re-run the build script rather than filtering in CSS, so what ships is what was
art-directed.

`products.ts` and `rawProducts.ts` are deleted. If you find a reference to
either, it is stale.
