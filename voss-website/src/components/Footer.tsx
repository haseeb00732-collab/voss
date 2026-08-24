import Link from "next/link";
import { VMark } from "./VMark";

const LINKS = [
  { href: "/collection", label: "Collection" },
  { href: "/#collection", label: "Collection" },
  { href: "/#waitlist", label: "Contact" },
];

/**
 * The footer closes the page in the deepest part of the vitrine.
 *
 * No newsletter form — that is the section immediately above, and repeating
 * it reads as desperation. No social icon row either: one word-link. The mark
 * is nudged down 2% because the V is top-heavy, so geometric centring makes
 * it appear to float above its own space.
 */
export function Footer() {
  return (
    <footer
      data-surface="dark"
      className="substrate vignette relative bg-ink-950 pt-section pb-block"
    >
      <div className="above-material relative mx-auto max-w-[120rem] px-gutter">
        <div className="flex flex-col items-center">
          <VMark className="h-14 w-auto translate-y-[2%]" title="VOSS" />
          <p className="wordmark mt-group text-[0.9375rem] text-paper-100">Voss</p>
        </div>

        <div className="rule-h mt-block w-full" />

        <div className="mt-block flex flex-col gap-group md:flex-row md:items-center md:justify-between">
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-group">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="body-s text-smoke transition-colors duration-[var(--dur-1)] ease-[var(--ease-lux)] hover:text-gold-300"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <a
            href="https://instagram.com"
            rel="noreferrer noopener"
            target="_blank"
            className="body-s text-smoke transition-colors duration-[var(--dur-1)] ease-[var(--ease-lux)] hover:text-gold-300"
          >
            Instagram
          </a>
        </div>

        <p className="caption mt-block text-pewter">&copy; 2026 VOSS. Firenze.</p>
      </div>
    </footer>
  );
}
