import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyLoginn Astrology-Handwritten Horoscope",
  description: "High-precision Vedic Astrology birth chart generator with traditional handwritten manuscript rendering and authentic readings.",
};

export const viewport: Viewport = {
  themeColor: "#f0e5cc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ta">
      <head>
        {/*
          Tamil typefaces offered by the Jathagam theme panel
          (lib/jathagamTheme.tsx → TAMIL_FONTS). globals.css already imports
          Kavivanar / Baloo Thambi 2 / Noto Sans Tamil / Noto Serif Tamil; the
          rest are loaded here so switching typeface never falls back to a face
          without Tamil glyphs (which renders as tofu boxes, not as Tamil).
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Anek+Tamil:wght@400;500;600;700&family=Arima:wght@400;500;600;700&family=Catamaran:wght@400;500;600;700;800&family=Hind+Madurai:wght@400;500;600;700&family=Meera+Inimai&family=Mukta+Malar:wght@400;500;600;700&family=Pavanam&display=swap"
        />
      </head>
      <body className="antialiased selection:bg-[#b03726]/20 selection:text-[#2b2117]">
        <div className="grain" aria-hidden="true"></div>
        <div className="age" aria-hidden="true"></div>
        {children}
      </body>
    </html>
  );
}