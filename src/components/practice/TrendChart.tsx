"use client";

import { useState } from "react";

/**
 * Weekly score trend, one line per practice area. Validated categorical slots 1-4 (adjacent pairs pass CVD ≥ 9.1);
 * two of them sit below 3:1 on the light surface, so lines carry direct end labels and a table view is included.
 */

const SERIES_LIGHT = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100"];
const SERIES_DARK = ["#3987e5", "#d95926", "#199e70", "#c98500"];

export type TrendSeries = { area: string; label: string; points: (number | null)[] };

const W = 640, H = 240, L = 34, R = 104, T = 14, B = 28;

export function TrendChart({ weeks, series }: { weeks: string[]; series: TrendSeries[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const x = (i: number) => L + (i * (W - L - R)) / Math.max(1, weeks.length - 1);
  const y = (v: number) => T + ((100 - v) * (H - T - B)) / 100;
  const label = (w: string) => new Date(`${w}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

  return (
    <figure className="viz-root">
      <style>{`
        .viz-root { --grid: #e8e7e3; --ink-2: #52514e; --surface: var(--color-surface, #fff); ${SERIES_LIGHT.map((c, i) => `--s${i}: ${c};`).join(" ")} }
        :root[data-theme="dark"] .viz-root { --grid: #34332f; --ink-2: #c3c2b7; ${SERIES_DARK.map((c, i) => `--s${i}: ${c};`).join(" ")} }
      `}</style>
      <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted" aria-label="Legend">
        {series.map((s, i) => <li key={s.area} className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 rounded-full" style={{ background: `var(--s${i})` }} />{s.label}</li>)}
      </ul>
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Weekly practice scores" onMouseLeave={() => setHover(null)}>
          {[0, 25, 50, 75, 100].map((v) => (
            <g key={v}>
              <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="var(--grid)" strokeWidth="1" />
              <text x={L - 8} y={y(v)} textAnchor="end" dominantBaseline="central" fontSize="11" fill="var(--ink-2)">{v}</text>
            </g>
          ))}
          {weeks.map((w, i) => (i % 2 === weeks.length % 2 || i === weeks.length - 1 ? <text key={w} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--ink-2)">{label(w)}</text> : null))}
          {hover !== null ? <line x1={x(hover)} x2={x(hover)} y1={T} y2={H - B} stroke="var(--ink-2)" strokeWidth="1" opacity="0.5" /> : null}
          {series.map((s, si) => {
            // Lines break across weeks with no session rather than inventing values.
            const runs: { i: number; v: number }[][] = [];
            let run: { i: number; v: number }[] = [];
            s.points.forEach((v, i) => { if (v === null) { if (run.length) runs.push(run); run = []; } else run.push({ i, v }); });
            if (run.length) runs.push(run);
            const lastIdx = s.points.reduce<number>((acc, v, i) => (v !== null ? i : acc), -1);
            return (
              <g key={s.area}>
                {runs.map((r, k) => <polyline key={k} points={r.map((p) => `${x(p.i)},${y(p.v)}`).join(" ")} fill="none" stroke={`var(--s${si})`} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />)}
                {s.points.map((v, i) => (v === null ? null : <circle key={i} cx={x(i)} cy={y(v)} r={hover === i ? 5 : 4} fill={`var(--s${si})`} stroke="var(--surface)" strokeWidth="2" />))}
                {lastIdx >= 0 ? <text x={W - R + 10} y={y(s.points[lastIdx]!)} dominantBaseline="central" fontSize="11" fill="var(--ink-2)">{s.label} {s.points[lastIdx]}</text> : null}
              </g>
            );
          })}
          {weeks.map((w, i) => (
            <rect key={w} x={x(i) - (W - L - R) / weeks.length / 2} y={T} width={(W - L - R) / weeks.length} height={H - T - B} fill="transparent" onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} tabIndex={0} aria-label={`Week of ${label(w)}`} />
          ))}
        </svg>
        {hover !== null ? (
          <div className="pointer-events-none absolute top-2 z-10 min-w-36 rounded-xl border border-border-soft bg-surface p-2.5 text-xs shadow-[var(--shadow-soft)]" style={{ left: `clamp(0px, calc(${(x(hover) / W) * 100}% - 4.5rem), calc(100% - 9rem))` }}>
            <p className="font-semibold">Week of {label(weeks[hover])}</p>
            {series.map((s, i) => <p key={s.area} className="mt-1 flex items-center justify-between gap-3"><span className="inline-flex items-center gap-1.5 text-muted"><span className="h-2 w-2 rounded-full" style={{ background: `var(--s${i})` }} />{s.label}</span><span className="font-semibold tabular-nums">{s.points[hover] ?? "—"}</span></p>)}
          </div>
        ) : null}
      </div>
      <details className="mt-2 text-xs">
        <summary className="cursor-pointer text-muted">Show as table</summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr><th className="py-1 pr-3 font-semibold">Week</th>{series.map((s) => <th key={s.area} className="py-1 pr-3 font-semibold">{s.label}</th>)}</tr></thead>
            <tbody>{weeks.map((w, i) => <tr key={w} className="border-t border-border-soft"><td className="py-1 pr-3">{label(w)}</td>{series.map((s) => <td key={s.area} className="py-1 pr-3 tabular-nums">{s.points[i] ?? "—"}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
