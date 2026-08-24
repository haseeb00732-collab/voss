@AGENTS.md

# VOSS — working rules, v2

Full direction is `../Voss-Design.md`. This file is the short version: the
things that are easy to break by accident, and the traps that have already
cost time once.

**v1's design constitution is retired.** The old rules (radius 0, no shadows,
four colours, no overshoot, three approved layout placements) are archived in
`../Voss-Design-v1-archive.md` and are no longer in force. If you are looking
for permission to try something, you have it — decide, build it, and write
down what you chose.

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

## The 3D

`components/three/`. Read `VitrineCanvas.tsx` before touching any of it.

- **Nothing is fetched at runtime.** No `.glb`, no `.hdr`, no textures. All
  geometry is generated in code and the lighting is `<Lightformer>` geometry
  baked to a cube map. `<Environment preset="…">` pulls megabytes off a CDN
  and is the fastest way to undo the entire performance argument.
- The canvas mounts only when in view **and** the browser is idle; it stops
  rendering when scrolled away and never mounts under reduced motion. The CSS
  poster underneath is what LCP actually scores. Do not "simplify" this by
  mounting the canvas directly.
- 3D lives on the homepage and in the footer. Product pages are photography.

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

## TypeScript trap

`@react-three/fiber` augments the global JSX namespace with every three.js
object. Any component typed as a bare polymorphic `ElementType` will collapse
its `ref`/`className` props to `never`, or blow up as "union type too complex".
`Reveal.tsx` shows the fix: narrow to a `ComponentType` with the props you
actually pass.

## Images

`lib/media.ts` for graded art direction; `public/products/` for the real
catalogue photography, served as plain URLs because it is unretouched.

The six photographed styles **are** the product. The four named pieces in
`products.ts` are not a catalogue — they survive as the finish library for the
configurator.

Re-run `scripts/grade-media.mjs` rather than filtering in CSS, so what ships is
what was art-directed.
