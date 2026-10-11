import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyLoginn Astrology-Handwritten Horoscope",
  description: "High-precision Vedic Astrology birth chart generator with traditional handwritten manuscript rendering and authentic readings.",
};

export const viewport: Viewport = {
  // phones / tablets: device width, no forced zoom (users can still pinch-zoom),
  // and the page may use the full screen behind an iPhone notch (safe areas are
  // respected in globals.css)
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
          Fonts: globals.css imports Inter / Outfit / Kavivanar / Noto Tamil from
          Google Fonts, and declares the 13 "MLA Tamil" faces of the Tamil-style
          panel (served locally from /public/fonts/tamil). The old Google link for
          Anek / Arima / Catamaran / Hind Madurai / Meera / Mukta / Pavanam /
          Tiro / Coiny was removed with those panel entries.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* one parallel request (was an @import inside globals.css, which made the
            browser wait for the site CSS first); unused Cinzel / Noto Serif Tamil /
            Baloo Thambi 2 removed */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Inter:wght@400;500;600;700;800&family=Kalam:wght@300;400;700&family=Kavivanar&family=Noto+Sans+Tamil:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&display=swap"
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
