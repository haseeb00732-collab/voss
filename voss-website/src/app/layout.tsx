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
    default: "VOSS — One hide. One bag. Nothing else.",
    template: "%s · VOSS",
  },
  description:
    "VOSS selects one bag at a time, and selects it slowly. Full-grain leather, made to order. Nothing else.",
  openGraph: {
    title: "VOSS — One hide. One bag. Nothing else.",
    description:
      "VOSS selects one bag at a time, and selects it slowly. Full-grain leather, made to order.",
    url: SITE,
    siteName: "VOSS",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "VOSS — One hide. One bag. Nothing else.",
    description: "Full-grain leather, made to order. One hide at a time.",
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
