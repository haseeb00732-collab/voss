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
 * Full-bleed and ~21:9, so it reads as a held breath between the hero and the
 * grid rather than as another section. No copy over it — the wordmark is
 * already in the photograph, and putting a headline on top of a picture that
 * has its own typography is how you get two competing headlines.
 *
 * The whole band is inert: no link, no motion, no parallax. §4.4's inventory
 * does not list one here, and an effect not in the inventory does not ship.
 */
export function Campaign() {
  return (
    <section
      aria-label="VOSS campaign"
      data-surface="dark"
      className="relative w-full overflow-hidden"
    >
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
    </section>
  );
}
