"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion } from "framer-motion";
import { cn } from "@/lib/cn";

/**
 * Chart palette (validated with the dataviz six checks against #ffffff and
 * #10121f surfaces). Light-mode slot 2 sits below 3:1 contrast and the dark
 * set is in the CVD floor band — both are relieved by always-visible direct
 * labels and the legend values rendered next to every mark.
 */
const chartVars = cn(
  "[--c1:#6c4dff] [--c2:#06b6d4] [--c3:#d97706] [--c4:#16a34a] [--c5:#db2777] [--cother:#64748b]",
  "dark:[--c1:#8874ff] dark:[--c2:#0891b2] dark:[--c3:#d97706] dark:[--c4:#16a34a] dark:[--c5:#ec4899] dark:[--cother:#94a3b8]"
);

export const SERIES_VARS = ["var(--c1)", "var(--c2)", "var(--c3)", "var(--c4)", "var(--c5)"];

export type Datum = { label: string; value: number };

const nfIN = new Intl.NumberFormat("en-IN");

/* ── Horizontal bar list — single series, brand hue ─────────────────── */

export function BarList({ data, prefix = "" }: { data: Datum[]; prefix?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-muted">No data yet — it will appear here in real time.</p>;
  }

  return (
    <div className={cn("flex flex-col gap-3.5", chartVars)}>
      {data.map((d, i) => (
        <div key={d.label} className="group grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 sm:grid-cols-[minmax(0,11rem)_1fr_auto]">
          <span className="truncate text-xs font-medium text-foreground/85" title={d.label}>
            {d.label}
          </span>
          <div className="relative h-5">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-r-[4px] bg-[var(--c1)] transition-[filter] duration-200 group-hover:brightness-110"
              initial={{ width: 0 }}
              animate={{ width: `${(d.value / max) * 100}%` }}
              transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <span className="text-xs font-semibold tabular-nums text-foreground/90">
            {prefix}
            {nfIN.format(d.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Donut — part-to-whole with legend + center readout ─────────────── */

export function Donut({ data, unit = "enrollments" }: { data: Datum[]; unit?: string }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0);

  if (data.length === 0 || total === 0) {
    return <p className="py-10 text-center text-sm text-muted">No data yet — it will appear here in real time.</p>;
  }

  const R = 15.915; // circumference 100 units
  const active = hovered !== null ? data[hovered] : null;
  let offset = 25; // start at 12 o'clock

  return (
    <div className={cn("flex flex-col items-center gap-6 sm:flex-row sm:justify-center", chartVars)}>
      <div className="relative h-44 w-44 shrink-0">
        <svg viewBox="0 0 42 42" className="h-full w-full -rotate-0">
          {data.map((d, i) => {
            const frac = (d.value / total) * 100;
            const seg = (
              <motion.circle
                key={d.label}
                cx="21"
                cy="21"
                r={R}
                fill="none"
                stroke={d.label === "Other" ? "var(--cother)" : SERIES_VARS[i % SERIES_VARS.length]}
                strokeWidth={hovered === i ? 7.5 : 6.5}
                strokeDasharray={`${Math.max(frac - 1.2, 0.4)} ${100 - Math.max(frac - 1.2, 0.4)}`}
                strokeDashoffset={-offset + 100}
                strokeLinecap="butt"
                className="cursor-pointer transition-all duration-200"
                style={{ filter: hovered === i ? "brightness(1.1)" : undefined }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              />
            );
            offset += frac;
            return seg;
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold tabular-nums">{nfIN.format(active ? active.value : total)}</span>
          <span className="max-w-[6.5rem] truncate text-[11px] text-muted">{active ? active.label : `total ${unit}`}</span>
        </div>
      </div>

      <ul className="flex w-full max-w-xs flex-col gap-2">
        {data.map((d, i) => (
          <li
            key={d.label}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className={cn(
              "flex cursor-default items-center gap-2.5 rounded-lg px-2 py-1 text-xs transition-colors",
              hovered === i && "bg-surface-2"
            )}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
              style={{ background: d.label === "Other" ? "var(--cother)" : SERIES_VARS[i % SERIES_VARS.length] }}
            />
            <span className="min-w-0 flex-1 truncate font-medium text-foreground/85">{d.label}</span>
            <span className="font-semibold tabular-nums">{nfIN.format(d.value)}</span>
            <span className="w-10 text-right tabular-nums text-muted">{((d.value / total) * 100).toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Live count-up number (re-animates when the value changes) ──────── */

export function LiveNumber({
  value,
  prefix = "",
  className,
}: {
  value: number;
  prefix?: string;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const controls = animate(prev.current, value, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value]);

  return (
    <span className={className}>
      {prefix}
      {nfIN.format(display)}
    </span>
  );
}
