# VOSS — Design System

Companion to `Voss-Plan.md`. This document **extends** §1 of the plan; it does not re-open it. Onyx + gold remains the spine.

Every token below carries a one-line reason. Uncertain items are tagged `[unverified]`.

---

## 0. Three craft decisions I made that you didn't ask for

State them up front so you can kill any of them before they propagate.

### C1. One light source for all gold — `--angle-gold-light: 165deg`

The logos are **foil**, photographed under a single light. Foil has a direction. Every gold gradient on the site — the mark, hairlines, button edges, 3D metal — uses the **same 165° axis** (light from upper-left, shadow falling lower-right).

*Why:* the single fastest way to make a design system feel assembled rather than authored is gradients pointing in random directions. One light angle makes the whole page read as one photographed object. This is free and nobody will consciously notice it — which is the point.

### C2. The V's own angle is the site's only diagonal — `--angle-vee: 59deg`

Measured off the logo rasters: the V spans ≈370px wide × ≈305px tall, so each stroke sits at **≈59° from horizontal** (≈62° included angle). Every diagonal in the system — the hero aperture, section-transition wipes, the link underline sweep, the marquee skew — uses 59°, or its complement 31°.

*Why:* one derived constant turns "diagonal because it looked nice" into "diagonal because it is the logo." `[unverified — measured by eye off a 1024px JPEG. Confirm against a vector redraw before locking; if the true angle differs by more than ~2°, use the true one.]`

### C3. Two materials, not two colours — paper vs. vitrine

The cream logos are shot on **textured paper**; the black ones on **matte board under a vignette**. That's a material difference, and the site should honour it:

- **Bone sections** get a fine monochrome grain at 2.5% and *no* vignette. They are paper.
- **Onyx sections** get a soft radial vignette to `--onyx-deep` at the edges and *no* grain. They are a lit vitrine.

*Why:* the dark→light→dark rhythm stops being a colour switch and becomes a change of substrate. It is the single cheapest thing on this list and probably the most effective.

---

## 1. Colour system

### 1.1 Primitive tokens (from plan §1, unchanged)

```css
/* Dark — the vitrine */
--onyx-deep : #060607;   /* vignette floor, footer well            */
--onyx      : #0B0B0C;   /* primary dark surface                   */
--ash       : #1A1917;   /* raised dark surface: nav, cards, inputs */
--smoke     : #8C8781;   /* secondary copy on dark                  */

/* Light — the paper */
--bone      : #F1EDE4;   /* primary light surface                  */
--bone-deep : #E4DED1;   /* second light surface, dividers         */
--ink       : #141312;   /* type on light                          */

/* Gold foil ramp */
--gold-900  : #6E5527;
--gold-700  : #9A7C3E;
--gold-500  : #C2A46A;   /* THE brand gold                         */
--gold-300  : #DFCB9B;
--gold-100  : #F0E5C8;
```

### 1.2 Two neutrals added (not new hues — warm greys, per your brief)

```css
--clay      : #5C564E;   /* secondary copy on BONE                 */
--pewter    : #4A4640;   /* disabled on dark                       */
--chalk     : #B5AFA4;   /* disabled on light                      */
```

*Why `--clay`:* `--smoke` is tuned for dark surfaces and only reaches 3.0:1 on bone — it fails as body text there. The light side needed its own secondary. `--clay` is the same warm family, one step darker.

### 1.3 The finding that changes the gold rules

Plan §1 said *"gold is decoration-only on bone."* That was true of `--gold-500`, and I under-called it. Computing the whole ramp:

**`--gold-900` (#6E5527) hits 6.0 : 1 on bone — it passes AA as body text.**

So the correct rule is not "gold is banned on cream," it's that **the ramp has a surface-dependent operating range.** This is exactly the richness-from-the-ramp you asked for, and it means gold survives as a *voice* across both substrates instead of vanishing on half the site.

```
       gold-900   gold-700   gold-500   gold-300   gold-100
       #6E5527    #9A7C3E    #C2A46A    #DFCB9B    #F0E5C8

on     2.8:1      5.0:1      8.3:1      12.3:1     15.7:1
ONYX   ✗ decor    ✓ AA       ✓ AAA      ✓ AAA      ✓ AAA
                             ← operating range for dark →

on     6.0:1      3.4:1      2.0:1      1.4:1      1.1:1
BONE   ✓ AA       ~ large    ✗ decor    ✗ decor    ✗ decor
       ← operating range for light →
```

**The rule in one line:** *on onyx the gold gets lighter; on bone the gold gets darker.* The ramp inverts across the substrate. Same colour family, opposite end.

### 1.4 Full contrast matrix

All ratios computed with the WCAG 2.1 relative-luminance formula. AA body = 4.5:1, AA large (≥24px, or ≥18.66px bold) = 3:1, AAA = 7:1.

**Text on `--onyx` #0B0B0C**

| Colour | Hex | Ratio | Verdict | Role |
|---|---|---|---|---|
| `--bone` | `#F1EDE4` | **16.9:1** | AAA | text-primary |
| `--gold-100` | `#F0E5C8` | **15.7:1** | AAA | foil highlight |
| `--bone-deep` | `#E4DED1` | **14.7:1** | AAA | — |
| `--gold-300` | `#DFCB9B` | **12.3:1** | AAA | link, focus, success |
| `--gold-500` | `#C2A46A` | **8.3:1** | AAA | accent text, CTA label |
| `--oxblood-lit` | `#D9756A` | **6.3:1** | AA | error text |
| `--smoke` | `#8C8781` | **5.5:1** | AA | text-secondary |
| `--gold-700` | `#9A7C3E` | **5.0:1** | AA | hairline, muted accent |
| `--gold-900` | `#6E5527` | **2.8:1** | ✗ | decoration only |
| `--ash` | `#1A1917` | **1.1:1** | ✗ | surface separation only |

**Text on `--ash` #1A1917** (raised cards, inputs)

| Colour | Ratio | Verdict |
|---|---|---|
| `--bone` | **15.0:1** | AAA |
| `--gold-300` | **11.0:1** | AAA |
| `--gold-500` | **7.4:1** | AAA |
| `--smoke` | **4.9:1** | AA |

**Text on `--bone` #F1EDE4**

| Colour | Hex | Ratio | Verdict | Role |
|---|---|---|---|---|
| `--onyx` | `#0B0B0C` | **16.9:1** | AAA | — |
| `--ink` | `#141312` | **15.9:1** | AAA | text-primary |
| `--oxblood` | `#8C2F2A` | **7.0:1** | AAA | error text |
| `--clay` | `#5C564E` | **6.3:1** | AA | text-secondary |
| `--gold-900` | `#6E5527` | **6.0:1** | AA | accent text, link |
| `--gold-700` | `#9A7C3E` | **3.4:1** | AA-large | display accent only |
| `--smoke` | `#8C8781` | **3.0:1** | AA-large | captions only |
| `--gold-500` | `#C2A46A` | **2.0:1** | ✗ | decoration only |

**Text on `--bone-deep` #E4DED1**

| Colour | Ratio | Verdict |
|---|---|---|
| `--ink` | **13.8:1** | AAA |
| `--gold-900` | **5.2:1** | AA |

### 1.5 The one accent I'm proposing — and it isn't a brand colour

You allowed one restrained accent. Here is where the duotone genuinely breaks: **form validation.** Gold cannot mean "error" — it means luxury everywhere else on the page, and overloading it makes a failed email field look like a promotion. And whilst colour must never be the *only* error signal (we also use an icon + text), you still need a distinct one.

```css
--oxblood     : #8C2F2A;   /* error on BONE  — 7.0:1  */
--oxblood-lit : #D9756A;   /* error on ONYX  — 6.3:1  */
```

- **Total site usage: one form.** Realistically <0.5% of pixels, and only when something has gone wrong.
- **Why oxblood specifically:** it is a *warm, desaturated, leather-adjacent* red. It sits inside the same warm-neutral family as bone/clay/gold rather than introducing a cool or primary hue. Next to gold it reads as burgundy leather lining, not as a system alert.
- **Success needs no new colour:** success is `--gold-300` on onyx / `--gold-900` on bone. A gold checkmark is on-brand and celebratory; a green one would be the third hue you told me not to invent.

**If you'd rather stay absolutely pure duotone:** drop both tokens and signal error with `--bone` text + a `--gold-700` 2px left rule + an inline warning glyph + `aria-invalid`. It is defensible and passes WCAG (which never mandates red). I recommend keeping oxblood — one warm red for one purpose is craft, not compromise.

### 1.6 Semantic tokens

Two themes, same names. A section declares its substrate and every component beneath resolves correctly.

| Semantic token | On DARK (`onyx`) | On LIGHT (`bone`) | Reason |
|---|---|---|---|
| `--surface` | `--onyx` | `--bone` | the substrate |
| `--surface-raised` | `--ash` | `--bone-deep` | cards, inputs, nav-scrolled |
| `--surface-sunken` | `--onyx-deep` | `--bone-deep` | footer well, vignette floor |
| `--text-primary` | `--bone` | `--ink` | 16.9:1 both sides — symmetric by design |
| `--text-secondary` | `--smoke` | `--clay` | 5.5:1 / 6.3:1 |
| `--text-tertiary` | `--gold-700` | `--smoke` | captions, meta |
| `--text-accent` | `--gold-500` | `--gold-900` | **the ramp inverts** (§1.3) |
| `--border-hairline` | `--gold-700` @ 28% | `--gold-900` @ 22% | see hairline rule §1.8 |
| `--border-strong` | `--gold-500` @ 55% | `--gold-900` @ 45% | active/focused edges |
| `--border-neutral` | `--ash` | `--bone-deep` | non-accent dividers |
| `--focus` | `--gold-300` | `--gold-900` | 12.3:1 / 6.0:1 — both clear 3:1 |
| `--link` | `--gold-300` | `--gold-900` | |
| `--link-hover` | `--gold-100` | `--ink` | lighter on dark, darker on light |
| `--success` | `--gold-300` | `--gold-900` | no new hue |
| `--error` | `--oxblood-lit` | `--oxblood` | §1.5 |
| `--disabled-fg` | `--pewter` | `--chalk` | WCAG 1.4.3 exempts inactive controls |
| `--disabled-bg` | `--ash` | `--bone-deep` | |

### 1.7 State colours

| State | Dark | Light | Timing |
|---|---|---|---|
| rest | `--text-primary` | `--text-primary` | — |
| hover (text/link) | `--gold-100` | `--ink` | `--dur-1` `--ease-lux` |
| hover (surface) | `--ash` → lighten 4% | `--bone-deep` | `--dur-1` |
| active / pressed | `--gold-500` | `--gold-900` | `--dur-1`, no scale change |
| focus-visible | 1px `--focus` ring, 3px offset | same | instant, never animated |
| disabled | `--disabled-fg` on `--disabled-bg`, no border | same | — |
| loading | `--smoke`, 0.6 opacity pulse @ `--dur-5` | `--clay` | respects reduced-motion |

> **Rule:** hover **never** changes scale or adds a shadow. It changes *colour* and, on interactive edges, *hairline opacity*. Luxury interfaces don't bounce.

### 1.8 Gold foil ramp — exact usage per stop

| Stop | Hex | Where it goes | Never |
|---|---|---|---|
| `--gold-100` | `#F0E5C8` | Specular edge on the mark; top 8% of any foil gradient; hover state of links on dark; 3D metal highlight | As a fill — it goes grey-cream at scale |
| `--gold-300` | `#DFCB9B` | Links, focus rings, success, small icons on dark; second stop of the foil gradient | On bone (1.4:1) |
| `--gold-500` | `#C2A46A` | **The** brand gold. Accent type on dark, CTA labels, mid-stop of every gradient, 3D base metal colour | Type on bone (2.0:1) |
| `--gold-700` | `#9A7C3E` | Hairlines and rules on dark; muted accent text on dark; large display accent on bone; 3D metal shadow | Body text on bone |
| `--gold-900` | `#6E5527` | **Accent text and links on bone** (6.0:1); hairlines on bone; deepest stop of the foil gradient; darkest 3D metal | Anything on onyx (2.8:1) |

**The foil gradient** — one definition, used for the mark, the CTA edge, and any gold rule that needs to feel metallic rather than painted:

```
linear-gradient(var(--angle-gold-light),
  gold-700 0%, gold-500 22%, gold-100 38%,
  gold-300 52%, gold-700 74%, gold-900 100%)
```

*Why this shape:* the highlight sits at 38%, not 50%. Real foil catches light off-centre; a symmetric gradient reads as CSS.

**Hairlines.** The logo's stroke is genuinely hairline. A 1px border at full opacity next to it looks like scaffolding.

```css
--hairline-w      : 1px;      /* 0.5px on DPR >= 2 — see rule below */
--hairline-dark   : gold-700 @ 28%;
--hairline-light  : gold-900 @ 22%;
--hairline-strong : gold-500 @ 55% (dark) / gold-900 @ 45% (light);
```
> **Rule:** on displays with `device-pixel-ratio >= 2`, hairlines render at **0.5px**. On 1× they stay 1px at the opacities above. This is the difference between "bordered" and "drawn."

### 1.9 Visual token map — all 10 home sections

The dark→light→dark rhythm, locked. `S` = substrate.

| # | Section | S | `--surface` | `--text-primary` | `--text-secondary` | Accent | Material (C3) |
|---|---|---|---|---|---|---|---|
| 0 | Threshold | ▓ | `--onyx-deep` | `--bone` | — | foil gradient on mark | vignette, no grain |
| 1 | Hero | ▓ | `--onyx` | `--bone` | `--smoke` | `--gold-500` (eyebrow), foil (mark) | vignette |
| 2 | Marquee | ▓→░ | `--onyx` → `--bone` | `--gold-500` → `--gold-900` | — | `--gold-700` hairlines | crossfade both |
| 3 | Manifesto | ░ | `--bone` | `--ink` | `--clay` | `--gold-900` (drop-cap rule) | grain 2.5% |
| 4 | The Object | ░ | `--bone` | `--ink` | `--clay` | `--gold-900` (spec labels) | grain 2.5% |
| 5 | Collection | ░ | `--bone` | `--ink` | `--clay` | `--gold-900` (index numerals) | grain 2.5% |
| 6 | Atelier | ░→▓ | `--bone` → `--onyx` | `--ink` → `--bone` | `--clay` → `--smoke` | `--gold-700` step rules | grain fades out |
| 7 | Materials | ▓ | `--onyx` | `--bone` | `--smoke` | `--gold-500` swatch names | vignette |
| 8 | Waitlist | ▓ | `--onyx` | `--bone` | `--smoke` | `--gold-500` CTA, `--oxblood-lit` error | vignette |
| 9 | Footer | ▓ | `--onyx-deep` | `--smoke` | `--pewter` | foil on stacked mark | deepest vignette |

**Rhythm check:** ▓▓ → transition → ░░░ → transition → ▓▓▓. Two dark, three light, three dark, with both transitions doing real work. The page opens in the vitrine, moves to paper for the story and the product, and returns to the vitrine to close.

> **Transition rule (sections 2 and 6):** the substrate change is **scrubbed to scroll**, not triggered. It happens across the full height of the section so no one sees a "flip." The grain fades in as the vignette fades out, cross-dissolved on the same scrub.

---

## 2. Typography system

### 2.1 Locked pairing

| Role | Family | Axis used | Licence |
|---|---|---|---|
| Display | **Cormorant Garamond** | `wght 300–700` | OFL |
| Text / UI | **Jost** | `wght 100–900` | OFL |

Loaded via `next/font/google` → self-hosted at build, size-adjusted fallback on, `display: swap`. Exposed as `--font-display` and `--font-sans`.

**Weights actually used — three, total.** Cormorant **300** (display) and **400** (rare, for small serif italic asides). Jost **300** (body), **400** (UI/labels), **500** (eyebrows only). *Why:* fewer weights is the most reliable luxury signal in the checklist. Any fourth weight needs a reason.

### 2.2 Scale

Ratio 1.333 at display sizes, tightening to 1.2 for text. All fluid, no breakpoints needed.

| Token | Family / wt | `clamp()` | Tracking | Leading | Used in |
|---|---|---|---|---|---|
| `display-xl` | Cormorant 300 | `clamp(3.5rem, 11vw, 11rem)` | `-0.03em` | `0.88` | Hero word |
| `display-l` | Cormorant 300 | `clamp(2.75rem, 6.5vw, 6rem)` | `-0.02em` | `0.95` | Section headlines (3, 5, 6, 7) |
| `display-m` | Cormorant 300 | `clamp(2rem, 3.5vw, 3rem)` | `-0.015em` | `1.05` | Product names, Atelier steps |
| `display-s` | Cormorant 400 | `clamp(1.375rem, 2vw, 1.75rem)` | `-0.01em` | `1.2` | Card titles, footer mark line |
| `body-l` | Jost 300 | `clamp(1.0625rem, 1.3vw, 1.25rem)` | `0` | `1.65` | Manifesto, Atelier copy |
| `body` | Jost 300 | `1rem` | `0.005em` | `1.7` | Default |
| `body-s` | Jost 300 | `0.875rem` | `0.01em` | `1.6` | Form help, footer links |
| `eyebrow` | Jost 500 caps | `0.6875rem` | **`0.24em`** | `1` | Section labels |
| `wordmark` | Jost 400 caps | contextual | **`0.30em`** | `1` | The word VOSS, only |
| `caption` | Jost 300 | `0.8125rem` | `0.02em` | `1.5` | Specs, image captions |
| `numeral` | Jost 300 | `clamp(0.75rem, 1vw, 0.875rem)` | `0.08em` | `1` | Collection index (01 — 06) |

### 2.3 The two tracking rules

**Rule 1 — tracking is inverse to size.** Not a per-token whim; a function.

| Optical size | Tracking |
|---|---|
| ≥ 6rem | `-0.03em` |
| 3–6rem | `-0.02em` |
| 1.5–3rem | `-0.015em` |
| 1–1.5rem | `-0.005em` |
| < 1rem (sentence case) | `0` to `+0.005em` |
| caps labels | `+0.24em` |
| **the wordmark** | `+0.30em` |

*Why:* big type has too much air between letters at default spacing; small type has too little. Positive tracking on a large serif is the single loudest amateur tell in the anti-cheap list.

**Rule 2 — the wordmark is always the most open thing on the page.** Every other caps label sits at `0.24em`; `VOSS` sits at `0.30em`. *Why:* it creates a hierarchy of *air* rather than a hierarchy of size, so the brand reads as the calmest element even when it's small. This is why the logo works, and it should hold in the UI.

### 2.4 Usage per section

| Section | Composition |
|---|---|
| 1 Hero | `wordmark` (VOSS) + `display-xl` (one word) + `body-l` (one line) + `eyebrow` |
| 3 Manifesto | `eyebrow` + two sentences at `body-l`, no headline — *the absence of a headline is the point* |
| 4 The Object | `display-m` name + `caption` spec pairs (Material / Dimensions / Origin) |
| 5 Collection | `numeral` (01–06) + `display-m` name + `caption` material |
| 6 Atelier | `eyebrow` step + `display-l` step title + `body-l` |
| 7 Materials | `eyebrow` + swatch names at `body` + `caption` origin |
| 8 Waitlist | `display-l` + `body` + `body-s` help |
| 9 Footer | `wordmark` + `body-s` links + `caption` legal |

### 2.5 Measure and orphans

```css
--measure       : 62ch;   /* body-l and body            */
--measure-tight : 46ch;   /* display-l / display-xl     */
```
*Why the tighter measure on display:* a 62ch serif headline wraps into a paragraph shape. Display type should break into 2–3 deliberate lines, and the line breaks are art direction, not accident — set them manually in the hero and section headlines.

**No orphans.** Any headline ending in a single word on its own line gets a non-breaking space before the last word.

---

## 3. Spacing, grid & layout

### 3.1 Spacing tokens

```css
--space-section : clamp(7rem, 14vw, 14rem);   /* between sections     */
--space-block   : clamp(3rem, 6vw, 6rem);     /* within a section     */
--space-group   : clamp(1.5rem, 2.5vw, 2.5rem);
--space-item    : 1rem;
--space-tight   : 0.5rem;
--gutter        : clamp(1.25rem, 5vw, 6rem);  /* page edge            */
--gap-col       : clamp(1rem, 2vw, 2rem);     /* grid column gap      */
```

> **The rule that matters:** if a section looks cramped, it is. `--space-section` is a floor, not a target. The hero and Manifesto may exceed it.

### 3.2 The grid

12 columns, `--gutter` at the page edge, `--gap-col` between. **Content is never symmetric.**

**Three approved placements. Nothing else without a reason.**

- **A — Displaced heading:** heading `1–6`, body `8–12`. The empty col 7 is a deliberate gap, not a gutter.
- **B — Weighted image:** image `1–7`, copy `9–12`, copy vertically bottom-aligned to the image.
- **C — Full-bleed with inset caption:** image `1–12` edge-to-edge, caption `2–5` overlaid or below-left.

> **Banned:** heading and body both centred; three equal columns; anything that resolves to a 4+4+4 bento.

### 3.3 Layout sketches

**Manifesto (§3) — placement A. The whole point is the emptiness.**

```
┌───────────────────────────────────────────────────────────────┐
│ ←gutter                                              gutter→  │
│                                                               │
│  1    2    3    4    5    6  │ 7 │  8    9   10   11   12      │
│ ┌────┬────┬────┬────┬────┬────┐   ┌────┬────┬────┬────┬────┐   │
│ │                              │   │                        │  │
│ │ MANIFESTO      ← eyebrow     │   │  We make one bag at a   │  │
│ │ (gold-900, 0.24em)           │   │  time, and we make it   │  │
│ │                              │   │  slowly.                │  │
│ │                              │   │                         │  │
│ │        [ deliberately        │   │  Vachetta calf from a    │  │
│ │          empty ]             │   │  tannery in Santa Croce  │  │
│ │                              │   │  sull'Arno. Nothing      │  │
│ │                              │   │  else.                   │  │
│ │                              │   │        ← body-l, ink,    │  │
│ └──────────────────────────────┘   └──── 62ch, clay for ─────┘  │
│                                          the second para        │
│                        ↕ --space-section                        │
└───────────────────────────────────────────────────────────────┘
```
*Reason:* the eyebrow anchors far left, the copy sits far right, and roughly half the section is empty. That emptiness is the luxury. Centring this would destroy it.

**Collection rail item (§5) — placement B, alternating.**

```
 item 01                                    item 02  (mirrored)
┌──────────────────────────┬─────────┐     ┌─────────┬──────────────────────┐
│ 1        …        7      │ 9 … 12  │     │ 1 … 4   │ 6        …       12  │
│ ┌──────────────────────┐ │         │     │         │ ┌──────────────────┐ │
│ │                      │ │         │     │ 02      │ │                  │ │
│ │      [ 4:5 image ]   │ │ 01      │     │ ↑numeral│ │   [ 4:5 image ]   │ │
│ │                      │ │ ↑numeral│     │         │ │                  │ │
│ │   1px gold-900       │ │         │     │ THE     │ │                  │ │
│ │   hairline inset 0   │ │ THE     │     │ MEZZO   │ │                  │ │
│ │                      │ │ VESSEL  │     │         │ │                  │ │
│ │                      │ │         │     │ Vachetta│ │                  │ │
│ └──────────────────────┘ │ Vachetta│     │ calf    │ └──────────────────┘ │
│                          │ calf    │     │         │                      │
│                          │ ↑caption│     │         │                      │
└──────────────────────────┴─────────┘     └─────────┴──────────────────────┘
        ↕ --space-block between items, vertical offset ±6vh alternating
```
*Reason:* alternating sides plus a small vertical offset stops the rail reading as a grid. The numeral gives an editorial index feel — you are reading a catalogue, not browsing a store.

**Atelier (§6) — pinned, placement A inverted, steps cross-fade in place.**

```
┌───────────────────────────────────────────────────────────────┐
│                        [ PINNED SECTION ]                     │
│  1    2    3    4  │  5      6      7      8   │  9  10 11 12  │
│ ┌──────────────┐   │ ┌───────────────────────┐ │              │
│ │              │   │ │                       │ │  ─── 01 ───  │
│ │  ATELIER     │   │ │   [ macro crop,       │ │      02      │
│ │  ↑eyebrow    │   │ │     3:2, cross-       │ │      03      │
│ │              │   │ │     fading per step ] │ │              │
│ │  Cutting     │   │ │                       │ │  ↑ step index│
│ │  ↑display-l  │   │ └───────────────────────┘ │    gold-700  │
│ │              │   │                           │    hairline  │
│ │  One hide,   │   │  Caption changes with     │    marks the │
│ │  one bag.    │   │  the step. ↑caption       │    active one│
│ │  ↑body-l     │   │                           │              │
│ └──────────────┘   │                           │              │
│                                                               │
│  scroll ──────────────────────────────────────────────────▶   │
│  step 01 ············ step 02 ············ step 03            │
└───────────────────────────────────────────────────────────────┘
```
*Reason:* the pin holds the frame; only the copy, image and index change. Per the ScrollTrigger docs, the pinned element itself is never animated — its children are.

---

## 4. Motion system

### 4.1 Duration — one clock

Every duration is a multiple of a **200ms beat**. Nothing is arbitrary; everything on the page is rhythmically related.

```css
--dur-1 : 200ms;   /* micro: colour, hairline opacity            */
--dur-2 : 400ms;   /* small: nav state, swatch swap              */
--dur-3 : 600ms;   /* element entrance, image scale on hover     */
--dur-4 : 900ms;   /* line reveal, section heading               */
--dur-5 : 1200ms;  /* hero element, large reveal                 */
--dur-6 : 1600ms;  /* the mark draw-on, curtain lift             */
```
*Why one clock:* two animations at 340ms and 500ms read as sloppy even when nobody can name why. Multiples of one beat read as composed.

### 4.2 Easing

```css
--ease-lux    : cubic-bezier(0.22, 1, 0.36, 1);   /* ≈ GSAP power4.out — default entrance */
--ease-expo   : cubic-bezier(0.16, 1, 0.30, 1);   /* ≈ GSAP expo.out — hero, big reveals  */
--ease-inout  : cubic-bezier(0.65, 0, 0.35, 1);   /* ≈ power2.inOut — position, camera    */
--ease-linear : linear;                            /* marquee ONLY                         */
```
> **Banned: `back`, `elastic`, `bounce`, and any overshoot.** Overshoot is playful. Playful is not luxury. There is no exception on this site.

### 4.3 Stagger, scrub, scroll

```css
--stagger-line : 0.07s;   /* SplitText line reveals               */
--stagger-item : 0.09s;   /* cards, swatches, list items          */
--stagger-char : 0.02s;   /* the wordmark only, nowhere else      */

--scrub-hero     : 1.2;   /* the aperture — weighted, unhurried   */
--scrub-section  : 1.0;   /* pinned sections                      */
--scrub-parallax : 1.5;   /* background/image parallax — laziest  */

/* Lenis */
--lenis-lerp     : 0.1;
--lenis-duration : 1.2;
```
*Why these scrub numbers:* GSAP's docs define numeric `scrub` as catch-up time in **seconds**. `true` locks 1:1 and feels mechanical. `1.2` on the hero means the aperture is always a beat behind your wheel — which is what "heavy and expensive" feels like. This matches the `damping: 0.1 / 0.15` constants I pulled from the Miu Miu bundle.

### 4.4 Moment → motion recipe

| Moment | Property | Duration | Ease | Stagger | Notes |
|---|---|---|---|---|---|
| Mark draw-on (Threshold) | `stroke-dashoffset` 1→0 | `--dur-6` | `--ease-expo` | 0.12s between the 2 strokes | Once per session |
| Wordmark resolve | `letter-spacing` 0.5em→0.30em + opacity | `--dur-5` | `--ease-lux` | `--stagger-char` | Starts at 60% of the draw-on |
| Curtain lift | `clip-path` inset 0→100% from top | `--dur-5` | `--ease-expo` | — | Overlaps wordmark by 400ms |
| Hero aperture | `scale` on clip-path | scrubbed | linear (scroll IS the ease) | — | `--scrub-hero` |
| Headline line reveal | `y` 110%→0 inside overflow clip | `--dur-4` | `--ease-lux` | `--stagger-line` | Mask, never fade |
| Body copy reveal | `opacity` 0→1 + `y` 12px→0 | `--dur-3` | `--ease-lux` | `--stagger-line` | Starts 200ms after its heading |
| Image reveal | `clip-path` inset 100%→0, `--angle-vee` direction | `--dur-5` | `--ease-expo` | — | Wipes along the V's angle (C2) |
| Image ken-burns | `scale` 1→1.06 | scrubbed | linear | — | Whole pin duration |
| Collection rail | `x` driven by vertical scroll | scrubbed | — | — | `--scrub-section` |
| Rail item parallax | `y` ±4vh | scrubbed | — | — | `--scrub-parallax` |
| Substrate transition | background + grain/vignette cross-dissolve | scrubbed | — | — | Full section height |
| Marquee | `x` infinite | continuous | `--ease-linear` | — | Speed × Lenis velocity, clamped 1×–2.4× |
| Nav on scroll | bg `transparent`→`--ash` @92%, backdrop-blur 0→12px | `--dur-2` | `--ease-lux` | — | Triggered at 12vh |
| Link hover | `color` + underline `scale-x` 0→1 from left | `--dur-1` | `--ease-lux` | — | Underline is 1px `--gold-700` |
| Button hover | hairline opacity 28%→55%, label colour | `--dur-1` | `--ease-lux` | — | **No scale, no shadow** |
| Swatch hover | crop `scale` 1→1.04 | `--dur-3` | `--ease-lux` | — | Inside `overflow:hidden` |
| Focus ring | appears | **0ms** | — | — | Never animate focus |
| Form error | message `height` 0→auto + `opacity` | `--dur-2` | `--ease-lux` | — | Never shake |

### 4.5 Reduced motion

`prefers-reduced-motion: reduce` is not a degraded site. It is the same composition, arrived at instantly.

| Token / behaviour | Reduced-motion state |
|---|---|
| `--dur-1 … --dur-6` | all → `1ms` |
| All scrub values | disabled; elements render at their **final** state |
| Hero aperture | **fully open** on load, image visible, no pin |
| Threshold | skipped entirely — no mark draw, no curtain |
| Line reveals | text at final position, opacity 1 |
| Ken-burns / parallax | static at scale 1, offset 0 |
| Marquee | static, showing one full phrase, not clipped mid-word |
| Lenis | smoothing off (it does this natively; also read `lenis.prefersReducedMotion`) |
| Substrate transitions | hard switch at the section boundary |
| Focus, hover colour | **unchanged** — these are affordances, not decoration |

> **Test rule:** with reduced motion on, every section must still be *readable and complete*. If content is invisible without JS motion, that's a bug, not a preference.

---

## 5. Component look

Visual specs only. Radius is `0` unless stated — squared corners read as considered, and `border-radius: 8px` on everything is item #15 on the anti-cheap list.

### 5.1 Nav

| | Rest (over hero) | Scrolled (>12vh) |
|---|---|---|
| Background | transparent | `--ash` @ 92% + `backdrop-blur(12px)` |
| Height | `5.5rem` | `4.25rem` (transitions at `--dur-2`) |
| Bottom edge | none | `--hairline-w` `--hairline-dark` |
| Wordmark | `wordmark` token, `--bone`, foil gradient on the V glyph only | same, scaled 0.9 |
| Links | `eyebrow` token, `--smoke` | `--smoke` |
| Link hover | `--gold-300` + 1px `--gold-700` underline, `scale-x` 0→1 from left | same |
| Active link | `--gold-500`, underline at 100% | same |
| Layout | mark left, links right, **nothing centred** | same |

Mobile: shadcn `Sheet` from the right, `--onyx` at 100%, links at `display-s`, one per line, `--space-group` apart.

### 5.2 CTA — the gold hairline button

The primary button on the site. Deliberately not a filled rectangle.

```
        ┌─────────────────────────────────┐
        │                                 │   ← 1px hairline, foil gradient
        │      J O I N   T H E   L I S T  │      at --angle-gold-light
        │                                 │
        └─────────────────────────────────┘
         padding: 1.125rem 2.5rem
         label: eyebrow token (Jost 500 caps, 0.24em)
```

| Property | Dark surface | Light surface |
|---|---|---|
| Background | transparent | transparent |
| Border | `--hairline-w`, foil gradient @ 45% opacity | `--hairline-w` `--gold-900` @ 40% |
| Label | `--gold-500` (8.3:1) | `--gold-900` (6.0:1) |
| Radius | `0` | `0` |
| Hover | border → 85% opacity, label → `--gold-300` | border → 75%, label → `--ink` |
| Active | border → 100%, label → `--gold-100` | label → `--ink`, border `--gold-900` |
| Focus-visible | 1px `--focus` ring, 3px offset, **outside** the border | same |
| Disabled | border `--pewter` @ 30%, label `--pewter` | border `--chalk`, label `--chalk` |
| Transition | `--dur-1` `--ease-lux`, colour + opacity only | same |

**Secondary CTA:** text + 1px underline in `--gold-700` / `--gold-900`, no box.
**There is no third button style.**

### 5.3 Product card (collection grid, `/collection`)

```
┌──────────────────────────┐
│                          │  image: 4:5, 1px hairline inset 0
│      [ 4:5 image ]       │  no radius, no shadow
│                          │  hover: image scale 1→1.04 (--dur-3),
└──────────────────────────┘         hairline 22%→45%
  01                          numeral, --gold-900, --space-tight below
  THE VESSEL                  display-s, --ink
  Vachetta calf               caption, --clay
  ─────────                   1px --hairline-light, width 3rem, appears on hover
```
- **No price** in v1 (checkout deferred) — a card with no price and no button reads as editorial, which is the goal.
- **No badge, no ribbon, no "New" pill.** Ever.
- Whole card is one link; focus ring wraps the whole card.

### 5.4 Collection rail item (home §5)

As §3.3 diagram B. Differences from the grid card:
- Image is larger (spans 6–7 cols) and the meta sits *beside* it, not below.
- Alternating side + `±6vh` vertical offset.
- The numeral is `--gold-900` at `numeral` token, positioned at the **top** of the meta column, with a 3rem `--hairline-light` rule beneath it.
- Hover: image `scale` 1→1.03 and the meta's hairline extends `3rem → 5rem` at `--dur-3`.

### 5.5 Form field (waitlist)

```
  EMAIL                            ← eyebrow, --smoke, --space-tight below
  ┌────────────────────────────────────────────┐
  │ you@example.com                            │  ← input
  └────────────────────────────────────────────┘
  ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔  ← 1px bottom rule only
  We'll write once, when it's ready.            ← body-s, --smoke
```

| State | Bottom rule | Text | Notes |
|---|---|---|---|
| Rest | `--hairline-dark` (gold-700 @ 28%) | `--bone`, placeholder `--pewter` | **Bottom border only** — no box, no fill |
| Hover | 45% | — | |
| Focus | `--gold-300`, 1px, **plus** a 1px `--focus` ring on the field group | — | Ring is required; the rule alone isn't a visible focus indicator |
| Filled | `--gold-500` @ 55% | `--bone` | |
| Error | `--oxblood-lit` | message `--oxblood-lit` at `body-s`, preceded by a 12px warning glyph | `aria-invalid`, `aria-describedby`. **Colour is never the only signal** |
| Success | `--gold-300` | "You're on the list." + gold check | Field collapses at `--dur-2` |
| Disabled | `--pewter` @ 30% | `--pewter` | |

*Why bottom-rule-only:* a boxed input imports a form aesthetic from software. A ruled line imports it from a ledger. The second one belongs here.

### 5.6 Footer

```
┌───────────────────────────────────────────────────────────────┐
│  surface: --onyx-deep, deepest vignette                        │
│                                                                │
│                            ╲   ╱                               │
│                             ╲ ╱     ← V mark, foil gradient,   │
│                              V        56px, optically nudged   │
│                                       down 2%                  │
│                          V O S S      ← wordmark, 0.30em       │
│                                                                │
│  ──────────────────────────────────────────────────────────    │
│    ↑ 1px --hairline-dark, full width, --space-block above      │
│                                                                │
│  Collection   Atelier   Contact          Instagram             │
│  ↑ body-s, --smoke, hover --gold-300                           │
│                                                                │
│  © 2026 VOSS. Firenze.                                         │
│  ↑ caption, --pewter                                           │
└───────────────────────────────────────────────────────────────┘
```
- **No newsletter form** (it's already §8 — repeating it is desperation).
- **No social icon row.** One word-link, "Instagram." Icon soup is anti-cheap #18.
- Mark is **optically nudged down 2%** when centred — the V is top-heavy, so geometric centring reads as floating high.

---

## 6. The hero, fully art-directed — H-A "V Portal"

### 6.1 The beat sheet

| t | What happens | Tokens |
|---|---|---|
| 0.0s | Full-bleed `--onyx-deep`. Nothing. Vignette only. | — |
| 0.2s | The V's **outer** stroke begins drawing from its apex outward | `--dur-6`, `--ease-expo` |
| 0.32s | The **inner** stroke begins (0.12s behind) | same |
| 1.1s | Both strokes complete. The mark holds, still. | — |
| 1.1s | `VOSS` resolves beneath: `letter-spacing` 0.5em → 0.30em, opacity 0→1 | `--dur-5`, `--ease-lux`, `--stagger-char` |
| 1.9s | Hold. **0.6s of nothing.** This pause is the most expensive moment on the site. | — |
| 2.5s | Scroll hint: a 1px `--gold-700` vertical rule, 40px, breathing at 40% ↔ 70% | `--dur-5` loop |
| — | **From here, scroll drives everything.** `--scrub-hero: 1.2` | |
| scroll 0→100% | The V's paths, used as a `clip-path`, scale from mark-size until their edges pass the viewport. Inside them: the image. | scrubbed |
| scroll 15% | Eyebrow fades in, top-left | `--dur-3` |
| scroll 30% | `display-xl` word reveals, line-mask from below | `--dur-4`, `--ease-lux` |
| scroll 55% | The single line of copy | `--dur-3`, `--stagger-line` |
| scroll 100% | Aperture fully past the viewport; image is full-bleed; the hero unpins into §2 | — |

> **The 0.6s hold at 1.9s is deliberate and I want to defend it:** every AI-built hero animates continuously. Stillness costs nothing, cannot be faked by a template, and is the clearest possible signal of confidence. Do not fill it.

### 6.2 Composition

```
┌──────────────────────────────────────────────────────────────────┐
│  V O S S                                        Collection ·     │  ← nav, transparent
│                                                 Atelier ·        │
│                                                                  │
│   FLORENCE, SINCE                                                │  ← eyebrow, gold-500,
│   ↑ cols 1–4                                                     │    0.24em, cols 1–4
│                                                                  │
│                      ╲              ╱                            │
│                       ╲            ╱                             │
│                        ╲  ┌─────┐ ╱      ← the aperture:         │
│                         ╲ │image│╱          image visible ONLY   │
│                          ╲│     │            inside the V's      │
│                           ╲     ╱             two strokes        │
│                            ╲   ╱                                 │
│                             ╲ ╱                                  │
│                              V                                   │
│                                                                  │
│   Vessel                                                         │  ← display-xl, bone,
│   ↑ cols 1–6, baseline sits at 72% viewport height               │    -0.03em, 0.88
│                                                                  │
│                              One hide. One bag. Nothing else.    │  ← body-l, smoke,
│                              ↑ cols 8–12, right-aligned          │    cols 8–12
│                                                                  │
│                                    │  ← scroll rule, gold-700    │
└──────────────────────────────────────────────────────────────────┘
```

**Asymmetry check:** eyebrow far-left, display word bottom-left, copy bottom-right, mark optically centred but sitting at 46% height (above true centre, because the display word below it carries visual weight). Nothing is centred with anything else.

### 6.3 Exact specification

| Element | Spec |
|---|---|
| **Surface** | `--onyx` with a radial vignette to `--onyx-deep`, 140% radius from centre, no grain |
| **The mark** | Inline SVG, 2 paths, stroke width scaled so it matches the logo's optical weight at 180px tall. Stroke = the foil gradient at `--angle-gold-light`. Never a flat fill. |
| **Aperture** | The same 2 paths as a `clipPath`, masking the image. At rest the aperture ≈ 180px tall; at scroll 100% it has scaled ≈ 14× so its edges clear the viewport |
| **Aperture edge** | A 1px `--gold-500` @ 60% stroke rides the clip edge for the whole scrub, so the opening always reads as *the mark*, not a random mask |
| **Image ratio** | **4:5 portrait**, centre-weighted crop, so the composition survives the aperture at every scale |
| **Image subject** | Tight crop — a shoulder, a hand on a strap, the corner of a bag against a coat. **Not a full product shot, not a face.** |
| **Image grade** | §7 recipe, "vitrine" variant |
| **Image motion** | `scale` 1 → 1.06 across the whole pin, scrubbed |
| **Eyebrow** | `eyebrow` token, `--gold-500` (8.3:1), cols 1–4, top offset `--space-block` below nav |
| **Display word** | `display-xl`, `--bone`, cols 1–6, baseline at 72% viewport height |
| **The copy line** | `body-l`, `--smoke` (5.5:1), cols 8–12, right-aligned, `--measure-tight` |
| **Scroll rule** | 1px × 40px, `--gold-700`, centred, opacity 40%↔70% at `--dur-5` |
| **Reduced motion** | Aperture fully open, image full-bleed, all type at final position, no pin, no ken-burns. Composition identical. |

### 6.4 The copy

Headline word: **`Vessel`**
Line: **`One hide. One bag. Nothing else.`**
Eyebrow: **`FLORENCE, SINCE`** — deliberately unfinished; the founding year lands when you have one.

*Why:* "Vessel" is what the mark actually looks like and it's a bag word without being the word "bag." The line is three sentences in eight words — it states material, output and restraint, and it is the opposite of "Elevate your everyday" (anti-cheap #16). All of it is placeholder-quality-checked but yours to overrule.

### 6.5 Performance guards

- The hero image is the LCP element. `priority`, `fetchPriority="high"`, AVIF+WebP, `sizes` set to the real rendered width.
- The SVG mark is inline (~2 kB) so it paints with the document — no request.
- The clip-path scale runs on `transform`, never on `width`/`height`.
- Fonts preload from the root layout; `display: swap` + size-adjusted fallback so the display word never shifts.
- Budget: **LCP ≤ 2.5s, CLS ≤ 0.1** at 4× CPU throttle.

---

## 7. Imagery & art direction

The single biggest risk to this site is that free stock looks like free stock. These rules are what convert it.

### 7.1 The art direction recipe

Apply **all seven steps, in order**, to every image. Two variants: *paper* (bone sections) and *vitrine* (onyx sections).

| # | Step | Paper variant | Vitrine variant | Why |
|---|---|---|---|---|
| 1 | **Desaturate** | to 88% | to 82% | Stock is oversaturated to sell. Real fashion imagery isn't |
| 2 | **Lift the blacks** | to `--ink` (#141312) | to `--onyx` (#0B0B0C) | No pure black inside an image, ever. Crushed blacks read as a phone photo |
| 3 | **Warm the highlights** | pull toward `--bone` | pull toward `--gold-100` @ low amount | Ties the image to the substrate. This is the step that makes an image belong to the page |
| 4 | **No cool shadows** | — | — | Do NOT add blue/teal to shadows. Teal-and-orange is the "cinematic" tell |
| 5 | **Flatten the midtones**, then gentle S at the extremes | contrast −8%, then S | contrast −12%, then S | Slightly flat midtones read as film. Punchy midtones read as HDR |
| 6 | **Grain** | monochromatic, fine, **3%** | monochromatic, fine, **2%** | Matches the paper tooth in the logos (C3). Must be monochrome — colour noise reads as a bad sensor |
| 7 | **Frame** | 1px `--gold-900` @ 22%, inset 0 | 1px `--gold-700` @ 28%, inset 0 | The hairline is the brand's signature. It also separates image from substrate without a shadow |

**Two more, situational:**
- **Vignette** on vitrine images only, very soft, ≤12%.
- **Wipe direction:** when an image reveals, it wipes along `--angle-vee` (59°), never straight up or from the left.

### 7.2 Crop ratio family

**Only three ratios on the entire site.**

| Ratio | Use | Reason |
|---|---|---|
| **4:5** | Product, hero aperture, rail items, cards | Portrait. It's the fashion-editorial ratio and it's what a body fits in |
| **3:2** | Atelier macro crops, full-bleed editorial | Landscape. The classic photographic frame |
| **1:1** | Material swatches only | Neutral; reads as a sample, not a photo |

> **Banned: 16:9.** It reads as video, screen, or tech. Nothing on a leather goods site should look like a YouTube thumbnail.

### 7.3 Subject rules — what to actually search for

| Do | Don't |
|---|---|
| Tight crops: a hand on a strap, a shoulder, a corner of leather, a stitch line | Full-body model shots — the #1 "stock" tell |
| Texture at macro range: hide grain, thread, a buckle edge | Smiling people looking at the camera |
| Empty environments: a marble sill, a linen chair arm, a studio wall | Recognisable branded products in frame |
| Hands, always partial, never posed | Anything with legible text in the image |
| One light source, visible direction | Flat, evenly lit "catalogue" shots |

**Compliance note:** [Unsplash](https://unsplash.com/license) and [Pexels](https://www.pexels.com/license/) both permit commercial use with no attribution, and both prohibit selling unaltered copies. Pexels additionally prohibits implying endorsement by people shown — so **no identifiable face beside the Voss wordmark.** Our tight-crop rule happens to solve this for free.

### 7.4 Swap-in structure

Every image reference goes through **one module**, `src/lib/media.ts`, exporting a keyed map (`hero.aperture`, `collection.vessel.primary`, `atelier.step1`, …) with `src`, `alt`, `ratio`, and `grade: 'paper' | 'vitrine'`.

*Why:* when real photography arrives, you change one file, not thirty components. The grade token also means real photography inherits the same treatment, so the swap doesn't break the look.

---

## 8. Token summary

Everything above, in one place, for whoever implements it.

```css
/* ── COLOUR: primitives ─────────────────────────────────────── */
--onyx-deep:#060607;  --onyx:#0B0B0C;   --ash:#1A1917;   --smoke:#8C8781;
--bone:#F1EDE4;       --bone-deep:#E4DED1; --ink:#141312;
--clay:#5C564E;       --pewter:#4A4640;  --chalk:#B5AFA4;
--gold-900:#6E5527;   --gold-700:#9A7C3E; --gold-500:#C2A46A;
--gold-300:#DFCB9B;   --gold-100:#F0E5C8;
--oxblood:#8C2F2A;    --oxblood-lit:#D9756A;

/* ── GEOMETRY / MATERIAL ────────────────────────────────────── */
--angle-gold-light:165deg;   --angle-vee:59deg;
--hairline-w:1px;            /* 0.5px at DPR>=2 */
--grain-paper:3%;            --grain-vitrine:2%;
--radius:0;

/* ── TYPE ───────────────────────────────────────────────────── */
--font-display:Cormorant Garamond;  --font-sans:Jost;
--track-xl:-0.03em; --track-l:-0.02em; --track-m:-0.015em;
--track-s:-0.005em; --track-caps:0.24em; --track-wordmark:0.30em;
--measure:62ch;     --measure-tight:46ch;

/* ── SPACE ──────────────────────────────────────────────────── */
--space-section:clamp(7rem,14vw,14rem);
--space-block:clamp(3rem,6vw,6rem);
--space-group:clamp(1.5rem,2.5vw,2.5rem);
--space-item:1rem;  --space-tight:0.5rem;
--gutter:clamp(1.25rem,5vw,6rem);  --gap-col:clamp(1rem,2vw,2rem);

/* ── MOTION ─────────────────────────────────────────────────── */
--dur-1:200ms; --dur-2:400ms; --dur-3:600ms;
--dur-4:900ms; --dur-5:1200ms; --dur-6:1600ms;
--ease-lux:cubic-bezier(.22,1,.36,1);
--ease-expo:cubic-bezier(.16,1,.30,1);
--ease-inout:cubic-bezier(.65,0,.35,1);
--stagger-line:.07s; --stagger-item:.09s; --stagger-char:.02s;
--scrub-hero:1.2; --scrub-section:1.0; --scrub-parallax:1.5;
--lenis-lerp:.1;  --lenis-duration:1.2;
```

---

## 9. Decisions I need from you

| # | Decision | My default |
|---|---|---|
| 1 | **Oxblood accent** — keep for form errors, or stay pure duotone? | Keep. One warm red, one purpose, <0.5% of the site |
| 2 | **`--angle-vee: 59deg`** — I measured this off a JPEG | Keep, but confirm against a vector redraw before it propagates |
| 3 | **Hero copy** — "Vessel" / "One hide. One bag. Nothing else." | Use it; it's yours to overrule |
| 4 | **The 0.6s hold** in the hero | Keep. It's the most confident moment on the site |
| 5 | **Product names** — I invented "The Vessel" and "The Mezzo" as placeholders | Replace with real names when you have them |
| 6 | **No prices on cards** in v1 | Correct for showcase-first; revisit at checkout |
