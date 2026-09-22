"use client";

import React from "react";

interface RasiPickerGridProps {
  selected: number | null;
  onSelect: (rasiNumber: number) => void;
  lang: "ta" | "en";
  label?: string;
}

const RASI_LIST = [
  { num: 1, sa: "Mesha", ta: "மேஷம்" },
  { num: 2, sa: "Vrishabha", ta: "ரிஷபம்" },
  { num: 3, sa: "Mithuna", ta: "மிதுனம்" },
  { num: 4, sa: "Karkataka", ta: "கடகம்" },
  { num: 5, sa: "Simha", ta: "சிம்மம்" },
  { num: 6, sa: "Kanya", ta: "கன்னி" },
  { num: 7, sa: "Tula", ta: "துலாம்" },
  { num: 8, sa: "Vrischika", ta: "விருச்சிகம்" },
  { num: 9, sa: "Dhanus", ta: "தனுசு" },
  { num: 10, sa: "Makara", ta: "மகரம்" },
  { num: 11, sa: "Kumbha", ta: "கும்பம்" },
  { num: 12, sa: "Meena", ta: "மீனம்" },
];

export const RasiPickerGrid: React.FC<RasiPickerGridProps> = ({
  selected,
  onSelect,
  lang,
  label,
}) => {
  return (
    <div>
      {label && (
        <div className="text-xs font-semibold text-muted mb-2">
          {label}
        </div>
      )}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {RASI_LIST.map((r) => {
          const isSelected = selected === r.num;
          return (
            <button
              key={r.num}
              type="button"
              onClick={() => onSelect(r.num)}
              className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-2xl border transition-all ${
                isSelected
                  ? "bg-brand-600 border-brand-500 text-white shadow-md scale-[1.03]"
                  : "bg-surface-2 border-border-soft text-foreground hover:border-brand-500 hover:scale-[1.02]"
              }`}
            >
              <span className="text-lg font-bold">{r.ta.charAt(0)}</span>
              <span className="text-[11px] font-semibold text-center leading-tight">
                {lang === "ta" ? r.ta : r.sa}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};