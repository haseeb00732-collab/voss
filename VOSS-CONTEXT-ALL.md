# VOSS — Complete Context (single file)

Generated 2026-08-27. One file, no images, so it stays light. It contains: the
status report, then every current project file inline. The retired v1 design doc
and the stale 2026-08-24 snapshot are described but NOT inlined (they are large
and non-authoritative); ask for them separately if needed.

Reading order below is top to bottom. Section markers are `===== NN filename =====`.

---



<!-- ============================================================ -->
# ===== 00-VOSS-STATUS-2026-08-27.md =====
<!-- ============================================================ -->

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



<!-- ============================================================ -->
# ===== 01-CLAUDE-user-global.md =====
<!-- ============================================================ -->

# Operating Instructions

Applies to every session unless a project's own CLAUDE.md overrides a specific line.

## Who you're working with

- Self-taught builder, no CS degree. Explain trade-offs in plain language; never dumb down the reasoning. Define a term the first time you use it, then move on.
- Default stack unless a project says otherwise: Next.js + Tailwind + Vercel (web), Python/Flask on Railway (backends), n8n Cloud (automation), Claude + OpenAI APIs, GitHub for version control. Don't introduce a new tool or framework without saying why the default doesn't fit.
- I direct architecture and scope; you propose and execute. On any non-trivial or one-way-door decision (data model, auth, payments, deleting files, adding a dependency), state the trade-off and get my confirmation BEFORE acting.

## Stance — you are an adversary, not a cheerleader

- IMPORTANT: Never open with agreement. Your first line either challenges an assumption, names what I'm missing, or asks the one question that exposes the biggest gap.
- Tag non-obvious claims: [Certain] hard evidence · [Likely] strong inference · [Guessing] filling gaps. If a plan is mostly guesses, say so first.
- When I'm wrong: "I disagree because ___. Instead ___. The risk in your approach is ___."
- Lead with the uncomfortable truth. First line, not paragraph three.
- Don't fold under pushback unless I give NEW information. "I really think so" is not new information.

## Before you build anything new

1. New project or vague request → DO NOT start coding. Run `/kickoff` and interview me until you could write the spec yourself.
2. Write a short spec + step plan. Then invoke the `hole-puncher` sub-agent on it. Report the holes and WAIT.
3. Only after I approve the plan do you implement.

Exception: trivial, reversible edits (copy tweaks, one-function fixes) — just do them.

## Iteration discipline

Speed comes from small loops, not big swings.

- Make the smallest change that proves the next unknown. One thing at a time.
- After each change: run it / show the diff / state exactly how to verify. Never claim it works without evidence.
- If two corrections in a row don't fix it, STOP and re-diagnose out loud instead of guessing a third time.
- Prefer editing over rewriting. Preserve working code. Commit or back up before large changes. YOU MUST NOT delete files I can't regenerate.
- When context gets long, write a handoff note (done / left / key decisions) so a fresh session can continue cleanly.

## Anti-slop

- Frontend: no generic template look. Load the `design-taste-frontend` skill for any real UI (`high-end-visual-design` and `web-design-guidelines` layer on top; `redesign-existing-projects` when auditing something that already ships). Decide type, spacing, and color deliberately — don't default.
- Research: cite sources, flag when they conflict, separate what's verified from what you're inferring. Never invent a fact, a stat, or a citation. "I couldn't find it" beats a confident fabrication.
- Don't add features, abstractions, or dependencies I didn't ask for. Simplest thing that works.



<!-- ============================================================ -->
# ===== 02-CLAUDE-project-root.md =====
<!-- ============================================================ -->

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



<!-- ============================================================ -->
# ===== 03-Voss-Design-v2-CURRENT.md =====
<!-- ============================================================ -->

# VOSS — Design Direction, v2

*Supersedes `Voss-Design-v1-archive.md`, which is kept for reference only and
is no longer authoritative. Where the two disagree, this file wins.*

v1 was 834 lines of rules. It produced a site that was genuinely handsome and
completely stuck: every new idea had to be argued against a clause. This
document is deliberately a tenth of that length. It records **decisions**, not
**prohibitions**. If something isn't in here, it isn't banned — it's just
undecided, and you should decide it and write down what you chose.

---

## 1. What this site is

A dark boutique that sells. Not a lookbook, not a portfolio piece.

Three things are true at once and all three have to survive every decision:

1. **It should sell.** Real commerce, real product depth, a price and a button.
2. **It should be beautiful enough to be remembered.** Editorial, high
   contrast, big type, a grid broken on purpose.
3. **It should be fast.** The 3D is the showpiece and it must never cost the
   page its load. If those conflict, the load wins.

**Reference point:** Gucci.com. Worth being honest about what that actually
means — Gucci is far *calmer* than most people remember. Enormous photography,
a plain grid, almost no scroll trickery, a normal cursor. The luxury signal is
restraint plus production value, not interaction density. When in doubt, do
less and shoot it better.

---

## 2. The decisions

Taken from two direction sessions. These are settled — build to them.

### Material and colour

- **Dark-dominant.** The whole site reads as the vitrine.
- Palette: the ink scale, the paper scale, **the gold ramp** (which inverts
  across substrate — lighter on ink, darker on paper), the warm neutrals, and
  **vermilion** as the only added hue.
- **Vermilion is the buy button and almost nothing else.** If it appears twice
  in a viewport, one of them is wrong.
- Gold is the house. Vermilion is the verb.
- Shadows are allowed now. One light source, high and slightly left, matching
  `--elev-*` in `globals.css` and the key light in the vitrine. Two suns is
  the only shadow rule.

### Type

- **Bodoni Moda** for display, **Archivo** for everything under 1.5rem.
- Didone wants to be very large or not used. There is no medium Bodoni here.
- The Bodoni italic is a *voice* (pull quotes), not an emphasis.

### Shape

- **Sharp images, round buttons.** Deliberately mixed. Plates and photography
  are square-cornered; controls carry `--radius-xs`/`--radius-sm` so they read
  as pressable rather than printed.

### Layout

- Editorial collage. Overlapping crops, broken grid, asymmetry as default.
- v1's three approved placements are retired. Compose per section.

### Motion

- The 200ms beat survives: every duration is a multiple of `--dur-1`.
- Entrances never overshoot. `--ease-snap` exists and is allowed **only** on
  something the reader just clicked.
- Text enters **word by word, staggered**. Images enter by **scaling down from
  1.08 while fading in**.
- **One pinned moment on the whole site.** Used once, for impact.
- Reduced motion is not a degraded site — the same composition, arrived at
  instantly. Server markup always carries the final state; GSAP sets the start
  state on mount, never the reverse.

### The 3D

- Entirely procedural. No `.glb`, no `.hdr`, no runtime textures — that is what
  makes a 3D hero affordable.
- Lighting comes from `<Lightformer>` geometry baked to a cube map. An
  `Environment preset` pulls megabytes off a CDN and is banned for that reason
  alone.
- The canvas mounts only when in view and idle, stops when scrolled away, and
  never mounts under reduced motion. A CSS poster is what LCP scores.
- **3D lives on the homepage and in the footer. Product pages are
  photography.**

---

## 3. What I cut, and why

The brief as answered contained more ideas than the site can hold. Cutting is
the direction, not a failure of it. Each of these can be reinstated — but
reinstate it *knowing* what it costs.

**The contextual cursor (DRAG / VIEW / ADD).** Cut. This is an
agency-portfolio signal, not a luxury-retail one, and the stated reference
doesn't have one. It also actively hurts the commerce goal: a cursor that
narrates the interface makes the interface the subject. Gucci's cursor is the
system cursor.

**Duotone photography.** Cut. It contradicts the instruction to keep the
existing graded set — a duotone overwrites the grade rather than extending it.
Combined with a dark-throughout site it also flattens the page tonally: the
photography stops being the thing with the most information in it. Keep the
grade; deepen the blacks in the *frame* around the image instead.

**Two of the four hero motion systems.** The brief asked for the V mark
becoming the bag, a scroll-driven camera, a once-round turn, *and* a
cursor-following key light — four independent motions in one viewport. Keeping
the **threshold** and the **scroll-driven camera**; cutting the turn (the
camera already reveals the piece, so the turn is the same information twice)
and the cursor light (a scene that responds to both scroll and pointer never
holds still, and stillness is the expensive-looking part).

**"The room persists between sections" vs "the hero dissolves."** These are
mutually exclusive. Taking the dissolve, and giving the persistence idea its
own home: the room returns **once**, at the footer, empty, with the lights
going out. That is a better use of it than a full-page canvas, and it costs
almost nothing.

**"The bag turns to show the new colour" on a photography-only product page.**
Impossible as specified — you cannot turn a photograph, and the catalogue has
one colour shot per style, not four. Keeping the **full-bleed colour
takeover**, which is the stronger idea: the *page* floods with the hide, the
photograph crossfades. Labelled "made to order in" so it stays honest.

---

## 4. Open, and deliberately so

Decide these when you get to them. Write down what you chose; do not ask this
document for permission.

- Section order and page composition beyond the homepage hero.
- Whether a paper-substrate section returns for the atelier story. *(My
  recommendation: yes. An unbroken dark site has no rhythm, and the dark→
  paper→dark cadence was the single best structural idea in v1. But
  "dark throughout" was the explicit instruction, so it is built dark and this
  is a note, not a change.)*
- Copy voice. Placeholder throughout; three options owed.
- Names and prices for the six styles. The catalogue is real, the naming is
  not — the grid says "Inquire" until it is.

---

## 5. The catalogue

**The six photographed styles are the real product.** `Style 01`–`06`, 35
photographs, shot but not yet named or priced. The four named pieces in
`products.ts` (Vesper, Solene, Maraux, Ilaria) are *not* the catalogue — their
hex values survive as the **finish library** for the configurator, which is
where they were always most useful.

Every piece is available in all four hides: Noir, Cognac, Bone, Oxblood.

---

## 6. Accessibility

Not a program for this build, by instruction. Semantic HTML, real buttons,
alt text and keyboard order are kept anyway because they cost nothing and
removing them would take active effort. Contrast largely solves itself — a
high-contrast editorial brief and WCAG want the same thing.

---

## 7. The one rule that survives v1 intact

**Server markup carries the final state.** GSAP sets the start state on mount.
Never the other way round: a scroll trigger that fails to fire must not be able
to leave content permanently invisible. This is the only clause in the old
document that was protecting against a real failure rather than a taste
disagreement, and it stays.



<!-- ============================================================ -->
# ===== 04-CLAUDE-voss-website.md =====
<!-- ============================================================ -->

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



<!-- ============================================================ -->
# ===== 05-AGENTS-voss-website.md =====
<!-- ============================================================ -->

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->



<!-- ============================================================ -->
# ===== 06-product-marketing-PRE-PIVOT.md =====
<!-- ============================================================ -->

# Product Marketing Context

**Document version:** v3
**Last updated:** 2026-08-29

> **Positioning as of 2026-08-29: "COD now, premium later."**
> VOSS today is an honest Pakistani cash-on-delivery handbag shop at one flat
> price. "Premium" is the *destination*, not a current claim. Nothing in this
> doc may assert a premium/craft/origin fact the current product and price
> cannot back — see the two hard rules at the bottom. Earn those claims (real
> price, real photography, confirmed materials) before writing them.

## Product Overview
**One-liner:** VOSS is a Pakistan-based women's handbag label selling a small line of six styles — in stock, one flat price, cash on delivery.
**What it does:** VOSS sells six photographed handbag styles direct to consumers in Pakistan. Every price is shown on the page; buyers order over WhatsApp and pay cash on delivery. The premium, editorial brand look is deliberate aspiration — the *direction* the label is building toward — not a claim about the current product's materials or construction.
**Product category:** Direct-to-consumer women's handbags, Pakistan. Competes in the Instagram/WhatsApp cash-on-delivery handbag market, *not* (yet) in the imported/luxury tier its visual language borrows from.
**Product type:** Physical product, DTC e-commerce. Order path is WhatsApp → cash on delivery (no on-site checkout).
**Business model:** Single-purchase retail. **PKR 4,500 flat across all six styles** (`voss-website/src/lib/catalogue.ts`, confirmed 2026-08-27). One hide per style is photographed and treated as in stock; the other three hides are made to order. Cash on delivery across Pakistan; no card/online payment wired yet. *(For reference, ~PKR 4,500 ≈ $15–16 USD at 2026 rates — an accessible price, not a luxury one. The retired USD $1,290–$1,850 figures in `products.ts` are dead placeholder from the old luxury scope and feed only `TheObject` + the 3D finish library.)*

## Target Audience
**Target companies:** N/A — B2C.
**Decision-makers:** N/A — single-purchaser B2C.
**Primary use case:** *[Working inference, not researched]* — a woman in Pakistan who saw the bag on Instagram, wants to see the actual bag, the actual price, and the sizes/colours without having to DM "price?", and wants to buy with the safety of cash on delivery.
**Jobs to be done:**
- See the bag, the price, and the options up front — no DM-for-price friction
- Buy a good-looking bag at an accessible price without prepaying a stranger online
- Get it delivered and pay on arrival (cash on delivery removes the sight-unseen prepayment risk)
**Use cases:**
- *[Needs input — everyday carry vs. occasion; gifting; first "nice bag" purchase]*

## Personas
*[Needs input — no customer research exists yet. The row below is a starting hypothesis for a B2C Instagram-led COD shop, not a validated persona.]*

| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| The Instagram buyer | Seeing the real bag + real price before committing; not overpaying; not getting scammed on prepayment | Most Pakistani IG bag sellers hide the price ("DM for price") and demand advance payment to an unknown account | Every price on the page, in stock, and cash on delivery — you pay when it reaches your hands |

## Problems & Pain Points
**Core problem:** *[Working hypothesis]* — buying bags off Pakistani Instagram is high-friction and low-trust: prices are hidden behind DMs, stock is unclear, and payment is usually advance-to-an-account with real scam risk.
**Why alternatives fall short:**
- "DM for price" IG resellers: price opacity, haggling, slow replies, advance-payment risk
- Mall/retail brands: fixed hours, limited to who's nearby, often pricier for comparable looks
- *[Needs input — name real local competitors before asserting how they fall short]*
**What it costs them:** Wasted time DMing for basics; anxiety about prepaying an unknown seller; overpaying or getting a bag that doesn't match the photo.
**Emotional tension:** Wanting to buy something that looks considered and a little elevated, without the risk of prepaying a faceless Instagram account.

## Competitive Landscape
*[Needs input — no competitor/reference list exists on disk. Establishing a competitor-research methodology and a real named list is an open Phase-0 task. Categories below are hypotheses only; do not present as fact.]*

**Direct:** Other Pakistani DTC / Instagram women's-handbag shops selling at accessible price points with cash on delivery — *[names TBD]*.
**Secondary:** Local mall/retail handbag brands and marketplace listings (Daraz etc.) — *[confirm before asserting]*.
**Indirect:** Imported / "branded" bags and the luxury tier VOSS's look references — a different price bracket and a different buyer.
**How each falls short for customers:** *[Needs input once real competitors are named and observed — separate observed public facts from interpretation.]*

## Differentiation
**Verifiable-now differentiators (safe to use today):**
- **Price transparency** — every price is on the page (Rs 4,500 flat), against a category norm of "DM for price"
- **Cash on delivery** — pay when the bag arrives; no advance payment to an unknown account
- **In stock** — the photographed styles ship now, not "made to order / pre-order"
- **An elevated, consistent brand look** — a real design system, not a phone-snap catalogue dump
**Aspirational (the "premium later" direction — do NOT state as current fact):** material quality, construction detail, and any craft/repair promise. See the material-claim hard rule.
**Why customers choose us:** *[Needs input — no real customers yet; revisit after first WhatsApp orders / feedback.]*

## Objections
*[Pre-launch; no real sales conversations yet. Anticipated only.]*

| Objection | Response |
|-----------|----------|
| "Is this a real shop or another scam page?" | Every price is shown, it's cash on delivery (you pay on arrival, not in advance), and it's a real branded site — not a DM-only page. |
| "Why should I buy sight-unseen?" | Cash on delivery: you see it when it arrives and pay then. |
| "Is Rs 4,500 too cheap to be any good?" | *[Needs a truthful answer grounded in confirmed product facts — do not over-claim materials to justify price. See material-claim rule.]* |

**Anti-persona:** A buyer shopping the imported/luxury tier who expects verified full-grain leather, brand heritage, and in-person try-on at a four-figure price. VOSS's current product and price don't serve that buyer, and the copy must not pretend they do.

## Switching Dynamics
**Push:** Frustration with "DM for price," slow replies, and advance-payment risk on Instagram bag pages.
**Pull:** Prices shown up front, in stock, cash on delivery, on a site that looks trustworthy and considered.
**Habit:** Buying from familiar IG sellers or in malls; defaulting to whoever a friend used.
**Anxiety:** Prepaying an unknown seller; the bag not matching the photo. (Cash on delivery is the direct answer to both — lead with it.)

## Customer Language
*[Needs input — no customer interviews or reviews exist yet. Populate after first WhatsApp orders / feedback. Capture verbatim Urdu/English phrasing then.]*
**How they describe the problem:**
- "[verbatim — TBD]"
**How they describe us:**
- "[verbatim — TBD]"
**Words to use (verifiable today):** in stock, cash on delivery, every price on the page, Rs 4,500, order on WhatsApp, chosen in Lahore *(curation, not manufacture)*.
**Words to avoid:**
- *Scam-coded / friction:* "DM for price," "price in inbox," advance-payment framing
- *Unverified craft claims (banned until confirmed — see material-claim rule):* "full-grain," "vachetta," "vegetable-tanned," "hand-burnished," "solid brass," "lifetime repair," "made slowly," "one hide, one bag"
- *Luxury-economics / old-scope framing that contradicts an in-stock COD shop:* "made to order" *(as a headline positioning)*, "waitlist," "the collection is cut to order," "inquire"
- *Origin claims of any kind* — see origin hard rule
**Glossary:**
| Term | Meaning |
|------|---------|
| Cash on delivery (COD) | Buyer pays cash when the courier delivers; no advance/online payment |
| In stock | The photographed hide of each style ships now (vs. made-to-order/pre-order) |
| Made to order | Applies only to the three non-photographed hides per style — a fulfilment fact, not a positioning claim |

## Brand Voice
**Tone:** Spare, declarative, editorial — confident understatement. This elevated voice is allowed (it's the "premium later" aspiration made visible) **as long as it never makes an unverified factual claim.** Aspirational *look* is fine; aspirational *facts* are not.
**Style:** Short sentences, deliberate white space. No exclamation points, no urgency/discount framing. Under COD-now/premium-later, the voice must also be *plain and trustworthy* where it matters — price, stock, and delivery stated flatly, not poetically.
**Brand personality:** Considered, precise, honest, unhurried, quietly confident.

## Proof Points
*[Pre-launch: no real metrics, named customers, or testimonials exist. Do NOT fabricate any of this — attributed quotes from people who did not say them are a legal and ethical problem.]*
**Metrics:** None yet.
**Customers:** None yet (WhatsApp/COD orders not started or not tracked).
**Testimonials:** None yet — must be real, attributed quotes only once collected.
**Value themes:**
| Theme | Proof (verifiable today) |
|-------|--------------------------|
| Price transparency | Rs 4,500 shown on every card and page (`catalogue.ts`) |
| Low-risk purchase | Cash on delivery — pay on arrival |
| Availability | Photographed styles in stock |
| Craft / materials / longevity | **UNPROVEN — do not cite until confirmed from fact (see material-claim rule)** |

## Goals
**Primary business goal:** Turn Instagram interest into WhatsApp cash-on-delivery orders. (The old waitlist/newsletter goal is retired along with the luxury positioning.)
**Key conversion action:** "Ask on WhatsApp" → order → cash on delivery. *(Currently dead in the build — `NEXT_PUBLIC_WA_NUMBER` is unset, so every WhatsApp CTA silently doesn't render. Wiring this is the top functional gap.)*
**Current metrics:** None tracked — no analytics in the codebase yet.

## Origin claims — hard rule (unchanged, still in force)

**VOSS asserts no place of origin. Not a city, not a country, not a region.**

An earlier version of the site claimed "Florence, Italy," including a fabricated
`PostalAddress` in the Schema.org `Organization` block (`Via dei Fossi 12,
Firenze, 50123, IT`). It was invented placeholder, untrue, and removed everywhere
(commit `c602040`). Do not reintroduce it or substitute another place. A
country-of-origin claim on a physical product is a regulated advertising claim —
the founder's to make, from fact, in writing.

Banned until origin is confirmed on the record: "Tuscan," "Italian,"
"Italian-tanned," "European," "Made in ___," "Sourced in ___," "Crafted in ___,"
any `PostalAddress`/`addressLocality`/`addressCountry` in structured data, any
city name in nav/footer/eyebrow. **"Lahore" is allowed only as *where the bags
are chosen* (a curation claim), never as a manufacturing origin.**

## Material & craft claims — hard rule (new in v3)

**Same rule as origin, applied to what the bag is made of and what it promises.**
The current site copy (from `Marquee.tsx` and `products.ts`) claims "full-grain
vachetta," "vegetable-tanned," "solid brass," "hand-burnished edges," and
"lifetime repair." **None of these is confirmed anywhere in the repo, and all are
economically implausible at Rs 4,500.** Treat them exactly like the Florence
claim: unverified, and unusable until the founder confirms each one from fact, in
writing.

Banned until confirmed: any specific material grade or tannage, any hardware
metal claim, any construction/finishing claim, and any durability or repair
promise (e.g. "lifetime repair"). If you can't verify what the bag is made of,
say nothing about it — sell the price, the availability, and cash on delivery,
which are all true today.

*Open questions for the founder (answer on the record before the matching claim
can be used): What is the leather/material? What is the hardware? Where are the
bags made? Is any repair or guarantee actually offered?*

## Changelog
*Newest first. One line per revision: what changed and why.*
- v3 (2026-08-29) — **Repositioned luxury → "COD now, premium later"** to match the confirmed Rs 4,500 cash-on-delivery reality (founder decision, 2026-08-29). Rewrote Overview, Audience, Problems, Differentiation, Switching, Customer Language, Voice, Proof, and Goals for a Pakistani in-stock COD shop; pointed product data at `catalogue.ts`. Added the **material & craft-claim hard rule** — "full-grain / vegetable-tanned / solid brass / hand-burnished / lifetime repair" are unverified and economically implausible at this price, so they're banned until confirmed from fact. Kept the origin hard rule intact. Competitors, personas, customer language, and proof remain honest "Needs input" — not invented.
- v2 (2026-08-25) — Removed every "Florence, Italy" origin claim from this document and the site: it was invented placeholder, never true. Added the "Origin claims" hard rule so it is not reintroduced. Positioning pull now rested on material + scarcity, not place.
- v1 (2026-08-24) — Initial context, auto-drafted from the voss-website codebase (README, CLAUDE.md, VOSS-CONTEXT.md, component copy, product data). Several sections marked "Needs input" — no competitor list, customer research, testimonials, or real pricing exist yet since the brand is pre-launch.



<!-- ============================================================ -->
# ===== 07-scripts-README-grading.md =====
<!-- ============================================================ -->

# Media pipeline

`grade-media.mjs` bakes the seven-step art-direction recipe from
`Voss-Design.md` §7.1 into the image files themselves, so what ships is what
was art-directed. Nothing is filtered at runtime — CSS filters on a large
image are a per-frame GPU cost, and they leave the source ungraded for anyone
who downloads it.

```
node scripts/grade-media.mjs <source-dir> src/media scripts/media-plan.json
```

`media-plan.json` is the whole record of the shoot: for each output file, the
Unsplash photo id it came from, the target ratio and pixel width, which grade
variant to apply (`paper` for bone sections, `vitrine` for onyx), and an
optional per-image `sat` override for the few frames that arrive far hotter
than the rest.

To re-fetch the sources, resolve each id through Unsplash's photo endpoint and
pull the `urls.raw` it returns:

```sh
raw=$(curl -s "https://unsplash.com/napi/photos/$id" \
      | sed -n 's/.*"raw":"\([^"]*\)".*/\1/p' | head -1)
curl -L -o "$id.jpg" "${raw}&w=2400&q=90&fm=jpg"
```

Two things to know before swapping anything in:

- **Check `plus` on the photo record.** Unsplash+ images come back with a
  tiled watermark across the frame, and it survives the grade. Only use
  photos where `"plus": false`.
- **Subject rules are in §7.3 and they are not decorative.** Tight crops,
  partial hands, macro texture, one visible light source. No full-body model
  shots, no faces beside the wordmark, no legible text inside the frame —
  the last two are licence requirements, not taste.

Every image is referenced through `src/lib/media.ts`. Real photography drops
into the same map and inherits the same treatment.



<!-- ============================================================ -->
# ===== 08-voss-website-README-STALE.md =====
<!-- ============================================================ -->

# VOSS

Marketing site for VOSS, a small-batch women's leather handbag label. Built as
a scroll-driven 3D experience: a single WebGL bag travels the page as the
reader scrolls, and re-finishes itself live when they pick a model.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
npm run lint
```

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 (design tokens in `src/app/globals.css`) |
| 3D | Three.js via React Three Fiber + drei |
| Animation | GSAP + ScrollTrigger |
| Fonts | Cormorant (display) + Montserrat (UI), self-hosted via `next/font` |

## How the 3D works

The bag is **procedural** — modelled in code from primitives in
`src/components/three/Handbag.tsx` rather than loaded from a `.glb`. That is a
deliberate trade: it means silhouette, leather colour and hardware finish are
all driven by the product data in `src/lib/products.ts`, so adding a colourway
is a data edit, and the page ships with no model or texture downloads at all.

Supporting pieces:

- `three/textures.ts` generates the leather normal + roughness maps in memory
  from tiling value noise. No image assets, no network request.
- `three/Scene.tsx` builds the studio lighting entirely from drei
  `<Lightformer>`s instead of an HDRI, so the "studio" needs no download and
  looks identical regardless of connection.
- One WebGL context is fixed behind the whole document. A canvas per section
  would cost far more and would make the bag pop in and out between them.

### The scroll rig

`src/lib/stage.ts` holds two plain objects: `bagTarget` (the pose the bag
*should* hold) and `bagStage` (where it actually is). `StageCanvas` assigns a
pose per section via ScrollTrigger; the render loop eases `bagStage` toward
`bagTarget` every frame.

Three constraints are load-bearing here, and each cost a real bug during
build — please read before changing:

1. **Pose easing lives in `useFrame`, not in a tween.** GSAP clamps the delta
   of any frame longer than 500ms, so on a weak GPU a one-second tween can take
   tens of seconds to arrive. Frame damping uses the real delta and converges
   at the same rate regardless of frame time.
2. **`refreshPriority` matters.** The Craft section pins, adding ~2400px to the
   document. ScrollTrigger only applies that offset to triggers it measures
   *after* the pin, and `StageCanvas` mounts first — so Craft is
   `refreshPriority: 1` and the stage triggers are `-1`. Without this the bag
   jumps to its exit pose three sections early.
3. **WebGL boots only after the intro curtain lifts** (`voss:ready`). Shader
   compilation and texture generation block the main thread; doing that while
   the intro animates starves GSAP's ticker and visibly stalls it.

Neither stage object lives in React state — scroll motion must never re-render
the tree.

## Accessibility

- `prefers-reduced-motion` is honoured everywhere: the intro is skipped, scroll
  motion is dropped, and every surface renders its final state immediately
  rather than animating faster.
- Content is visible by default; GSAP animates *from* a hidden state only once
  JS runs, so crawlers and no-JS visitors get the whole page.
- Skip link first in tab order, visible focus rings, 44px minimum touch
  targets, labels outside placeholders, inline validation next to the field.
- The intro curtain has a 4s watchdog. It covers the entire page, so it is
  never allowed to get stuck — it always dismisses.

## Before going live

These are the deliberate gaps — everything else is production-ready:

1. **Newsletter has no backend.** `Newsletter.tsx` validates and shows success
   locally; wire the marked spot to your ESP (Klaviyo, Mailchimp) and add spam
   protection.
2. **"Reserve yours" is not commerce.** It anchors to the newsletter. Connect
   Shopify/Stripe for real checkout.
3. **Replace the placeholder copy.** Product names, prices, specs and
   testimonials are all invented. Testimonials must be real before publishing —
   attributed quotes from people who did not say them are a legal and ethical
   problem. The invented "Florence, Italy" origin — and the fabricated
   Schema.org `PostalAddress` that went with it — were removed on 2026-08-25.
   The site now makes **no** origin claim. Do not add one back without
   confirmed fact: see `.agents/product-marketing.md` § "Origin claims".
4. **Set the real domain** in `metadata.metadataBase` (`src/app/layout.tsx`) and
   add an OG share image.
5. **Nav links** (`#journal`) and all footer links are placeholders.



<!-- ============================================================ -->
# ===== 09-memory-screenshot-before-shipping.md =====
<!-- ============================================================ -->

---
name: screenshot-before-shipping-ui
description: Always render and look at UI work with the local Playwright+Chrome loop before showing it to the user
metadata:
  type: feedback
---

Never present UI, a webpage, or an artifact without first screenshotting it and
actually looking at the image. Shipping unrendered CSS produced badly broken
output twice on VOSS (a hero headline shattered across five lines by logo-grade
`letter-spacing` on running text, with the lede and CTAs pushed below the fold).

**Why:** the user cannot see my reasoning, only the rendered result. Design
decisions that read fine as CSS routinely render broken, and I have no way to
know which without looking. The user had to tell me the output looked bad twice
before the actual cause (never viewing it) surfaced.

**How to apply:** use the loop in [[voss-visual-preview-loop]]. Render, Read the
PNG, judge it, fix, re-render. Check desktop and a real 390px mobile viewport.
Treat "I have not seen this render" as equivalent to "this is not finished".



<!-- ============================================================ -->
# ===== 10-memory-visual-preview-loop.md =====
<!-- ============================================================ -->

---
name: voss-visual-preview-loop
description: How to screenshot local HTML/Next.js work on this machine using playwright-core plus the installed Chrome
metadata:
  type: project
---

This machine has Chrome at `C:\Program Files\Google\Chrome\Application\chrome.exe`
but no Playwright browsers. `playwright-core` is installed in the session
scratchpad and drives that Chrome via `executablePath`, so no ~100MB browser
download is needed.

`shot.mjs` in the scratchpad takes `<file.html> <out.png> [w] [h] [?query] [full]`,
reports viewport width plus any elements overflowing horizontally, then writes a
PNG to Read.

Two traps, both hit on 2026-08-22:
- **Chrome headless CLI (`--screenshot`) cannot do mobile.** Asking for a 390px
  window yields a 489px viewport and then crops the image, which fakes an
  overflow bug that is not in the page. Use Playwright for any width under ~700px.
- **Artifact HTML has no `<head>`,** since the publisher wraps it. Without a
  `width=device-width` viewport meta a narrow window still lays out at 980px and
  hides every real mobile problem, so `shot.mjs` injects the wrapper before loading.

Related: [[screenshot-before-shipping-ui]]

**Update 2026-08-31:** `playwright-core` is no longer installed in
`voss-website/node_modules`. Chrome itself is still at
`C:/Program Files/Google/Chrome/Application/chrome.exe` and headless screenshots
work with no packages at all:

    chrome.exe --headless=new --disable-gpu --hide-scrollbars       --force-device-scale-factor=1 --virtual-time-budget=9000       --window-size=1360,4200 --screenshot=OUT.png "file:///ABS/PATH.html"

A tall `--window-size` captures the full page in one shot; split it with sharp to
read the detail. Note the in-app Browser pane cannot open `file://` URLs, and it
is not signed in to claude.ai, so it cannot render a private Artifact either.



<!-- ============================================================ -->
# ===== 11-memory-photography-ceiling.md =====
<!-- ============================================================ -->

---
name: voss-catalogue-photography-ceiling
description: Source catalogue is now 1792x2400 AI-restaged colourway grids, not the old 540px WhatsApp exports; six styles, six unrelated sets, zero humans.
metadata:
  type: project
---

As of 2026-08-27 the six source folders under `Voss/` were replaced. They now
hold 29 PNGs at 1792x2400 (`product 1/` is 1122x1402), ~5MB each, named like
`image_MX49D06T5JXF36HI_0.png` — AI generation-service output, not camera files.

Each folder is **one bag silhouette in N colourways on one identical set** —
same light, same props, same crop across the row. These are colour-swaps and
re-stagings, not separate photographs.

The old note that these were 540px WhatsApp exports and that only style 02
could carry a hero is **superseded**. The graded output still living in
`voss-website/public/products/*/` is the old 540x1170 material and is now the
bottleneck, not the source.

**Why:** it changes what the site can do — heroes, macro detail and full-bleed
crops are now possible from source, and the grading pipeline needs re-running
against the new files.

**How to apply:** re-run `voss-website/scripts/grade-media.mjs` from the new
sources before assuming any image ceiling. Two real gaps remain: **no human /
no scale reference in any of the 29 frames**, and **six mutually inconsistent
set designs**, so the catalogue reads as six brands. Colourways that were
generated rather than photographed are a live COD returns risk — see
[[voss-positioning-cod-now]].



<!-- ============================================================ -->
# ===== 12-memory-github-repo.md =====
<!-- ============================================================ -->

---
name: voss-github-repo
description: VOSS is version-controlled at github.com/haseeb00732-collab/voss — public by the user's explicit choice, and living inside OneDrive
metadata:
  type: project
---

Set up 2026-08-25. Repo root is the whole project (docs, source photography,
and `voss-website/` as a subfolder), not just the site.

The user chose **public** after I recommended private and laid out the exposure
(pre-launch brand, placeholder copy, unretouched product photography,
`.agents/product-marketing.md` positioning). Their call, made with the
tradeoff in front of them — do not re-litigate it unprompted.

Two things that shape how to work here:

- **The working copy lives inside OneDrive.** Moving it out was rejected as too
  costly: it would break the 64 absolute-path symlinks in `.claude/skills/`,
  `.claude/launch.json`, and Claude Code's project-scoped skill resolution.
  So OneDrive may corrupt `.git/` mid-operation. GitHub is the recovery point —
  commit often, and if the index breaks, reclone rather than repair.
- **`.claude/skills/` is gitignored on purpose.** It is 64 symlinks holding
  absolute machine-local paths into `.agents/skills/`. The real content is
  committed; `skills-lock.json` reproduces the links.

Commits are authored as `294388084+haseeb00732-collab@users.noreply.github.com`
(repo-local config, not global) to keep the personal gmail out of a public
history.

Related: [[voss-visual-preview-loop]], [[screenshot-before-shipping-ui]]



<!-- ============================================================ -->
# ===== 13-memory-never-build-vs-dev-server.md =====
<!-- ============================================================ -->

---
name: never-build-against-live-dev-server
description: "Running `next build`/`next start` while the user's `next dev` is live clobbers .next and visibly breaks their browser."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 0cd643c4-e7f5-4977-ad3d-b73762405168
  modified: 2026-08-25T14:40:08.978Z
---

Never run `next build` or `next start` in `voss-website/` while the user has a
dev server running on :3000. They share the `.next` directory, so the build
overwrites the dev server's output underneath it. The user's browser then
serves a mix of dev and production chunks — the page renders duplicated,
ghosted "two layers", then falls over.

**Why:** it looks like a harmless read-only measurement, but it is a write to
shared state that the user is actively watching. They reported the site "going
down" and seeing two layers while I was measuring bundle size.

**How to apply:** to measure a production build, either stop the dev server
first and restart it after, or build to a separate distDir. Recovery is
`rm -rf .next/static .next/server` and let dev rebuild. Related:
[[voss-visual-preview-loop]].



<!-- ============================================================ -->
# ===== 14 + 15: files NOT inlined =====
<!-- ============================================================ -->

**`Voss-Design-v1-archive.md`** (834 lines, ~52 KB) — the RETIRED v1 design
system. Superseded by file 03 (`Voss-Design-v2-CURRENT.md`). Where they disagree,
v2 wins. Left out here to keep this file light; its full text is also embedded
verbatim inside file 15.

**`VOSS-CONTEXT.md`** (~72 KB) — a 2026-08-24 03:59 snapshot that embeds the
retired v1 design system labelled "the approved design system" (v1 was retired the
same day at 16:53). Useful only as an index of what files exist. Do not build to
the design rules inside it.
