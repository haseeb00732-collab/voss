import { SmoothScroll } from "@/components/SmoothScroll";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";

const orgLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "VOSS",
  description: "Leather bags, selected one hide at a time.",
};

/**
 * The tonal rhythm, top to bottom: ▓▓ → wipe → ░░░ → wipe → ▓▓▓.
 * The page opens in the vitrine, moves to paper for the story and the
 * product, and returns to the vitrine to close.
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
      </main>

      <Footer />
    </>
  );
}
