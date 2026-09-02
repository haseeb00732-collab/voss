/**
 * The campaign band, between the hero and the range.
 *
 * It is doing one job: it is the only frame on the site where a bag is being
 * CARRIED. Everything else in the range is a product photograph on a plinth,
 * which tells you what the bag looks like and nothing about what owning one is
 * like. A single lifestyle frame in the middle of a page of product shots is
 * worth more than a page of lifestyle frames, because it stays a punctuation
 * mark rather than becoming the wallpaper.
 *
 * THE BAND IS NOT A BARE IMAGE. A full-bleed photograph dropped onto a dark
 * page reads as a rectangle someone pasted in — the hard top and bottom edges
 * announce that it arrived from somewhere else. Four layers fix that, and all
 * four are inert:
 *
 *   1. HUE WASH under the image, on the same --wash-hue the rest of the page
 *      uses, so the band is lit by the same light as everything around it.
 *   2. COLUMN RULES over it, on the SAME 12-column grid SiteBackdrop draws
 *      behind the content. This is the layer that does the most work: it ties
 *      the photograph to the page's structure instead of letting it float.
 *   3. EDGE FALLOFF — top and bottom gradients in --color-ink-950, so the
 *      image dissolves into the ground rather than cutting against it. The
 *      source is a dusk scene that is already near-black at its edges, which
 *      is why this works here and would not on a bright image.
 *   4. VIGNETTE at the corners, matching the one the product frames use.
 *
 * No copy over it — the wordmark is already in the photograph, and putting a
 * headline on a picture that has its own typography gives you two competing
 * headlines. No motion: §4.4's inventory does not list one here, and an effect
 * not in the inventory does not ship.
 */
export function Campaign() {
  return (
    <section
      aria-label="VOSS campaign"
      data-surface="dark"
      className="relative isolate w-full overflow-hidden"
    >
      {/* 1. The same wash the rest of the page is lit by. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(80% 120% at 50% 50%, var(--wash-hue) 0%, transparent 70%)",
        }}
      />

      <img
        src="/campaign/desert-1584.avif"
        srcSet={
          "/campaign/desert-640.avif 640w, " +
          "/campaign/desert-1024.avif 1024w, " +
          "/campaign/desert-1440.avif 1440w, " +
          "/campaign/desert-1584.avif 1584w"
        }
        sizes="100vw"
        width={1584}
        height={672}
        /* Native is 1584px and the pipeline never upscales, so on a wider
           viewport the band is upscaled by the browser rather than by us.
           object-cover keeps the crop honest instead of letting it stretch. */
        className="block h-auto w-full object-cover"
        alt="A VOSS bag carried at dusk, the wordmark across the landscape behind."
        /* Below the fold on every viewport — it must not compete with the
           hero for LCP. */
        loading="lazy"
        decoding="async"
      />

      {/* 2. The page's own grid, continued across the photograph. Hidden below
             lg for the same reason SiteBackdrop hides it: at phone width the
             layout is one column and the rules would describe a structure
             that is not there. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
        <div className="mx-auto grid h-full max-w-[120rem] grid-cols-12 gap-x-gap-col px-gutter">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="relative">
              <span className="absolute inset-y-0 left-0 w-px bg-[color-mix(in_srgb,var(--color-gold-300)_10%,transparent)]" />
              {i === 11 && (
                <span className="absolute inset-y-0 right-0 w-px bg-[color-mix(in_srgb,var(--color-gold-300)_10%,transparent)]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Edge falloff into the page ground. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[18%]"
        style={{
          background:
            "linear-gradient(to bottom, var(--color-ink-950) 0%, transparent 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[22%]"
        style={{
          background:
            "linear-gradient(to top, var(--color-ink-950) 0%, transparent 100%)",
        }}
      />

      {/* 4. Corner vignette, the same falloff the product frames carry. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 45%, transparent 0%, transparent 52%, var(--color-ink-950) 100%)",
          opacity: 0.7,
        }}
      />
    </section>
  );
}
