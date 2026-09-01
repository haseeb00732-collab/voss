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
