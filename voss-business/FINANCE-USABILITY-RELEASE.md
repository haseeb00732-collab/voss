# Finance usability release — 21 October 2026

Public entrance: https://voss-business.pages.dev/

Cloudflare Worker deployment: `684f882bf8064388851a6f1c749ab727`.
Previous Worker version: `59b945b483624c0a9d1f35b93d22f0af`.

## Kept

Existing routes, Google sign-in and team approval, private Supabase records, source import, finance permissions, optimistic editing conflicts, audit history, order workflow, reports, campaign import and scheduled jobs. No database migration or production finance write was needed. The original import remains 26 entries / Rs 64,514.10; the number shown in the app comes from the existing server response.

## Changed

- Guided article/colour/quantity/price/discount sale form, followed by delivery, payment and specific order costs, then explicit review/save.
- New sales retain their original price, whole-order discount and channel in the saved notes; recognised revenue uses the net subtotal. No historical discounts were invented.
- Expense category shortcuts, simple expense creation/editing, reporting month and spending table with CSV export.
- Visible imported-sheet shortcut selects all dates and original source entries. Existing detailed editing and source view remain available.
- Advanced bag/campaign tables are expandable, rather than the first thing an owner must read.
- Ledger recognised income requires delivered and collected; cost display/export includes COD, return courier and stock loss.
- Numbered Social → Connections instructions document both Cloudflare scheduled-sync settings and the existing Supabase Social screen settings. Credentials still require the user's Meta setup.

## Verification

Full npm test suite passed: owner access, team/signup/approval, email queue, finance permissions/import/audit/precision/conflicts, returns/refusals/payment timing/campaign reconciliation, new discount calculations, social privacy, auth callbacks and proxy origin rules. Production Next build and TypeScript passed. Isolated browser checks verified actual sale and packaging expense payloads without production writes; Next/Review does not save. Mobile width is contained; light/dark styles checked.

Example synthetic arithmetic: 2 × Rs 2,649 − Rs 200 = Rs 5,098. A pending new sale remains excluded from recognised revenue. These are tests, not business sales.

## Rollback

In Cloudflare → existing voss-business Worker → Deployments, roll back to `59b945b483624c0a9d1f35b93d22f0af`. The Pages entrance proxies that Worker, so no Pages redeployment is needed. Do not remove JOB_SECRET or scheduled triggers. An ignored private source/settings checkpoint is saved in runtime/checkpoint-before-finance-usability.json. No database rollback is necessary; all records remain compatible with the prior interface. Reverting frontend code does not undo genuine later user edits.
