import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyLoginn Astrology-Handwritten Horoscope",
  description: "High-precision Vedic Astrology birth chart generator with traditional handwritten manuscript rendering and authentic readings.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#060912" },
  ],
};

/**
 * Runs before first paint: applies the saved (or system) light/dark choice so
 * the page never flashes the wrong theme. Only the site chrome follows it —
 * the handwritten Jathagam always stays on its parchment "desk".
 */
const THEME_INIT = `(function(){try{var t=localStorage.getItem('mla-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ta" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        {/*
          Tamil typefaces offered by the Jathagam theme panel
          (lib/jathagamTheme.tsx → TAMIL_FONTS). globals.css already imports
          Kavivanar / Baloo Thambi 2 / Noto Sans Tamil / Noto Serif Tamil (and
          the new UI's Inter + Outfit); the rest are loaded here so switching
          typeface never falls back to a face without Tamil glyphs (which
          renders as tofu boxes, not as Tamil).
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Anek+Tamil:wght@400;500;600;700&family=Arima:wght@400;500;600;700&family=Catamaran:wght@400;500;600;700;800&family=Hind+Madurai:wght@400;500;600;700&family=Meera+Inimai&family=Mukta+Malar:wght@400;500;600;700&family=Pavanam&family=Tiro+Tamil:ital@0;1&family=Coiny&display=swap"
        />
      </head>
      <body className="antialiased">
        {/* Soft blue aurora behind every page (screen only) */}
        <div className="app-ambient no-print" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
