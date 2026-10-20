# Upgrade verification and operation

## Finance examples — synthetic tests only

These numbers are fixtures in an isolated database. They are not VOSS sales and are never imported into production.

| Order | Collected revenue | Sold bag cost | Packaging | Courier outward | COD fee | Marketing | Courier return | Profit contribution |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| A: delivered + collected | 3,000 | 1,000 | 100 | 150 | 30 | 200 | 0 | 1,520 |
| B: delivered + collected | 3,400 | 1,400 | 80 | 150 | 34 | 0 | 0 | 1,736 |
| C: returned, not collected | 0 | 0 | 70 | 150 | 0 | 100 | 150 | -470 |
| Total | 6,400 | 2,400 | 250 | 450 | 64 | 300 | 150 | 2,786 |

Revenue = 3,000 + 3,400 = 6,400. Other order costs = 1,214. Profit = 6,400 − 2,400 − 1,214 = 2,786. Bags sold = 2. Returned saleable stock remains stock; damaged/lost stock is recorded explicitly as a loss. The same refused order has zero revenue and keeps both courier legs.

## Checks to run

1. `npm test`: owner access, team approval/revocation, promotion boundary, checkout retries, email queue, base ledger, upgraded finance math, social connector, Google auth and restricted proxy.
2. `node scripts/test-jobs.mjs`: disconnected fallback, secret headers, non-PKR account rejection and safe missing-backup failure.
3. `npx tsc --noEmit --incremental false` then `npm run build`.
4. A create request retried after an edit or void must return the current record without changing it or incrementing the offer counter.
5. A fee-only cost payment, a later expense payment and a refund must appear in the correct cash week. Category totals must equal Total Spent.
6. Missing/unreviewed costs must keep profit incomplete; zero revenue must not produce infinite margin or ROAS.
7. Signed-out/unapproved accounts cannot read business records. Viewers can read but cannot save finance, inventory, order or campaign changes. Revoking a viewer must remove its membership.
8. Concurrent edits return a refresh/conflict message instead of silently overwriting another owner.
9. No private job secret, provider token, customer records or runtime backup belongs in a public build or Git commit.
10. Confirm the live login, narrow API response, finance page desktop/mobile, CSV preview and PDF download after deployment. Do not create fake live orders to test.

## Files by deployable phase

### Finance and orders

- `database/finance.sql`: backward-compatible base ledger update, detailed offline costs, shared promotion accounting, retry protection.
- `database/finance-upgrade.sql`: normalized economics, collected-only revenue, refund/cash distinction, per-bag/campaign reporting, campaign storage, named audit records.
- `database/finance-order-costs.sql`: audited whole-order website costs and attribution.
- `database/order-status-upgrade.sql`: Refused support and returning a collected order, preserving existing Packed/Cancelled behavior.
- `database/viewer-roles.sql`: member reads, owner writes, technical administrator role changes and viewer revocation.
- `src/lib/finance.ts`, `FinanceWorkspace`, `FinanceInsights`, `WebsiteOrderCosts`, `FinanceCalculator`, `OrderCsvImport`: summary, tables, forms, calculation details, CSV and print exports.

### Social and jobs

- `database/scheduled-jobs.sql`: private cached metrics/status, tightly scoped secret-authenticated job entry point. Job credentials are excluded from exports.
- `worker/jobs.mjs`: six-hour Meta sync, campaign-day upserts, weekly PDF trigger, private daily backup support.
- `worker/index.mjs`: same restricted proxy with only explicit new read/write routes; the job RPC is never proxied to the browser.
- `SystemStatus`: shows connection, scheduled run and failure information without exposing secrets.

### Reports and polish

- `database/weekly-reports.sql`, `WeeklyReports`: deterministic Monday snapshots and saved PDF downloads.
- `AuthGate`, `OwnerDashboard`, `TeamAccess`, `ThemeToggle` and CSS: logo placement, compact hierarchy, read-only role controls, mobile table scrolling and appearance preference.

## Deployment

1. Keep ignored runtime data/functions/source backups and the previous Cloudflare Worker version ID. These backups contain private business data.
2. Use branch `codex/finance-mvp-upgrade`. Review only dashboard changes; do not stage unrelated storefront changes.
3. Apply **once**, in one migration transaction: `finance.sql`, `finance-upgrade.sql`, `finance-order-costs.sql`, `order-status-upgrade.sql`, `viewer-roles.sql`, `weekly-reports.sql`, `scheduled-jobs.sql`.
4. Do not rerun the base finance file by itself after the upgrade: it would replace the wrapper. Later changes should use a new forward migration.
5. Provision a random server job secret. Store only its SHA-256 digest in the private database credential table; store the real value in Cloudflare Secrets. Never put it in source control.
6. Build static assets, upload their verified manifest, then publish the Worker including both `worker.mjs` and `jobs.mjs`, keeping existing secret bindings. Preserve the existing HTTPS dashboard URL and OAuth return address.
7. Register `0 4 * * 1` for weekly PDF and `15 */6 * * *` for social refresh. Daily backup cron `0 3 * * *` must only be enabled after the private `BACKUPS` KV binding is authorized and its test export succeeds.
8. Confirm the imported ledger count and source totals are unchanged, anonymous reads fail, the original checkout functions still exist, and report generation is idempotent.

## Rollback

- Revert the Worker to the saved prior version to restore the previous UI without deleting any data.
- Leave additive tables/columns intact. Never drop the new ledger, audit or report records to roll back a screen.
- Preserve old function definitions in the ignored functions backup. Restore only the affected definitions inside a transaction, then test both old and current schemas.
- Do not rename `finance_save_before_upgrade` over the live function casually; it lacks the upgrade's refund/status rules. Restore a reviewed function body instead.
- Pause cron triggers if job behavior is wrong. Reports and finance remain usable manually.
- Never overwrite a current database with an old complete backup. Restore into an isolated project first, compare IDs and reconcile newer orders.

## Operational limits and honesty

- The report is a PKR operating ledger, not a tax filing or a full double-entry accounting package. Opening balances, depreciation, unrecorded activity and taxes are not invented.
- Return status restates the order's current revenue contribution. Saved weekly PDFs are immutable historical snapshots; later corrections/returns do not rewrite an old saved PDF. Review the live ledger for corrected current figures.
- Per-bag contribution includes allocated linked campaign spend; business overhead is deducted only from total net profit. Mixed-product website orders are grouped until a reliable allocation is entered, rather than claiming exact individual bag profitability.
- Direct order marketing, Marketing expenses and campaign-day spend are separate entry paths. Record a cost only once; the software cannot identify two differently described rows as the same receipt reliably.
- Campaign spend affects profit when incurred. It is excluded from cash movement until a separate payment model exists; the cash screen states this limitation.
- Email remains unconnected until a sender and owner recipients are configured. A saved report is not evidence that an email was sent.
- Daily off-site backup needs Workers KV permission on the Cloudflare connection. The manual pre-upgrade backup is not a substitute for an activated daily schedule.
- Meta credentials and app authorization are required before live metrics can be verified. CSV/manual entry works independently.
