# VOSS — DESIGN & HERO ANIMATION UPGRADE

**Scope:** visual design, hero animation, product-section motion, bilingual naming, and
placing the written content. NOT commerce logic, NOT new features.

## FILE LOCATIONS — read these before starting

This file lives in `voss-website/`. Its inputs live in the project root, one level up:

| File | Where | What it is |
|---|---|---|
| `../Voss-Design.md` | project root | v2 design system — tokens, motion, type. Authority. |
| `../voss-content-pack-2026-08-30.md` | project root | **Rev 3** — the copy to place. Must be Rev 3 (Instagram + Urdu names). If yours says "Ask on WhatsApp" or "Halden/Merrow/Solene", it is stale — stop and ask Haseeb for Rev 3. |
| `CLAUDE.md` | this folder | codebase rules and known traps |
| `src/lib/catalogue.ts` | this folder | the single source of truth for names, colours, prices |

If a referenced file is missing, say so and stop. Do not proceed on a guess.

**Pricing:** list Rs 6,000 · offer Rs 4,500 · save Rs 1,500.
**Order path:** INSTAGRAM (@voss.pk) via `src/lib/instagram.ts`. No WhatsApp anywhere.

---

## 0 — SETTLE THIS FIRST, IN ONE COMMIT

The site was switched from `public/products-graded/` to `public/products/` because grading
crushed the six colours into one grey-green, making the chips useless. Wrong trade. Reverse it:

1. Restore `public/products-graded/` as the image source everywhere.
2. **DECOUPLE THE CHIPS FROM THE PHOTOS.** Chip colour is authored data in `catalogue.ts`, not
   a pixel sample. Measure each of the six — olive, black, chocolate, cognac, wine, camel —
   from the RAW file, store as hex, render the chip from that value.
3. Every chip carries its colour NAME in text. Colour is never the only differentiator —
   accessibility requirement, and it solves olive/chocolate/camel reading alike at small size.
4. Verify no two chips are perceptually identical: compute pairwise ΔE00 and report the table.
   Anything under 8 gets flagged to Haseeb, not silently shipped.

Do not touch the grading recipe this pass. Graded photos + authored chips gets both the
cohesive look and honest colour with one change.

---

## 1 — THE NAMES

| # | Latin (primary) | Urdu | Slug |
|---|---|---|---|
| 01 | Afsun | افسون | `afsun` |
| 02 | Gulnaar | گلنار | `gulnaar` |
| 03 | Naubahar | نو بہار | `naubahar` |
| 04 | Dilara | دل آرا | `dilara` |
| 05 | Mahrooh | ماہ رُخ | `mahrooh` |
| 06 | Meher | مہر | `meher` |

Assignment follows this order (name 01 → style 01) unless Haseeb says otherwise.

**BLOCKING FLAG:** ماہ رُخ transliterates as "Mahrukh", not "Mahrooh" (Mah = moon, rukh =
face). Confirm the intended spelling with Haseeb BEFORE writing slugs — it lands in the URL,
the product page and the Instagram message, and changing it later breaks links.

These names replace the old English set (Halden / Merrow / Solene / Corbel / Wren / Kestrel)
everywhere. `catalogue.ts` is the single source of truth; never hardcode a name in a component.

---

## 2 — BILINGUAL TYPOGRAPHY — this breaks silently if you skip it

Jost and Bodoni Moda contain **no Arabic-script glyphs**. Left alone, every Urdu name falls
back to a device font: Segoe UI on Windows, Noto Naskh on Android, Geeza Pro on iOS. Three
different faces, none of them Nastaliq. Fix it:

- **Self-host Noto Nastaliq Urdu** (SIL OFL). Nastaliq is what Urdu is meant to look like;
  Naskh reads as Arabic to a Pakistani eye and is the wrong signal for this brand.
- **Subset it.** The full family is several hundred KB. Six names use ~20 unique glyphs —
  subset to exactly those and it drops to a few KB. Non-negotiable against the ≤120KB /
  LCP ≤1.5s budget. Same self-host pipeline as Jost and Bodoni. No Google Fonts CDN.
- Nastaliq has deep descenders and steep diagonal baselines: `line-height: 1.9–2.2` (Latin
  sits at ~1.2), and roughly 1.3× the font-size of adjacent Latin to read as equally weighted.
- Wrap every Urdu string in `<span lang="ur" dir="rtl">` with `unicode-bidi: isolate`. Without
  isolation, adjacent Latin punctuation and digits reorder and the name renders mangled.
- Baselines do not match across scripts. Align **optically** — nudge with `translateY` and
  verify by screenshot. Do not trust the box.

**Where each script is used:**
- **Card size** (six-bag grid): **Latin only.** Nastaliq at ~16px is illegible; it needs size
  to be beautiful. The Latin name is also what she types and what the URL carries.
- **Product page:** Urdu large — 64px+ — as the display element above or beside the Latin
  name. This is where Nastaliq earns its place and the brand gets its texture.
- Never set Urdu in Bodoni or Jost. Alt text, metadata and slugs are Latin, lowercase, no
  diacritics.

---

## 3 — REFERENCE SET AND DESIGN LAW

Open these, study the mechanic, rebuild in VOSS's vocabulary. Never paste.

**Take from:**
- **aesop.com** — PRIMARY. Restraint as the luxury signal: large negative space, sparse copy,
  product isolated on a plain ground, no effects. The one reference achievable with the
  photography VOSS actually has.
- **everlane.com / nothing.tech / patagonia.com** — clear product views on plain grounds beat
  styled lifestyle scenes, and convert better.
- **allbirds.com / glossier.com** — premium feel at LCP < 1.5s. Fast and beautiful are one site.
- **unseenstudio.co.uk / uncommon.studio** — scale-on-hover, staggered entry. Best polish per byte.

**Do not copy:** lusion.co, activetheory.net, zentry.com — WebGL agency portfolios with nothing
to sell. Do not reintroduce `three` / `@react-three/fiber` / `@react-three/drei`.

**The law:**
- Negative space is the primary material. Minimum 120px between sections at 1440px, 72px at
  390px. If a section feels sparse, it is probably right.
- **One accent:** `signal` #C66963, reserved for price and order CTAs. Gold is a light
  temperature, never a fill. Two accent colours in one screenshot means one is wrong.
- Type carries the page. Bodoni Moda display 24px+ only; Jost everything else; three weights
  total plus the subset Nastaliq. If a section needs decoration to feel finished, the type is
  too small.
- Sparse copy. The content pack is already written this way — do not expand it.

---

## 4 — IMAGE QUALITY: THE "PIXELS" RULES

Source photos are 540×1170, ~540×700 usable after letterboxing. Sharp small, mush large.

- **HARD LIMIT: no product photo renders wider than 440 CSS px** at any breakpoint. A 3-column
  grid at 1440px (~400px cards) and a single column at 390px (~350px) both sit inside this.
- **Never full-bleed a product photo.** Full-bleed is what makes 540px look broken.
- **Scale down, never up**, in animation: 1.08 → 1.00, never 1.00 → 1.08. Upscaling during a
  transform resamples and softens.
- No `filter: blur()` in any scroll or hover animation. Expensive, and it reads as low-res.
- AVIF, correct `sizes`, explicit width/height. Let the browser downsample from 540, never up.
- Remove `will-change` on complete — a permanently promoted layer softens text and edges.
- Animate on whole-pixel `translate3d` values at rest. Sub-pixel resting positions blur text.
- **One aspect ratio, one crop rule across all six cards.** Consistency of frame is what makes
  six inconsistent backgrounds read as a set.
- Frame the photograph: visible plate/inset, consistent padding on a common ground, consistent
  inner vignette so backgrounds fall off into the card. Same values for all six — no per-image
  tuning, that reintroduces the inconsistency you are hiding.
- If a photo cannot be shown honestly at the shared crop without losing usable resolution, say
  which and why. Do not ship a broken card to keep the grid at six.

---

## 5 — THE HERO: FIRST-SCROLL PLAYTHROUGH ← the main fix

The hero is nearly blank on landing and feels slow. Same cause for both: it is **scrubbed**
against a 2× viewport pin, and its copy ships at `opacity: 0`.

**Delete:** the pin, the scrub, the 48-frame sequence, `heroFrame.ts`, the V-mark travel
animation and the runtime nav-slot measurement driving it.

**Build a one-shot timeline:**
- **Initial state is complete and readable at first paint.** Headline, subhead and CTA in the
  server-rendered DOM at full opacity. Nothing waits for a script. This alone fixes the blank
  hero.
- ScrollTrigger fires `once: true` on first downward scroll intent past ~48px. No scrub, no
  pin, no reverse, no re-fire.
- The timeline then plays to completion **on its own clock**, decoupled from scroll position.
  Continued scrolling never pauses, reverses or restarts it; the page scrolls normally
  underneath while it finishes.
- **Total duration 800–1000ms** (4–5 × the 200ms beat). Past 1200ms reads slow.
- **Front-load the distance:** ~60% of all movement inside the first 40% of the duration, then
  a long quiet settle. This is what makes motion read as fast without shortening it. Strong
  ease-out. Never `back` / `elastic` / `bounce`.
- Scrolling past mid-animation still completes it. Never strand an element at partial opacity.

**Smoothness — all of these, not a subset:**
- `await document.fonts.ready` before firing any timeline that animates text. Includes the
  Nastaliq subset — a font swap mid-animation causes reflow and a visible jump.
- `await img.decode()` on every image the timeline touches. A decode stall on the first frame
  is the most common cause of a janky first play.
- Set `will-change` immediately before the timeline, remove it in `onComplete`.
- Cap simultaneously animating elements at 8. Stagger beyond that.
- Never animate more than one full-viewport-sized element at a time.
- Text reveals by per-character clip-mask rise, never opacity fade. Opacity fade-in is the
  loudest template tell in this category. **Note:** per-character splitting does not work on
  Nastaliq — Arabic script is cursive and joined. Reveal Urdu as a whole-word clip mask.
- `prefers-reduced-motion`: render the completed state immediately, no timeline.

**Hero image:** build from the one photo with a plain-wall background, as a layered static
composition with parallax on the playthrough. Poster/first frame is the LCP element: composed,
AVIF, ≤60KB. Label `/* interim hero — replace when real footage exists */`.

---

## 6 — THE BAGS: build v3 §4, specified and never shipped

Immediately after the hero, nothing between.

- **a. Light travels the column** — `--light-y` tracks section scroll progress; the card under
  it cross-fades dark-base → lit grade. Two AVIFs per bag, opacity only, GPU-composited.
- **b. Arrival, not appearance** — ~24px travel, ~4% overshoot, settle inside 420ms, 60ms
  stagger. Like someone setting bags down one after another.
- **c. Velocity counter-drift** — alternating rows ±12px against scroll direction, proportional
  to velocity, springing to zero at rest. Clamp hard. The only place velocity is read.
- **d. Clip-path reveals**, never opacity. Counter-scale the inner img so the picture is
  revealed at rest. Name and price rise past 60% viewport height.
- **e. Pointer layer** (must be removable) — max 3° magnetic tilt, light origin follows pointer
  within the card. Delete it and a–d must still read as finished. Touch gets nothing extra.
- **f. Grid → product page** — cross-document View Transitions, bag image as morph target;
  Motion `layoutId` fallback.

**Price transition:** Rs 6,000 in `ink-dim` → a 1px rule strikes through it, clip-path wipe
L→R, 400ms → Rs 4,500 rises beneath on a per-character clip mask in `signal`, 200ms, starting
at 60% of the strike so they overlap. Once per session per card. No pulse, no flash, no badge.

---

## 7 — PLACING THE CONTENT

Source: `../voss-content-pack-2026-08-30.md` (Rev 3), verbatim.

| Content pack section | Goes into |
|---|---|
| §1 Hero (offer-running AND offer-ended states) | `Hero.tsx` |
| §2 The bags — label, intro, card pattern, lifestyle line bank | `Bags.tsx` |
| §3 What it is | Replaces `Manifesto.tsx` AND `TheObject.tsx` — one section, not two |
| §4 Before you pay | NEW component — currently missing entirely |
| §5 FAQs | NEW component |
| §6 Meta / OG pack | `layout.tsx` + per-route metadata |

**Delete after migrating:** `Manifesto.tsx`, `Waitlist.tsx`.
**Fix `/collection`:** it still says "Four hides" and "cut to order". Both false.
Extend the kill-list grep to catch `made to order`, `cut to order`, `four hides`.
Bracketed `[ ]` items are unconfirmed facts — leave the bracket in a TODO comment, never
invent a value.

---

## 8 — PERFORMANCE

LCP ≤1.5s desktop / ≤2.0s on 4× CPU-throttled mobile · CLS <0.02 · INP <200ms ·
initial JS ≤120KB gz · largest product image ≤120KB AVIF · 55+ fps sustained ·
Nastaliq subset ≤15KB.

- `transform` / `opacity` / `clip-path` only inside scroll handlers. Anything touching `width`,
  `height`, `top`, `left`, `margin` or `filter` during scroll needs a written justification.
- One rAF-batched writer for all scroll-derived custom properties. Never per-element listeners.
- Self-host and subset all three families. No Google Fonts CDN.
- Lenis stays, tuned heavy. Never break native scrollbar or keyboard scrolling.

---

## 9 — SKILLS

`hole-puncher` (sub-agent) **first** — pressure-test this prompt, report, and wait.
Then `redesign-existing-projects` → `design-taste-frontend` → `high-end-visual-design` →
`web-design-guidelines` for all UI work.
`image-to-code` for reading mechanics off the reference sites, not for pasting components.
`cro` on the product section and price transition.
`copywriting` + `copy-editing` when placing the content pack.
`accessibility-review` for contrast on all three grounds, keyboard traverse, and `lang`/`dir`
correctness on the Urdu.
`brandkit` so Archivo or a gold fill doesn't creep back.
`full-output-enforcement` before calling anything done.

---

## 10 — GATES. STOP AT EACH.

**A. NO CODE.** Show: the six chip hex values with a pairwise ΔE00 table; a contact sheet of
all six graded photos at the shared crop; all six names rendered in subset Nastaliq beside
their Latin, at card size AND 64px, screenshotted; the Jost/Bodoni pairing; static hero at
390 and 1440. Plus your written disagreements with anything above.

**B.** Hero playthrough only. Screen-record it; confirm ≤1000ms.

**C.** The light mechanic prototyped on ONE card, profiled at 4× CPU throttle. If it cannot
hold 55fps, simplify BEFORE it spreads.

**D.** Full bags section, then the price transition.

**E.** Content placement, new sections, `/collection` fix.

---

## 11 — DEFINITION OF DONE

- Graded photos restored; chips render from authored hex, not sampled pixels.
- No two chips perceptually identical; every chip labelled with its colour name.
- Nastaliq self-hosted and subset ≤15KB; zero Urdu rendering in a fallback system font on
  Windows, Android and iOS — verify on all three, not just this machine.
- Every Urdu string wrapped `lang="ur" dir="rtl"` with `unicode-bidi: isolate`.
- No product photo wider than 440 CSS px. No full-bleed product photo anywhere.
- Hero: no pin, no scrub, no 48-frame sequence, no V-mark travel animation.
- Hero: JS disabled → headline and CTA fully visible. This is the blank-hero test.
- Hero: timeline completes ≤1000ms; scroll rapidly past mid-animation and nothing strands.
- All six cards share one aspect ratio, one crop, one grade, one vignette.
- Order CTA renders a real Instagram link on every surface — never a silent dead button.
- Kill-list grep zero: `firenze` / `florence` / `italy` / `since 19` / `since 20` / `lorem` /
  `genuine leather` / `handcrafted` / `Santa Croce` / `made to order` / `cut to order` /
  `four hides`.
- One accent per viewport.
- Every number in §8 met, or state which was missed and by how much. Do not round 78 to "good."

Screenshots at 390 / 768 / 1440, before and after. Raw Lighthouse JSON. A screen recording of
the hero playthrough.
