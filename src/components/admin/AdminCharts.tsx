"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

function pathFor(values: number[], w: number, h: number, pad = 4) {
  const max = Math.max(1, ...values);
  const stepX = values.length > 1 ? (w - pad * 2) / (values.length - 1) : 0;
  const pts = values.map((v, i) => [pad + i * stepX, h - pad - (v / max) * (h - pad * 2)] as const);
  // Smooth the line with simple midpoint curves.
  const line = pts.reduce((d, [x, y], i) => {
    if (i === 0) return `M ${x} ${y}`;
    const [px, py] = pts[i - 1];
    const cx = (px + x) / 2;
    return `${d} C ${cx} ${py}, ${cx} ${y}, ${x} ${y}`;
  }, "");
  const area = `${line} L ${pts[pts.length - 1]?.[0] ?? pad} ${h} L ${pts[0]?.[0] ?? pad} ${h} Z`;
  return { line, area, pts };
}

/** Tiny trend line for KPI cards. */
export function Sparkline({ values, color = "var(--story-royal)", className }: { values: number[]; color?: string; className?: string }) {
  const w = 96;
  const h = 32;
  const { line, area } = useMemo(() => pathFor(values.length ? values : [0, 0], w, h, 2), [values]);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("h-8 w-24", className)} fill="none" aria-hidden>
      <path d={area} fill={color} fillOpacity="0.1" />
      <motion.path d={line} stroke={color} strokeWidth="1.8" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: EASE }} />
    </svg>
  );
}

/** Interactive area chart: hover or touch to read the value for a day. */
export function AreaChart({ values, labels, color = "var(--story-royal)", format = (n) => String(n), height = 180 }: { values: number[]; labels: string[]; color?: string; format?: (n: number) => string; height?: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const w = 600;
  const { line, area, pts } = useMemo(() => pathFor(values.length ? values : [0, 0], w, height, 8), [values, height]);
  const max = Math.max(1, ...values);
  const active = hover ?? null;

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * w;
    const idx = Math.round(((x - 8) / (w - 16)) * (values.length - 1));
    setHover(Math.max(0, Math.min(values.length - 1, idx)));
  }

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${height}`} className="h-auto w-full touch-none" role="img" aria-label="Trend chart" onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
        {[0.25, 0.5, 0.75].map((g) => <line key={g} x1="0" x2={w} y1={height * g} y2={height * g} stroke="var(--story-line)" strokeDasharray="3 5" />)}
        <path d={area} fill={color} fillOpacity="0.1" />
        <motion.path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: EASE }} />
        {active !== null && pts[active] && (
          <g>
            <line x1={pts[active][0]} x2={pts[active][0]} y1="0" y2={height} stroke={color} strokeOpacity="0.35" />
            <circle cx={pts[active][0]} cy={pts[active][1]} r="5" fill="var(--surface)" stroke={color} strokeWidth="2.5" />
          </g>
        )}
      </svg>
      {active !== null && pts[active] && (
        <div className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg bg-story-navy px-2.5 py-1.5 text-center text-[11px] font-semibold text-white shadow-lg" style={{ left: `${(pts[active][0] / w) * 100}%` }}>
          {format(values[active])}
          <span className="block text-[9px] font-normal opacity-70">{labels[active]}</span>
        </div>
      )}
      <div className="mt-1 flex justify-between text-[10px] text-muted">
        <span>{labels[0]}</span>
        <span>peak {format(max)}</span>
        <span>{labels[labels.length - 1]}</span>
      </div>
    </div>
  );
}

/** Horizontal funnel: each step as a bar sized against the first, with the drop-off from the previous step. */
export function Funnel({ steps }: { steps: { label: string; value: number }[] }) {
  const top = Math.max(1, steps[0]?.value ?? 1);
  return (
    <ol className="space-y-3">
      {steps.map((s, i) => {
        const pct = Math.round((s.value / top) * 100);
        const prev = i > 0 ? steps[i - 1].value : null;
        const kept = prev ? Math.round((s.value / Math.max(1, prev)) * 100) : null;
        return (
          <li key={s.label}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
              <span className="font-semibold">{s.label}</span>
              <span className="tabular-nums text-muted"><span className="font-bold text-foreground">{s.value.toLocaleString("en-IN")}</span>{kept !== null && <span className="ml-2">{kept}% of previous</span>}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-story-mist">
              <motion.div className="h-full rounded-full bg-story-royal" initial={{ width: 0 }} whileInView={{ width: `${Math.max(2, pct)}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.1, ease: EASE }} style={{ opacity: 1 - i * 0.18 }} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Percent-change chip: green up, red down, grey when unknown. */
export function Delta({ value }: { value: number | null }) {
  if (value === null) return <span className="rounded-full bg-story-mist px-2 py-0.5 text-[10px] font-semibold text-muted">new</span>;
  const up = value >= 0;
  return (
    <span className={cn("inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums", up ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600")}>
      {up ? "▲" : "▼"} {Math.abs(value)}%
    </span>
  );
}
