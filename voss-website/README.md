# VOSS

Marketing site for VOSS, a small-batch women's leather handbag label. Built as
a scroll-driven 3D experience: a single WebGL bag travels the page as the
reader scrolls, and re-finishes itself live when they pick a model.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
npm run lint
```

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 (design tokens in `src/app/globals.css`) |
| 3D | Three.js via React Three Fiber + drei |
| Animation | GSAP + ScrollTrigger |
| Fonts | Cormorant (display) + Montserrat (UI), self-hosted via `next/font` |

## How the 3D works

The bag is **procedural** — modelled in code from primitives in
`src/components/three/Handbag.tsx` rather than loaded from a `.glb`. That is a
deliberate trade: it means silhouette, leather colour and hardware finish are
all driven by the product data in `src/lib/products.ts`, so adding a colourway
is a data edit, and the page ships with no model or texture downloads at all.

Supporting pieces:

- `three/textures.ts` generates the leather normal + roughness maps in memory
  from tiling value noise. No image assets, no network request.
- `three/Scene.tsx` builds the studio lighting entirely from drei
  `<Lightformer>`s instead of an HDRI, so the "studio" needs no download and
  looks identical regardless of connection.
- One WebGL context is fixed behind the whole document. A canvas per section
  would cost far more and would make the bag pop in and out between them.

### The scroll rig

`src/lib/stage.ts` holds two plain objects: `bagTarget` (the pose the bag
*should* hold) and `bagStage` (where it actually is). `StageCanvas` assigns a
pose per section via ScrollTrigger; the render loop eases `bagStage` toward
`bagTarget` every frame.

Three constraints are load-bearing here, and each cost a real bug during
build — please read before changing:

1. **Pose easing lives in `useFrame`, not in a tween.** GSAP clamps the delta
   of any frame longer than 500ms, so on a weak GPU a one-second tween can take
   tens of seconds to arrive. Frame damping uses the real delta and converges
   at the same rate regardless of frame time.
2. **`refreshPriority` matters.** The Craft section pins, adding ~2400px to the
   document. ScrollTrigger only applies that offset to triggers it measures
   *after* the pin, and `StageCanvas` mounts first — so Craft is
   `refreshPriority: 1` and the stage triggers are `-1`. Without this the bag
   jumps to its exit pose three sections early.
3. **WebGL boots only after the intro curtain lifts** (`voss:ready`). Shader
   compilation and texture generation block the main thread; doing that while
   the intro animates starves GSAP's ticker and visibly stalls it.

Neither stage object lives in React state — scroll motion must never re-render
the tree.

## Accessibility

- `prefers-reduced-motion` is honoured everywhere: the intro is skipped, scroll
  motion is dropped, and every surface renders its final state immediately
  rather than animating faster.
- Content is visible by default; GSAP animates *from* a hidden state only once
  JS runs, so crawlers and no-JS visitors get the whole page.
- Skip link first in tab order, visible focus rings, 44px minimum touch
  targets, labels outside placeholders, inline validation next to the field.
- The intro curtain has a 4s watchdog. It covers the entire page, so it is
  never allowed to get stuck — it always dismisses.

## Before going live

These are the deliberate gaps — everything else is production-ready:

1. **Newsletter has no backend.** `Newsletter.tsx` validates and shows success
   locally; wire the marked spot to your ESP (Klaviyo, Mailchimp) and add spam
   protection.
2. **"Reserve yours" is not commerce.** It anchors to the newsletter. Connect
   Shopify/Stripe for real checkout.
3. **Replace the placeholder copy and address.** Product names, prices, specs,
   testimonials and the Florence address are all invented. Testimonials must be
   real before publishing — attributed quotes from people who did not say them
   are a legal and ethical problem.
4. **Set the real domain** in `metadata.metadataBase` (`src/app/layout.tsx`) and
   add an OG share image.
5. **Nav links** (`#journal`) and all footer links are placeholders.
