import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Jathagam · K. அருணகிரி — Handwritten Horoscope",
  description: "High-precision Vedic Astrology birth chart generator with traditional handwritten manuscript rendering and authentic readings.",
  themeColor: "#f0e5cc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ta">
      <body className="antialiased selection:bg-[#b03726]/20 selection:text-[#2b2117]">
        <div className="grain" aria-hidden="true"></div>
        <div className="age" aria-hidden="true"></div>
        {children}
      </body>
    </html>
  );
}
