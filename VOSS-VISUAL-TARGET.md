# VOSS — Visual Target v3

**Status:** This file is the design authority. It supersedes `Voss-Design.md` (v2)
and retires `Voss-Design-v1-archive.md` entirely.
**Created:** 2026-09-01
**Rule:** Every number in here is a decision, not a suggestion. If a value is not
in this file, decide it, build it, and add it here in the same commit.

**Mobile is the primary design surface.** 390 × 844 is the canvas. Desktop is the
adaptation. If a decision is good on desktop and bad at 390px, it is a bad decision.

---

## 0. The problem this file exists to fix

**Corrected 2026-09-01 after the Phase 0 audit.** The first draft of this section
was written against the 2026-08-27 context pack, which was already several commits
stale. Three of its four claims were false. Corrected against `grep`, not memory:

| Original claim | Verified state |
|---|---|
| ~~"The hero pin is `+= 2 × viewport`"~~ | **Already fixed.** There is no `pin:` anywhere in `src/`. |
| ~~"Headline is `opacity: 0` in server markup"~~ | **Already fixed.** `Hero.tsx` renders headline, price and both CTAs at full opacity; GSAP sets the start state in a layout effect before paint. |
| ~~"Six static cards, no hover, no touch, no colour change"~~ | **Partly fixed.** `Bags.tsx` already has colourway chips, a pointer tilt matching §4.4 P4, and compositor-driven `animation-timeline: view()` motion. |
| **"Only two colours"** | **Still true.** This is the one real symptom, and §1 is the whole answer to it. |

So the genuine remaining problems are narrower than the first draft claimed:

1. **The palette is untinted.** Every surface is the same neutral black. §1.
2. **Motion is per-component and one-shot.** There is no shared scroll state, so
   nothing on the page knows the reader is still there after the first pass. §4.4b.
3. **The product section's interactions are the floor, not the ceiling.** What
   exists is P4 and part of P3. P8–P11 are what make it memorable. §4.4c.
4. **The site is still not built mobile-first.** §3, §4.6, §9.

**Standing rule from this correction:** verify a symptom against the code before
building a fix for it. A status document is a description of a moment, and this
project has now been burned by a stale one twice.

---

## 1. Colour system

### 1.1 The principle

The supporting colours are **the six bag colours**. They are not decoration —
they are the product. This is what makes the palette feel earned instead of
sprinkled on. Nothing gets a hue unless a bag has that hue.

### 1.2 Ground — warm black, never pure black

Pure `#000` is what makes the current site read cheap. Every ground is warm.

```css
--ink-950: #0B0A09;   /* page ground */
--ink-900: #131110;   /* raised surface, nav on scroll */
--ink-850: #191614;   /* card ground */
--ink-800: #221E1B;   /* card ground, hovered */
--ink-700: #2E2926;   /* hairline / border */
--ink-600: #423B36;   /* border, emphasised */
--cool-shade: #0A0C0E; /* the ONLY cool value — used at 0–40% inside gradients
                          so blacks have depth instead of reading flat brown */
```

### 1.3 Text

```css
--chalk:  #F4EFE8;  /* primary text on ink — 15.8:1 on ink-950 */
--smoke:  #B3AAA2;  /* secondary — 7.6:1 */
--pewter: #7C736C;  /* meta / mono labels — 4.1:1, LABELS ONLY, never body */
```

`--pewter` on `--ink-950` fails WCAG AA for body text. It is permitted only for
uppercase mono micro-labels at 11px+ with 0.12em tracking, where it reads as
material texture rather than content. Anything a customer must read is `--smoke`
or brighter.

### 1.4 Gold — the house

```css
--gold-300: #EBD7A8;  /* highlight, hairline on hover */
--gold-500: #C9A961;  /* default gold on ink */
--gold-700: #9A7C40;  /* gold on lighter ink surfaces */
--gold-900: #5E4C28;  /* gold on paper substrate */
```

Gold is **never** a button fill. Gold is hairlines, small caps, the V-mark, the
1px line under an active nav item. The moment gold fills a large area it reads as
a template.

### 1.5 Vermilion — the verb

**Amended 2026-09-01.** The first draft specified a single `#E8452A`. That
overwrote a deliberate decision made on 2026-08-31 to use `#c66963` *because it
inverts across substrate the way gold does* — and the Phase 0 audit was right to
flag it. Reinstating a flat value was a decision un-made by accident.

The resolution is neither value alone. **Vermilion becomes a ramp, exactly like
gold**, because §5.5 piece pages genuinely flip substrate — the page floods with
the chosen hide and `PieceHero` goes light. A signal colour that only works on ink
is a real bug on those pages; a single compromise value that works everywhere is a
weaker signal than a ramp that is correct in both.

```css
--verm-400: #FF5F3E;   /* hover, on ink */
--verm-500: #E8452A;   /* on ink — measured 5.01:1 on --ink-950, passes AA */
--verm-600: #C2331B;   /* pressed, on ink */
--verm-800: <derive>;  /* on paper — start from the #c66963 hue and darken until it
                          measures ≥ 4.5:1 on --paper-50. Report the value and the
                          measured ratio in the brief. Do not guess it. */
```

Resolve it through the semantic layer per `data-surface`, the same mechanism the
gold ramp already uses — never by hard-coding either end:

```css
[data-surface="dark"]  { --text-signal: var(--verm-500); }
[data-surface="paper"] { --text-signal: var(--verm-800); }
```

Components reference `--text-signal`. Hard-coding `--verm-500` works right up until
the section flips substrate, and then the buy button is at 3:1. This is the
identical trap the gold ramp already documents.

### 1.5b Paper substrate — now defined

The first draft defined no paper substrate at all while `PieceHero` was already
flipping to light. That gap is what made the vermilion question ambiguous.

```css
--paper-50:      #F4EFE8;
--paper-100:     #E9E2D8;
--paper-200:     #D8CFC2;   /* hairline on paper */
--ink-on-paper:  #17130F;   /* primary text on paper */
--smoke-on-paper:#5A524A;
```

Gold on paper is `--gold-900`; vermilion on paper is `--verm-800`. Both resolve
through the semantic layer. **Paper appears on piece pages only** — the homepage
stays dark top to bottom.

### 1.5c The rule

**One vermilion element per viewport.** If two are visible at once, one is wrong.
Price is vermilion. The primary CTA is vermilion. They must never be in the same
viewport — which means the product card shows a vermilion price and a *ghost*
button, not a vermilion button.

### 1.6 Product hues — the supporting palette

```css
--hue-olive:     #5A5F3C;
--hue-black:     #22212B;   /* lifted, so "black" bag reads as a hue not the ground */
--hue-chocolate: #4A3128;
--hue-cognac:    #8A4E28;
--hue-wine:      #5C1F2B;
--hue-camel:     #B08556;
```

Each hue gets three derived tokens, generated once in `globals.css`:

| Token | Value | Used for |
|---|---|---|
| `--hue-{x}-wash` | hue at **8%** over `--ink-950` | Section background when that colour is active |
| `--hue-{x}-veil` | hue at **18%** over `--ink-850` | Card ground on hover / active colourway |
| `--hue-{x}-edge` | hue at **55%** | Hairline, colour chip, focus ring |

**This is the single biggest change to how the site feels.** Right now every
section is the same black. After this, scrolling the page moves through
olive → chocolate → wine → camel washes, all so subtle no one can name them, but
the page stops being one flat colour.

### 1.7 Gradients — how depth is made

Never a flat fill on a full-viewport surface. Every ground gets one of:

```css
/* Ground gradient — used on <body> and every full-bleed section */
background:
  radial-gradient(120% 80% at 50% 0%, var(--ink-850) 0%, transparent 60%),
  linear-gradient(180deg, var(--ink-950) 0%, var(--cool-shade) 100%);

/* Hue wash — added when a colour section is active, cross-faded over 800ms */
background-image:
  radial-gradient(90% 60% at 50% 40%, var(--hue-cognac-wash) 0%, transparent 70%);
```

### 1.8 Grain

One 128×128 tiling SVG noise at `opacity: 0.035`, `mix-blend-mode: overlay`,
`position: fixed`, `pointer-events: none`, above everything. Costs ~2KB inline,
kills banding in the gradients, and is 80% of why expensive sites look expensive.
**Non-negotiable.**

---

## 2. Type

### 2.1 Families

| Role | Family | Weights | Rule |
|---|---|---|---|
| Display | **Bodoni Moda** | 400, 400 italic | Only at ≥ 2rem. There is no medium Bodoni on this site. |
| UI / body | **Archivo** | 400, 500, 600 | Everything under 1.5rem. |
| Micro-label | **IBM Plex Mono** | 400 | **NEW.** Uppercase, 0.12em tracking, ≤ 0.75rem. Price meta, "IN STOCK", "COD", specs, indices. |

The mono is new and it is doing real work: it is the cheapest way to make a page
read as *considered* rather than *decorated*, and it gives the eye a third texture
so the page is not just "serif headline + sans body" like every template.

### 2.2 Scale — mobile-first, fluid

```css
--fs-display-1: clamp(2.5rem, 7vw, 5.5rem);     /* hero H1 — amended, see below */
--fs-display-2: clamp(2rem,   8.5vw, 4.5rem);   /* section headline */
--fs-display-3: clamp(1.5rem, 5.5vw, 2.5rem);   /* pull quote */
--fs-h4:        1.125rem;                        /* product name */
--fs-body:      1rem;                            /* 16px min — never smaller on mobile */
--fs-small:     0.875rem;
--fs-meta:      0.6875rem;                       /* mono only */
```

```css
--lh-display: 0.92;   --ls-display: -0.025em;
--lh-body:    1.6;    --ls-body:     0;
--lh-meta:    1;      --ls-meta:     0.12em;
```

**Amended 2026-09-02.** `--fs-display-1` was `clamp(2.75rem, 13vw, 7.5rem)`.
That was sized against the hero line it was written for, "Carry it your way."
— 18 characters. The line is now "Made to find its way to you.", 28
characters, in a headline column that is 6 of 12 (643px at 1440). At the old
7.5rem max that is ~5 characters per line: the headline wrapped to three
lines, stood 331px tall, and pushed the hero to **926px inside a 900px
viewport**, so the hero stopped fitting on one screen.

**A display size is only correct against a measure.** The number that matters
is characters per line, not the size itself. 5.5rem in a 643px column is ~14
characters a line — two lines for this headline, 162px tall, hero back to
900px. The vw factor drops with it so the growth between breakpoints is
gentler than 13vw was making it.

If the hero line changes length again, re-measure. Do not assume the clamp
still holds.

**Trap already hit once on this project:** display letter-spacing on running text
shattered the hero across five lines. Tracking is a *display-only* token. Body is
`0`. Never apply `--ls-display` to anything under 2rem.

### 2.3 Measure

Body copy is capped at `65ch`. On mobile that is never reached; on desktop it stops
a paragraph running the full 1280px, which is the other half of "looks like a
template."

---

## 3. Grid & spacing

### 3.1 Breakpoints

```
base   390px   4 col   20px margin   12px gutter   ← design here first
sm     480px   4 col   24px margin   14px gutter
md     768px   8 col   32px margin   16px gutter
lg    1024px  12 col   48px margin   20px gutter
xl    1280px  12 col   64px margin   24px gutter   max content 1440px
```

### 3.2 Spacing scale — 4px base

> **Migration hazard, raised by the Phase 0 audit and it is a real one.** Renaming
> spacing utilities in Tailwind **fails silently** — an unknown utility is dropped,
> not errored. A typo'd token does not break the build; it produces an element with
> no padding that nobody notices until it ships.
>
> So the rename is done in one commit, and that commit includes: a grep of every
> old utility name proving zero remain, a full-page screenshot at 390 and 1440
> before and after, and a diff of the two. If a section's height changed, a token
> was dropped. Do not spread this rename across phases.

```
--sp-1: 4px    --sp-4: 16px   --sp-8:  48px   --sp-12: 128px
--sp-2: 8px    --sp-5: 20px   --sp-9:  64px   --sp-13: 160px
--sp-3: 12px   --sp-6: 24px   --sp-10: 80px
               --sp-7: 32px   --sp-11: 96px
```

Section vertical rhythm: `--sp-11` (96px) mobile, `--sp-13` (160px) desktop.

### 3.3 Radius

```css
--radius-0:  0;      /* images, plates, cards — sharp */
--radius-xs: 4px;    /* chips, tags */
--radius-sm: 8px;    /* buttons, inputs */
--radius-pill: 999px;/* the scroll cue, the colour chips */
```

Sharp images, round controls. Deliberately mixed — this survives from v2.

### 3.4 Elevation

One light source, high and slightly left. Never a second direction.

```css
--elev-1: 0 2px 8px    rgba(0,0,0,.34);
--elev-2: 0 8px 28px   rgba(0,0,0,.42);
--elev-3: 0 22px 64px  rgba(0,0,0,.52);
--elev-glow: 0 12px 48px var(--hue-{active}-veil);  /* hovered/active card only */
```

---

## 4. Motion — the spec

### 4.1 The beat

Every duration is a multiple of **200ms**.

```css
--dur-1: 120ms;  /* micro: press, chip, focus ring — the one sub-beat exception */
--dur-2: 240ms;  /* hover, nav */
--dur-3: 400ms;  /* card state, chip swap */
--dur-4: 600ms;  /* entrance */
--dur-5: 800ms;  /* section wash cross-fade */
--dur-6: 1200ms; /* hero headline sequence */
```

### 4.2 Easings

```css
--ease-out:  cubic-bezier(0.16, 1, 0.30, 1);   /* power3.out — the default */
--ease-io:   cubic-bezier(0.65, 0, 0.35, 1);   /* symmetric moves */
--ease-snap: cubic-bezier(0.34, 1.4, 0.44, 1); /* the ONE overshoot — only on
                                                  something just clicked/tapped */
```

`back`, `elastic`, `bounce` are banned on entrances. An entrance that overshoots
reads as a toy.

### 4.3 The load-bearing rule (survives from v1 and v2)

**Server markup carries the FINAL state.** GSAP sets the start state on mount,
never the reverse. A ScrollTrigger that fails to fire must never be able to leave
content permanently invisible.

The current hero violates this. It is the #1 bug on the site.

### 4.4 Motion inventory — what actually moves

This is the list. If a motion is not here, it does not ship.

**Global**
| # | Motion | Spec |
|---|---|---|
| G1 | Smooth scroll | Lenis, `duration: 1.0`, expo-out. **`syncTouch: false`** — native momentum on touch. Overriding mobile scroll physics is what makes a site feel laggy on a phone. |
| G2 | Nav auto-hide | Scroll down > 80px → translateY(-100%), `--dur-2`. Scroll up → back. |
| G3 | Nav material change | At scrollY > 24: ground → `--ink-900` + 1px `--ink-700` hairline + `backdrop-filter: blur(16px)`. `--dur-2`. Never a shadow. |
| G4 | Grain | Static. Does not animate. |

**Hero**
| # | Motion | Spec |
|---|---|---|
| H1 | Pin length | **`+= 1.0 × innerHeight` on mobile, `1.5 ×` on desktop.** Down from 2×. This is the "scroll faster" fix. |
| H2 | Headline reveal | **On page load, not on scroll.** Per-word mask-up, `y: 105% → 0`, 40ms stagger, `--dur-4`, `--ease-out`. Starts at 200ms after fonts resolve. |
| H3 | Frame sequence | 48 frames desktop / **24 frames mobile**. Scrubbed against the pin. Loaded *after* the `load` event so it never competes with LCP. A CSS poster is what LCP scores. |
| H4 | Hue drift | A radial `--hue-cognac-wash` glow, `scale 1 → 1.15` + `opacity .6 → 1`, scrubbed across the pin. Cheap, and it is what makes the hero feel like it has air in it. |
| H5 | Scroll cue | A 1px 32px vertical line, `--gold-500`, scaleY 0→1→0 loop, 2400ms, `--ease-io`. Fades out at scrollY > 40. |
| H6 | CTA row | **Visible in server markup.** Fades in at 600ms with the headline. Never gated on scroll. |

**Product grid — the section he called dull**
| # | Motion | Spec |
|---|---|---|
| P1 | Entrance | Cards stagger 60ms, `y: 24 → 0`, `opacity: 0 → 1`, inner image `scale: 1.06 → 1`. `--dur-4`, `--ease-out`. Trigger `top 85%`, `once: true`. |
| P2 | Hover (pointer: fine) | Image `scale: 1.05` over `--dur-4`; card `y: -6px`; ground → `--hue-{x}-veil`; hairline → `--gold-300`; `--elev-glow` fades in. |
| P3 | Colour chips | Hidden at `y: 8, opacity: 0`. On hover/focus, slide up staggered 40ms, `--dur-3`. On mobile they are **always visible** — no hover to reveal them. |
| P4 | Pointer tilt | `rotateX/rotateY` max **4deg**, damped toward target in `requestAnimationFrame` (not a tween). `pointer: fine` only. Disabled under reduced motion. |
| P5 | **Touch active state** | `:active` → card `scale: 0.98`, `--dur-1`, `--ease-snap`. This is the "nothing happens when my finger touches it" fix. |
| P6 | **Mobile colourway cycle** | As a card's centre crosses the viewport centre, its image cross-fades to the next colourway, `--dur-5`. One step per card per pass. This is the mobile replacement for hover, and it is the single motion that will make the phone experience feel alive. |
| P7 | Chip → image swap | Tapping a colour chip cross-fades the card image, `--dur-3`, and the chip's ring animates to `--hue-{x}-edge` in `--dur-1`. |

**Sections**
| # | Motion | Spec |
|---|---|---|
| S1 | Hue wash | Each section declares an active hue. On `onEnter`/`onEnterBack`, the page-level wash layer cross-fades to that hue, `--dur-5`, `--ease-io`. This is what stops the page being one black. |
| S2 | Headline reveal | Per-word mask-up, 40ms stagger, `--dur-4`. Trigger `top 80%`, `once: true`. |
| S3 | Image reveal | `scale: 1.08 → 1` + fade, `--dur-4`. Never a slide. |
| S4 | Marquee | Infinite strip, base 40s, speed multiplied by scroll velocity clamped **1 → 2.4×**, eased back to 1 over `--dur-5`. |
| S5 | Diagonal wipe | The Object section only. `clip-path` polygon on the V-angle. **One per site.** |
| S6 | Proof tiles | Count/label pairs, `y: 16 → 0` staggered 80ms. |

**Controls**
| # | Motion | Spec |
|---|---|---|
| C1 | Button hover | Fill wipes in from left, `--dur-2`, `--ease-out`. Label colour cross-fades at 50%. |
| C2 | Button press | `scale: 0.97`, `--dur-1`, `--ease-snap`. |
| C3 | Focus ring | 2px `--gold-300` at 2px offset, `--dur-1`. Always visible on `:focus-visible`. |
| C4 | Link underline | 1px, `scaleX 0 → 1` from left, `--dur-2`, transform-origin flips on exit. |

### 4.4b Scroll reactivity — everything on the page responds to the scroll

This is the difference between "a page with some animations on it" and a page that
feels alive. Right now every motion on the site is a one-shot entrance that fires
once and is never heard from again. That is why it reads as dead: after the first
pass, nothing on the page knows the reader is still there.

**One controller, everyone subscribes.** Build a single scroll controller
(`src/lib/scrollState.ts`) that publishes four values every frame, outside React
state:

```ts
scrollY      // px
velocity     // px/frame, signed, damped
direction    // 1 | -1
progress     // 0–1 through the document
```

Nothing else in the app may attach its own `scroll` listener. One rAF loop, one
source of truth, every effect reads from it. Six components each running their own
listener is the standard way a site ends up janky on a phone.

**What reacts, and how much:**

| # | Effect | Spec |
|---|---|---|
| R1 | **Depth parallax** | Three speeds and no more: hue wash `0.3×`, images `0.85×`, text `1.0×`. Applied with `translate3d`, scrubbed. Three layers reads as depth; five reads as broken. |
| R2 | **Velocity skew** | Content wrapper `skewY` = `clamp(velocity × 0.06, -3deg, 3deg)`, eased back to 0 over `--dur-3`. This is the single cheapest effect that makes a page feel like it has weight. Desktop and high-refresh mobile only; cap at 3deg — past 4deg it reads as a glitch. |
| R3 | **Column offset in the grid** | In a 3-col grid, column 1 offsets `0`, column 2 `-40px`, column 3 `-80px`, scrubbed across the section. In 2-col mobile: `0` / `-28px`. The grid stops being a table and becomes a composition. |
| R4 | **In-frame image parallax** | Each product image moves at `0.9×` inside its own 4:5 mask as the card crosses the viewport. Subtle, and it is what makes a static photo feel photographed rather than pasted. |
| R5 | **Scrubbed headline** | Section headlines reveal word-by-word tied to scroll *progress*, not a one-shot trigger — scroll back up and they un-reveal. Two sections only (hero + The Object); everywhere else uses the one-shot S2. |
| R6 | **Clip-path image reveal** | Images enter by `inset()` wipe on the V-angle, scrubbed 0→1 across `top 90%` → `top 55%`. Replaces a plain fade on the three full-bleed images. |
| R7 | **Marquee direction** | The marquee reverses direction when scroll direction reverses, easing through zero over `--dur-3`. Speed still tracks velocity, clamped 1–2.4×. |
| R8 | **Nav progress counter** | A mono `01 / 06` in the nav that tracks which product is centred while the grid is in view, cross-fading digits over `--dur-1`. Free wayfinding, and it tells the reader the page is watching. |
| R9 | **Eyebrow tracking** | Section mono eyebrows animate `letter-spacing` `0.24em → 0.12em` as the section enters. Tiny, and the kind of detail that separates a built site from a templated one. |
| R10 | **Sticky section label** | The section's mono label sticks to the top-left of the viewport for the section's duration, then releases. Costs one `position: sticky`. No JS. |

**Not allowed, however tempting:** a custom cursor, more than three parallax
speeds, per-letter (rather than per-word) reveals on body copy, scroll-jacked
snapping between sections, or any effect that has to be explained to be noticed.

### 4.4c Product section — the full interaction set

P1–P7 in §4.4 are the floor. These are what make it the section people remember.
**Ship Tier A first and confirm 60fps on a throttled mid-range Android before
starting Tier B.** If Tier A cannot hold 60fps, Tier B does not ship at all — a
smooth grid with fewer effects beats a stuttering one with more, every time.

**Tier A — must ship**

| # | Effect | Spec |
|---|---|---|
| P8 | **Colour rail filter** | A sticky horizontal rail of the six colours above the grid. Tap one and the grid re-renders to that colourway across all six bags. Cards reposition with a **FLIP** transition (measure, move, invert, play) over `--dur-4` — never a re-mount and fade. This is the single most interactive thing on the page and it is also genuinely useful: it is how someone shops by colour. |
| P9 | **Name marquee on hover** | On hover, the bag's name scrolls slowly across the bottom of the frame in Bodoni at 30% opacity, entering from the right. Replaces the custom cursor idea that v2 cut — same intent, none of the cost. |
| P10 | **Chip → whole-card recolour** | Tapping a chip cross-fades the image *and* eases the card ground, hairline and glow to that hue over `--dur-3`. Every chip tap should feel like the card changed material, not like an image swapped. |
| P11 | **Weighted entrance** | Cards do not all enter the same way. Stagger by column with `--dur-4`, but give each card an entrance `y` derived from its column (24 / 36 / 48px) so the row assembles rather than appears. |

**Tier B — ship if Tier A holds 60fps**

| # | Effect | Spec |
|---|---|---|
| P12 | **Quick view** | Tapping the mono index opens a full-bleed overlay of that bag. Open with a **FLIP from the card's own rect** so the card grows into the overlay — not a modal that fades in over a dimmed page. Close returns it to its slot. Trap focus, `Esc` closes, body scroll locked. |
| P13 | **Peel corner** | On hover, the frame's top-right corner lifts on a 3D fold revealing the next colourway underneath. `rotateY` on a pseudo-element, max 18deg, `--dur-4`. Desktop only. |
| P14 | **Grid breathing** | While the grid is the dominant element in view, cards scale between `0.995` and `1.0` on a 6s offset sine, each card phase-shifted by its index. Almost invisible; the section stops feeling frozen. Cut immediately if it costs a single frame. |

### 4.5 Pinning budget

**Exactly one pinned section: the hero.** If a second pin appears, the problem
was solved wrong. Pinned sections change document height and every offset measured
before them caches against a shorter document — that bug already cost time on this
project once.

Use pixel values for a pin's `end`: `() => "+=" + window.innerHeight * n`.
A percentage is measured against the trigger's own height, which `pinSpacing` has
already changed by the time it is re-read.

### 4.6 Mobile performance rules — hard limits

1. Everything ScrollTrigger goes inside `gsap.matchMedia()`. No exceptions.
2. Animate `transform` and `opacity` only. Never `top/left/width/height/filter`.
3. `will-change` is set on animation start and **removed on complete**. A
   permanent `will-change` on six cards is six extra GPU layers.
4. `ScrollTrigger.config({ ignoreMobileResize: true })` — otherwise the iOS URL
   bar collapsing re-fires every trigger.
5. Frame sequence: 24 frames mobile, decoded via `img.decode()` before the pin is
   armed, never during.
6. `prefers-reduced-motion` → same composition, arrived at instantly. Not a
   degraded site.
7. **Budget: LCP < 2.5s on Slow 4G, INP < 200ms, CLS < 0.05, sustained 60fps
   while scrolling on a mid-range Android.** Verified with a throttled trace,
   not by feel.

---

## 5. Section-by-section composition

Order, mobile-first. Sections not in this list are cut.

### 5.1 Nav — `--ink-950`, transparent until scroll
V-mark + "VOSS" left. Right: a mono "SHOP" and a vermilion-hairline "ORDER".
Mobile: full-screen sheet, staggered link entrance, mono index numbers `01`–`04`.
**Remove "Made to order" from the mobile sheet footer.** That is old-voice copy.

### 5.2 Hero — full viewport, hue: cognac
```
[frame sequence, full bleed, ken-burns scrubbed]
[hue-cognac radial glow, scrubbed scale 1→1.15]

  mono eyebrow  ·  HANDBAGS · LAHORE · CASH ON DELIVERY
  H1 (display-1, Bodoni, 2 lines mobile)
  sub (body, --smoke, max 32ch mobile)
  [ SEE THE BAGS ]  (vermilion fill)   [ ORDER ON INSTAGRAM ] (ghost, gold hairline)
  ── scroll cue ──
```
Everything above is in the **server markup, visible**. GSAP animates from hidden.

### 5.3 Product grid — hue: cycles per card in view
```
mono label   THE RANGE / SIX BAGS
display-2    headline
mono meta    RS 6,000  →  RS 4,500  ·  IN STOCK  ·  COD

[ card ][ card ]        ← 2 col @ 390px
[ card ][ card ]        ← 3 col @ 480px
[ card ][ card ]        ← 3 col @ 1024px
```
**Card anatomy** (4:5 image):
```
┌────────────────┐
│  image 4:5     │  ← scale 1.05 on hover, cross-fade on chip tap
│                │
│         01 ←mono index, top-right, --pewter
└────────────────┘
Afsun            ← --fs-h4, Archivo 500, --chalk
افسون             ← Urdu, --smoke, 0.875rem   (this is free brand equity — use it)
Rs 4,500         ← --verm-500, Archivo 600
Rs 6,000         ← --pewter, strikethrough, --fs-meta mono
● ● ● ● ● ●      ← 6 colour chips, 14px, --radius-pill, ring on active
```
No button on the card. The whole card is the link. A button per card is six
vermilion elements in one viewport — a direct violation of §1.5.

### 5.4 Colour story — hue: cycles, horizontal
A horizontal scroll strip of the six colours, one full-bleed frame each,
snap-scrolled on mobile (`scroll-snap-type: x mandatory`). Each frame floods the
page wash with its hue. Native scroll — **not** a GSAP horizontal pin. Native
horizontal scroll on touch beats a pinned fake one every time.

### 5.5 The Object — hue: chocolate
Full-bleed 3:2 macro crop, diagonal V-angle clip wipe, scrubbed 1 → 1.08.
This is already the strongest frame on the site. Keep it. Pull its copy from
`catalogue.ts`, **not** `products.ts`. Delete "Made to order".

### 5.6 The trust block — hue: olive

**Amended 2026-09-01.** The first draft's section list omitted `WhatItIs`,
`BeforeYouPay` and `Faqs` — not as a decision, but because they did not exist in
the stale snapshot it was written from. Under §5's "unlisted sections are cut" rule
that would have deleted them. **They are not cut.** The audit was right to refuse.

Cutting them would have been the worst call in this document. VOSS's entire
differentiator against "DM for price" Instagram sellers is *this is not a scam
page*. Three sections that answer the cash-on-delivery trust objection are the
conversion argument, not decoration.

But four separate trust sections stacked in a row is its own failure. **Merge, do
not stack.** The trust block is one composed sequence with one hue:

```
WHAT IT IS        →  what you are buying, plainly. Absorbs the three proof tiles
                     (EVERY PRICE ON THE PAGE / IN STOCK / CASH ON DELIVERY) as
                     mono labels inside it rather than as their own section.
BEFORE YOU PAY    →  the COD mechanics: order, courier, you see it, you pay.
                     This is the objection-killer. Give it the most space.
FAQS              →  everything that did not fit above. Accordion, one open at a
                     time, height animated with a real measurement — never a
                     max-height guess that jumps.
```

The standalone "Why VOSS" proof-tile section from the first draft is **dropped** —
its three claims live inside `WhatItIs` now. One trust argument, told once.

Only verifiable claims anywhere in this block. No material, craft, or origin
language — see §7. Before writing a single word here, read §7 again.

### 5.7 Marquee — the diagonal light→dark wipe
`CASH ON DELIVERY · IN STOCK · EVERY PRICE ON THE PAGE · ORDER ON INSTAGRAM ·`

### 5.8 Order block — hue: wine
Large Bodoni line, the Instagram handle `@voss.pk` as a real link, and one
vermilion CTA. **Replaces the Waitlist section entirely** — a newsletter signup
on a cash-on-delivery shop with no backend is a dead end wearing a form.

### 5.9 Footer — deepest vignette, hue: none
V-mark, links, `© 2026 VOSS`. Real Instagram URL, not a placeholder.

### 5.10 How to read this section list

**A section absent from this list is a section this document did not know about,
not a section that is cut.** The "unlisted sections are cut" rule from the first
draft is withdrawn — it was written assuming the list was complete, and it was not.

Only the explicit "Cut entirely" list below deletes anything. If you find a section
in the codebase that is not named anywhere in §5, keep it, and add it to §5 with a
one-line note on what job it does. Do not delete a shipping section on the strength
of an omission.

### Cut entirely
`Manifesto.tsx` (old luxury voice, unreadable low contrast) ·
`Waitlist.tsx` (no backend, wrong business model) ·
`Threshold.tsx` (2.2s intro against a 900ms budget) ·
`three/VitrineCanvas.tsx` + `three/VitrineScene.tsx` (built, never mounted) ·
`Collection.tsx` (superseded by `Bags.tsx`) ·
`products.ts` + `rawProducts.ts` (contradict `catalogue.ts`)

---

## 6. Product data — one source

`src/lib/catalogue.ts` is the only product source. Six styles:

| # | Name | Urdu | Type |
|---|---|---|---|
| 01 | Afsun | افسون | top handle |
| 02 | Gulnaar | گلنار | shoulder |
| 03 | Naubahar | نو بہار | tote |
| 04 | Dilara | دل آرا | box |
| 05 | Mahrooh | ماہ رُخ | crossbody |
| 06 | Meher | مہر | weekend |

Six colours per style: olive, black, chocolate, cognac, wine, camel.
List **Rs 6,000** · launch **Rs 4,500** (save Rs 1,500 / 25%).
Order path: **Instagram @voss.pk**.

`products.ts` and `rawProducts.ts` are deleted. Any hex the 3D configurator needed
moves into `catalogue.ts` as `hueTokens`.

---

## 7. What copy may claim — unchanged, still in force

**Verifiable today, safe to write:** every price on the page · in stock ·
cash on delivery · Rs 6,000 → Rs 4,500 · order on Instagram · chosen in Lahore
(a curation claim only).

**Banned until confirmed in writing by the founder:** any origin claim of any kind
(no city, no country, no `PostalAddress` in structured data) · any material grade
or tannage ("full-grain", "vegetable-tanned") · any hardware metal claim ·
any construction or finishing claim · any durability or repair promise.

The site may **look** premium. It may not **claim** premium facts it cannot back.
That is the whole resolution of "ultra premium look, affordable price."

---

## 8. Accessibility floor

Not a full program, but these cost nothing and are kept:
semantic HTML · real `<button>`/`<a>` · alt text on every product image ·
visible `:focus-visible` ring · 44×44px minimum touch target ·
`prefers-reduced-motion` honoured everywhere · body text ≥ 16px on mobile ·
`--pewter` restricted to mono labels per §1.3.

---

## 9. Definition of done — per section

A section is not done until all five are true:

1. Screenshotted at **390 × 844** and at **1440 × 900**, and the PNG was actually
   looked at.
2. Every motion in §4.4 that applies to it is implemented and verified moving.
3. Server markup renders the final state with JS disabled.
4. No horizontal overflow at 390px (`document.scrollWidth <= 390`).
5. It uses only tokens from §1–§3. Zero hard-coded hex values, zero magic numbers.

---

## 10. Reference sites — study these, do not copy them

Open each one **on a phone as well as a laptop**. Note the specific mechanic, not
the vibe. "It felt premium" is not a finding; "the size selector slides in from the
card's right edge so it never covers the product" is.

### Product-grid and card mechanics

| Site | The mechanic worth stealing |
|---|---|
| [axelarigato.com](https://www.axelarigato.com) | Colour and size options align vertically at the card edge, so the product stays optically centred while options appear. Directly relevant to our chip row. |
| [oakame.com](https://www.oakame.com/en/products/sofas/indoor/bonaparte-sofa/) | A "Discover" control slides in as the image lifts slightly — two motions reading as one gesture. This is the model for P2 + P9. |
| [glossier.com](https://www.glossier.com) | Swatch selection updates the product without a page reload or a spinner. This is exactly P10, executed well. |
| [terraskin.x-bionic.com](https://terraskin.x-bionic.com/) | A toggle switches the entire presentation in place. The model for the P8 colour rail. |
| [kvellhome.com](https://kvellhome.com) | Horizontal dot navigation through products — worth studying for the mobile colour story in §5.4. |
| [cowboy.com](https://cowboy.com/) | Scroll-driven product storytelling that stays legible on a phone. |
| [aiaiai.dk/tma-2-discovery](https://aiaiai.dk/tma-2-discovery) | A configurator that never feels like a form. Relevant if the colour rail grows up. |

### Motion and scroll behaviour

| Site | The mechanic worth stealing |
|---|---|
| [stenger-bike.de/en](https://stenger-bike.de/en) | Scroll reactivity applied to a real commerce site rather than a portfolio. Watch how much is happening at once — it is less than it feels. |
| [the-shirt.bymatthew.com](https://the-shirt.bymatthew.com/) | Restraint plus one memorable interaction. This is the ratio we want. |
| [gucci.com](https://www.gucci.com) | The honest reference: far calmer than anyone remembers. Enormous photography, plain grid, a normal cursor. The luxury signal is restraint plus production value, not interaction density. |

**The reading to do before Phase 3:**
[Motion in eCommerce — Microinteractions](https://commerce-ui.com/insights/motion-in-ecommerce-part-1-microinteractions)
— its central point is the one to hold onto: a microinteraction earns its place by
helping someone decide, not by being noticed.

**The test to apply to every effect we add:** does this help her choose a bag, or
does it show her that a developer was here? If it is the second one, cut it.

---

## 11. Code quality — how this is written

Everything here is the standard for merged code. This section is as binding as the
design tokens.

### 11.1 Architecture

- **One scroll controller** (§4.4b). No component attaches its own scroll listener.
- **One source of product truth**: `catalogue.ts`. No component holds a hard-coded
  product name, price, colour or count.
- **One GSAP context per component**, always: `const ctx = gsap.context(() => {…}, ref)`
  and `return () => ctx.revert()` in the cleanup. A ScrollTrigger that outlives its
  component is a memory leak that shows up as jank ten minutes into a session.
- **Motion values live in `src/lib/motion.ts`**, read from the CSS custom properties
  — not duplicated as JS literals. A duration must be changeable in one place.
- **Components are presentational; behaviour lives in hooks.** `useScrollState`,
  `useParallax`, `useRevealOnce`, `useFlip`. A component that both fetches, computes
  and animates is a component nobody can safely change later.

### 11.2 Naming and structure

- Files: `PascalCase.tsx` for components, `camelCase.ts` for libs and hooks.
- No file over ~200 lines. Past that, the component is doing two jobs — split it.
- Props are explicitly typed. No `any`, no `as unknown as`, no `@ts-ignore` without
  a comment naming the upstream issue.
- Name things by what the reader sees, not how it is built: `ColourRail`, not
  `FilterControlContainer`.

### 11.3 Non-negotiables

- **Zero magic numbers.** Every duration, colour, spacing value and breakpoint comes
  from a token. If a value is not a token, it is either a bug or it needs a token.
- **Zero hard-coded hex** outside `globals.css`.
- **No dead code.** If a component is not mounted, delete it — do not leave it "for
  later". Six unmounted components is how this codebase reached the state it is in.
- **No commented-out blocks** in a commit. Git remembers.
- **No dependency added without a one-line justification** in the commit message.
- **Every animation respects `prefers-reduced-motion`.** Not as a wrapper at the
  top of the file — as a real branch that renders the final composition instantly.
- **Every interactive element is a real `<button>` or `<a>`** with a visible focus
  state and a 44×44px hit area.

### 11.4 Comments

Comment the *why*, never the *what*. `// stagger the cards` is noise.
`// pixel end value, not %, because pinSpacing has already changed the trigger's
own height by the time a % is re-read` is the comment that saves the next person
two hours. Every trap in §4.5 and §4.6 gets a comment at the site of the code that
would otherwise reintroduce it.

### 11.5 Commits

Small and reversible. One concern per commit. A message that says what changed and
why, not "updates". Commit before any large change — OneDrive can corrupt `.git/`
mid-operation, and GitHub is the recovery point.

### 11.6 The senior-engineer test

Before opening any file as done, answer these four in the BRIEF:

1. If a new person opened this file cold, what would confuse them? Fix that.
2. What did I add that nobody asked for? Delete it.
3. Where did I repeat myself? Extract it — but only on the third occurrence, not
   the second. Premature abstraction costs more than duplication.
4. What did I claim works that I did not actually verify? Go verify it or say so.
