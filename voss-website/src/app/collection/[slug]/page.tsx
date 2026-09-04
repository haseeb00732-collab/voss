import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { PieceHero } from "@/components/PieceHero";
import { PieceGallery } from "@/components/PieceGallery";
import { SiteBackdrop } from "@/components/SiteBackdrop";
import {
  CATALOGUE,
  getPiece,
  hdImage,
  hdSrcSet,
  relatedPieces,
  styleCountWord,
} from "@/lib/catalogue";

export function generateStaticParams() {
  return CATALOGUE.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const piece = getPiece(slug);
  if (!piece) return { title: "The Collection" };
  return {
    title: piece.name ?? piece.label,
    description: piece.note,
  };
}

export default async function PiecePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const piece = getPiece(slug);
  if (!piece) notFound();

  const related = relatedPieces(piece.slug);

  return (
    <>
      <SiteBackdrop />
      <SmoothScroll />
      <Nav />

      <main id="main">
        <PieceHero piece={piece} />

        <PieceGallery piece={piece} />

        {/* Related pieces, immediately below the hero — the brief was explicit
            that this is what follows, not specs. Someone who has decided
            against this bag has not decided against the house. */}
        <section data-surface="dark" className="substrate py-section" aria-label="Related pieces">
          <div className="mx-auto max-w-[120rem] px-gutter">
            <div className="flex items-baseline justify-between gap-group">
              <p className="eyebrow text-gold-500">Also in the house</p>
              <Link
                href="/collection"
                className="eyebrow text-smoke transition-colors duration-[var(--dur-1)] hover:text-gold-300"
              >
                All {styleCountWord} &rarr;
              </Link>
            </div>

            <div className="mt-band grid grid-cols-1 gap-x-gap-col gap-y-band sm:grid-cols-3">
              {related.map((r) => {
                const cover = hdImage(r, 1);
                return (
                  <Link
                    key={r.slug}
                    href={`/collection/${r.slug}`}
                    className="group block transition-transform duration-[var(--dur-2)] ease-[var(--ease-lux)] hover:-translate-y-1.5"
                  >
                    <div className="plate relative aspect-[4/5] w-full transition-shadow duration-[var(--dur-2)] ease-[var(--ease-lux)] group-hover:shadow-[var(--elev-3)]">
                      <img
                        src={cover}
                        srcSet={hdSrcSet(r, 1)}
                        sizes="(max-width: 640px) 92vw, 31vw"
                        alt={`The ${r.name}, ${r.silhouette.toLowerCase()}`}
                        width={1792}
                        height={2400}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                    <div className="mt-item flex items-baseline justify-between gap-group">
                      <p className="body-base text-paper-100">{r.name ?? r.label}</p>
                      <p className="numeral text-gold-500">{r.silhouette}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
