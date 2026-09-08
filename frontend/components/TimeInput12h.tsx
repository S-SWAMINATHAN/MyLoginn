"use client";

import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface TimeInput12hProps {
  /** Current value in 24-hour "HH:MM:SS" format, e.g. "07:00:00" */
  value: string;
  /** Called with the new value, still in 24-hour "HH:MM:SS" format */
  onChange: (value24h: string) => void;
  label?: string;
}

function parse24h(value: string) {
  const [hStr, mStr, sStr] = (value || "07:00:00").split(":");
  const h24 = parseInt(hStr, 10) || 0;
  const minute = parseInt(mStr, 10) || 0;
  const second = sStr ?? "00";
  const ampm: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
  let hour12 = h24 % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, minute, second, ampm };
}

function toValue24h(hour12: number, minute: number, second: string, ampm: "AM" | "PM") {
  let h24 = hour12 % 12;
  if (ampm === "PM") h24 += 12;
  const hh = String(h24).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  const ss = (second || "00").padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export const TimeInput12h: React.FC<TimeInput12hProps> = ({ value, onChange }) => {
  const initial = parse24h(value);
  const [hour12, setHour12] = useState(initial.hour12);
  const [minute, setMinute] = useState(initial.minute);
  const [second] = useState(initial.second); // seconds preserved, not user-editable
  const [ampm, setAmpm] = useState<"AM" | "PM">(initial.ampm);

  // Keep in sync if parent resets `value` externally (e.g. loading a saved profile)
  useEffect(() => {
    const p = parse24h(value);
    setHour12(p.hour12);
    setMinute(p.minute);
    setAmpm(p.ampm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function emit(nextHour12: number, nextMinute: number, nextAmpm: "AM" | "PM") {
    onChange(toValue24h(nextHour12, nextMinute, second, nextAmpm));
  }

  const selectClass =
    "bg-[#11162e] border border-[#d4af37]/30 rounded-xl text-white text-sm py-2.5 px-3 focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700] transition-all appearance-none text-center";

  return (
    <div className="relative">
      <div className="flex items-center gap-2 pl-1">
        <Clock className="w-4 h-4 text-[#d4af37]/70 shrink-0" />

        <select
          aria-label="Hour"
          value={hour12}
          onChange={(e) => {
            const h = parseInt(e.target.value, 10);
            setHour12(h);
            emit(h, minute, ampm);
          }}
          className={selectClass}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
            <option key={h} value={h}>
              {String(h).padStart(2, "0")}
            </option>
          ))}
        </select>

        <span className="text-[#d4af37]">:</span>

        <select
          aria-label="Minute"
          value={minute}
          onChange={(e) => {
            const m = parseInt(e.target.value, 10);
            setMinute(m);
            emit(hour12, m, ampm);
          }}
          className={selectClass}
        >
          {Array.from({ length: 60 }, (_, i) => i).map((m) => (
            <option key={m} value={m}>
              {String(m).padStart(2, "0")}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-1.5 ml-1">
          {(["AM", "PM"] as const).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => {
                setAmpm(period);
                emit(hour12, minute, period);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                ampm === period
                  ? "bg-[#1e3a8a] border-[#ffd700] text-[#ffd700]"
                  : "bg-[#11162e] border-[#d4af37]/30 text-white/70 hover:bg-white/5"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};