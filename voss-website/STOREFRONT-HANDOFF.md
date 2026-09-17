# VOSS storefront — 16 September 2026

## Generated colour photography — 17 September 2026

`scripts/import-generated-media.mjs` replaced the raw WhatsApp colour photos with the 41 hand-verified generated studio shots from `voss_updated_products/Voss_products` (run: `node scripts/import-generated-media.mjs <path-to-Voss_products>`). A colour's primary shot is `<colour>-1`; hero colours add review angles as `-2`/`-3`/`-4`, which appear in the product-page gallery through `referenceImages`. Studio covers and `public/studio-cutouts/` are unchanged.

Colours without a usable generated shot still show their original phone photo: product-05 nude, product-06 brown/tan/beige-natural/navy, and all of products 07 and 08. **Do not re-run `import-current-media.mjs`** — it would restore the raw photos everywhere. The pre-change files are in `outputs/backup-before-generated-media-2026-09-17/`.

## Studio interaction pass

Latest header pass: navigation now follows the structure reviewed on [Polène](https://eng.polene-paris.com/): a slim, full-width masthead, left-aligned shopping categories, centred VOSS wordmark and right-aligned utilities. VOSS retains its solid black/gold colours. Desktop height transitions from 64px to 52px; phone height is 56px. The inset floating frame and reading-progress line were removed. Header category links open filtered collection views through validated `shape` parameters. A native-dialog search panel searches all eight products by bag, shape or colour, shows prices and handles no matches. Mobile uses menu, centred wordmark, search and bag; Instagram remains accessible through the menu and ordering sections. Header styles live in `src/app/header.css`.

The light surface uses studio grey (`#D9DDDA`). Following explicit owner approval for local background removal, all eight studio covers now use true alpha cutouts with contact shadows. This supersedes the earlier CSS edge feathering. `scripts/remove-studio-backgrounds.py` produces RGBA originals and responsive alpha WebP files in `public/studio-cutouts/`; it preserves opaque product RGB in the PNG masters. Original source photography and the alternate colour reference photos remain unchanged. Review composites and pixel validation are in `outputs/cutout-review/`.

The footer wordmark is gold and approximately 40% smaller on desktop. Desktop products respond gently to pointer movement. Compare buttons let visitors select two bags, review their prices, shapes and colour counts side by side, and continue to either product. Native dialogs support keyboard dismissal and mobile layouts. `scripts/review-floating-studio.mjs` verifies these additions; reports and screenshots are in `outputs/floating-studio-review/`.

The homepage and collection grid include animated entrances, desktop product lift, functional colour previews, and native-dialog quick looks with add-to-bag. Homepage shape filters and full/detail photograph views help visitors explore the edit. The homepage is now four main sections: hero, all eight products, compact interactive detail study with macro crops, and an Instagram colour-story/ordering section. Repeated promotional sections were removed to shorten the page. The original hero media now plays at 1.5x with eager buffering, offscreen/background pause, manual pause/replay and reduced-motion handling. Its headline is “CARRY YOUR OWN STYLE.”

Quick looks and product pages expose an Instagram order panel. It copies the selected product, colour and individual price before opening the configured Instagram conversation. Clipboard denial shows a selectable text fallback; links do not claim to prefill a message. `scripts/review-instagram-order.mjs` checks selected-colour pricing, destinations, clipboard fallback and the shorter phone page. Screenshots are in `outputs/premium-review/`.

Reference review: [Strathberry's collection](https://www.strathberry.com/collections/bestsellers) places prices and add-to-bag actions beside products; [Polène](https://www.polene-paris.com/) separates collection navigation and Instagram discovery. The VOSS implementation uses original copy and its own product photography.

`scripts/review-studio.mjs` covers these interactions at 360, 390, 430, 768 and 1440 pixels; its report and screenshots are in `outputs/studio-review/`.

The current implementation uses the approved black / studio-grey / champagne-gold direction, the Carry Your Own Style headline, all eight updated products, and the existing hero film. The old seven-product collection and flat-price promotion are no longer mounted in the storefront. Their source photography remains on disk.

## Review

Run `npm run dev` and open http://localhost:3000. Screenshots and the browser-check report are in `outputs/site-review/`. The site is built for phone widths first and recomposes for desktop.

Routes: `/`, `/collection`, eight `/collection/[slug]` pages, `/bag`, `/about`, `/help`. Unknown routes have a recovery page. Collection filters, search and sorting work locally; the bag persists in the browser and supports colours, quantity changes and removal.

Orders use the existing VOSS Instagram flow. Copy the selection and send it to the account opened by the second button. The site does not submit orders, reserve inventory or process payments. Each line quotes that product's own current price. Delivery costs are not included in the displayed item total.

## Product source

`src/lib/catalogue.ts` is the runtime source for names, prices, colours and image lookup. Product names are descriptive working names. The eight user-confirmed prices are 3,499 / 3,899 / 3,249 / 3,299 / 4,099 / 4,049 / 3,399 / 3,749 PKR in article order.

The current studio-only image manifest is `src/lib/studio-media.json`. All 39 colours now use studio imagery, with responsive 480px and 960px WebPs and a continuous transparent background. The approved homepage cover colours remain Camel, Magenta, Black, Black, Green, Black, Beige and Cream Brown. Old raw-photo public directories are archived outside the served assets. Do not restore the older `current-media.json` importer workflow. See `STUDIO-MEDIA-HANDOFF.md` for the image pipeline, owner exclusions and category corrections.

The current studio covers are generated imagery; product fidelity and final factual specifications still need the owner's merchandise review. No undocumented rear views, material composition, dimensions, availability claims, ratings or artificial discounts were added.

## Before public launch

- Set `NEXT_PUBLIC_SITE_URL` to the actual HTTPS domain. Canonicals, absolute product structured data and sitemap entries use this value. No unrelated voss.com domain is assumed.
- Confirm `NEXT_PUBLIC_IG_HANDLE` (defaults to the existing `voss.pk` configuration).
- Confirm the delivery area, fees, times, payment methods, exchange terms, product materials, dimensions, included accessories and stock. The help pages currently ask customers to confirm these with VOSS instead of publishing invented terms.
- If online checkout is required, choose and connect the commerce/order backend and payment provider. This build retains the agreed Instagram ordering model.
- Deploy after the owner reviews the storefront and merchandise. This task did not publish the site or change DNS.

## Validation

`npm run build` and TypeScript checks passed. `npm run lint` passed with image-element warnings; the storefront serves pre-generated responsive WebP images. The meaningful browser checks cover all eight prices, every colour image, mobile overflow, quantity persistence, ordering details for differently priced products, removal, filters, sorting, no-result search, keyboard menu dismissal, help/about routes, reduced-motion hero and the 404 route. The report records failures if any are found. The hero film files themselves are unchanged.
