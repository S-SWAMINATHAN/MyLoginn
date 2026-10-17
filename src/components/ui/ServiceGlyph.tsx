"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/useReducedMotion";

export type GlyphName = "web" | "mobile" | "ai" | "software" | "marketing";

type Glyph = {
  /** Soft tinted body shapes. */
  fill: string[];
  /** Main outline strokes. */
  stroke: string[];
  /** Small accent strokes drawn in the secondary colour. */
  accent: string[];
  /** Accent dots as [cx, cy, r]. */
  dots: [number, number, number][];
  /** Solid accent-coloured shapes (for example a sparkle). */
  solid?: string[];
  /** Solid shapes in the main colour (for example a robot's visor). */
  solidMain?: string[];
  /** Eyes cut into a solidMain shape, as [cx, cy, r]; they blink. */
  eyes?: [number, number, number][];
};

/** Flat, single-weight line icons on a 32px grid, drawn to share one visual language. */
const GLYPHS: Record<GlyphName, Glyph> = {
  web: {
    fill: ["M5 11.5h22v10a2.5 2.5 0 0 1-2.5 2.5h-17A2.5 2.5 0 0 1 5 21.5z"],
    stroke: [
      "M5 8.5A2.5 2.5 0 0 1 7.5 6h17A2.5 2.5 0 0 1 27 8.5v13a2.5 2.5 0 0 1-2.5 2.5h-17A2.5 2.5 0 0 1 5 21.5z",
      "M5 11.5h22",
      "M12.5 15.5 10 18l2.5 2.5",
      "M19.5 15.5 22 18l-2.5 2.5",
      "M12 27.5h8",
      "M16 24v3.5",
    ],
    accent: ["M17.4 14.8 14.6 21.2"],
    dots: [[8.7, 8.8, 1.1], [11.7, 8.8, 1.1]],
  },
  mobile: {
    fill: ["M10 4h12a2 2 0 0 1 2 2v20a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"],
    stroke: [
      "M10 4h12a2 2 0 0 1 2 2v20a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
      "M13.5 7h5",
      "M12 11.5h8",
      "M12 15.5h5",
    ],
    accent: ["M12 19.5h8v3h-8z"],
    dots: [[16, 25.4, 1]],
  },
  ai: {
    fill: ["M10 10h12a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4v-8a4 4 0 0 1 4-4z"],
    stroke: [
      "M10 10h12a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4v-8a4 4 0 0 1 4-4z",
      "M16 10V6.3",
      "M3.5 15v6",
      "M28.5 15v6",
      "M12 29.5h8",
      "M16 26v3.5",
    ],
    accent: [],
    dots: [[16, 4.6, 1.8]],
    solidMain: ["M11 14.2h10a2.5 2.5 0 0 1 2.5 2.5v1.6a2.5 2.5 0 0 1-2.5 2.5H11a2.5 2.5 0 0 1-2.5-2.5v-1.6A2.5 2.5 0 0 1 11 14.2z"],
    eyes: [[12.9, 17.5, 1.6], [19.1, 17.5, 1.6]],
  },
  software: {
    fill: ["M16 4.5 26 10l-10 5.5L6 10z"],
    stroke: [
      "M16 4.5 26 10v12l-10 5.5L6 22V10z",
      "M6 10l10 5.5L26 10",
      "M16 15.5v12",
    ],
    accent: ["M11 7.7 21 13.2"],
    dots: [],
  },
  marketing: {
    fill: ["M5 13.5v5A1.5 1.5 0 0 0 6.5 20H9l9 5V7l-9 5H6.5A1.5 1.5 0 0 0 5 13.5z"],
    stroke: [
      "M5 13.5v5A1.5 1.5 0 0 0 6.5 20H9l9 5V7l-9 5H6.5A1.5 1.5 0 0 0 5 13.5z",
      "M9 20l1.6 6h3L12.7 22.5",
    ],
    accent: ["M21.5 12.2a5 5 0 0 1 0 7.6", "M24.8 9.4a9 9 0 0 1 0 13.2"],
    dots: [],
  },
};

/**
 * Professional flat line icon for a service. Royal-blue strokes with a cyan accent on a light surface; when `active`
 * the strokes turn white (for a solid-blue circle) and draw themselves on. Plain SVG, no gradients or raster images.
 */
export function ServiceGlyph({ name, active = false, className }: { name: GlyphName; active?: boolean; className?: string }) {
  const reduced = useReducedMotion();
  const g = GLYPHS[name];
  const main = active ? "#ffffff" : "var(--story-royal)";
  const accent = active ? "#9fd8ff" : "var(--story-cyan)";
  const draw = active && !reduced;

  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className={cn("shrink-0", className)} strokeLinecap="round" strokeLinejoin="round">
      {g.fill.map((d, i) => <path key={`f${i}`} d={d} fill={main} fillOpacity={active ? 0.2 : 0.14} stroke="none" />)}
      {g.stroke.map((d, i) => (
        <motion.path
          key={`s${i}-${active}`}
          d={d}
          stroke={main}
          strokeWidth={2}
          initial={draw ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.55, delay: i * 0.05, ease: "easeOut" }}
        />
      ))}
      {g.accent.map((d, i) => (
        <motion.path
          key={`a${i}-${active}`}
          d={d}
          stroke={accent}
          strokeWidth={2}
          initial={draw ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.3 + i * 0.08, ease: "easeOut" }}
        />
      ))}
      {(g.solidMain ?? []).map((d, i) => (
        <motion.path
          key={`m${i}-${active}`}
          d={d}
          fill={main}
          stroke="none"
          initial={draw ? { opacity: 0, scale: 0.6 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          style={{ transformOrigin: "16px 17.5px", transformBox: "view-box" }}
        />
      ))}
      {(g.eyes ?? []).map(([cx, cy, r], i) => (
        <motion.circle
          key={`e${i}-${active}`}
          cx={cx}
          cy={cy}
          r={r}
          fill={active ? "var(--story-royal)" : "#7dd3fc"}
          initial={draw ? { scale: 0 } : false}
          animate={reduced ? { scale: 1 } : { scale: [1, 1, 1, 1, 0.1, 1] }}
          transition={reduced ? undefined : { duration: 4.2, times: [0, 0.5, 0.9, 0.93, 0.96, 1], repeat: Infinity, delay: 0.5 + i * 0.02 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
      ))}
      {(g.solid ?? []).map((d, i) => (
        <motion.path
          key={`p${i}-${active}`}
          d={d}
          fill={accent}
          stroke="none"
          initial={draw ? { scale: 0, opacity: 0, rotate: -45 } : false}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.35 + i * 0.08 }}
          style={{ transformOrigin: "16px 14px", transformBox: "view-box" }}
        />
      ))}
      {g.dots.map(([cx, cy, r], i) => (
        <motion.circle
          key={`d${i}-${active}`}
          cx={cx}
          cy={cy}
          r={r}
          fill={accent}
          initial={draw ? { scale: 0, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 16, delay: 0.35 + i * 0.07 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
      ))}
    </svg>
  );
}
