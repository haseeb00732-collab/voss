/**
 * Every image on the site goes through this map (§7.4).
 *
 * When real photography arrives you change this file, not thirty components.
 * `grade` is not decorative metadata: the seven-step treatment in §7.1 is
 * already baked into the file by `scripts/grade-media.mjs`, and this records
 * which variant was baked so a replacement inherits the same look.
 *
 * Static imports rather than `/public` URLs, so every image ships its own
 * intrinsic size and a build-time blur placeholder — no layout shift, and
 * nothing pops in white.
 */
import type { StaticImageData } from "next/image";

import objectMacro from "@/media/object-macro.jpg";

export type Ratio = "4:5" | "3:2" | "1:1";

export type Media = {
  src: StaticImageData;
  alt: string;
  ratio: Ratio;
  grade: "paper" | "vitrine";
};

const m = (src: StaticImageData, alt: string, ratio: Ratio, grade: Media["grade"]): Media => ({
  src,
  alt,
  ratio,
  grade,
});

export const MEDIA = {
  object: {
    macro: m(
      objectMacro,
      "The shoulder of a tan bag in close crop, the strap curving away.",
      "3:2",
      "paper"
    ),
  },
} as const;

/** Only three ratios exist on this site. 16:9 reads as video, screen or tech. */
export const RATIO_CLASS: Record<Ratio, string> = {
  "4:5": "aspect-[4/5]",
  "3:2": "aspect-[3/2]",
  "1:1": "aspect-square",
};
