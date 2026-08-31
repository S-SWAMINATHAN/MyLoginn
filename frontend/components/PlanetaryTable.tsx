"use client";

import React from "react";
import { PlanetPosition } from "@/lib/types";
import { Compass, Sparkles } from "lucide-react";

interface PlanetaryTableProps {
  planets: PlanetPosition[];
  lang: "ta" | "en";
}

export const PlanetaryTable: React.FC<PlanetaryTableProps> = ({ planets, lang }) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-[#d4af37]/30 bg-[#160f12]/90 shadow-xl backdrop-blur-md">
      <div className="p-4 bg-[#231519] border-b border-[#d4af37]/20 flex items-center justify-between">
        <h3 className="text-base font-bold text-[#ffd700] font-cinzel flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#d4af37]" />
          {lang === "ta" ? "நவக்கிரக நிலைகள் (Planetary Positions)" : "Navagraha Planetary Positions"}
        </h3>
        <span className="text-xs text-[#e0b87f] font-mono">
          Lahiri Ayanamsha (Chitrapaksha)
        </span>
      </div>

      <table className="w-full text-left text-xs sm:text-sm">
        <thead className="bg-[#1b1013] text-[#d4af37] uppercase tracking-wider text-[11px] font-semibold border-b border-[#d4af37]/20">
          <tr>
            <th className="py-3 px-4">{lang === "ta" ? "கிரகம் (Planet)" : "Planet"}</th>
            <th className="py-3 px-3">{lang === "ta" ? "ராசி (Sign)" : "Rasi (Sign)"}</th>
            <th className="py-3 px-3">{lang === "ta" ? "பாகை (Degree)" : "Degree in Sign"}</th>
            <th className="py-3 px-3">{lang === "ta" ? "பாவம் (House)" : "House"}</th>
            <th className="py-3 px-3">{lang === "ta" ? "நட்சத்திரம் (Star)" : "Nakshatra"}</th>
            <th className="py-3 px-3">{lang === "ta" ? "பாதம் (Pada)" : "Pada"}</th>
            <th className="py-3 px-3">{lang === "ta" ? "நிலை (Status)" : "Dignity / Status"}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-white/90">
          {planets.map((p, idx) => (
            <tr
              key={idx}
              className={`hover:bg-[#6b1426]/20 transition-colors ${
                p.name === "Sun" || p.name === "Moon" ? "bg-white/[0.02]" : ""
              }`}
            >
              <td className="py-3 px-4 font-semibold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#6b1426]/60 border border-[#d4af37]/40 flex items-center justify-center text-[10px] text-[#ffd700] font-tamil">
                  {p.symbol}
                </span>
                <div>
                  <span className="font-tamil font-bold">{lang === "ta" ? p.name_ta : p.name}</span>
                  <span className="text-[10px] text-white/40 block font-mono">({p.name_sa})</span>
                </div>
              </td>

              <td className="py-3 px-3 font-tamil font-medium text-[#ffd700]">
                {lang === "ta" ? p.rasi_ta : p.rasi}
              </td>

              <td className="py-3 px-3 font-mono text-white/80">
                {Math.floor(p.degree)}° {Math.floor((p.degree % 1) * 60)}'
              </td>

              <td className="py-3 px-3">
                <span className="px-2 py-0.5 rounded-md bg-[#25181c] border border-[#d4af37]/30 text-xs font-semibold text-[#ffd700]">
                  {p.house}
                </span>
              </td>

              <td className="py-3 px-3 font-tamil">
                {lang === "ta" ? p.nakshatra_ta : p.nakshatra}
              </td>

              <td className="py-3 px-3 font-mono text-center font-bold text-[#e0b87f]">
                {p.pada}
              </td>

              <td className="py-3 px-3">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                    p.status.includes("Exalted")
                      ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-300"
                      : p.status.includes("Own")
                      ? "bg-amber-950/80 border-amber-500/50 text-amber-300"
                      : p.status.includes("Debilitated")
                      ? "bg-rose-950/80 border-rose-500/50 text-rose-300"
                      : p.is_retrograde
                      ? "bg-purple-950/80 border-purple-500/50 text-purple-300"
                      : "bg-white/5 border-white/10 text-white/70"
                  }`}
                >
                  {p.status}
                  {p.is_retrograde && !p.status.includes("Retrograde") ? " (வக்ரம்)" : ""}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
