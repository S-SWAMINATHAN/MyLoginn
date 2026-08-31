import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Jathagam Generator | தமிழ் வேத ஜோதிட ஜாதகம்",
  description: "High-precision Vedic Astrology birth chart generator with traditional handwritten manuscript rendering and authentic readings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ta">
      <body className="antialiased selection:bg-[#6b1426] selection:text-[#ffd700]">
        {children}
      </body>
    </html>
  );
}
