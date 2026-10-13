import "./astrology.css";
import { notFound } from "next/navigation";
import { HIDE_ASTROLOGY } from "@/lib/hiddenSections";
import { createPageMetadata } from "@/lib/seo";
import { AstrologyGuard } from "@/components/astrology/AstrologyGuard";

export const metadata = createPageMetadata({
  title: "Astrology – Jathagam, Porutham & Horoscope",
  description:
    "Vedic astrology by MyLoginn: Kanitha and KP Jathagam, 12 Porutham matching, Rasi horoscope, baby names and numerology.",
  path: "/services/astrology",
  keywords: ["jathagam", "horoscope", "porutham", "horoscope matching", "Tamil astrology", "birth chart"],
});

// The Google Fonts below are the faces the Jathagam manuscript and Tamil UI were designed with.
export default function AstrologyLayout({ children }: { children: React.ReactNode }) {
  if (HIDE_ASTROLOGY) notFound();
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Inter:wght@400;500;600;700;800&family=Kalam:wght@300;400;700&family=Kavivanar&family=Noto+Sans+Tamil:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&display=swap"
      />
      <div className="astro-root">
        {children}
        <AstrologyGuard />
      </div>
    </>
  );
}
