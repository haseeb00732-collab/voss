import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { CollectionGrid } from "@/components/CollectionGrid";
import { CATALOGUE } from "@/lib/catalogue";

export const metadata: Metadata = {
  title: "The Collection",
  description:
    "Six bags. Every price, size and material on the page.",
};

/**
 * The catalogue, calm and uniform.
 *
 * The homepage is where this site performs; this page is where it sells, and
 * those want opposite things. A masonry collage here would make comparing two
 * bags harder, which is the only job the page has. One ratio, one column
 * width, nothing overlapping.
 */
export default function CollectionPage() {
  return (
    <>
      <SmoothScroll />
      <Nav />

      <main id="main" data-surface="dark" className="substrate min-h-screen pt-[8.5rem]">
        <header className="mx-auto grid max-w-[120rem] grid-cols-12 gap-x-gap-col px-gutter pb-band">
          <p className="eyebrow col-span-12 text-gold-500">The Collection</p>
          <h1 className="display-xl col-span-12 mt-group text-paper-50 md:col-span-9">
            Six pieces. <em className="font-normal italic text-gold-300">Four hides.</em>
          </h1>
          <p className="body-l measure col-span-12 mt-group text-smoke md:col-span-5">
            Every piece is cut to order. Choose the silhouette first. The hide is the
            easy part, and we will talk you through it.
          </p>
        </header>

        <CollectionGrid pieces={CATALOGUE} />
      </main>

      <Footer />
    </>
  );
}
