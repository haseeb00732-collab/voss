import type { Metadata, Viewport } from "next";
import { Archivo, Bodoni_Moda } from "next/font/google";
import "./globals.css";

/* A didone against a grotesque — the masthead pairing.
   Bodoni carries the italic because the italic is a voice here (pull
   quotes), not an emphasis. Archivo carries everything under 1.5rem. */
const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const SITE = "https://voss.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Handbags for Women in Pakistan | Cash on Delivery — VOSS",
    template: "%s · VOSS",
  },
  description:
    "Handbags chosen in Lahore. Every price, size and material listed, no DMs for price. Cash on delivery across Pakistan.",
  openGraph: {
    title: "Handbags for Women in Pakistan | Cash on Delivery — VOSS",
    description:
      "Handbags chosen in Lahore. Every price, size and material listed, no DMs for price. Cash on delivery across Pakistan.",
    url: SITE,
    siteName: "VOSS",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Handbags for Women in Pakistan | Cash on Delivery — VOSS",
    description: "Every price on the page. Cash on delivery, Pakistan-wide.",
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
    <html lang="en" className={`${bodoni.variable} ${archivo.variable}`}>
      <body className="antialiased">
        <a
          href="#main"
          className="eyebrow sr-only focus:not-sr-only focus:fixed focus:top-6 focus:left-6 focus:z-100 focus:bg-paper-100 focus:px-6 focus:py-4 focus:text-ink-900"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
