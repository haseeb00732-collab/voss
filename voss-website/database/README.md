# VOSS checkout handoff

## Implemented

- The original 10-product grid is restored. The shelf and TextureStudy components are no longer rendered on the homepage.
- ColourCampaign uses the current Tassel Tote photographs, colour crossfades, GSAP ScrollTrigger and pointer movement. Reduced-motion preferences are respected.
- Product pages have **Order now**, which adds the selected colour if it is not already in the bag and opens checkout.
- Checkout has two steps: **Delivery details**, then **Review & order**. Address edits preserve the entered fields. Orders are submitted only from the final step.
- PostgreSQL schema stores 10 products, 50 colour variants, 63 studio/white media references, orders and immutable order-line price/name/image snapshots.
- White images in `public/catalogue-white` are flattened versions of the approved website photographs at their original web resolution (960 pixels wide); they are not artificial HD upscales. The storefront retains transparent images for seamless backgrounds.
- The first **30 website orders** receive free delivery. This is a global launch offer, not 30 orders per customer. A transaction locks the promotion row, inserts the order/items and consumes one slot together. Cancelled orders do not automatically release a slot. Rerunning setup never resets usage.
- The server validates colour/quantity/address, reads prices from the database, checks the displayed total, rejects cross-origin requests and deduplicates retries by idempotency key and payload hash. Up to three orders per phone per hour are accepted.

## Current state

Local database seeded successfully. Local checkout is explicitly a design preview and cannot accept orders. A managed production PostgreSQL connection has not been supplied. COD and Lahore-only delivery are confirmed. No production checkout is enabled and no real customer orders were submitted during testing.

Cash on delivery is confirmed by the owner. Delivery takes 3–8 days. Bank transfer/card processing is not configured. Delivery is currently Lahore only. The owner mentioned a standard Rs 150 that depends on the address, but asked to defer later delivery rates. Leave VOSS_DELIVERY_FEE_PKR blank for launch: the server accepts the first 30 free-delivery orders and then requires manual delivery confirmation. Do not assume a fixed Rs 150 for every address. The Rs 250 fee used in automated tests is a test fixture, not a proposed shipping policy.

## Production activation

1. Create or connect a managed PostgreSQL database (Supabase/Neon/PostgreSQL), using a server-side pooled connection with verified TLS. Put the connection in `DATABASE_URL` in the existing Vercel project. Never use a `NEXT_PUBLIC_` variable for database credentials.
2. From this directory, run `npm run db:setup` with that database URL securely configured. It creates the tables and seeds the catalogue using existing white image copies. Use the table-owner migration connection; the application role must have the appropriate explicit access if it is a separate role. Tables have RLS enabled and no anonymous access policies.
3. Set the owner-approved values: `VOSS_PAYMENT_METHOD=cod`, `VOSS_DELIVERY_FEE_PKR=` (blank for the first-30 launch), `VOSS_DELIVERY_CITY=Lahore`, and `NEXT_PUBLIC_SITE_URL=https://www.voss.pk`.
4. Run a controlled test against a separate staging database. Check order persistence, colour/quantity/total, retry behavior and the free-delivery limit. Automated tests are `npm run test:commerce`; they use an isolated in-memory PostgreSQL engine and never touch production.
5. Set `VOSS_CHECKOUT_ENABLED=true` only after the above. Deploy through the existing GitHub → Vercel connection. Keep the current Cloudflare DNS routing; bypass caching for `/api/*`, `/checkout*` and `/bag*` if custom cache rules override origin headers. API responses already use `no-store, private`.
6. Arrange order monitoring/fulfilment before opening checkout. Orders are shown by the separate `voss-business` app and authenticated database console. There is no storefront `/admin` page or admin API. No automatic email/SMS/WhatsApp notification service is connected.

For a uniform delivery charge, prices are integer PKR. Region-specific shipping or payment providers require additional confirmed configuration and implementation before enabling them.

## Local review and verification

- `.env.local` enables a persistent local PostgreSQL-compatible PGlite development database, with order submission disabled. The local database and all environment files are ignored by Git and excluded from deployment traces.
- The local development database closes after each operation so hot reloads do not leave a live file lock. On Windows it lives under `%LOCALAPPDATA%/VOSS/development-databases`, outside OneDrive to avoid sync interference; other systems use the ignored `.data` folder. Production always uses managed PostgreSQL, never the local filesystem.
- `npm run db:setup` is an explicit catalogue sync: updating static product prices alone does not update database checkout prices. Run it after approved catalogue changes.
- `npm run test:commerce` checks validation, server-side pricing, HTTP handlers, origin checks, idempotency, concurrency at slot 30, paid shipping from order 31, rate limits and rollback after a simulated item-write failure.
- The production build can be checked on this OneDrive machine with `$env:VOSS_RELEASE_CHECK='1'; npm run build`, using a separate ignored `.next-release` folder. Normal Vercel builds use `.next`.

The earlier interrupted local seed is retained privately in `.data`; it contains catalogue data only. No live database has been provisioned or published yet.


## Separate business server

Customer tracking was removed at the owner’s request. The owner app is in the sibling `voss-business` directory with its own server and environment. Local PGlite must not be opened concurrently by both apps; production uses managed PostgreSQL. Cloudflare must bypass caching for `/api/*`, `/checkout*` and `/bag*`.

## Cloud readiness check

After configuring the server-only Supabase transaction pooler connection (verified TLS) and running db:setup, run `npm run db:verify-cloud`. It reads product prices, variant image coverage, RLS, promotion usage and order count without printing customer details or creating orders. This does not replace a controlled end-to-end checkout test. Keep production ordering disabled until the database connection, order monitoring and end-to-end test are verified.
