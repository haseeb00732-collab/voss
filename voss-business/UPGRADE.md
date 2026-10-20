# VOSS Business upgrade — 20 October 2026

## 1. Audit before this upgrade

Keep: the deployed Cloudflare dashboard, Google sign-in, approved team access, Supabase cloud records, existing routes, storefront checkout, stock editor, order history and notification outbox. Keep all 26 imported expense records and their source provenance. Twelve products, 59 variants and 72 image records exist. No product photography changes.

Fix: duplicate BUSINESS on login; oversized finance heading; ledger density; manual order cost breakdown; revenue currently recognized at delivery rather than delivery AND collection; no refused status; incomplete per-bag/campaign attribution; audit history omits the person; no viewer permission; no scheduled report archive or verified daily off-site backup.

Remove: only the three explicitly identified test orders (already removed before this upgrade request). The free-delivery counter was reset from its inconsistent test value to zero. Do not enter the five real historical orders until an owner supplies actual details. Preserve Packed and Cancelled as useful existing statuses.

Add: collected-sales accounting, detailed costs, profit completeness, per-bag and campaign tables, calculator, exports, reports, manual/import fallbacks and scheduled integrations. No fabricated Meta metrics or financial values.

## 2. Independently deployable phases

1. Finance: backup, additive schema, costed sales, collected revenue, returns, reports and finance UI. Preserve old function definitions for rollback. Publish only after isolated database tests and build.
2. Social: private cached metrics and campaign spend, manual/CSV fallback first; connect Meta only after credentials exist. No Google Ads API. Do not label disconnected platforms connected.
3. Reports: save immutable weekly snapshots Monday 09:00 Asia/Karachi (04:00 UTC), downloadable PDF and email delivery outbox. Email requires a configured sender and verified owner recipients; failed delivery must not lose reports.
4. UX/security: mobile tables, light/dark, explanations, viewer access, daily backup schedule and recovery checks.

## Backup checkpoint

Private snapshots are in ignored `runtime/backup-20261019-data.json`, `runtime/backup-20261019-functions.json` and `runtime/backup-20261019-source.zip`. The branch is `codex/finance-mvp-upgrade`. These files contain private business data and must never be committed or published. This is a manual checkpoint, not a claim that daily backups are configured.

## Accounting rules

- Recognized revenue = product subtotal + customer delivery charged, only for Delivered AND Collected orders. Date = collection date. Returned/refused orders have no recognized sales revenue.
- Bags sold = delivered, collected units. Pending COD is displayed separately.
- Bag contribution = recognized revenue − product cost of sold units − packaging − outward courier − return courier − COD fees − attributable marketing − damaged/returned stock loss − other order costs.
- Net profit = total contribution − unallocated operating expenses − campaign spend not already allocated. Never subtract inventory purchases and cost of the same sold goods twice.
- Total spent = recorded expenses + additional order costs + campaign-day spend. Cash spent is shown separately when unpaid costs exist. Product purchase cash is recorded in the expense ledger; sold-unit product cost belongs to profit.
- Margin = net profit / recognized revenue × 100. Zero revenue gives “—”, not infinity.
- Campaign ROAS = attributed collected revenue / campaign spend. Cost per acquired customer requires identified new customers; without that input show “Not known”. Cost per order is not CAC.
- Spending recovery = recorded spending, recognized collected sales and max(spending − collected sales, 0). It is a spending-recovery comparison, not a bank balance or a complete cash break-even model.
- Missing costs are unknown, not zero. Profit stays incomplete until cost details are confirmed. Historical source dates are preserved and flagged, never silently corrected.
- Any refunds must be recorded explicitly; a returned status alone does not transfer money. Returned goods that remain sellable are inventory, not automatically a full product loss.

## Deployment and rollback

Run the isolated SQL tests, TypeScript build and proxy/auth tests. Apply additive migrations in order, then deploy the static shell and existing restricted Worker proxy. Verify signed-out data requests are rejected. Roll back UI to the prior Worker version if necessary. Retain new database columns and rows on rollback; restore only prior function definitions after checking schema compatibility. Never restore a whole database snapshot over newer orders. Reconcile by IDs in a separate transaction.

## Maintenance in ten lines

1. Owners enter each historical order once with its real date and costs.
2. Confirm delivery and collection separately.
3. Record returned/refused courier charges and any refund.
4. Check missing costs before relying on profit.
5. Record stock purchases once; sold-unit cost is a separate profit calculation.
6. Assign campaigns only when attribution is known.
7. Review the weekly report and pending COD every Monday.
8. Check social connection, email delivery and backup status weekly.
9. Give each person their own Google login; revoke access when they leave.
10. Test a backup restore quarterly and before major schema upgrades.
