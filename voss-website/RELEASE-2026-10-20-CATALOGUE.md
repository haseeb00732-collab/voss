# Catalogue release — 20 October 2026

Preserved: all twelve existing products, retail prices, image files, checkout routes, historical orders, promotion counters and finance records. Added two styles in eight colours, with sixteen transparent responsive WebP assets and eight white checkout assets. Source photographs and the pre-change cloud catalogue backup are kept locally under the ignored `outputs/studio-unification/masters/20261020` directory.

| Website bag | Width × height, inches | Other confirmed measurements |
|---|---|---|
| Square Quilted Tote | 14 × 11 | Depth 5; handle drop 10 |
| Floral Embossed Bag | 12 × 10 | — |
| Croc Panel Tote | 13 × 11 | — |
| Croc Top Handle Bag | 13 × 11 | — |
| Chevron Quilted Satchel | 13 × 11 | — |
| Textured Dome Satchel | 13 × 11 | — |
| Two Tone Bag Set | 16 × 11 | Main bag only |
| Tassel Tote | 17 × 11 | — |
| Structured Trio Bag Set | 10 × 9 | Main bag only |
| Croc Panel Dome Bag | 10.5 × 8.5 | Depth omitted: reference graphic says 4; text says 3.5 |

CHIC, Arc Handle Bag Set, Kite Tote and Buckle Panel Bag Set remain unmeasured: no matching confirmed dimensions were supplied. Two screenshots describe the same Tassel Tote, so eleven references confirm ten styles. Nineteen attachments contain eleven references and eight new photographs, rather than nine.

New products: Kite Tote (Article 13), Rs 2,649, ivory/tan/black/dark brown; Buckle Panel Bag Set (Article 14), Rs 2,799, green/black/dark brown/brown. Supplier wholesale amounts have not been substituted for retail prices or inventory costs. Generated studio photographs are based on the supplied photos; confirm physical-stock colour and detail before using them in advertising.

## Validation

- Production build passed with TypeScript and all 33 pages generated.
- Eight colour assets verified at 480×600 and 960×1200 with transparency; eight checkout images verified at 960×1200.
- Checkout request, Edge validation, email failure handling and 29 approval/promotion/retry checks passed using isolated data.
- 72 finance checks, the finance-upgrade suite, 21 owner checks and Google callback/session checks passed. No real order was submitted.
- Cloud quote for one of each new bag: 2,649 + 2,799 = 5,448; delivery 0 while first-thirty offer remains available. Existing counters unchanged.

## Deployment and reversal

The GitHub production branch is `main`; its existing Vercel integration publishes the storefront. Catalogue commit `f55ad9e` and privacy notice commit `42b505d` were verified in successful preview builds before production push. The database seed is `database/october-20-products.sql`, generated and asset-checked by `scripts/prepare-october-20-products.ts`. It upserts only the two new products, eight variants and eight images, without changing stock quantities or costs.

To reverse the storefront, revert those two commits on the deployment branch and push. Keep cloud rows for historical order integrity; if withdrawing either style, set its product `active=false` instead of deleting it. Restore previous catalogue values from the local backup only after comparing current changes. Never restore by deleting later customer orders, expenses or payment records.

## Owner access

Google sign-in was found in Testing mode with only the technical email registered. The branding links were completed and the user explicitly approved publishing Google sign-in after automatic review requested confirmation. Google now displays **In production**. No sensitive or restricted Google scopes are configured. Business approval remains separate: first sign-in requests access; the technical account approves each owner in Settings → Team. There is no shared password, and public sign-in does not expose records. Owners must complete their own Google authentication; their personal sessions have not been impersonated or tested.

Live production checks confirmed both product pages, colour switching, Square Quilted Tote measurements and the website checkout total of Rs 5,448 for the two new styles. Vercel reports successful deployment `BMSpCVZ7RSfeNymSz4pvfozHoVa1` for commit `42b505d`.
