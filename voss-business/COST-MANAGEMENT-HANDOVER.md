# Owner-managed costs and original sheet

Open https://voss-business.pages.dev/ → Finance.

Live Worker release: `8222af512363481cb33ffa5a309b16a7`. Production build and TypeScript passed. Full access/finance/auth/proxy tests passed, with additional cost-item, import-link and expense-retry checks. The live professional address serves Cost items, the reconciliation and VOSS owner guide; unauthenticated cost writes return 401. Google settings return 200 with Google enabled and sign-ups allowed; the sign-in endpoint redirects to accounts.google.com. This verifies configuration and handoff, not a personal sign-in by either owner's Google account.

## What is preserved

The 26 original sheet entries remain unchanged, with an original total of Rs64,514.10. There are Rs2,750 of bag stock purchases and Rs61,764.10 of other expenses. With no delivered-and-collected sales recorded, stock purchases remain assets rather than being deducted from profit immediately. The Summary now explains this difference in a reconciliation table.

Finance opens on All dates so the preserved sheet is immediately included. Choose a month when you want a monthly breakdown. The six summary cards come first, followed immediately by spending by category, the spending-versus-profit explanation, and an expandable original-sheet table. The original-sheet table always loads all imported rows, not just the selected reporting dates. It shows source row, date, description, category, payer, original amount and current amount. Date warnings remain visible for owner review.

## Add and manage cost items

1. Choose Cost items. Fourteen reusable non-stock cost names have been created from the sheet's 24 non-stock bills. Salary spelling variations and ChatGPT spelling variations are grouped. The actual bills remain their separate original records. The two stock purchases remain in Summary and the original-sheet table.
2. Add cost item creates a reusable name such as a box, wrapping, Instagram ads, photography, subscription or salary. Select its reporting category, optional usual rate and unit. It creates no expense.
3. Record expense opens a bill using the saved name, category and rate. Change the quantity or actual rate; the total is calculated in integer paise. Enter the date, payer and paid/unpaid state, then save.
4. Add expense also supports a free one-off description and total amount without using a saved item. You can optionally choose a saved item in that form.
5. Edit changes an item's usual rate/name/category, or archives it. Include archived items lets you restore it. Past expenses and their saved amounts do not change when an item's rate changes. Use Sales & expenses to correct an actual bill; detailed editing retains source records and void-with-reason controls.
6. Actual bills in the cost-item table are linked to the existing ledger. They show all-date totals and bill counts. A usual rate is a reusable starting point, not the sum of past spending. Unknown rates remain unknown; historical bulk bills do not establish reliable per-unit rates.
7. Usual costs for new sales is under Cost items in an expandable section. Packaging's expense/per-sale setting and marketing's planning-only allowance remain in place to prevent double-counting. The confirmed customer delivery charge is Rs150, separate from the courier's bill.

## Safeguards and verification

- Additive private cost_items table, RLS and revoked direct access. Existing finance RPC names and normal writes are retained. Only owners/technical users can write; viewers can read.
- Optimistic versions prevent overwriting a colleague's changes. Cost items are archived, not deleted. Changes enter the existing immutable audit log.
- Request references deduplicate new cost-item creation and new expense retries. Changing a request's contents after an uncertain save produces a conflict rather than a second posting.
- Source-entry IDs link imported bills to their cost items even if a source description is corrected later. Rerunning the migration does not duplicate those links or expenses.
- Tests cover precision, actual bill totals, historical amounts after rate edits, archive/restore, stale edits, viewer write rejection, import grouping, reruns and expense retries. No test bills were posted to production.
- CSV exports are available for cost items, spending categories, original rows and the existing ledger. Summary also has Print / PDF.

## Backup and rollback

GitHub backups were created before these changes: codex/backup-dashboard-before-finance at 43a988b and codex/backup-dashboard-before-simplification at b11a4ad. A local Git bundle is in ignored runtime/voss-dashboard-before-simplification-2026-10-21.bundle. A private finance backup (entries, inventory, defaults, audit and prior public function definitions) is in ignored runtime/finance-before-cost-items-2026-10-21.json. Private backups are not committed or uploaded to GitHub.

The preceding Worker version is c7bafe0d3fb84ca191478125b68e381b. Cloudflare can roll back the interface to that version. The additive table may remain: older frontend versions ignore it. Do not drop the table or audit history to reverse a visual change. No product-creation controls or storefront publishing behavior were added.
