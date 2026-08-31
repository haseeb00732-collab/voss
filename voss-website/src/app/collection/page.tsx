import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { CollectionGrid } from "@/components/CollectionGrid";
import { CATALOGUE } from "@/lib/catalogue";

export const metadata: Metadata = {
  title: "The Collection",
  // No material claim: material is unconfirmed. Do not add it back until it is.
  description:
    "Six handbags, one price. Rs 4,500 today, list Rs 6,000. Cash on delivery.",
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
          {/* The previous headline and standfirst both claimed a hide system
              and a production model that do not exist. What is true is the
              thing that actually sells here: one price, on the page, before
              she has to ask. */}
          <h1 className="display-xl col-span-12 mt-group text-paper-50 md:col-span-9">
            Six bags. <em className="font-normal italic text-gold-300">One price.</em>
          </h1>
          <p className="body-l measure col-span-12 mt-group text-smoke md:col-span-5">
            Rs 6,000 each, Rs 4,500 today. Pick a colour, message us on
            Instagram, and pay the rider when it reaches you.
          </p>
        </header>

        <CollectionGrid pieces={CATALOGUE} />
      </main>

      <Footer />
    </>
  );
}
