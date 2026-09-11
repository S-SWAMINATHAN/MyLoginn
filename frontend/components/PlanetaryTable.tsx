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
    <div className="hand-card p-4 sm:p-6 overflow-hidden">
      <div className="pb-4 mb-4 border-b border-[#a3917a]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-[#2b2117] font-script flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#b03726]" />
            {lang === "ta" ? "கிரகங்களின் நிலைகள் (Planetary Positions)" : "Planetary Positions (Navagraha Nilai)"}
          </h3>
          <p className="text-xs text-[#6f6049] font-script mt-0.5">
            Lahiri Ayanamsha • Swiss Ephemeris JPL DE431/441
          </p>
        </div>
        <span className="text-xs text-[#8e2b1c] font-mono self-start sm:self-auto bg-[#f0e5cc] px-2.5 py-1 rounded-lg border border-[#a3917a]/40">
          9 கிரக நிலைகள்
        </span>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="table-hand w-full text-left text-xs sm:text-sm">
          <thead>
            <tr>
              <th>கிரகம்<i>Planet</i></th>
              <th>ராசி<i>Sign</i></th>
              <th>பாகை<i>Degree</i></th>
              <th className="text-center">பாவம்<i>House</i></th>
              <th>நட்சத்திரம்<i>Star</i></th>
              <th className="text-center">பதம்<i>Pada</i></th>
              <th>நவாம்சம்<i>Navamsa</i></th>
              <th>வேகம்<i>Speed</i></th>
              <th>நிலை<i>Status</i></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#a3917a]/20">
            {planets.map((p, idx) => {
              const isExalted = p.status.includes("Exalted");
              const isOwn = p.status.includes("Own");
              const isDebilitated = p.status.includes("Debilitated");

              return (
                <tr key={idx} className="hover:bg-[#ecdcc2]/40 transition-colors">
                  <td className="py-2.5 px-3.5 font-semibold flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#f0e5cc] border border-[#a3917a] flex items-center justify-center text-xs text-[#b03726] font-tamil font-bold shadow-xs">
                      {p.symbol}
                    </span>
                    <div>
                      <span className="font-tamil font-bold text-[#2b2117] text-sm">
                        {lang === "ta" ? p.name_ta : p.name}
                      </span>
                      <span className="text-[10px] text-[#6f6049] block font-mono">({p.name_sa})</span>
                    </div>
                  </td>

                  <td className="py-2.5 px-3 font-tamil font-medium text-[#2b2117]">
                    <div>
                      <span className="font-semibold">{lang === "ta" ? p.rasi_ta : p.rasi}</span>
                      {p.lord_ta && (
                        <span className="block text-[10px] text-[#6f6049]">
                          ({lang === "ta" ? p.lord_ta : p.lord})
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-2.5 px-3 num-hand text-[#2b2117]">
                    {p.degree_dms || `${Math.floor(p.degree)}° ${Math.floor((p.degree % 1) * 60)}'`}
                  </td>

                  <td className="py-2.5 px-2.5 text-center">
                    <span className="px-2 py-0.5 rounded-md bg-[#f0e5cc] border border-[#a3917a]/50 text-xs font-bold text-[#b03726] num-hand">
                      {p.house}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 font-tamil">
                    <span className="text-[#2b2117] font-semibold">
                      {lang === "ta" ? p.nakshatra_ta : p.nakshatra}
                    </span>
                    {p.nakshatra_lord_ta && (
                      <span className="block text-[10px] text-[#6f6049]">
                        {lang === "ta" ? `அதிபதி: ${p.nakshatra_lord_ta}` : `Lord: ${p.nakshatra_lord}`}
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-2 text-center num-hand font-bold text-[#8e2b1c]">
                    {p.pada}
                  </td>

                  <td className="py-2.5 px-3 font-tamil text-[#2b2117]">
                    <span>{lang === "ta" ? p.navamsa_rasi_ta || "—" : p.navamsa_rasi || "—"}</span>
                    {p.navamsa_lord_ta && (
                      <span className="block text-[10px] text-[#6f6049]">
                        ({lang === "ta" ? p.navamsa_lord_ta : p.navamsa_lord})
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 num-hand text-xs text-[#6f6049]">
                    {p.speed !== undefined && p.speed !== null
                      ? `${p.speed > 0 ? "+" : ""}${p.speed.toFixed(4)}`
                      : "—"}
                  </td>

                  <td className="py-2.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold font-tamil border shadow-xs ${
                        isExalted
                          ? "bg-[#b03726]/15 border-[#b03726]/50 text-[#8e2b1c] font-bold"
                          : isOwn
                          ? "bg-[#e8d7ba] border-[#a3917a] text-[#2b2117] font-bold"
                          : isDebilitated
                          ? "bg-rose-100 border-rose-400 text-rose-800"
                          : "bg-[#f0e5cc] border-[#a3917a]/40 text-[#2b2117]"
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
    </div>
  );
};
