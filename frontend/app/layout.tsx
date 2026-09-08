import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyLoginn Astrology-Handwritten Horoscope",
  description: "High-precision Vedic Astrology birth chart generator with traditional handwritten manuscript rendering and authentic readings.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#eaf1fb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ta">
      <body className="antialiased selection:bg-[#2454c7]/20 selection:text-[#161b33]">
        <div className="grain" aria-hidden="true"></div>
        <div className="age" aria-hidden="true"></div>
        {children}
      </body>
    </html>
  );
}
