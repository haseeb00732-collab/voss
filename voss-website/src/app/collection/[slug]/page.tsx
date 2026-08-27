import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { PieceHero } from "@/components/PieceHero";
import { CATALOGUE, getPiece, pieceImages, relatedPieces } from "@/lib/catalogue";

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
      <SmoothScroll />
      <Nav />

      <main id="main">
        <PieceHero piece={piece} />

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
                All six &rarr;
              </Link>
            </div>

            <div className="mt-band grid grid-cols-1 gap-x-gap-col gap-y-band sm:grid-cols-3">
              {related.map((r) => {
                const [cover] = pieceImages(r);
                return (
                  <Link
                    key={r.slug}
                    href={`/collection/${r.slug}`}
                    className="group block transition-transform duration-[var(--dur-2)] ease-[var(--ease-lux)] hover:-translate-y-1.5"
                  >
                    <div className="plate aspect-[4/5] transition-shadow duration-[var(--dur-2)] ease-[var(--ease-lux)] group-hover:shadow-[var(--elev-3)]">
                      <Image
                        src={cover}
                        alt={`${r.label}, ${r.silhouette.toLowerCase()}`}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover"
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
