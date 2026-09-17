# VOSS studio image update — 17 September 2026

## Current storefront

All eight products and all 39 colours use studio imagery. Runtime image lookup is in `src/lib/studio-media.json`, consumed by `src/lib/catalogue.ts`. There is no raw-photo fallback. The eight existing homepage cover cutouts remain the owner's approved default studio views.

The floral product is named **Floral Embossed Bag** and belongs to **Top handle**. Its existing `/collection/floral-embossed-tote` URL remains valid. **Two Tone Bag Set** belongs to **Totes**. Totes now contains Square Quilted Tote, Croc Panel Tote and Two Tone Bag Set. Prices and colour choices are unchanged.

The owner-rejected black floral reverse angle (`product-02-black-review-three-quarter`) is excluded by `scripts/publish-studio-media.py`. Ten other Poyo angles marked as inferred/needs-review remain outside the storefront manifest. Do not reintroduce these automatically.

## Image work

- Prepared 14 missing colour-primary images and eight additional gallery photographs using the built-in image generator.
- For the two sets, the extra views show the front, the tote alone and the smaller pieces. They replace requests for undocumented rear/opposite views; no unseen bag construction was invented for those angles.
- Repaired three Poyo floral primaries (ivory, mustard and royal blue) whose light surfaces were damaged by the original export script. A further edit removed an incorrectly generated tassel from the black Arc Handle accessory photograph.
- Processed studio backgrounds locally using the owner's explicit approval. Transparent canvases sit on site colour `#D9DDDA`; bags share consistent framing and retain contact shadows. The grey Arc Handle set uses a tighter mask to preserve its pale handles and pebbled texture. Small bright metal regions are protected.
- Served images are responsive 480px and 960px WebPs. Product pages and quick looks display every colour as a studio image; the old 440px raw-reference size cap no longer applies.

The original Poyo exporter used a broad colour-distance replacement that also replaced product highlights. Retrieval of its untouched completed renders was attempted through a read-only API request, but the endpoint returned HTTP 403. No new paid Poyo generation was submitted. Repairs use the supplied Poyo studio renders, not the rejected shop photo.

## Files and repeatability

- `public/studio-colours-v1/`: responsive storefront derivatives.
- `public/studio-cutouts/`: approved homepage covers.
- `outputs/studio-unification/generated/`: newly generated source PNGs.
- `outputs/studio-unification/masters/`: normalized transparent PNG masters.
- `outputs/studio-unification/collection-review.jpg`: all 39 published colours on the site surface.
- `outputs/studio-unification/validation.json`: provenance and image processing report.
- `outputs/studio-unification/asset-check.json`: complete published-asset check.
- `outputs/retired-raw-images-2026-09-17/`: archived old public product-photo directories, no longer served by the website.

Run `scripts/unify-studio-media.py`, then `scripts/publish-studio-media.py`, then `scripts/check-studio-media.py` with Python/Pillow/NumPy. The preparation scripts read the external `voss_updated_products` folder; never overwrite those originals. Review images before publishing a new manifest. Keep generated sources, archives and transparent masters outside public deployment assets.

Do not run the older `import-current-media.mjs` or `import-generated-media.mjs` to restore the retired manifest. Those importers predate the studio-only storefront.

## Validation and status

Production build and TypeScript checks passed. Targeted ESLint has no errors (four existing image-element advisories; responsive derivatives are provided). Browser review confirmed the corrected Totes category, floral name/category, two-image black floral gallery, all six floral colour selectors at 390px, no phone horizontal overflow, and the burgundy tote's continuous desktop background. The asset check validates every published responsive image and transparent canvas edge.

Generated product photography still deserves the owner's normal merchandise review for physical accuracy before public launch. This work did not publish, deploy, commit or push the site.
