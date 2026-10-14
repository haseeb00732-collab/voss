# VOSS Business

A separate private owner dashboard. The public shop remains at https://www.voss.pk.
Customers place cash-on-delivery orders on the website; no WhatsApp message is required.
Orders are stored in the existing Supabase cloud project, not on this computer.

## Implemented

- Owner sign-in, sign-out, password change and password recovery.
- Overview of new orders, orders to prepare, dispatched orders, outstanding COD and money received.
- Search/filter/paginate orders; export the current page as CSV.
- Order details: customer contact/address, bags, colours, quantities, totals and customer notes.
- Confirm, pack, dispatch, deliver, cancel or return an order through validated status transitions.
- Courier references, private notes and an activity history.
- Separate confirmation of COD money received; delivery alone does not count as payment.
- Product catalogue from Supabase, including the white-background image references.
- Mobile layout, keyboard-accessible order dialog, private data excluded from public previews.
- New-order alert queue recorded in the same transaction as each order.

## Current status — 14 October 2026

The cloud schema is installed in Supabase project `porncyiyigtvejpbsjwl` (VOSS Commerce).
The dashboard is published on Cloudflare Workers Static Assets:
https://voss-business.haseeb00732.workers.dev/ (private sign-in), with a fictional
design preview at `/preview/`. Cloudflare OAuth is connected. Live responses were
verified as HTTP 200 with no-store, noindex and frame-denial headers.
Owner email confirmed by the user: haseeb00732@gmail.com. The owner Auth account has not
been provisioned yet. Automatic email delivery and Meta integrations are NOT connected.
The recipient is verified in Cloudflare. Public DNS uses Cloudflare nameservers,
but the authorized account returns no accessible zones, including `voss.pk`.
Email Routing/domain access must be resolved before official-domain sending works.
The `/preview/` route contains fictional sample orders; it never writes them to Supabase.
Catalogue editing and courier booking are not included in this release.

## Local preview

Run `npm ci`, then `npm run build`, then `npm start` in `voss-business`.
Open http://127.0.0.1:3001/preview/ for sample data, or `/` for owner sign-in.
For development use `npm run dev`. This machine reuses installed dependencies through
a local junction because disk space is low; the committed package files support a clean install.
Run `npm test` for isolated database security and order-state checks. These create no production orders.

## Free deployment: Cloudflare Workers Static Assets

This is a Next.js static export, with Supabase handling authentication and data access.
It is a SEPARATE Worker named `voss-business` in account
`9d0d63daf3c22d34aa586059e6069f64`. The existing `voss` storefront proxy is untouched.
The static export was uploaded through the authorized Cloudflare API; no paid plan
or subscription was enabled. Future builds use:

- Root directory: `voss-business`
- Build command: `npm run build`
- Output directory: `out`
- No service-role key, database password or Meta secret in build variables.
- Use the free plan; do not enable paid services.

The public publishable key in `src/lib/business.ts` is intentional. Every read/write requires
an authenticated user whose ID is in the private owner allowlist. Static hosting of the
shell does not expose order data. `public/_headers` supplies no-store, noindex and security headers.
`scripts/cloudflare-assets.mjs manifest` prepares a SHA-256 manifest. An authorized
Cloudflare client creates an assets-upload-session and stores its response in ignored
`runtime/assets-session.json`. Run `node scripts/cloudflare-assets.mjs upload`, then
publish the Worker assets with the returned completion token and the contents of
`public/_headers` in `assets.config._headers`. Enable its workers.dev subdomain.
Tokens are temporary, remain ignored, and must never be committed. No GitHub automatic
dashboard deployment is configured yet. Cloudflare static-asset limits apply:
https://developers.cloudflare.com/workers/static-assets/.

## Owner registration and activation

1. Add the exact dashboard HTTPS origin to Supabase Auth redirect URLs and use it for invite/recovery.
2. Connect verified Brevo SMTP in Supabase Auth. Enable email confirmation and email signup.
3. Haseeb registers with haseeb00732@gmail.com, sets his own password, verifies the email and signs in.
   The single-use bootstrap reserves technical administration for this confirmed email only.
4. Each owner opens the same dashboard link, chooses Create account, verifies their email and signs in.
5. Haseeb approves their request under Settings → Team access. Registration alone never reveals orders.
6. Verify real owner sign-in, order reading and sign-out. Never place real customer data in preview fixtures.

Do not use user-editable metadata for authorization. Do not insert accounts directly into `auth.users`.
Default Supabase email has delivery restrictions; configure a verified sender if it cannot deliver
owner invites/recovery. Documentation: https://supabase.com/docs/guides/auth/auth-smtp.

## Database

`database/cloud-owner.sql` is the applied additive migration. The source of checkout data remains
the storefront database schema. Private helpers enforce owner authorization and row locking;
public wrappers use invoker permissions. All exposed tables have RLS and no public read policies.
Order changes use version checks to stop one tab overwriting another tab's newer changes.
Revoking the owner's allowlist entry immediately blocks subsequent data operations.

## Notifications and social

Dashboard data refreshes every 30 seconds while visible. Optional browser alerts work while its tab
is open. The cloud continues accepting orders when the dashboard is closed. Email jobs are queued.
The Brevo dispatcher source is implemented with service-only access, leases and bounded retries.
It is inactive until BREVO_API_KEY and VOSS_EMAIL_FROM are set in Supabase Edge secrets.
Supabase Auth also needs Brevo SMTP, correct dashboard redirects and verified sending access.
Before activation, configure a private scheduled invocation for retries and verify an actual test
message. Provider acceptance is not proof of inbox delivery. Customer details remain in the private
dashboard; the alert contains the reference, amount and dashboard link only.
No automatic WhatsApp messages are active. Meta Business Suite is linked for convenience;
Facebook, Instagram and WhatsApp inboxes/analytics are not integrated into this dashboard yet.

## Verification

On 9 October: production build and TypeScript passed; all 21 isolated database tests
passed. Live storefront configuration and a Black Tassel Tote quote returned COD,
Rs 3,100 and free delivery, with 29 places remaining. No new production test order
was created. The live preview opens order details and refuses to persist demo changes.
Real owner sign-in and email delivery are still unverified and not activated.

## Delivery rules

Lahore only. Cash on delivery. Estimated 3–8 days. First 30 website orders get free delivery.
After the first 30 website orders, the confirmed fee is a flat Rs 150 across Lahore.
Changing order status does not book a courier, contact a customer or process a refund.

## Legacy files

`legacy/`, `database/owner.sql` and `src/lib/server/` retain the earlier server implementation for
reference. They are not used by the static dashboard and are not deployed as API routes. Old owner
keys and local database configuration do not grant access to this version.
