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
