# VOSS — Competitive Landscape

**Version:** v1 — first real competitor research on this project.
**Researched:** 2026-09-03. **Method:** Apify (Instagram posts, Meta Ad Library)
plus public Shopify `/products.json` endpoints and page fetches.
**Cost:** $1.14 of the Apify monthly allowance. Raw data in the session
scratchpad (`comp/`); Apify datasets expire after 7 days on the free plan.

This file replaces the `[Needs input]` block in `.agents/product-marketing.md`
§Competitive Landscape. Claims are tagged **[Fact]** (observed in scraped data),
**[Likely]** (strong inference), **[Guess]** (gap-filling).

---

## 1. The headline finding

**[Fact] VOSS at Rs 4,500 is the most expensive bag in its own competitive set.**
Not "accessible". Not "affordable". The most expensive.

| Brand | Median bag price | Max price | Bag SKUs |
|---|---:|---:|---:|
| Fineur | Rs 1,899 | Rs 2,999 | 409 |
| Lyana | Rs 1,999 | Rs 3,199 | 123 |
| WestStyle | Rs 1,999 | Rs 3,499 | 80 |
| RTW Creation | Rs 2,149 | Rs 4,499 | 675 |
| Bag X | Rs 2,199 | Rs 30,099 | 867 |
| Enshee | Rs 2,299 | Rs 3,999 | 294 |
| Purse Bazar | Rs 2,499 | Rs 2,999 | 52 |
| Insignia *(mall tier)* | Rs 3,725 | Rs 22,360 | 698 |
| **VOSS** | **Rs 4,500** | **Rs 4,500** | **12** |

VOSS's single price sits at **2.0–2.4x the DTC median** and **above the ceiling**
of five of the seven direct competitors. Enshee's flagship "Cyme Velvet" — their
most expensive bag, anchored at Rs 6,499 — sells at Rs 3,899. VOSS uses the same
Rs 6,000 anchor and lands Rs 600 *above* their top of range.

**This is the single most important fact in this document.** The positioning
doc's framing (Rs 4,500 is about $16, "an accessible price, not a luxury one")
is true against *global* handbags and false against *the market VOSS actually
competes in*. VOSS is the premium option in this set, priced as one, while
claiming to be the accessible one.

Two coherent responses. The current copy picks neither:

1. **Own the premium slot.** Stop calling it accessible. Justify Rs 4,500 on
   something visible — but the material/craft claim rules ban the usual levers,
   so it has to be design, curation and the buying experience.
2. **Reprice to Rs 2,900–3,400.** Top of the DTC band without leaving it, and it
   makes "twelve styles, one honest price" a value story instead of a tension.

---

## 2. The discount architecture — everyone runs a permanent fake sale

**[Fact] Share of variants carrying a struck-through "was" price:** Fineur 98% ·
Lyana 99% · Bag X 98% · Insignia 98% · Enshee 95% · WestStyle 89% · Purse Bazar
56% · RTW 50%. **Median markdown 33–50%.**

There is effectively no full price in this category. The list price is a fiction
that exists to be struck through. **[Fact]** Lyana has run the *same*
"Women Handbags | Upto 60% Off" video ad continuously for **391 days**, and DPA
ads templated on `Now:{{current_price}} Was:{{price}}` for **544 days**. The
discount is not a campaign, it is the permanent price architecture.

**[Fact] The promo calendar, recovered from their Shopify tags:** `11.11 Deals` ·
`1212` · `azadisale` / `1947azadi` (14 August) · `ramdansale` · `Blessed Friday`
(localised Black Friday) · `Year End Sale` · `SUMMER SALE` · `MegaSale_85%` ·
`newyearsale`. Roughly one named sale event every 5–6 weeks.

**Where this leaves VOSS.** Rs 6,000 → Rs 4,500 is a **25% markdown, shallower
than every competitor's median**, running permanently with no end date — which
is exactly the practice `product-marketing.md` says VOSS is positioned against.
VOSS currently takes the *credibility cost* of a fake anchor and gets **none**
of the perceived-value benefit. **[Likely]** the weakest of the three available
options. Either drop the anchor and sell one honest price — genuinely
differentiated here, because nobody else does it — or make the discount real,
dated, and deep enough to register.

---

## 3. Catalogue strategy — they win on volume, VOSS cannot

**[Fact] New products published per month over the last year:** Fineur 25–63 ·
Enshee 24–71 · Bag X 23–151 · RTW Creation 12–325 · Insignia 39–521.

These are churn businesses: dozens of SKUs a month, sourced and flipped, each one
an SEO landing page and a fresh creative. VOSS has **twelve styles total**.

**[Fact] They list each colourway as a separate product.** Enshee's "Cyme Velvet
Bag - Black", "- Horsebrown" and "- Multi" are three products, not one with
variants. Median colourways-as-variants is **1**; only Lyana groups them (median
3). **[Likely]** deliberate SEO surface-area farming, and also why their
catalogues look enormous and incoherent.

**[Fact] Stock discipline is bad, and that is VOSS's opening.** Out-of-stock
variant rates: Insignia 72% · Fineur 40% · WestStyle 38% · Bag X 18% · Enshee 8%
· RTW 2% · Purse Bazar 0%. Insignia's storefront is three-quarters dead.
**VOSS's "everything photographed is in stock" is a real, verifiable, uncopied
wedge** — and it is worth saying on the page, which it currently isn't.

**[Fact]** RTW Creation tags colours with raw CSS colour names — `OldLace`,
`GoldenRod`, `DarkSlateBlue`, `Sienna`. **[Likely]** an automated or generated
catalogue pipeline. **[Fact]** Enshee carries a `dup-review-publication` tag on
182 products; **[Likely]** duplicated review content seeded across the catalogue.

---

## 4. Instagram — the brands' own accounts are not the engine

**[Fact] Brand-account performance is weak.** Median engagement per post: Fineur
151 · RTW 58 · Purse Bazar 37 · Enshee 15 · Lyana 12 · Elixir 2. Cadence is
3.7–9.4 posts/week.

**[Fact] Creator posts tagging those brands perform 10–800x better:**

| Creator post | Plays | Engagement | Brand |
|---|---:|---:|---|
| @emm.ugc.creator | 384,035 | 12,017 | Enshee |
| @_wo.noor | 137,992 | 2,739 | Fineur |
| @ewits.aqssa_ | 111,689 | 3,187 | Fineur |
| @saima.noor10 | 64,928 | 104 | Lyana |
| @fatimazchohan | 47,860 | 273 | RTW Creation |

**The growth engine is seeded micro-creator UGC, not brand content.** Around 40
distinct creator accounts surfaced in one shallow pull, so the seeding programme
is broad and continuous.

### The creator-post formula, recovered verbatim

1. **Format:** vertical Reel — "fit check", OOTD, "what's in my bag" — shot on a
   phone in a real room. Not studio product film.
2. **The bag is one credited item among several:**
   `button down @amo_amorre jeans @outfitters_pk bag @fineur.pk heels @insignia_shoes`.
   It reads as a personal outfit, not an ad.
3. **The caption is almost nothing.** Often literally `X @thelyanashop`.
4. **[Fact] Hidden keyword blocks in parentheses at the end**, for in-app search:
   `(viral polène dupe, polène bag, polène bag dupe, what's in my bag, university bag`
   · `(cherry red bag, red shoulder bag, red handbag, shoulder bag, statement bag`
   · `(Tote bag, university, rtw creation, affordable)`.
5. **[Fact] The dupe angle is explicit, and it is the top performer.** The single
   biggest post in the dataset — 384k plays — sells Enshee as a *"viral polène
   dupe"*. Also `"trendy bag dupes"`, `"Korean Bags, Now in Pakistan"`,
   `"First Real Korean Bags In Pakistan"`.
6. **[Fact] Comment-to-DM funnel:** `"viral bag under 2500/- comment 'link' and
   ill share the link"`.
7. **[Fact] Price is the hook when it is low:** "under 2500", "super super
   affordable", "affordable luxury bags".

### What their captions do *not* say — this is the gap

**[Fact] Across 269 brand captions:** price mentioned **2%** · COD **3%** · free
delivery **1%** · delivery-time promise **0%** · exchange or return **0%**.
Against discount/sale language at **40%** and urgency at **20%**.

Top hashtags: `#bags #sale #handbag #pakistanifashion #handbagstyle #trending
#salesalesale #baglovers #upto50off #everydaybag #totebag #discount`.

**The entire trust stack VOSS is built on — the price is on the page, it's in
stock, you pay on delivery — is absent from competitor Instagram.** They shout
discounts and say nothing about whether you can trust them. That lane is wide
open.

---

## 5. Paid ads — Meta Ad Library, 257 bag ads

**[Fact] Who is actually buying traffic:**

| Page | Ads live | Oldest running | Median run | Page likes |
|---|---:|---:|---:|---:|
| Lyana | 65 | 544d | 93d | 7,872 |
| Fineur.pk | 21 | 404d | 55d | 22,187 |
| RTW Creation | 18 | 42d | 41d | 433,790 |
| Enshee | 16 | 130d | 24d | 15,501 |
| Insignia | 4 | 34d | 34d | 1,027,121 |

**Lyana is by far the most sophisticated paid operator in the set** — 65
concurrent ads, an 18-month-old evergreen winner, and a DPA catalogue feed. Bag
X, Purse Bazar and WestStyle run no meaningful paid presence at all.

**[Fact] Format and placement:** VIDEO 53%, IMAGE 25%, DPA 12%. CTA is
`SHOP_NOW` 61%. Placements: Facebook 95%, Instagram 94%, Audience Network 77%,
Messenger 67%, Threads 62%. **[Likely]** broad Advantage+ style campaigns, not
hand-placed.

**[Fact] Longevity:** median ad runs 59 days, p75 143 days, max 1,113 days. **56
of 257 ads have run past 180 days** — in Meta terms those are proven winners
worth studying rather than guessing at.

**[Fact] The persuasion stack, by how often it appears in bag ads:**

| Element | Share of ads |
|---|---:|
| Luxury / designer / international framing | 33% |
| Free exchange or return policy | 31% |
| Limited time / hurry / season-end | 23% |
| Percentage discount claim | 18% |
| Star rating or review proof | 18% |
| Units-sold / order-count proof | 14% |
| Explicit price in Rs | 11% |
| Free delivery | 9% |
| **Cash on delivery named** | **7%** |
| Urdu-script copy | 2% |

### The winning ad, reduced to its skeleton

> **TITLE:** `Women Handbags | Upto 60% Off` — the offer, in the title, always
> **DESC:** `Top-Rated Bags! ⭐⭐⭐⭐⭐` — the proof line, always
> **BODY:** discount restated in bold-unicode, then a scarcity close
> (`grab yours before they're gone!`)
> **CTA:** `SHOP_NOW` to the product page

Other proof lines observed verbatim: `7 Days Return Policy` · `Sold more than
2980 pieces | 100+ reviews | 7 Days Easy return and exchange policy` · `10,000+
reviews | 7 Days Return Policy | Biggest Brand in Pakistan` · `4.9/5⭐⭐⭐⭐⭐
100,000+ Orders Delivered` · `Delivery across Pakistan 🚚 7 din exchange &
return policy` (code-switched Urdu).

**[Fact] The number-one risk-reducer in paid is the return/exchange window (31%),
not COD (7%).** COD is assumed baseline in Pakistan and barely worth ad space.
**[Likely] VOSS is over-weighting COD as a differentiator** — it is table stakes.
**The uncopied position is a stated return/exchange policy.** VOSS has none
published, while 31% of competitor ad spend leans on theirs.

---

## 6. What VOSS should take from this

**Genuinely open lanes [Likely]:**

- **One honest price, no fake anchor.** 95–99% of this market runs a permanent
  struck-through price. Being the only brand that doesn't is a real story — but
  only if VOSS actually drops the Rs 6,000 anchor.
- **A stated returns/exchange window.** The category's top risk-reducer, and
  VOSS currently has none.
- **In-stock integrity**, against competitors running 18–72% dead SKUs.
- **Twelve considered styles against 400-SKU churn.** Curation is the one thing
  a volume flipper structurally cannot copy.

**Must fix [Fact-driven]:**

- The price/positioning contradiction in §1 — premium-priced,
  accessible-positioned.
- The 25% permanent discount: worst of both worlds.
- COD treated as the headline differentiator when the data says it's baseline.

**Should copy [Fact]:**

- **Seeded micro-creator Reels.** This is the entire organic engine;
  brand-account posting is near-worthless. Budget goes here.
- **Offer in the ad title, proof line in the description** — the structure behind
  every long-running winner.
- **Keyword blocks in captions**, for in-app search.

**Should not copy:**

- The dupe framing ("polène dupe"). It works — it is the best-performing post in
  the data — but it is incompatible with building a label rather than a flip shop.
- Seeded duplicate reviews (Enshee's `dup-review-publication`).
- Permanent 50–60% off.

---

## 7. The set, for the record

**Direct** (DTC, Shopify, COD, Rs 1,900–2,500 median): Enshee `enshee.com`
`@enshee4` · Fineur `fineur.pk` `@fineur.pk` · Lyana `thelyanashop.com`
`@thelyanashop` · RTW Creation `rtwcreation.com` `@rtw_creation` · Bag X
`bagx.pk` `@bag.x.official` · Purse Bazar `pursebazar.pk` `@pursebazarteam` ·
WestStyle `weststyle.pk`.

**Secondary** (mall / department tier): Insignia `insignia.com.pk` · Sanaulla
`sanaullastore.com` · Borjan · Stylo · Bata.

**Marginal:** Elixir Bags `elixirbags.pk` `@_elixirhandbags_` — not Shopify, 0.1
posts/week, median 2 engagements, zero ads. **[Fact] Effectively dormant.**

**Not researched:** Daraz marketplace listings, and TikTok — all seven direct
competitors have accounts (`@fineur.pk_`, `@thelyanashop_`, `@rtw.creation`,
`@enshee_style1`, `@pursebazar`, `@elixir_handbags`) and **[Likely]** it matters
at this price point, but it was out of budget this pass.
