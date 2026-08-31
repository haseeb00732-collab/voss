import { HIDES } from "@/lib/catalogue";

/**
 * DEPRECATED and unmounted. The finish library for the configurator.
 *
 * Honesty rule: only ONE of these is photographed — the one in `piece.shotIn`.
 * The rest have no photograph. So the
 * shot hide gets a ring and the others do not, and the label says which is
 * which. Rendering four identical swatches would imply four photographs we
 * cannot show, which is the same lie as a placeholder price.
 *
 * Presentational only. Selecting a hide belongs on the piece page, where
 * `PieceHero` already floods the background with the chosen leather.
 */
export function HideSwatches({
  shotIn,
  className = "",
  size = "sm",
}: {
  shotIn: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const dot = size === "md" ? "h-3.5 w-3.5" : "h-2.5 w-2.5";

  return (
    <ul className={`flex items-center gap-tight ${className}`} aria-label="Available hides">
      {HIDES.map((h) => {
        const shot = h.id === shotIn;
        return (
          <li key={h.id}>
            <span
              // The ring is the tell: this is the one you are looking at.
              className={`block rounded-full ${dot} ${
                shot ? "ring-1 ring-gold-500 ring-offset-2 ring-offset-transparent" : ""
              }`}
              style={{ backgroundColor: h.leather, boxShadow: "inset 0 0 0 1px rgb(255 255 255 / 0.14)" }}
            />
            <span className="sr-only">
              {h.name}
              {shot ? ", photographed" : ", not photographed"}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
