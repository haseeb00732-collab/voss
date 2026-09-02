import { SmoothScroll } from "@/components/SmoothScroll";
import { SiteBackdrop } from "@/components/SiteBackdrop";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Campaign } from "@/components/Campaign";
import { TheObject } from "@/components/TheObject";
import { TrustBlock } from "@/components/TrustBlock";
import { OrderBlock } from "@/components/OrderBlock";
import { Range } from "@/components/Range";
import { Marquee } from "@/components/Marquee";
import { Footer } from "@/components/Footer";
import { CATALOGUE, OFFER, pricing } from "@/lib/catalogue";
import { igProfile } from "@/lib/instagram";

/**
 * The homepage, in the order she actually needs it.
 *
 *   hero        what it costs and how to buy it, readable at first paint
 *   bags        the shop; nothing between it and the hero
 *   what it is  the proposition, once, without manufacturing language
 *   before      the COD terms, which is the trust question in this market
 *   questions   the same terms again, in her words
 *
 * `Manifesto` and `TheObject` are gone: the content pack replaces both with
 * one "What it is". `Waitlist` is gone too — there is nothing to wait for, the
 * bags are on sale today and the CTA is a DM.
 *
 * Threshold is still deliberately NOT mounted: it runs ~2.2s of intro before
 * the hero is reachable, in front of the LCP element.
 */

/* Product schema, generated from the catalogue so it cannot drift from the
   prices actually rendered. */
function catalogueLd() {
  const offers = CATALOGUE.map((p) => {
    const price = pricing(p);
    return {
      "@type": "Product",
      name: p.name,
      description: p.note,
      url: `https://voss.com/collection/${p.slug}`,
      offers: {
        "@type": "Offer",
        priceCurrency: "PKR",
        price: String(price.running ? p.price : p.listPrice),
        availability: "https://schema.org/InStock",
        ...(OFFER.endsOn ? { priceValidUntil: OFFER.endsOn } : {}),
      },
    };
  });
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: offers.map((o, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: o,
    })),
  };
}

const orgLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "VOSS",
  description: "Handbags in Lahore. One price, cash on delivery.",
  sameAs: [igProfile()],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogueLd()) }}
      />

      <SiteBackdrop />
      <SmoothScroll />
      <Nav />

      <main id="main">
        <Hero />

        {/* The trust strip, directly under the hero. Three facts that answer
            "is this a scam page" — cash on delivery, in stock, every price on
            the page — placed where she looks after the headline and before
            she has to decide whether to scroll at all. */}
        <Marquee compact />

        <Campaign />

        {/* she came from Instagram to see bags: nothing else goes between */}
        <Range />

        {/* §5.5. Built long ago and never mounted — Phase 0 flagged it as the
            strongest frame on the site sitting in the repo doing nothing. */}
        <TheObject />

        {/* §5.6, merge do not stack: WhatItIs, BeforeYouPay and Faqs inside
            one composed region with one animated ground. */}
        <TrustBlock />

        {/* §5.8. The only place the page asks for the sale outright. */}
        <OrderBlock />
      </main>

      <Footer />
    </>
  );
}
