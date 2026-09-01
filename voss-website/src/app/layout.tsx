import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, IBM_Plex_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Grain } from "@/components/Grain";
import "./globals.css";

/* A didone against a grotesque, plus Nastaliq for Urdu.

   Bodoni carries the italic because the italic is a voice here (pull quotes),
   not an emphasis. Jost carries everything under 1.5rem — it replaced Archivo
   on 2026-08-31.

   Jost and Nastaliq are LOCAL, subset by `scripts/subset-fonts.py`. Bodoni
   comes through next/font/google, which downloads and self-hosts at build
   time — there is no runtime request to the Google Fonts CDN from any of the
   three. */
const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

/* §2.1. The mono is doing real work: it is the cheapest way to make a page
   read as considered rather than decorated, and it gives the eye a third
   texture so the page is not "serif headline + sans body" like every
   template. Micro-labels only — price meta, IN STOCK, COD, specs, indices.

   preload:false because it never sets the LCP element. Preloading three
   families makes them compete for the same early bandwidth as the hero, and
   an 11px label swapping in a frame later is imperceptible. */
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  preload: false,
});

const jost = localFont({
  src: "./fonts/Jost-subset.woff2",
  variable: "--font-jost",
  display: "swap",
  weight: "100 900", // variable axis retained; three weights are used
});

/* Subset to exactly the glyphs in the six Urdu names. Change a name in
   `catalogue.ts` and you must re-run `scripts/subset-fonts.py`, or the new
   letter silently renders in a device font. */
const nastaliq = localFont({
  src: "./fonts/NotoNastaliqUrdu-subset.woff2",
  variable: "--font-nastaliq",
  display: "swap",
  weight: "400",
  /* §2: Urdu sets the product name and nothing else, so it must never be in
     the critical path. preload:false keeps it out of the LCP race — the file
     is only fetched once an element actually using `.urdu` renders. */
  preload: false,
});

const SITE = "https://voss.com";

/* Content pack §6. Tier-2 keyword first, brand last — the brand name never
   opens a title, because "VOSS" collides with an established .com in the same
   category and branded search cannot be relied on to recover a lost visitor.

   The og:title is deliberately not the page title: this card is seen far more
   often than any Google snippet, because traffic arrives from Instagram and
   gets forwarded on WhatsApp. It leads with the number. */
const TITLE = "Handbags for Women in Pakistan — Rs 4,500, Cash on Delivery | VOSS";
const DESCRIPTION =
  "Six handbags, launch price Rs 4,500 (list Rs 6,000), cash on delivery. " +
  "Price on the page — no DM required. Lahore-based.";
// TODO [nationwide / confirmed cities] — delivery reach is unconfirmed, so the
// description stops at "Lahore-based" rather than claiming a shipping radius.
const OG_TITLE = "Rs 4,500 instead of Rs 6,000 — cash on delivery.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: TITLE, template: "%s · VOSS" },
  description: DESCRIPTION,
  openGraph: {
    title: OG_TITLE,
    description: DESCRIPTION,
    url: SITE,
    siteName: "VOSS",
    type: "website",
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: "Six bags, one price. Cash when it lands in your hands.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  width: "device-width",
  initialScale: 1,
  // Never disable zoom.
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bodoni.variable} ${jost.variable} ${nastaliq.variable} ${plexMono.variable}`}
    >
      <body className="antialiased">
        <a
          href="#main"
          className="eyebrow sr-only focus:not-sr-only focus:fixed focus:top-6 focus:left-6 focus:z-100 focus:bg-paper-100 focus:px-6 focus:py-4 focus:text-ink-900"
        >
          Skip to content
        </a>
        {children}
        {/* §1.8: one grain, above everything, so it covers the photographs
            too. Last in the body so it needs no z-index gymnastics. */}
        <Grain />
      </body>
    </html>
  );
}
