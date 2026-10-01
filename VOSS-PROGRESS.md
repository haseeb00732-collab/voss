# VOSS progress — 1 October 2026

## Frontend: what customers see

The website has all 10 products, prices, colour choices, product photographs, a shopping bag and a two-step checkout. The shelf was replaced with the original grid. Product backgrounds blend into the page. Article 9 starts in black. The hero animation and colour creative are retained.

The arrows now use SVG drawings instead of text symbols, so iPhone emoji fonts cannot change their appearance. This was changed throughout the storefront, including buttons, product cards and navigation.

Customer order tracking was removed at your request. Order confirmations keep a reference number. Delivery is 3–8 days. COD is confirmed. The first 30 website orders qualify for free delivery.

## Backend: what happens behind the page

The checkout code validates details, gets prices from the database, saves orders and items together, prevents duplicate submissions, and counts free-delivery orders safely. It does not accept card payments.

There are no owner/admin pages or admin APIs in the storefront. The business dashboard is a separate app in `voss-business`, on a separate server/port. It displays order data and has prepared read-only Facebook/Instagram data connections. No AI is needed.

## Database: current truth

The configured development database is local PGlite (a PostgreSQL-compatible engine) on this computer, under `%LOCALAPPDATA%/VOSS/development-databases/voss-preview`. It is for development, not a public cloud database. It contains the product catalogue. Local checkout is deliberately disabled for real orders.

A managed cloud PostgreSQL database has not been connected. Publishing the website files does not publish the local database. Live order saving/lookup requires a cloud database, catalogue migration and production environment configuration.

## Still to connect

- Cloud PostgreSQL and a separate hosted business server.
- Delivery coverage and the normal delivery fee after the first 30 orders; COD and 3–8 days are confirmed.
- Meta developer app credentials/account permissions for real Facebook/Instagram metrics.
- Shared social inbox account linking and automatic WhatsApp notifications, if wanted. Neither is active just because the business number is known.

The latest publishing result is reported in the conversation after build and GitHub checks; do not assume a local edit is already live.
