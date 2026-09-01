# VOSS

Six photographed handbag styles sold direct in Pakistan. Every price is on the
page, orders go through Instagram [@voss.pk](https://instagram.com/voss.pk),
payment is cash on delivery.

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · GSAP +
ScrollTrigger · Lenis.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

## Three things to know before editing

- `src/lib/catalogue.ts` is the **only** product source. A reshoot or a rename
  is an edit here and nowhere else.
- `src/app/globals.css` holds every colour, duration and spacing value. No
  hard-coded hex belongs outside it.
- Rename a bag and you must re-run `scripts/subset-fonts.py`, or the new Urdu
  letter silently falls back to a device font.

## Design authority

`../VOSS-VISUAL-TARGET.md`, plus `CLAUDE.md` here for the engineering traps.
Mobile at 390×844 is the primary surface.
