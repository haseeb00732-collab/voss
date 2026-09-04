# VOSS — Project Status & Full Context

**Snapshot date:** 2026-08-27
**Purpose:** hand a fresh Claude chat (or any collaborator) the complete picture of
what VOSS is, where the website stands right now, what has changed, what is
half-done, and what tools we build it with.

> This is a **point-in-time status doc**, not design authority. It will go stale —
> the same way `VOSS-CONTEXT.md` did. If it disagrees with `Voss-Design.md` (v2) or
> `voss-website/CLAUDE.md`, those win. Don't build design rules from this file;
> build understanding of *the situation* from it.

---

## Files shipped alongside this doc

This report is the map. The numbered files are the territory — the actual project
files, verbatim, because a fresh chat can't read the local disk.

| # | File | What it is |
|---|---|---|
| 00 | `VOSS-STATUS-2026-08-27.md` | **This report.** Read it first. |
| 01 | `CLAUDE-user-global.md` | The user's global operating instructions (all projects) — stance, workflow, anti-slop rules. |
| 02 | `CLAUDE-project-root.md` | Root map + document-authority order. |
| 03 | `Voss-Design-v2-CURRENT.md` | ★ **The current design authority.** 178 lines. Decisions, not prohibitions. |
| 04 | `CLAUDE-voss-website.md` | Codebase rules + the traps that already cost time (tokens, motion, ScrollTrigger, 3D). |
| 05 | `AGENTS-voss-website.md` | The "this is not the Next.js you know" warning (Next 16, auto-written by `next dev`). |
| 06 | `product-marketing-PRE-PIVOT.md` | Positioning doc (v2, 2026-08-25). **Written for the luxury framing — predates the Pakistan/COD pivot.** Still-valid part: the no-origin-claims hard rule. |
| 07 | `scripts-README-grading.md` | How the image-grading pipeline works. |
| 08 | `voss-website-README-STALE.md` | ⚠ Describes a **deleted** 3D build. Kept only for its "Before going live" gap list. |
| 09–13 | `memory-*.md` | Five session-memory notes: screenshot-before-shipping, the visual preview loop, the **photography ceiling** (important), the GitHub/OneDrive setup, and never-build-vs-dev-server. |
| 14 | `Voss-Design-v1-archive-RETIRED.md` | 834 lines. **Retired.** v2 (file 03) supersedes it. Where they disagree, v2 wins. |
| 15 | `VOSS-CONTEXT-STALE-snapshot.md` | A 2026-08-24 snapshot that embeds the retired v1 verbatim. Useful only as an index of what files exist. |

*(There is also a single self-contained `VOSS-CONTEXT-PACK.html` — this same report
plus 6 embedded screenshots plus the key files — if a single-file drop is easier.)*

---

## 0. TL;DR — the one thing to understand first

**VOSS is mid-pivot, and both identities are live in the same build.**

| | Original scope (Aug 22–25) | Where it's pivoting (Aug 25–27) |
|---|---|---|
| What it is | Small-batch quiet-luxury leather label. "One hide, one bag, nothing else." | A Pakistan handbag shop. "Handbags for Women in Pakistan, Cash on Delivery." |
| Buyer | The "considered buyer" — craft, provenance, longevity | A woman who came from **Instagram**, wants to see the bag, the price, and buy |
| Model | Pre-commerce waitlist, made-to-order | In stock, **cash on delivery across Pakistan**, WhatsApp to buy |
| Price | USD **$1,290–$1,850** (invented placeholder) | PKR **4,500** flat across all 6 styles (marked "confirmed 2026-08-27") |
| Reference | Gucci.com (restraint + production value) | (unstated — but the copy is aimed at Pakistani Instagram resellers who make you DM for a price) |
| Origin claim | *(briefly)* "Florence, Italy" — **removed, it was invented** | none — "chosen in Lahore" is the only place reference |

The new positioning is written into: the page `<title>`/meta, the **Hero**, the
**Bags** section, the **Marquee**, and the catalogue pricing.
The old luxury positioning is still in: **Manifesto**, **The Object** section,
**Waitlist** copy, **Nav** ("Made to order"), the `/collection` page intro, the
piece pages ("Made to order in", "Add to bag"), and `.agents/product-marketing.md`.

**Resolving that contradiction — one coherent story, one voice, one set of
product facts — is the biggest open piece of work.**

---

## 1. Repository layout

Project root: `C:\Users\pesum\OneDrive\Desktop\Voss`
This root is **direction + source material**, not the codebase. The site is the
subfolder `voss-website/`.

```
Voss/
├── CLAUDE.md                    map of the root + document-authority order
├── Voss-Design.md              ★ v2, 178 lines — CURRENT design authority
├── Voss-Design-v1-archive.md     v1, 834 lines — RETIRED, reference only
├── VOSS-CONTEXT.md               2026-08-24 snapshot — STALE (embeds retired v1 verbatim)
├── VOSS-STATUS-2026-08-27.md      ← this file
├── skills-lock.json              pins the 64 project-scoped skills
├── .agents/product-marketing.md  positioning doc every marketing skill reads (pre-pivot)
├── .claude/skills/               64 skills (symlinks, gitignored — see §8)
├── Voss-Logos/                   6 generated raster JPEGs of the wordmark + V mark. NO vector source.
├── product 1/ … product_6/       raw WhatsApp product photos (the real catalogue — see §6)
└── voss-website/                 the Next.js site (the actual deliverable)
```

### Document authority order (highest first)

1. **`Voss-Design.md`** — v2. Records *decisions, not prohibitions*. "If it isn't
   in here, it isn't banned — decide it and write down what you chose."
2. **`voss-website/CLAUDE.md`** — codebase rules + traps that already cost time.
3. **`Voss-Design-v1-archive.md`** — retired. Where it disagrees with v2, v2 wins.

### Documents that are stale or never existed

- **`voss-website/README.md`** — describes a *deleted* build ("a single WebGL bag
  travels the page as you scroll", Montserrat font, `Handbag.tsx`, `Newsletter.tsx`,
  `Scene.tsx`, `stage.ts`). None of those files exist. Ignore it except the
  "Before going live" gap list, which is still roughly accurate.
- **`VOSS-CONTEXT.md`** — assembled 2026-08-24 03:59. Its §1 embeds the full
  834-line **v1** design system labelled "the approved design system". v1 was
  retired the same day at 16:53. Useful only as an index of *what files exist*.
- **`Voss-Plan.md`** — cited by the v1 archive as its companion (colour, the
  anti-cheap checklist, section order, the reference teardown). **Never existed on
  disk.** Every decision so far worked around its absence. Do not cite it.
- **`VOSS-SECTION-BRIEF.md`** — referenced in code comments (`Bags.tsx`,
  `PieceHero.tsx` "the brief was explicit"). **Not on disk.** Another phantom.
- **`.agents/product-marketing.md`** — real, v2 (2026-08-25), but written for the
  *luxury* positioning and predates the Pakistan pivot. Still has one hard,
  still-valid rule: **no origin claims of any kind** (see §2).

---

## 2. The origin-claim rule (still in force)

An earlier version of the site claimed **"Florence, Italy"** — in copy, in SEO
metadata, and as a fabricated `PostalAddress` in the Schema.org `Organization`
block (`Via dei Fossi 12, Firenze, 50123, IT`, a real Florentine street).

It was **invented placeholder and untrue.** Commit `c602040` (2026-08-25) removed
it everywhere. A country-of-origin claim on a physical product is a regulated
advertising claim — it's the founder's to make, from fact, in writing.

**Still banned until origin is confirmed on the record:** "Tuscan", "Italian",
"Italian-tanned", "European", "Made in ___", "Sourced in ___", "Crafted in ___",
any `PostalAddress`/`addressLocality`/`addressCountry` in structured data, any city
name in nav/footer/eyebrow. ("Lahore" appears now as *where the bags are chosen* —
a curation claim, not a manufacturing-origin claim. Keep it that way unless the
founder confirms otherwise.)

Carry the story on verifiable things instead: the materials, the price
transparency, cash on delivery, in stock.

---

## 3. Design system (v2) — the short version

Full detail is in `Voss-Design.md` and `voss-website/CLAUDE.md`. Summary:

- **Dark-dominant, top to bottom.** v1's dark→paper→dark rhythm was **cut**. The
  hero read expensive, then the page turned cream and read like any other shop.
  Rhythm now comes from *tone inside one material* (ink-950 / ink-900 / raised) and
  from **one diagonal wipe** (the Marquee), not from flipping substrate.
- **Palette:** ink scale, paper scale, the **gold ramp** (inverts across substrate
  — lighter on ink, darker on paper; this catches people out), warm neutrals
  (clay/smoke/pewter/chalk), and **vermilion** — the single added hue.
  **Vermilion = the verb**: price, CTA, "in stock". If it appears twice in a
  viewport, one is wrong. Gold is the house; vermilion is the buy button.
- **Type:** **Bodoni Moda** for display (headline sizes only — "no medium Bodoni
  on this site", everything under 1.5rem is Archivo), **Archivo** for everything
  else. Bodoni *italic* is a voice (pull quotes), not emphasis. ~3 weights total.
- **Shape:** sharp images and plates (`--radius: 0`), **rounded controls**
  (`--radius-xs/-sm`) so buttons read pressable. Deliberately mixed.
- **Shadows are allowed now** (v1 banned them). One light source, high and slightly
  left — `--elev-1/-2/-3` — matching the 3D vitrine's key light. "Two suns" is the
  only shadow rule.
- **Motion:** every duration is a multiple of the **200ms beat** (`--dur-1`…`-6`).
  No overshoot — `back`/`elastic`/`bounce` banned; `--ease-snap` (the one
  overshoot easing) is allowed only on something the reader just clicked. Text
  enters word/line-by-line; images scale down from 1.08 while fading. **One pinned
  moment on the whole site.** Reduced motion = the same composition, arrived at
  instantly.
- **The load-bearing rule that survived from v1:** *server markup carries the
  FINAL state.* GSAP sets the *start* state on mount, never the reverse — a
  scroll trigger that fails to fire must never be able to leave content
  permanently invisible. (This is directly relevant to the hero bug in §7.)
- **The 3D:** entirely procedural — no `.glb`, `.hdr`, or runtime textures.
  Lighting is `<Lightformer>` geometry baked to a cube map (an `<Environment
  preset>` pulls megabytes off a CDN and is banned). Canvas mounts only when
  in-view **and** the browser is idle; never under reduced motion; a CSS poster is
  what LCP scores. **3D is meant to live on the homepage + footer only; product
  pages are photography.** — *Status: the 3D components exist but are currently
  not mounted anywhere (see §4).*

---

## 4. The site as it actually renders today

**Stack:** Next.js **16.3.1** (App Router) · React **19.2** · TypeScript ·
Tailwind CSS **v4** (tokens in `src/app/globals.css`) · GSAP 3 + ScrollTrigger +
SplitText · Lenis (smooth scroll, driven off GSAP's ticker) · React Three Fiber +
drei (built, unused) · shadcn/radix for `button` + `field` primitives ·
`next/font` (Bodoni Moda + Archivo) · `next/image` AVIF-first.

**Dev server:** `npm run dev --prefix voss-website` on :3000. `.claude/launch.json`
is configured with `autoPort`. **Never run `next build`/`next start` while
`next dev` is live** — they share `.next/` and the user's browser then serves a
broken, doubled page.

### Homepage — `src/app/page.tsx`

Render order: `Nav · Hero · Bags · TheObject · Manifesto · Marquee · Waitlist ·
Footer`. All one `data-surface="dark"`. Comment in the file: *"she came from
Instagram to see bags: nothing goes between [Hero and Bags]."*

| Section | File | What it is now | State |
|---|---|---|---|
| **Nav** | `Nav.tsx` | V-mark + "Voss" left, "Collection" + "Join the list" right. Scrolled state = adds surface + hairline (a material change, not a shadow). Mobile = full-screen sheet. | Works. Mobile menu footer still says **"Made to order"** (old voice). |
| **Hero** | `Hero.tsx` | One pinned scroll sequence (`+= 2×viewport`). Background = **48 decoded AVIF stills**, scroll position picks the frame (not a `<video>`). A V-mark travels from centre into the nav's real logo slot (measured at runtime). Copy: eyebrow "Handbags · Lahore · Cash on delivery", H1 **"Carry it your way."**, sub "Every price, size and material is on the page. Pay when it reaches your hands.", CTAs "See the bags" (vermilion) + "Ask on WhatsApp". | **Broken on first paint** — see §7. Headline/CTAs are `opacity:0` in server markup and only revealed by scrolling into the pin. At scroll 0 the hero is a near-empty black rectangle with an orphan "See the bags" button. |
| **Bags** | `Bags.tsx` | The actual shop. "The bags" / "Six bags. Cash on delivery." Then a 3-col (1-col mobile) grid of all **6** styles. Each card: photo, name, **Rs 4,500** in vermilion, colour chips (each chip sampled from the photo it selects), "Ask on WhatsApp" link. | Renders well. Photo-to-photo inconsistency is stark (see §6). "Ask on WhatsApp" link doesn't render — WA number unset (§7). |
| **The Object** | `TheObject.tsx` | Full-bleed 3:2 macro crop of cognac leather grain, arriving on a diagonal (V-angle) clip wipe, with a scrubbed 1→1.08 ken-burns. Headline + specs pulled from `products.ts` (the **old** luxury data) → renders as **"Solene"**, specs "Leather / Dimensions / Production: Made to order". | Image itself is the strongest single visual on the site. But: uses old data, name collides with catalogue Style 03, "Made to order" contradicts the homepage. In a full-page screenshot the image looks like a black void because the clip-wipe is caught pre-reveal; scroll to it and it's there. |
| **Manifesto** | `Manifesto.tsx` | Placement A, "the point is the emptiness" — 6 blank columns, label hard-left, copy hard-right: *"We choose one bag at a time, and we choose it slowly. …nothing that won't outlast the season it was bought in. Nothing else."* | Pure **old luxury voice.** Low-contrast smoke-on-ink text stranded in a large black void; barely reads. |
| **Marquee** | `Marquee.tsx` | Infinite scrolling strip, speed tied to scroll velocity (clamped 1–2.4×), carrying the diagonal light→dark wipe. Words: "Cash on delivery · In stock · Every price on the page · Lahore · Ask on WhatsApp". | Works. This is the site's one sanctioned pinned/diagonal moment. |
| **Waitlist** | `Waitlist.tsx` | Ruled-line email field + "Join the list" button. Copy: "One letter, when there is something to say." / "We'll write once, when it's ready." | **No backend** — validates client-side, shows success locally. Copy is old newsletter framing, mismatched with a cash-on-delivery shop. |
| **Footer** | `Footer.tsx` | Deepest vignette. V-mark + "Voss", links (Collection / Contact / Instagram), "© 2026 VOSS." | Works. Instagram link → `https://instagram.com` placeholder. |

### Routes

- **`/`** — the homepage above.
- **`/collection`** (`app/collection/page.tsx` + `CollectionGrid.tsx`) — "THE
  COLLECTION" / *"Six pieces. Four hides."* / "Every piece is cut to order. Choose
  the silhouette first…" **(old voice)**. 3×2 grid, one 4:5 ratio, cards lift on
  hover and reveal price on the same gesture. Uses `CATALOGUE`.
- **`/collection/[slug]`** for `01`–`06` (`PieceHero.tsx` + a related-pieces rail).
  Editorial 3-crop collage with `--elev-3` shadows. Picking a hide **floods the
  whole page background with that leather colour** (the photo can't change —
  there's one shot per style — so copy says "Made to order in" and the *room*
  takes the colour). Shows **Rs 4,500** and an **"Add to bag"** button.

### Components built but NOT mounted anywhere

- **`Threshold.tsx`** — the "first ten seconds" intro (mark draws itself, "Voss"
  resolves, 0.6s deliberate hold, doors part). Deliberately unwired: *"~2.2s of
  intro before the hero is reachable, against a 900ms brand-moment budget, and it
  would sit in front of the LCP."*
- **`three/VitrineCanvas.tsx` + `three/VitrineScene.tsx`** — the procedural 3D
  vitrine (a code-generated box bag on a plinth, procedural lighting, configurable
  finish/hardware/room). Fully built, referenced only by each other.
- **`Collection.tsx`** — an older homepage "rail you can push" version of the
  collection. Superseded by `Bags.tsx`. Still says "Inquire for price".
- **`useDiagonalWipe.ts` / `heroFrame.ts` / `vee.ts` / `vitrine.ts`** — supporting
  libs, some used, some only by the unmounted components.

---

## 5. Product data — there are THREE sources and they don't agree

| File | Purpose | Contents |
|---|---|---|
| **`src/lib/catalogue.ts`** ★ | **The real catalogue.** Feeds Bags, `/collection`, piece pages. | 6 styles, **named 2026-08-27**: **Halden** (01, top handle), **Merrow** (02, shoulder), **Solene** (03, tote), **Corbel** (04, box), **Wren** (05, crossbody), **Kestrel** (06, weekend). **PKR 4,500 flat**, "confirmed 2026-08-27". 4 hides each (Noir / Cognac / Bone / Oxblood); one is photographed, the rest are "made to order". Colour chips are median-sampled per-photo by `grade-catalogue.mjs`. `priceLabel()` returns `null` (→ no price row) for an unset price — the code deliberately **never** shows "Inquire". |
| **`src/lib/products.ts`** | **Old luxury data.** Now only feeds `TheObject` + the 3D configurator's finish library. | Vesper / **Solene** / Maraux / Ilaria. USD **$1,290 / $1,480 / $1,620 / $1,850**. "The Evening Edit" / "Made to order" / brass hardware / suede goatskin lining. **"Solene" name collides with catalogue Style 03.** |
| **`src/lib/rawProducts.ts`** | Feeds the dead `Collection.tsx` only. | "Style 01"–"Style 06", `imageCount` per style, label only, no price ("Inquire for price"). |

Hides / finishes live in **`src/lib/vitrine.ts`** (`FINISHES`: noir/cognac/bone/
oxblood with roughness + sheen for the 3D; `HARDWARES`: brass/nickel/gunmetal;
`VITRINES`: salon/gallery/vault rooms).

---

## 6. The asset ceiling — read this before promising any image-led work

*(This is the single most expensive lesson on the project. It's in session memory.)*

**Catalogue photography** (`public/products/01…06/`, mirrored from root
`product 1/`…`product_6/`):

- Files are **540×1170 WhatsApp exports**, byte-identical to the raw JPEGs.
  Letterboxing eats 20–45% of each frame — real usable content is ~540×650–740.
- Style **01** = a phone snap in a shopping mall with strangers in it.
  Style **04** = a screenshot *of a phone screen* (status bar + Android nav bar).
  Style **03** has "Width 13 inches" burned into the pixels.
  Styles **02/03/05/06** carry an AI "sparkle" watermark; **06**'s boutique has a
  shelf sign reading "Brand Name" → those backgrounds are **likely AI-generated
  with the bag composited in**.
- Consequence: only **Style 02** is hero-capable, and only because its background
  is a plain wall. Any brief asking for macro product detail, a full-bleed desktop
  hero, or "one grade so the set reads as one shoot" is **unbuildable from these
  files.** Grading can't separate a grey bag from a grey wall.

**Hero frame sequence** (`public/sequence/reveal/` — 48 frames at multiple widths,
extracted from a video by `scripts/video-to-sequence.mjs`):

- Source mean luminance was **~1% (2.6/255)** — crushed, not clipped, so
  recoverable. `scripts/grade-sequence.mjs` lifts it to ~2.7%. Even lifted it's a
  rim-lit silhouette with **no leather grain**; past ~3.5× the noise floor takes
  over. This is why the hero background reads as "a bag emerging from near-black".

**The grading pipeline** (works, but see above for what it can't fix):
`scripts/grade-media.mjs` / `grade-catalogue.mjs` / `grade-sequence.mjs` bake the
7-step art-direction recipe from `Voss-Design.md §7.1` into the files — output in
`public/products-graded/*.avif`. Never filter in CSS. `scripts/media-plan.json`
records Unsplash IDs for the non-catalogue art direction (only `object-macro.jpg`
survives, referenced through `src/lib/media.ts`).

**The recommendation on file:** push for a **reshoot against a plain wall** — the
same phone is fine; it's *resolution and background consistency* that are missing,
not a better camera. Until then, the workaround that survives these assets is to
treat *the framed photograph* as the lit object, not the bag itself.

---

## 7. Known gaps & things observed broken (2026-08-27)

Ranked roughly by impact. Screenshots referenced are attached alongside this file.

1. **Hero renders near-empty on first paint** — [`01-home-hero-desktop.png`,
   `02-home-fullpage-desktop.png`, `05-home-fullpage-mobile.png`]. The eyebrow,
   H1 "Carry it your way.", subhead and CTA row all have `style={{opacity:0}}` in
   the server markup and are only revealed by GSAP as you scroll *through* the
   2×viewport pin. Land on `/` and you see: the nav, a lone "See the bags" button,
   and a mostly-black rectangle with a faint bag. On mobile that's ~1,700px of
   black before the first readable words — for a visitor who arrived from
   Instagram. This also technically violates the "server markup carries the final
   state" rule (the final state here *is* visible text; the reveal should animate
   *from* hidden, and a non-firing trigger currently leaves it hidden).
2. **WhatsApp buy path is not wired.** `NEXT_PUBLIC_WA_NUMBER` is unset (no `.env`
   file). `waLink()` returns `null`, so every "Ask on WhatsApp" CTA silently
   doesn't render. The entire new positioning ("no DMs for price" → *do* DM to
   buy) leans on this and it's currently dead.
3. **"Add to bag" (piece pages) is a dead button** — no cart, no checkout, no
   handler. Same class of gap as the old "Reserve yours".
4. **Waitlist has no backend** — client-side validation + local success only.
5. **Positioning contradiction across the site** (see §0). Homepage/Marquee say
   "in stock, cash on delivery, every price on the page". Nav, Manifesto, The
   Object, Waitlist, `/collection` intro and every piece page say "made to order"
   / newsletter / "cut to order, choose the silhouette first".
6. **`/collection` row-2 caption overlap** — [`03-collection-desktop.png`] the
   second row of cards butts together with no gutter and the silhouette labels
   collide with the next card's name ("Bo**Wren**", "Crossbod**Kestrel**").
   Likely the `scale:1.08` entrance animation caught mid-flight in a full-page
   capture — **verify live at a normal scroll speed** before treating it as a real
   layout bug.
7. **Photography inconsistency** — [`03`, `04`, `05`] six styles shot in six
   different worlds (industrial wall, driftwood, dark studio, wood + lilies, stone
   slabs, blue geometric blocks). Several read as AI composites. See §6.
8. **`products.ts` still USD + luxury** and its "Solene" collides with catalogue
   Style 03. Feeds The Object section only.
9. **`metadataBase` = `https://voss.com`** placeholder in `layout.tsx`. No OG
   share image. Footer Instagram → `instagram.com`. No analytics anywhere.
10. **Stale docs** — `README.md`, `VOSS-CONTEXT.md`, and `.agents/product-
    marketing.md` all predate the pivot and/or describe deleted code.

### What works well

- **The Bags section** on the homepage — clean grid, real prices, per-photo colour
  chips, honest.
- **The Object macro image** when actually scrolled to — [`06-home-hero-scrolled-
  desktop.png`] — rich cognac leather grain, full-bleed. Best single frame on the
  site.
- **The piece-page colour takeover** — [`04-piece-03-solene-desktop.png`] — the
  whole background floods to the chosen hide; genuinely nice.
- **Motion discipline** — the 200ms beat, no-overshoot easing, reduced-motion
  handling, and the "server renders final state" pattern are consistently applied
  in the components that were finished.
- **Performance architecture** — AVIF-first, frame sequence loaded post-`load`
  event and never competing with LCP, device-tier detection (`src/lib/tier.ts`)
  that demotes 3→2→1 on measured frame drops, 3D gated behind in-view + idle.

---

## 8. Skills — what's installed and what gets used building the site

### The 64 project-scoped skills (`.claude/skills/`, pinned in `skills-lock.json`)

Gitignored on purpose — they're symlinks holding machine-local absolute paths into
`.agents/skills/`. The real content **is** committed; `skills-lock.json`
reproduces the links. Three sources:

**A. Design / frontend / taste — `Leonxlnx/taste-skill` (15)**
`design-taste-frontend` · `design-taste-frontend-v1` · `high-end-visual-design` ·
`redesign-existing-projects` · `minimalist-ui` · `industrial-brutalist-ui` ·
`stitch-design-taste` · `gpt-taste` · `image-to-code` · `imagegen-frontend-web` ·
`imagegen-frontend-mobile` · `brandkit` · `full-output-enforcement` ·
*(+ the taste-skill support files)*

**B. Web guidelines — `vercel-labs/agent-skills` (1)**
`web-design-guidelines`

**C. Marketing — `coreyhaines31/marketingskills` (~48)**
`product-marketing` · `copywriting` · `copy-editing` · `cro` · `positioning`
*(via product-marketing)* · `pricing` · `offers` · `customer-research` ·
`competitor-profiling` · `competitors` · `content-strategy` · `ai-seo` ·
`seo-audit` · `schema` · `site-architecture` · `programmatic-seo` ·
`directory-submissions` · `launch` · `ads` · `ad-creative` · `analytics` ·
`attribution` · `ab-testing` · `emails` · `cold-email` · `sms` · `popups` ·
`signup` · `onboarding` · `paywalls` · `churn-prevention` · `referrals` ·
`revops` · `sales-enablement` · `lead-magnets` · `free-tools` · `social` ·
`video` · `image` · `events` · `co-marketing` · `community-marketing` ·
`influencer-marketing` · `public-relations` · `aso` · `marketing-plan` ·
`marketing-ideas` · `marketing-loops` · `marketing-psychology` ·
`marketing-council`

### Which skills are actually used when building this site

Per the user's global operating instructions (`~/.claude/CLAUDE.md`):

- **`design-taste-frontend`** — mandatory load for *any real UI work* on VOSS.
- **`high-end-visual-design`** + **`web-design-guidelines`** — layered on top of it.
- **`redesign-existing-projects`** — when auditing something that already ships
  (i.e. most VOSS work now, since the site exists).
- **`kickoff`** (slash command) — for any new/vague scope, before writing code.
- **`hole-puncher`** (sub-agent) — pressure-test a spec/plan for holes *before*
  building; report the holes and wait for approval.
- Trivial reversible edits (copy tweaks, one-function fixes) skip all of the above.

Given the work is now **positioning + copy + product truth**, the relevant
marketing skills are: **`product-marketing`** (rewrite `.agents/product-
marketing.md` for the Pakistan/COD reality), **`copywriting`** + **`copy-editing`**
(hero, Manifesto, Waitlist, `/collection`, piece pages), **`cro`** (the empty
hero, the dead CTAs), **`pricing`**/**`offers`** (PKR 4,500 flat + COD framing),
**`seo-audit`** + **`schema`** + **`ai-seo`** (the `voss.com` placeholder, no OG
image, the "Handbags for Women in Pakistan" title), and **`launch`** if there's a
go-live moment.

### MCP servers wired for the site

- **`shadcn`** — `voss-website/.mcp.json` runs `npx shadcn@latest mcp` (component
  registry access).
- Available but need auth in an interactive session: the standard Claude Code MCP
  set (GitHub, Figma, Notion, Linear, Slack, Stripe, etc.) — none currently
  authorised for this project.

---

## 9. Environment & workflow facts (from session memory)

- **Repo:** `github.com/haseeb00732-collab/voss` — **public**, by the user's
  explicit choice (recommendation was private; the tradeoff was laid out and they
  chose public — don't re-litigate).
- The working copy **lives inside OneDrive**. Moving it out was rejected (would
  break the 64 skill symlinks + `launch.json` + skill resolution). OneDrive can
  corrupt `.git/` mid-operation, so **GitHub is the recovery point — commit
  often**; if the index breaks, reclone rather than repair.
- Commits are authored as `294388084+haseeb00732-collab@users.noreply.github.com`
  (repo-local config) to keep the personal gmail out of public history.
- **Always screenshot UI before presenting it.** Local preview = `playwright-core`
  driving the installed Chrome (`C:\Program Files\Google\Chrome\...`), or the
  `chrome-devtools` MCP. Check desktop **and** a real ~390px mobile viewport.
  Chrome headless `--screenshot` can't do mobile (fakes a 489px viewport).
- **Never `next build`/`next start` while `next dev` is running** — shared `.next/`,
  user sees a broken doubled page. Recovery: `rm -rf .next/static .next/server`,
  let dev rebuild.

---

## 10. Git history (only 3 commits — everything is committed, tree is clean)

| Commit | Date | What |
|---|---|---|
| `ed82c32` | 2026-08-25 | **Initial commit: VOSS project root.** Whole project under version control for the first time — design docs, product photography, marketing context, and the Next.js site. Noted "all site copy is placeholder" and flagged the Florence claim for removal. |
| `c602040` | 2026-08-25 | **Remove the invented "Florence, Italy" origin claim.** Copy, SEO metadata, and the fabricated Schema.org `PostalAddress`. Added the origin-claims hard rule to `product-marketing.md`. |
| `b96ac00` | 2026-08-27 | **Build out voss-website and add product source material.** The real site build: hero frame-sequence, catalogue + vee libs, grading scripts, `next/image` AVIF config, graded media, `product_*` source images. **The Pakistan / cash-on-delivery / PKR 4,500 pivot copy is inside this commit** — it wasn't a separate step. Dropped the superseded WhatsApp JPEG exports (kept in history at `ed82c32`). |

Working tree: **clean.** No uncommitted changes.

---

## 11. If you're a fresh Claude picking this up — start here

1. **Read** `Voss-Design.md` (v2) and `voss-website/CLAUDE.md` in full. Skim
   `.agents/product-marketing.md` but know it's pre-pivot.
2. **Decide the positioning with the user** (`kickoff` if it's genuinely open):
   is VOSS a Pakistani cash-on-delivery handbag shop, or a quiet-luxury label, or
   something in between? Everything downstream — copy, the "made to order" vs "in
   stock" question, whether the Manifesto/Threshold/3D survive — depends on this
   one answer.
3. **Then** align the three product-data files, rewrite the mismatched sections in
   one voice, wire the WhatsApp number, and fix the empty-hero reveal.
4. **Before promising anything image-led**, re-read §6. Check the asset before
   blaming CSS.
5. Screenshot everything you change, desktop + mobile, and look at it.
