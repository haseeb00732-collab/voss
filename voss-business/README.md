# VOSS Business — separate private server

This is an independent Next.js application, not an `/admin` page on voss.pk. It has its own environment, login cookie, build and server. No AI service, AI subscription or running Codex session is required.

## What it shows

- Website orders: customer/contact/address, items, colours, quantities, totals, order status. The list refreshes every 30 seconds while open.
- Instagram: up to 12 recent posts, likes, comments, views, reach, saves, shares and a transparent engagement-by-reach calculation. Missing metrics display a dash, never a made-up zero.
- Facebook: up to 12 recent posts, reactions, comments and shares. Facebook views/reach are not connected in this version.
- Links to the VOSS accounts and Meta Business Suite inbox. Facebook, Instagram and WhatsApp messages are **not yet synchronized into this app**. Account linking in Meta is still required. No automatic WhatsApp alerts are active.

The dashboard is read-only. It does not publish posts, send messages, change orders or book couriers. Order status fields must be updated by the fulfilment system or an authorized database operator; a courier webhook integration has not been supplied.

## Run locally

1. Install Node.js and run `npm ci` in this directory.
2. Copy `.env.example` to `.env.local`; configure credentials privately.
3. Apply the storefront's `database/schema.sql` to PostgreSQL, followed by this app's `database/owner.sql`.
4. Run `npm run dev`. The business app is at `http://localhost:3001`; the storefront remains on port 3000.
5. `npm test` tests session security, protected endpoints and missing-data calculations. `npm run build` verifies the production build.

On the current development machine only, node_modules is a junction to the storefront's existing installed dependencies because npm downloads timed out. The committed package/lock files are standalone; deployments install their own dependencies with npm ci. `.install-incomplete` is ignored and contains the interrupted dependency download.

## Owner access

The existing local owner key was preserved in `%LOCALAPPDATA%/VOSS/owner-access.txt`; the hash/session secret moved to this app's ignored environment. They were removed from the storefront environment. The old URL in that private file should now be read as `http://localhost:3001`.

For a new deployment, configure `VOSS_OWNER_KEY_HASH` (SHA-256 of a random, high-entropy owner key) and `VOSS_OWNER_SESSION_SECRET` (at least 64 random characters) privately. Sessions last eight hours, cookies are HttpOnly/SameSite Strict and Secure in production, and sign-in attempts are throttled in PostgreSQL. Rotating the secret signs out all sessions.

Deploy as a **separate project/server** with root directory `voss-business`, its own hostname and `BUSINESS_ORIGIN`. Do not add a reverse proxy under voss.pk/admin. Bypass CDN caching for the whole private app. No production business server has been provisioned yet.

Use a restricted server database role with SELECT on orders/order items and SELECT/UPDATE on the owner login throttle row; configure appropriate RLS policies for that role. Never expose database credentials or Meta tokens to the browser. Local PGlite is for development only; production requires managed PostgreSQL. Do not run two local PGlite apps against the same directory at once; use managed PostgreSQL for simultaneous website/business testing.

## Meta connection still needed

Create the Meta developer app using Facebook Login for the Facebook Page and its linked Instagram professional account. Configure the Graph API version supported by your app, Page access token, Page ID and Instagram account ID in this server's environment. Verify the Page ID through Meta before activation; the supplied public Page link is Vosspk-61593772016374. Typical read permissions for this flow include pages_show_list, pages_read_engagement, instagram_basic and instagram_manage_insights; request only those needed and complete any Meta review required for your account/access level. Do not mix these with Instagram Login's separate permission family.

This version accepts a server-configured token; it does not yet implement an OAuth onboarding/refresh UI. Tokens and permissions need to remain valid. Metrics are requested from Meta's Graph API with a five-minute cache, not scraped. Per-metric failure stays unavailable. Live account results require verification after authorization.

Implementation references: Meta's [Instagram API collection](https://www.postman.com/meta/instagram/overview), [IG Media SDK](https://github.com/facebook/facebook-python-business-sdk/blob/main/facebook_business/adobjects/igmedia.py) and [Post SDK](https://github.com/facebook/facebook-python-business-sdk/blob/main/facebook_business/adobjects/post.py).
