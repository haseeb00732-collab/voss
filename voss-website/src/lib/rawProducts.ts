/**
 * Placeholder catalogue built from the raw phone photos in `public/products/`.
 *
 * These are the actual pieces being sold, shot on a phone rather than graded
 * — unlike everything in `media.ts`, which is why they are served from
 * `/public` instead of statically imported. Names, prices and descriptions
 * are unset until the real copy exists; the page renders no price row rather
 * than inventing a number.
 */
export type RawProduct = {
  slug: string;
  label: string;
  imageCount: number;
};

export const RAW_PRODUCTS: RawProduct[] = [
  { slug: "01", label: "Style 01", imageCount: 6 },
  { slug: "02", label: "Style 02", imageCount: 6 },
  { slug: "03", label: "Style 03", imageCount: 8 },
  { slug: "04", label: "Style 04", imageCount: 6 },
  { slug: "05", label: "Style 05", imageCount: 4 },
  { slug: "06", label: "Style 06", imageCount: 5 },
];

export function rawProductImages(slug: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => `/products-graded/${slug}/${i + 1}.avif`);
}

export function getRawProduct(slug: string): RawProduct | undefined {
  return RAW_PRODUCTS.find((p) => p.slug === slug);
}
