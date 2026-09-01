import { notFound } from "next/navigation";
import { TokenGuard } from "@/components/dev/TokenGuard";
import { PALETTE } from "@/lib/tokens";

/**
 * The proof page for the design tokens. Served at /_tokens — the `%5F`
 * folder prefix is Next's documented escape for a URL segment that starts
 * with an underscore, because a bare `_tokens` folder is a private folder
 * and would not be routed at all.
 *
 * Dev only. It is not a page of the site, it is the instrument that says
 * whether the palette in globals.css actually reached the browser.
 */
export const metadata = { robots: { index: false, follow: false } };

export default function TokensPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main data-surface="dark" className="substrate min-h-screen px-gutter py-section">
      <header className="mb-band">
        <p className="eyebrow" style={{ color: "var(--text-accent)" }}>
          Dev only · not part of the site
        </p>
        <h1 className="display-1 mt-tight">Tokens</h1>
        <p className="body-l measure mt-group" style={{ color: "var(--text-secondary)" }}>
          Every colour VOSS-VISUAL-TARGET §1.2–§1.6 names, read back out of the
          live document. A striped swatch is a token that resolved to nothing.
        </p>
      </header>
      <TokenGuard groups={PALETTE} />
    </main>
  );
}
