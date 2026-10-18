"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/useReducedMotion";

type Glyph = { fill?: string[]; stroke: string[]; accent?: string[]; dots?: [number, number, number][] };

/** Flat duotone line icons on a 32px grid, one per LogiQuest section, drawn to share a single visual language. */
const GLYPHS: Record<string, Glyph> = {
  // calculator
  aptitude: {
    fill: ["M10 4h12a3 3 0 0 1 3 3v18a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z"],
    stroke: ["M10 4h12a3 3 0 0 1 3 3v18a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z", "M11.5 8.5h9v4.5h-9z"],
    dots: [[12, 18, 1.2], [16, 18, 1.2], [20, 18, 1.2], [12, 23, 1.2], [16, 23, 1.2], [20, 23, 1.2]],
  },
  // speech bubble
  verbal: {
    fill: ["M6 7h20a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H15l-6 5v-5H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"],
    stroke: ["M6 7h20a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H15l-6 5v-5H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"],
    accent: ["M9.5 12.5h13", "M9.5 17h7.5"],
  },
  // light bulb
  reasoning: {
    fill: ["M16 4a8 8 0 0 0-4.6 14.5c.9.7 1.6 1.7 1.6 2.8V23h6v-1.7c0-1.1.7-2.1 1.6-2.8A8 8 0 0 0 16 4z"],
    stroke: ["M16 4a8 8 0 0 0-4.6 14.5c.9.7 1.6 1.7 1.6 2.8V23h6v-1.7c0-1.1.7-2.1 1.6-2.8A8 8 0 0 0 16 4z", "M13 26.5h6", "M14.4 29.2h3.2"],
    accent: ["M13.2 13.6 16 16.4l2.8-2.8", "M16 16.4V21"],
  },
  // code brackets
  programming: {
    fill: ["M4 7a2 2 0 0 1 2-2h20a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"],
    stroke: ["M4 7a2 2 0 0 1 2-2h20a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z", "M13 12.5 9.5 16l3.5 3.5", "M19 12.5l3.5 3.5-3.5 3.5"],
    accent: ["M17.4 11.5 14.6 20.5"],
  },
  // chip
  technical: {
    fill: ["M10 8h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z"],
    stroke: ["M10 8h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z", "M13 8V4", "M19 8V4", "M13 28v-4", "M19 28v-4", "M8 13H4", "M8 19H4", "M28 13h-4", "M28 19h-4"],
    accent: ["M13 13h6v6h-6z"],
  },
  // two people
  interview: {
    fill: ["M3.5 26c0-4.1 3.4-7 7.5-7s7.5 2.9 7.5 7z"],
    stroke: ["M11 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "M3.5 26c0-4.1 3.4-7 7.5-7s7.5 2.9 7.5 7"],
    accent: ["M22 11.6a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6z", "M22 19.2c3.7 0 6.5 2.2 6.5 6.3"],
  },
  // globe
  gk: {
    fill: ["M16 4a12 12 0 1 0 0 24 12 12 0 0 0 0-24z"],
    stroke: ["M16 4a12 12 0 1 0 0 24 12 12 0 0 0 0-24z", "M4 16h24"],
    accent: ["M16 4c3.3 3.4 5 7.4 5 12s-1.7 8.6-5 12c-3.3-3.4-5-7.4-5-12s1.7-8.6 5-12z"],
  },
  // gear
  engineering: {
    fill: ["M16 8a8 8 0 1 0 0 16 8 8 0 0 0 0-16z"],
    stroke: ["M16 8a8 8 0 1 0 0 16 8 8 0 0 0 0-16z", "M16 3.5V7", "M16 25v3.5", "M3.5 16H7", "M25 16h3.5", "M7.2 7.2l2.5 2.5", "M22.3 22.3l2.5 2.5", "M24.8 7.2l-2.5 2.5", "M9.7 22.3l-2.5 2.5"],
    accent: ["M16 12.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"],
  },
  // heart with pulse
  medical: {
    fill: ["M16 27S5 20.2 5 12.6A6.2 6.2 0 0 1 16 8.9a6.2 6.2 0 0 1 11 3.7C27 20.2 16 27 16 27z"],
    stroke: ["M16 27S5 20.2 5 12.6A6.2 6.2 0 0 1 16 8.9a6.2 6.2 0 0 1 11 3.7C27 20.2 16 27 16 27z"],
    accent: ["M8.5 16.5H12l2-4 3.2 8 2.3-4h4"],
  },
  // blocks
  puzzles: {
    fill: ["M5 5h9v9H5z", "M5 18h9v9H5z", "M18 5h9v9h-9z"],
    stroke: ["M5 5h9v9H5z", "M5 18h9v9H5z", "M18 5h9v9h-9z"],
    accent: ["M22.5 18v9", "M18 22.5h9"],
  },
};

/**
 * Section icon. `solid` renders white strokes for use on a filled colour tile; otherwise the strokes use the section
 * colour. Strokes draw themselves on whenever `replay` changes (for example on hover) and once on mount if `animate`.
 */
export function SectionGlyph({ name, color, solid = false, replay = 0, animate = false, className }: { name: string; color: string; solid?: boolean; replay?: number; animate?: boolean; className?: string }) {
  const reduced = useReducedMotion();
  const g = GLYPHS[name] ?? GLYPHS.puzzles;
  const main = solid ? "#ffffff" : color;
  const accent = solid ? "rgba(255,255,255,0.72)" : `color-mix(in srgb, ${color} 55%, #ffffff)`;
  const draw = !reduced && (replay > 0 || animate);

  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className={cn("shrink-0", className)} strokeLinecap="round" strokeLinejoin="round">
      {(g.fill ?? []).map((d, i) => <path key={`f${i}`} d={d} fill={main} fillOpacity={solid ? 0.18 : 0.12} stroke="none" />)}
      {g.stroke.map((d, i) => (
        <motion.path key={`s${i}-${replay}`} d={d} stroke={main} strokeWidth={2} initial={draw ? { pathLength: 0 } : false} animate={{ pathLength: 1 }} transition={{ duration: 0.55, delay: i * 0.04, ease: "easeOut" }} />
      ))}
      {(g.accent ?? []).map((d, i) => (
        <motion.path key={`a${i}-${replay}`} d={d} stroke={accent} strokeWidth={2} initial={draw ? { pathLength: 0 } : false} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.25 + i * 0.07, ease: "easeOut" }} />
      ))}
      {(g.dots ?? []).map(([cx, cy, r], i) => (
        <motion.circle key={`d${i}-${replay}`} cx={cx} cy={cy} r={r} fill={accent} initial={draw ? { scale: 0, opacity: 0 } : false} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 420, damping: 16, delay: 0.3 + i * 0.05 }} style={{ transformOrigin: `${cx}px ${cy}px` }} />
      ))}
    </svg>
  );
}
