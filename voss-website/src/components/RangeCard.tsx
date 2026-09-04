import Link from "next/link";
import {
  colourwayImage,
  colourwaySrcSet,
  pricing,
  type Piece,
} from "@/lib/catalogue";

/**
 * One bag in the range, as a wipe card.
 *
 * The two photographs are the SAME bag in two colourways, which is why this
 * mechanic earns its place here rather than being an effect for its own sake:
 * hovering answers "what else does it come in", which is the question the
 * chips underneath were already there to answer. On a shop where every style
 * has four or five colourways, a hover that shows you one of them is doing
 * merchandising work, not decoration.
 *
 * The whole card is the link. §5.3: no button per card — six buttons would be
 * six vermilion elements in one viewport and §1.5c allows one.
 */
export function RangeCard({
  piece,
  ratio,
  className,
  priority,
}: {
  piece: Piece;
  /** CSS aspect-ratio for the frame. The grid is deliberately not uniform. */
  ratio: string;
  /** Grid placement. Lives with the row, not with the bag. */
  className: string;
  priority?: boolean;
}) {
  const [front, back] = piece.colourways;
  const { now, was } = pricing(piece);

  return (
    <article className={className}>
      <Link
        href={`/collection/${piece.slug}`}
        className="wipe-card group block"
        aria-label={`${piece.name}, ${piece.silhouette.toLowerCase()}`}
      >
        <div className="wipe-media" style={{ aspectRatio: ratio }}>
          <img
            className="wipe-front"
            src={colourwayImage(piece, front)}
            srcSet={colourwaySrcSet(piece, front)}
            sizes="(min-width: 768px) 45vw, 45vw"
            alt={`The ${piece.name} in ${front.name}, ${piece.silhouette.toLowerCase()}`}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
          />
          {back && (
            <img
              className="wipe-back"
              src={colourwayImage(piece, back)}
              srcSet={colourwaySrcSet(piece, back)}
              sizes="(min-width: 768px) 45vw, 45vw"
              /* The alt is empty and it is aria-hidden on purpose: this is the
                 same product, and a screen reader announcing a second image
                 would imply a second bag. The colour it reveals is named in
                 the meta row below, which is text. */
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          )}
        </div>

        {/* Name left, price right — the way a price tag reads. */}
        <div className="mt-item flex flex-wrap items-baseline justify-between gap-x-group gap-y-tight">
          <span className="display-s text-[var(--text-primary)]">
            {piece.name}
          </span>
          {now !== null && (
            <span className="display-s text-[var(--text-signal)]">{now}</span>
          )}
        </div>

        <div className="mt-tight flex flex-wrap items-center gap-x-group gap-y-tight">
          <span className="mono text-[var(--text-tertiary)]">
            {piece.silhouette}
          </span>
          {was !== null && (
            <span className="mono text-[var(--color-pewter)] line-through">
              {was}
            </span>
          )}
          <span className="mono text-[var(--color-pewter)]">
            {piece.colourways.length} colours
          </span>
        </div>
      </Link>
    </article>
  );
}
