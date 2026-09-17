import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    /**
     * AVIF first. The catalogue is photographic and dark, which is where AVIF
     * beats WebP hardest — and the audience is on mobile data, so the extra
     * encode time at build is paid once and saved on every visit.
     */
    formats: ["image/avif", "image/webp"],

    /**
     * Next 16 changed the default from "any quality" to `[75]`, and coerces
     * any `quality` prop not in this list to the nearest listed value. 75 is
     * kept because nothing in `src/` passes an explicit quality, so every
     * image asks for it — dropping it would silently re-encode the whole
     * catalogue at whatever else was nearest. 86 is here for piece pages,
     * where the reader has chosen to look closely at leather grain.
     */
    qualities: [75, 86],

    /**
     * Trimmed from the defaults. The layout only ever asks for full-bleed,
     * 40vw plate, or a ~22vw rail card, so the wide desktop sizes were being
     * generated and never requested.
     */
    deviceSizes: [390, 640, 768, 1024, 1280, 1600, 1920],
    imageSizes: [128, 256, 384],
  },
};

export default nextConfig;
