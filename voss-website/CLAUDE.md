@AGENTS.md

# voss-website — engineering traps

The things that are easy to break by accident and have already cost time once.
There is deliberately no design direction here.

## Tokens

Every colour, duration and spacing value lives in `app/globals.css`. Use the
semantic layer, not the primitives: `--text-accent`, `--border-hairline`,
`--link`, `--text-signal` resolve per `data-surface`, and the gold ramp
genuinely inverts across substrates — `gold-500` on ink, `gold-900` on paper.
Hard-coding either one works until the section flips substrate, and then it is
2.0:1 and illegible.

## Motion

**Server markup carries the FINAL state.** GSAP sets the start state on mount.
Never the reverse — a trigger that fails to fire must not be able to leave
content permanently invisible.

Reduced motion is not a degraded site: same composition, arrived at instantly.

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

## 3D

There is none. If it comes back, fetch nothing at runtime — no `.glb`, no
`.hdr`, no textures. `<Environment preset="...">` pulls megabytes off a CDN and
is the fastest way to undo the performance budget. The old unmounted build
(`components/three/`, `lib/vitrine.ts`) is readable in git.

## TypeScript

`Reveal.tsx` narrows its polymorphic `as` prop to a `ComponentType` with the
props actually passed, rather than a bare `ElementType`. Keep it narrow.

## Images

`lib/catalogue.ts` is the **only** product source — names, slugs, colourways,
image folders, prices. No component holds a product fact of its own.

Two image sets, both live, both named only in `catalogue.ts`:
`public/products-hd/` is the generated AVIF catalogue (three widths per shot,
built by `scripts/build-media.mjs`) and is what the grid renders;
`public/products/` is the original 540px phone set, kept as extra gallery
frames and **never rendered above 440 CSS px**.

Re-run the build script rather than filtering in CSS, so what ships is what was
graded.

`products.ts` and `rawProducts.ts` are deleted. A reference to either is stale.
