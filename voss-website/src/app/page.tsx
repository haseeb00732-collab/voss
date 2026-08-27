import { SmoothScroll } from "@/components/SmoothScroll";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Bags } from "@/components/Bags";
import { TheObject } from "@/components/TheObject";
import { Manifesto } from "@/components/Manifesto";
import { Marquee } from "@/components/Marquee";
import { Waitlist } from "@/components/Waitlist";
import { Footer } from "@/components/Footer";

const orgLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "VOSS",
  description: "Leather bags, selected one hide at a time.",
};

/**
 * The page is dark-dominant, top to bottom. CLAUDE.md opens with "the whole
 * site reads as the vitrine", and the earlier paper-substrate middle fought
 * that: the hero read expensive, then the page turned cream for three
 * sections and read like any other shop. Rhythm now comes from tone inside
 * one material (ink-950 / ink-900 / raised) and from the diagonal wipe,
 * not from flipping to paper and back.
 *
 * Each section owns its own `id` and `data-surface`, so the order here is the
 * only thing that sets the rhythm. Marquee carries the light→dark wipe, which
 * is why it sits immediately before the dark close rather than with Manifesto.
 *
 * Threshold is deliberately NOT mounted: it runs ~2.2s of intro before the
 * hero is reachable, against a 900ms brand-moment budget, and it would sit in
 * front of the LCP. It stays built and unwired until it fits the budget.
 */
export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
      />

      <SmoothScroll />
      <Nav />

      <main id="main">
        <Hero />

        {/* she came from Instagram to see bags: nothing goes between */}
        <Bags />
        <TheObject />
        <Manifesto />

        {/* the wipe back down */}
        <Marquee />

        <Waitlist />
      </main>

      <Footer />
    </>
  );
}
