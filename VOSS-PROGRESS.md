# VOSS — build progress

One append-only log. Newest phase at the bottom. Design authority is
`VOSS-VISUAL-TARGET.md`; engineering standard is its §11.

---

## Phase 0 — Audit & cleanup — 2026-09-01

### Part A — the recommendation

**Upgrade `voss-website/` in place. Do not rebuild.** `[Certain]`

Two sentences: §1–§3 of the target rewrites roughly **110 of `globals.css`'s
963 lines (~11%)** — everything else in that file is substrate machinery, type
utilities and component motion the token spec never touches — while the parts
that would be most expensive to recreate (the AVIF catalogue pipeline, the Urdu
font subsetter, the Lenis↔GSAP-ticker fix, the compositor-driven card motion)
are all wired and working today. A rebuild would pay the full migration cost to
buy a token swap that is a find-and-replace inside one file.

#### The evidence, by the four criteria asked for

**1. §0 of the target is measurably out of date, and that is the whole case.**
`[Certain]` — every row below is a grep or a computed style, not an opinion.

| §0 says | Actual state of `main` today |
|---|---|
| "The pin is `+= 2 × viewport`" | **`grep -rn "pin:" src/` returns nothing.** There is no pinned section anywhere. §4.5's budget of one pin is met with room to spare. |
| "the headline is `opacity: 0` in server markup" | `Hero.tsx` renders headline, price and both CTAs at full opacity. GSAP sets the start state in `useLayoutEffect` *before paint*, and only when `prefers-reduced-motion` is not set. §4.3 is already satisfied. |
| "Six static cards in a static grid. No hover, no touch state, no colour change" | `Bags.tsx` has per-card colourway chips that cross-fade the photograph, `PointerTilt` (= §4.4 P4 verbatim, 4° max, `pointer: fine` only), a pointer-tracked glare, and a broken 12-column desktop layout. |
| "No motion — nothing responds to the pointer" | Card arrival, in-frame counter-move, meta rise and the light travelling the column all run on `animation-timeline: view()`. The marquee tracks scroll velocity. |
| "Only two colours" | **True, and the only one of the four still true.** There is no hue anywhere except gold. §1.6's six product hues do not exist. |

One of four symptoms survives contact with the code. Rebuilding to fix one
symptom means re-deriving the three fixes that are already in.

**2. Motion / ScrollTrigger wiring — reusable, with two named gaps.** `[Certain]`

Reusable as-is:

- `SmoothScroll.tsx` — Lenis stepped from inside GSAP's ticker with
  `lagSmoothing(0)`. Two clocks reading two timestamps is what produces the
  one-frame jitter between smoothed scroll and scrubbed animation; this is the
  fix and it is not obvious. §4.4 G1 additionally wants `syncTouch: false` —
  that is already the Lenis default and is not overridden. `duration` is 1.2
  against the target's 1.0: a one-value edit.
- `scrollRefresh.ts` — re-refreshes at three timers, `load` and `fonts.ready`.
  Still needed; §4.5's offset-caching trap is real.
- `useReducedMotion.ts` — `useSyncExternalStore` over `matchMedia`. Correct.
- `useDiagonalWipe.ts` — is §5.5 / R6 already.
- The `[data-price-state]` CSS state machine — a scroll-free price transition
  whose *server-rendered* state is `done`. §4.3, executed well.

Gaps against §4.6, both cheap:

- **`gsap.matchMedia()` appears zero times.** §4.6 rule 1 says everything
  ScrollTrigger goes inside it, no exceptions. This is the single largest
  standing deficit. ~15 lines per animating component.
- **`ScrollTrigger.config({ ignoreMobileResize: true })` is missing** (§4.6
  rule 4). One line. Without it the iOS URL bar collapsing re-fires every
  trigger.
- **No single scroll controller (§4.4b).** Today there are three mechanisms: a
  module-level `velocity` in `SmoothScroll`, two raw `window` scroll listeners
  in `Hero`, and a ScrollTrigger in `Nav`. `scrollState.ts` is new work on
  either path, so it is not an argument for rebuilding.

**3. The AVIF pipeline — fully reusable, and the expensive thing to lose.**
`[Certain]`

- `scripts/build-media.mjs` → `public/products-hd/<dir>/<n>-{440,880,1320}.avif`,
  **87 files on disk**, wired into `Bags.tsx` through `hdSrcSet()`/`sizes` so
  the browser downloads the width it paints.
- `scripts/subset-fonts.py` subsets Noto Nastaliq to exactly the glyphs in the
  six Urdu names. This is the one nobody would recreate correctly: rename a bag
  without re-running it and the new letter silently falls back to Segoe UI on
  Windows and Noto Naskh on Android, and the failure is invisible until someone
  looks at a phone.
- `grade-media.mjs`, `grade-catalogue.mjs`, `build-hero.mjs`,
  `transcode-hero.sh` all still serve live assets.
- The one exception: `tier.ts` was a good device-tiering module with **zero
  importers**. Deleted rather than claimed as an asset. Recover with
  `git show phase-0-cleanup~1:voss-website/src/lib/tier.ts` if §4.6 wants it.

**4. `globals.css` against §1–§3.** `[Likely]` — the line counts are exact, the
"survives" judgement is mine.

| Region | Lines | Verdict |
|---|---|---|
| `@theme` + `:root` tokens | 1–162 | **The only region §1–§3 rewrites.** Gold ramp survives near-verbatim (`gold-700` differs by two hex digits). Easings map 1:1 onto §4.2. Radius, tracking, measure, hairline survive. Ink and text scales get new values; signal → vermilion; +18 hue tokens, `ink-850`, `cool-shade`, `--sp-1..13`, the mono family. |
| Substrate `[data-surface]` | 163–205 | Survives. Still live — `PieceHero` flips to `light`. |
| Type utilities | 243–368 | Scaffolding survives; ~6 `clamp()` values change, one mono utility is added. |
| Material, foil, rules | 370–487 | Survives. `grain` gets rewritten as one fixed overlay per §1.8. |
| Motion primitives + reduced-motion | 489–563 | Survives. |
| Urdu | 565–600 | Survives verbatim. §5.3 wants Urdu on cards; this is the only correct way to set it. |
| Bag-card `view()` timelines | 602–719 | Survives, and is **ahead of** §4.4 P1 — the target specifies a ScrollTrigger stagger; this does the same job on the compositor with zero main-thread work, which is what §4.6's 60fps budget actually needs. |
| Price transition, pointer tilt | 721–860 | Survives. |
| View transitions, hero video, gallery | 862–963 | Survives. |

#### The two strongest arguments against my own recommendation

1. **§5 cuts three shipping sections, and upgrading lets them survive by
   inertia.** §5 lists nine sections and says "Sections not in this list are
   cut" — which cuts `WhatItIs`, `BeforeYouPay` and `Faqs`, all three built
   from the content pack to answer the cash-on-delivery trust question. A
   rebuild forces the §5 composition; an upgrade lets three unlisted sections
   quietly stay because deleting them is nobody's explicit job. *Counter: that
   is a business decision about whether to drop the COD trust content, and it
   is equally available, and equally easy to duck, on either path.*

2. **The `@theme` token names are load-bearing across every component via
   Tailwind utilities, and §3.2 renames the spacing scale.** `py-section`,
   `mt-band`, `gap-gap-col`, `px-control-x-l` are compiled from `--spacing-*`
   names that §3.2 replaces with numeric `--sp-1..13`. A missed usage does not
   error — Tailwind drops an unknown utility and the spacing silently goes to
   zero. A rebuild starts on the new scale with no migration surface at all.
   *Counter: it is a bounded, greppable rename, and §3.2 defines a scale rather
   than mandating those names — the semantic aliases can point at the numeric
   scale instead of being deleted.*

### Files deleted (29)

**Components (6)** — `Threshold.tsx` · `Collection.tsx` · `HideSwatches.tsx` ·
`three/VitrineCanvas.tsx` · `three/VitrineScene.tsx` · `ui/field.tsx`
(directory `components/three/` removed)

**Libs (7)** — `products.ts` · `rawProducts.ts` · `vitrine.ts` ·
`heroFrame.ts` · `useFrameSequence.ts` · `whatsapp.ts` · `tier.ts`

**Orphan media (12)** — every `.jpg` in `src/media/` except `object-macro.jpg`:
the three `atelier-*`, `hero-aperture`, four `piece-*`, four `swatch-*`. Zero
references, all of them from the retired luxury scope.

**Scripts (2)** — `video-to-sequence.mjs` (needs `playwright-core`, which is
gone) and `grade-sequence.mjs`. Both fed the deleted frame sequence.

**Docs (2)** — `Voss-Design-v1-archive.md` (834 lines, retired twice over) ·
`VOSS-CONTEXT.md` (2026-08-24 snapshot embedding retired v1 verbatim).

`Manifesto.tsx` and `Waitlist.tsx` were on the delete list but **were already
gone** — deleted in an earlier session. Nothing to do.

### Rewritten, not deleted

- `Voss-Design.md` → one line pointing at `VOSS-VISUAL-TARGET.md`.
- `voss-website/README.md` → described a WebGL build (`Handbag.tsx`,
  `three/textures.ts`, `lib/stage.ts`, `Newsletter.tsx`, Cormorant/Montserrat)
  in which **not one named file exists**. Replaced with what the project is,
  how to run it, and the three traps worth knowing.
- `.agents/product-marketing.md` → order path WhatsApp → Instagram `@voss.pk`;
  pricing restated as list Rs 6,000 → launch Rs 4,500 (it said "Rs 4,500
  flat"); removed the four-hide made-to-order model and the `products.ts` /
  3D-finish-library references. **The origin and material hard rules are
  byte-for-byte unchanged**, as instructed.
- `CLAUDE.md` (root) and `voss-website/CLAUDE.md` → both were pointing at files
  this phase deleted, and both load into every session. Root now names
  `VOSS-VISUAL-TARGET.md` as authority; the codebase one loses its "The 3D"
  section and its `@react-three/fiber` TypeScript trap.
- `VOSS-VISUAL-TARGET.md` **copied into the repo root.** It was living in
  `C:\Users\pesum\New folder\` — outside version control, on a path one rename
  away from losing the design authority entirely.

### Code repointed off deleted data

- `TheObject.tsx` — was reading `PRODUCTS[1]` (a $1,290 USD placeholder named
  "Solene"). Now reads `CATALOGUE[0]`, and its spec list is rebuilt from facts
  the catalogue can back. The old list printed a leather grade, a dimension and
  the literal string **"TODO confirm"** — all three banned by §7.
- `CollectionGrid.tsx` — alt text said *"Style 01, top handle in Cognac"* while
  the frame showed the **Tan** colourway: it named the retired four-hide finish,
  not the photograph. Now `"The Afsun in Tan, top handle"`. Verified in the
  browser across all six cards.
- `lib/media.ts` — the macro alt claimed *"cognac calfskin"* and *"the grain"*.
  Two material claims, in alt text, read aloud to exactly the people who cannot
  check them. §7 violation, removed.
- `lib/instagram.ts` — `orderReference()` hard-coded `"Rs 4,500"` into the line
  she pastes into the DM, directly under a comment saying it exists so the
  price shown and the price quoted cannot drift. It now reads `pricing()`.
- `lib/scrollRefresh.ts` — dropped `READY_EVENT`; `Threshold` was the only
  thing that ever dispatched `voss:ready`.

### Dependencies removed (8)

`@react-three/fiber` · `@react-three/drei` · `three` (`@types/three` came off
with it) · `@gltf-transform/cli` · `lucide-react` · `radix-ui` · `shadcn` ·
`tw-animate-css`

All eight confirmed unused by `npx depcheck` **and** by grep over `src/` and
`scripts/`. Kept despite depcheck flagging them: `tailwindcss` and
`@tailwindcss/postcss` (loaded through `postcss.config.mjs`, which depcheck
cannot see), `@types/*` (type-only), and `ffmpeg-static` (used by
`scripts/transcode-hero.sh`, a live pipeline script).

### Skills — cut 54, kept 10

Kept: `design-taste-frontend` · `high-end-visual-design` ·
`web-design-guidelines` · `redesign-existing-projects` · `image-to-code` ·
`brandkit` · `copywriting` · `copy-editing` · `cro` · `product-marketing`

Cut (54): ab-testing, ad-creative, ads, ai-seo, analytics, aso, attribution,
churn-prevention, co-marketing, cold-email, community-marketing,
competitor-profiling, competitors, content-strategy, customer-research,
design-taste-frontend-v1, directory-submissions, emails, events, free-tools,
full-output-enforcement, gpt-taste, image, imagegen-frontend-mobile,
imagegen-frontend-web, industrial-brutalist-ui, influencer-marketing, launch,
lead-magnets, marketing-council, marketing-ideas, marketing-loops,
marketing-plan, marketing-psychology, minimalist-ui, offers, onboarding,
paywalls, popups, pricing, programmatic-seo, prospecting, public-relations,
referrals, revops, sales-enablement, schema, seo-audit, signup,
site-architecture, sms, social, stitch-design-taste, video.

**The usage evidence.** Across all 21 session transcripts for this project
(2026-08-22 → today), the number of skills ever actually invoked via the Skill
tool is **three**: `design-taste-frontend` (7), `product-marketing` (4),
`high-end-visual-design` (2). Every other count in a naive grep is the skills
*listing* injected into each turn's system prompt — which is exactly the context
cost being paid for 64 descriptions that never fire.

`.agents/skills/` is untouched and still holds all 64. Cutting was done with
`Directory.Delete(path, recursive: false)`, which removes the junction's reparse
point and never follows it. Restoring one is
`mklink /J .claude\skills\<name> .agents\skills\<name>` plus a `skills-lock.json`
entry. `skills-lock.json` pruned 64 → 10 to match.

### Numbers

- `node_modules`: **759 MB → 490 MB** (−269 MB, −35%)
- `src/` files: **55 → 39**
- Files deleted: **29**
- Dependencies: **19 → 11**
- Skills: **64 → 10**
- **Build passes: yes.** `next build` clean before and after; TypeScript clean;
  `next lint` reports 0 errors and 6 pre-existing `no-img-element` warnings
  (deliberate — the catalogue is served as plain URLs with hand-written
  `srcset`, documented in `catalogue.ts`).
- **Verified in the browser** at 390×844 and 1440×900: homepage and
  `/collection` both render, all six catalogue photographs load,
  `document.scrollWidth === 375` at mobile (no horizontal overflow).

### Decisions I made

- **Kept `product-marketing` in the skill set** though it was not on the keep
  list. It has 4 real invocations (more than `high-end-visual-design`'s 2) and
  it is the skill that maintains `.agents/product-marketing.md`, which both
  `CLAUDE.md` files and §7 depend on.
- **Deleted 7 files beyond the delete list** — `tier.ts`, `useFrameSequence.ts`,
  `whatsapp.ts`, `heroFrame.ts`, `HideSwatches.tsx`, `ui/field.tsx` — plus 12
  orphan `src/media` JPEGs and 2 orphan scripts. Every one has zero importers.
  §11.3 bans dead code and leaving unmounted files is how the codebase reached
  this state.
- **Moved the four finish hexes into `catalogue.ts` as `HUE_TOKENS`** per §6,
  even though they now have zero consumers, because that instruction was
  explicit. They are a *different* set from §1.6's six product hues. Flagged
  below.
- **Dropped `Piece.shotIn`** rather than carrying it. Its last reader was
  `CollectionGrid`'s alt text, and that reader was wrong.
- **Did not change the homepage composition.** §5's section list would cut
  `WhatItIs`, `BeforeYouPay` and `Faqs`; that is a content decision, not
  cleanup, and this phase was explicitly not to restyle. Flagged below.
- **Left `public/` untouched.** `products-graded/` (29 files) and
  `sequence/reveal/` are now orphaned by the deletions, and `hero/hero.mp4`
  (2.6 MB) plus three old posters are unreferenced — but they derive from source
  video that may exist only outside the repo, and deleting an unregeneratable
  master is not a cleanup.

### §11.6 — the four questions

1. **What would confuse someone opening these files cold?** That
   `TheObject.tsx` is not mounted anywhere. Fixed: its doc comment now says so
   in capitals and names the decision Phase 1 has to make. Second: `HUE_TOKENS`
   looks like the product palette and is not — its comment now says so, and
   says to delete it rather than find it a job.
2. **What did I add that nobody asked for?** The `instagram.ts` price fix and
   the two alt-text corrections. All three are §7 or §11.1 violations found
   while repointing imports I was told to repoint, and each is a two-line
   change. Nothing else was added.
3. **Where did I repeat myself?** Nowhere new. The one live duplication —
   `Bags.tsx` and `CollectionGrid.tsx` both building a product card — is a
   second occurrence, not a third, so per §11.6 it stays duplicated.
4. **What did I claim without verifying?** The `globals.css` survival
   percentage is a judgement over exact line counts, tagged `[Likely]` rather
   than `[Certain]`. Everything else in Part A is a grep or a computed style.
   The `Bags.tsx` motion is verified rendering but I have **not** measured
   60fps on a throttled mid-range Android — §4.6's budget is unverified and
   stays that way until someone traces it.

### Found, contradicting VOSS-VISUAL-TARGET.md

1. **§0's diagnosis is stale.** Three of its four symptoms describe code that
   no longer exists (table in Part A). Anyone building to §0 literally would
   re-solve fixed problems. §0 should be rewritten to the one live symptom:
   there is no hue on the page.
2. **§4.4 H3 specifies a frame sequence the hero no longer uses.** "48 frames
   desktop / 24 mobile, scrubbed against the pin" — there is no pin, and the
   hero is a real `<video>` with a lit poster. The video is the better call
   (GPU decode at native resolution vs. a per-frame `drawImage` of upscaled
   stills) and the reasoning is written up at the top of `Hero.tsx`. **H3 and
   H1 should be retired.**
3. **§1.5 reinstates a vermilion the founder replaced two days earlier.**
   `globals.css` records `--color-signal-500: #c66963`, "Set to #c66963 by
   Haseeb 2026-08-31", chosen because it *inverts across substrate* the way
   gold does — 5.28:1 on ink, 6.01:1 on paper. §1.5's `#E8452A` measures
   **5.01:1 on `--ink-950`**, so it passes AA on ink, but §1 defines no paper
   substrate at all and `PieceHero` still flips to `light`. The target is newer
   so it wins, but this looks like a decision made and un-made rather than a
   deliberate reversal. **Needs a yes/no.**
4. **§1.5's one-vermilion-per-viewport rule is violated on load right now.**
   The hero shows a vermilion price *and* a vermilion CTA fill in the same
   viewport at 390px. Screenshotted. Phase 1 fix.
5. **§6 and §11.3 disagree about hex in `catalogue.ts`.** §6 says configurator
   hexes move *into* `catalogue.ts`; §11.3 says zero hard-coded hex outside
   `globals.css`. `catalogue.ts` already carries ~30 colourway hexes. Resolved
   here as: colourway hexes are *measurements of a photograph*, i.e. data, not
   design tokens. Worth writing into §11.3 so it is not re-litigated.
6. **§5.3's card anatomy contradicts §1.3.** It puts the struck-through
   `Rs 6,000` in `--pewter`, but §1.3 restricts `--pewter` to labels and says
   anything a customer must read is `--smoke` or brighter. A price is content.
   The mono index in `--pewter` is fine; the old price is not.

### Blocked on / needs Haseeb's decision

1. **Does §5's section list actually cut `WhatItIs`, `BeforeYouPay` and
   `Faqs`?** All three ship today and all three exist to answer the
   cash-on-delivery trust question, which is this market's real objection. §5
   says sections not on its list are cut, and none of the three is on it. I did
   not cut them. **This is the one genuinely irreversible-by-inspection call in
   the phase and it is the first thing Phase 1 needs.**
2. **§1.5: `#E8452A` or `#c66963`?** See contradiction 3 above.
3. **Mount or delete `TheObject.tsx`?** §5.5 gives it a homepage slot and calls
   it the strongest frame on the site. It is repointed and correct, but still
   unmounted, and its image is a stock 3:2 macro that is not one of the six
   bags. Keeping it unmounted past Phase 1 re-creates exactly the dead-code
   problem this phase cleaned up.

### Two things found while verifying

**A pre-existing bug, not introduced here.** On `/collection`, all six cards are
stuck at `transform: scale(1.08)` permanently, with `opacity: 1`.
`CollectionGrid.tsx:32` runs
`gsap.from(cards, { opacity: 0, scale: 1.08, …, scrollTrigger: { once: true } })`
and the start state survives the tween. The photographs are therefore rendered
8% oversized and cropped on every visit. Confirmed by computed style at both
390px and 1440px. Untouched by this phase — the only edits to that file were an
import removal and an alt string.

**The disk hit 100% mid-phase.** `C:` is a 119 GB volume and reached 0 bytes
free during the build runs; writing this file failed with `ENOSPC`. Cleared the
1.1 GB npm cache (fully regenerable) to get to 0.93 GB free. That is still
thin, and `node_modules` alone is 490 MB inside a OneDrive-synced folder. Worth
addressing before Phase 1 — a full disk during a `git` operation inside OneDrive
is the scenario `CLAUDE.md` §11.5 already warns can corrupt `.git/`.

- [x] Phase 0 complete

---

## Phase 1a — Warm the ground — 2026-09-01

Scope: the background colour only. No layout, type or motion changed.

### The actual diagnosis

"Grey" was not a colour anyone picked. **Every stop of the ink ramp was
blue-tinted** — B > R at all six:

```
#060607  #0a0a0c  #131316  #1e1e22  #2c2c32  #45454e
```

Gold is the opposite (`#c2a46a`, R > G > B). A cool ground pushes gold's
complement, so the house colour came back slightly green and the page read as
grey rather than black. §1.2 of the target already called this and supplied the
values.

### What changed

`globals.css` `@theme` — the ink ramp replaced with §1.2's warm black, plus the
two tokens §1.2 adds:

```
--color-ink-950: #0b0a09   page ground        (was #060607)
--color-ink-900: #131110   raised / nav       (was #0a0a0c)
--color-ink-850: #191614   card ground        (new)
--color-ink-800: #221e1b   card ground hover  (was #131316)
--color-ink-700: #2e2926   hairline           (was #1e1e22)
--color-ink-600: #423b36   border emphasised  (was #2c2c32)
--color-ink-500: #574e48   not in §1.2, continues the same hue slope
--color-cool-shade: #0a0c0e  the only cool value on the site
```

`body` moved from a flat `ink-900` fill to `ink-950` with a vertical gradient
falling toward `cool-shade`, per §1.7's "never a flat fill on a full-viewport
surface". Warm black alone over a whole viewport goes sepia; the cool fall is
what stops it.

`Nav.tsx` — the scrolled surface moved `ink-800` → `ink-900`. On the old cool
ramp those two were close; on the warm ramp `ink-800` is a card-hover value and
read too light for a nav. §1.2 names `ink-900` as "nav on scroll".

### Verified, not asserted

Measured live in the browser with a WCAG contrast function, on the new ground:

| | ratio on `#0b0a09` |
|---|---|
| `paper-100` body text | 16.93:1 |
| `gold-300` | 12.39:1 |
| `chalk` | 9.07:1 |
| `gold-500` | **8.30:1** |
| `smoke` | 5.56:1 |
| `signal-500` (price) | **5.28:1** |

`gold-500` measured **8.30:1 on the old ground too**, and `signal-500` **5.28:1
on both**. The change is pure hue at unchanged luminance — nothing's contrast
moved, which is the point. Screenshotted and looked at, 390×844 and 1440×900,
homepage hero and product grid. Build and TypeScript clean.

### Decisions I made

- **Applied only the linear half of §1.7's ground gradient.** §1.7 also
  specifies a radial at `50% 0%`, but `SiteBackdrop.tsx` already casts a key
  light at `18% -10%` — high and slightly left, matching `--elev-*` and the
  hero clip. A second radial at centre would be a second light direction, which
  §3.4 forbids. The vertical fall gives the depth without the contradiction.
- **Kept the `SiteBackdrop` counter-fill warm.** Its comment called it "a cold
  counter-fill"; the whole ramp is warm now, so the cool direction moved into
  the body gradient's vertical fall instead. Lit side warm, shadow side cool is
  how one light actually behaves. Comment corrected at the site.

### Trap found and documented in `globals.css`

**Tailwind v4 only emits a `@theme` token that something references** — as a
utility or as a raw `var()`. Verified in the browser:
`getPropertyValue("--color-ink-850")` returns the **empty string** today, and so
do `--color-ink-500` and `--color-paper-300`, because nothing uses them yet. A
raw `var(--color-ink-850)` written now resolves to nothing rather than erroring.

**This will bite §1.6 hard.** The six `--hue-*` values must each be referenced
by their derived `-wash` / `-veil` / `-edge` tokens, or half the product palette
will silently not exist and every hue wash will render as nothing. Commented at
the token block.

### Not done, still open

The three items from Phase 0 are unchanged and still need Haseeb: §5.10 has now
settled the section-list question (nothing is cut on an omission), and §1.5 has
settled the vermilion by making it a ramp — but `--verm-800` is specified as
`<derive>` and has not been derived. **That is the next colour task**, and §1.5
says to report the value and its measured ratio on `--paper-50` rather than
guess it.

---

## Phase 1b — Outfit-style range, twelve styles, campaign band — 2026-09-01

Scope changed mid-phase at Haseeb's direction: the §3.2 spacing rename was
stopped before any edit (tree was clean at `c798444`) and replaced with this.

### What was ported from `outfit-clone.zip`, and what was not

The reference is a Vite/React clone of hellohello's *Outfit* store. **Its
structure and its hover mechanic came across. Its look did not, and none of
its assets or copy did.** That page is paper-and-red; VOSS is dark-dominant
(`voss-website/CLAUDE.md`, and §1.5b: the homepage stays dark top to bottom).
Copying the palette would have inverted the whole identity to match a
reference that was only ever cited for layout.

**The mechanic**, now `wipe-media` in `globals.css`:

```
clip-path  collapsed to the left edge  ->  full rect     (the wipe)
transform  back scale(1.2) -> 1, front 1 -> 1.03         (two planes, depth)
filter     brightness(400%) contrast(150%) -> normal     (colour resolving)
```

All three move together over `--dur-4` on `--ease-io`. Drop any one and it
reads as a plain image swap — the filter in particular is what makes it read
as a colour *changing* rather than a second picture appearing.

It earns its place on VOSS rather than being an effect for its own sake:
`front` and `back` are two **colourways of the same bag**, so hovering answers
"what else does it come in" — the question the chips underneath already
existed to answer. Gated on `(hover: hover) and (pointer: fine)`: on touch
there is no hover to leave and the card would stick on the second colourway.

Verified in the browser, computed styles rather than by eye:

| | at rest | hovered |
|---|---|---|
| `clip-path` | `polygon(0 0, 0 0, 0 100%, 0 100%)` | `polygon(0 0, 100% 0, 100% 100%, 0 100%)` |
| `transform` | `matrix(1.2, 0, 0, 1.2, 0, 0)` | `matrix(1, 0, 0, 1, 0, 0)` |
| `filter` | `brightness(4) contrast(1.5)` | `brightness(1) contrast(1)` |

### Twelve styles — and two bugs that hid six of them

`scripts/build-media.mjs` had two defects that together produced a six-style
site from a twelve-style shoot, silently:

1. **The source regex was a single `\d`.** It matched `product 1` .. `product_9`
   and was blind to `product_10`, `_11`, `_12`.
2. **It read the ROOT `product_N` folders.** For 07-12 those are raw supplier
   listing photographs: several have a colour name burned into the pixels —
   **"WHITE", "Black", and "Dark brown" in a script face** — and are shot in
   domestic interiors with a dresser and a mirror in frame. Building from them
   would have put another seller's watermark on the VOSS site.

   The restaged, studio-lit set is in `shoot-out/product_N`. The script now
   prefers it and falls back to the root folder, which is correct for 01-06
   because their root folder *is* the restaged set.

I compared both sets as contact sheets before choosing. Result: 12 styles,
7.3 MB total, every card image under 120 KB.

Third defect found while running it: **OneDrive syncs `public/` while sharp is
writing into it** and fails a write with "Invalid argument" — a different file
each run, which is the tell for sync contention rather than a bad encode. The
script now honours `VOSS_MEDIA_OUT` so the encode can happen outside the
synced tree and be moved in afterwards.

### The count was a hard-coded product fact in seven places

"Six" was written into the hero (twice), both collection pages, and three
metadata descriptions — **including the page `<title>` and the Open Graph
card**, which is the copy that actually travels on WhatsApp. Adding six styles
left every one of them lying. §11.1 says no component holds a product fact;
`catalogue.ts` now exports `STYLE_COUNT` / `styleCountWord` / `StyleCountWord`
and all seven read it.

### Campaign band

One lifestyle frame between the hero and the range — the only frame on the
site where a bag is being *carried*. Full-bleed, ~21:9, inert (no link, no
motion: §4.4's inventory does not list one here). No copy over it, because the
wordmark is already in the photograph. `loading="lazy"`, so it never competes
with the hero for LCP. 9-35 KB per width across four widths.

Note: it contains a human model, which is a departure from the rest of the
catalogue photography. It is a campaign frame rather than a product shot, so
the distinction is deliberate — but it is the only one, and it should stay
the only one.

### Deleted

`Bags.tsx` (301 lines, superseded by `Range.tsx`), `PointerTilt.tsx`, and 161
lines of now-orphaned CSS — the `.pointer-tilt` / `.bag-glare` pointer layer
and the whole `bag-*` `animation-timeline: view()` block. `globals.css` is
1037 lines, down from 1198.

### Decisions I made

- **Dark, not paper.** The reference is paper-and-red. `CLAUDE.md` and §1.5b
  both say the homepage is dark top to bottom, so the composition came across
  and the palette did not. This is the one call that would be expensive to
  reverse, and the documents answered it.
- **Deleted `PointerTilt` rather than wiring it into the new card**, even
  though §4.4 P4 specifies a pointer tilt on product cards. Two reasons: its
  own doc comment names it "the only part of the bags section that is allowed
  to be deleted", and a 3D `rotateX/rotateY` under a `clip-path` wipe shears
  the clip edge — they are not composable. The wipe now does the job P4 was
  there to do. **If P4 is wanted back, it needs a different mechanic, not this
  file.**
- **Names for styles 07-12 are PLACEHOLDER** — Sahar, Nikhat, Shabnam, Saba,
  Hilal, Zeb. Chosen in the same Urdu register as the confirmed six; Hilal
  ("crescent") was picked for the crescent silhouette. Marked as unapproved in
  `catalogue.ts`. They are one edit each and nothing outside that file
  hard-codes them — **but they are on a public page until confirmed.**
- **Colourway hexes for 07-12 were read by eye, not sampled.** The pipeline's
  automatic sampler returned the *backdrop* for several shots — style 11 came
  back as five shades of the tan wall behind a navy bag. Flagged in the file
  for re-measurement.
- **Mobile keeps §5.3's two columns** rather than inheriting the 16-column
  broken grid. Sixteen columns at 390px is two postage stamps and a lot of
  nothing; the asymmetry needs width to read as composition rather than error.

### Verified

- 12 cards render, names correct, campaign band before the range in DOM order.
- **390 x 844: `document.scrollWidth === 390`, no horizontal overflow.** §9.4.
- Token guard still passes: **83 tokens checked, 0 empty**; `verm-800` still
  4.67:1 on paper-50.
- Build and TypeScript clean; eslint clean on the three new components.
- Screenshotted and looked at, at 390 and at desktop: hero, campaign band,
  grid rows, and the hover state.

### §11.6 — the four questions

1. **What would confuse someone cold?** That `RangeCard` renders two `<img>`
   for one product. The comment at the `wipe-media` utility says why the three
   properties are one rule and why the second image is `aria-hidden`.
2. **What did I add that nobody asked for?** The `STYLE_COUNT` export. It is
   not scope creep — adding six styles made seven hard-coded "Six" strings
   false, including the page title, so it was repair, not addition.
3. **Where did I repeat myself?** `RangeCard` and `CollectionGrid` both build
   a product card. That is the second occurrence, so per §11.6 it stays
   duplicated. A third means extracting it.
4. **What did I claim without verifying?** The hover mechanic is verified by
   computed style at both ends, not by eye — I could not get a clean
   mid-transition screenshot because Lenis kept moving the page under the
   capture. I have **not** profiled the wipe on a mid-range Android; §4.6's
   60fps budget remains unverified, same as at the end of Phase 0.

### Still open

1. **Names 07-12 need confirming or replacing.** Highest priority — they ship
   on a public page.
2. **Colourway hexes 07-12 need re-measuring** from the restaged photography.
3. The §3.2 spacing rename is **not done** and is still the next token task.
   Note for whoever picks it up: `--spacing-7` .. `--spacing-13` must NOT be
   used for §3.2's scale. Tailwind's own `7..13` are 28/32/36/40/44/48/52px
   and §3.2's are 32/48/64/80/96/128/160px, and `py-8`, `py-7`, `h-11`,
   `mx-10` and `size-8` are all in use today — overriding that namespace
   silently redefines them rather than dropping them. §3.2 writes the scale as
   `--sp-1..13`, which is not a Tailwind namespace at all. Use that.
