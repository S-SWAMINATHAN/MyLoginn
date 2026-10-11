import React from "react";
import Link from "next/link";

interface FooterProps {
  lang: "ta" | "en";
  /** Optional per-page line, e.g. "திருமணப் பொருத்த வழிகாட்டி". */
  note?: string;
}

/** Shared footer for every page. Screen-only (hidden when printing). */
export const Footer: React.FC<FooterProps> = ({ lang, note }) => (
  <footer className="no-print mt-8 border-t border-border-soft bg-surface-2/60">
    <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-10 text-center sm:px-6 lg:px-8">
      <div className="flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-mark-144.png" alt="" width={144} height={144} className="h-8 w-8 object-contain" />
        <span className="font-display text-base font-semibold brand-gradient-text">MyLoginn Astrology</span>
      </div>
      <p className="max-w-2xl text-sm text-muted">
        {note ||
          (lang === "ta"
            ? "துல்லியமான கணித விதிகளுடன் அமைக்கப்பட்ட வேத ஜோதிட தளம்"
            : "A Vedic astrology platform built on deterministic astronomical calculation")}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="chip">Swiss Ephemeris</span>
        <span className="chip">Lahiri Ayanamsha</span>
        <span className="chip">BPHS &amp; Phaladeepika</span>
      </div>
      <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-muted" aria-label="Footer">
        <Link href="/" className="hover:text-brand-fg">{lang === "ta" ? "ஜாதகம்" : "Jathagam"}</Link>
        <Link href="/porutham" className="hover:text-brand-fg">{lang === "ta" ? "பொருத்தம்" : "Matching"}</Link>
        <Link href="/horoscope" className="hover:text-brand-fg">{lang === "ta" ? "ராசி பலன்" : "Horoscope"}</Link>
        <Link href="/muhurtha" className="hover:text-brand-fg">{lang === "ta" ? "முகூர்த்தம்" : "Muhurtha"}</Link>
        <Link href="/baby-names" className="hover:text-brand-fg">{lang === "ta" ? "குழந்தை பெயர்" : "Baby Names"}</Link>
      </nav>
      <p className="text-[11px] text-muted/80">
        {lang === "ta" ? "வழிகாட்டுதலுக்காக மட்டும் · " : "For guidance only · "}© MyLoginn Astrology
      </p>
    </div>
  </footer>
);

export default Footer;
