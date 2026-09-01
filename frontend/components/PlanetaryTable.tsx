"use client";

import React from "react";
import { PlanetPosition } from "@/lib/types";
import { Compass, Sparkles, Activity } from "lucide-react";

interface PlanetaryTableProps {
  planets: PlanetPosition[];
  lang: "ta" | "en";
}

export const PlanetaryTable: React.FC<PlanetaryTableProps> = ({ planets, lang }) => {
  return (
    <div className="w-full overflow-x-auto rounded-3xl border-2 border-[#d4af37]/30 bg-[#160f12]/95 shadow-2xl backdrop-blur-md">
      <div className="p-4 sm:p-5 bg-[#231519] border-b border-[#d4af37]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="text-base sm:text-lg font-bold text-[#ffd700] font-cinzel flex items-center gap-2">
          <Compass className="w-5 h-5 text-[#d4af37]" />
          {lang === "ta" ? "3. நவக்கிரக நிலைகள் (Planetary Positions)" : "3. Navagraha Planetary Positions"}
        </h3>
        <span className="text-xs text-[#e0b87f] font-mono">
          Swiss Ephemeris DE431/441 • Lahiri Ayanamsha
        </span>
      </div>

      <table className="w-full text-left text-xs sm:text-sm">
        <thead className="bg-[#1b1013] text-[#d4af37] uppercase tracking-wider text-[11px] font-semibold border-b border-[#d4af37]/20">
          <tr>
            <th className="py-3.5 px-4">{lang === "ta" ? "கிரகம் (Planet)" : "Planet"}</th>
            <th className="py-3.5 px-3">{lang === "ta" ? "ராசி (Sign)" : "Rasi"}</th>
            <th className="py-3.5 px-3">{lang === "ta" ? "பாகை (Degree)" : "Degree (DMS)"}</th>
            <th className="py-3.5 px-2.5 text-center">{lang === "ta" ? "பாவம்" : "House"}</th>
            <th className="py-3.5 px-3">{lang === "ta" ? "நட்சத்திரம் (Star)" : "Nakshatra"}</th>
            <th className="py-3.5 px-2 text-center">{lang === "ta" ? "பாதம்" : "Pada"}</th>
            <th className="py-3.5 px-3">{lang === "ta" ? "நவாம்சம் (D9)" : "Navamsa"}</th>
            <th className="py-3.5 px-3">{lang === "ta" ? "வேகம் (°/நாள்)" : "Speed (°/d)"}</th>
            <th className="py-3.5 px-4">{lang === "ta" ? "நிலை (Dignity)" : "Status / Dignity"}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-white/90">
          {planets.map((p, idx) => {
            const isExalted = p.status.includes("Exalted");
            const isOwn = p.status.includes("Own");
            const isDebilitated = p.status.includes("Debilitated");
            const isFriendly = p.status.includes("Friendly");
            const isEnemy = p.status.includes("Enemy");
            const isRetro = p.is_retrograde;

            return (
              <tr
                key={idx}
                className={`hover:bg-[#6b1426]/30 transition-colors ${
                  p.name === "Sun" || p.name === "Moon" ? "bg-white/[0.02]" : ""
                }`}
              >
                <td className="py-3 px-4 font-semibold flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#6b1426] border border-[#d4af37]/40 flex items-center justify-center text-[10px] text-[#ffd700] font-tamil font-bold shadow">
                    {p.symbol}
                  </span>
                  <div>
                    <span className="font-tamil font-bold text-white text-sm">
                      {lang === "ta" ? p.name_ta : p.name}
                    </span>
                    <span className="text-[10px] text-white/40 block font-mono">({p.name_sa})</span>
                  </div>
                </td>

                <td className="py-3 px-3 font-tamil font-medium text-[#ffd700]">
                  <div>
                    <span>{lang === "ta" ? p.rasi_ta : p.rasi}</span>
                    {p.lord_ta && (
                      <span className="block text-[10px] text-white/50 font-normal">
                        ({lang === "ta" ? p.lord_ta : p.lord})
                      </span>
                    )}
                  </div>
                </td>

                <td className="py-3 px-3 font-mono text-white/90 font-medium">
                  {p.degree_dms || `${Math.floor(p.degree)}° ${Math.floor((p.degree % 1) * 60)}'`}
                </td>

                <td className="py-3 px-2.5 text-center">
                  <span className="px-2 py-0.5 rounded-md bg-[#25181c] border border-[#d4af37]/30 text-xs font-bold text-[#ffd700] font-mono">
                    {p.house}
                  </span>
                </td>

                <td className="py-3 px-3 font-tamil">
                  <span className="text-white font-medium">
                    {lang === "ta" ? p.nakshatra_ta : p.nakshatra}
                  </span>
                  {p.nakshatra_lord_ta && (
                    <span className="block text-[10px] text-[#e0b87f]/70">
                      {lang === "ta" ? `அதிபதி: ${p.nakshatra_lord_ta}` : `Lord: ${p.nakshatra_lord}`}
                    </span>
                  )}
                </td>

                <td className="py-3 px-2 font-mono text-center font-bold text-[#e0b87f]">
                  {p.pada}
                </td>

                <td className="py-3 px-3 font-tamil text-white/80">
                  <span>{lang === "ta" ? p.navamsa_rasi_ta || "—" : p.navamsa_rasi || "—"}</span>
                  {p.navamsa_lord_ta && (
                    <span className="block text-[10px] text-white/40">
                      ({lang === "ta" ? p.navamsa_lord_ta : p.navamsa_lord})
                    </span>
                  )}
                </td>

                <td className="py-3 px-3 font-mono text-xs text-white/70">
                  {p.speed !== undefined && p.speed !== null
                    ? `${p.speed > 0 ? "+" : ""}${p.speed.toFixed(4)}`
                    : "—"}
                </td>

                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold font-tamil border shadow ${
                      isOwn
                        ? "bg-amber-950/90 border-amber-400 text-amber-300"
                        : isExalted
                        ? "bg-emerald-950/90 border-emerald-400 text-emerald-300"
                        : isDebilitated
                        ? "bg-rose-950/90 border-rose-400 text-rose-300"
                        : isFriendly
                        ? "bg-teal-950/90 border-teal-400 text-teal-300"
                        : isEnemy
                        ? "bg-orange-950/90 border-orange-400 text-orange-300"
                        : isRetro
                        ? "bg-purple-950/90 border-purple-400 text-purple-300"
                        : "bg-white/5 border-white/15 text-white/80"
                    }`}
                  >
                    {lang === "ta" ? p.status_ta || p.status : p.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
