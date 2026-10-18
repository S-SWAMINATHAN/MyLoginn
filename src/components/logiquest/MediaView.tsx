import type { Media } from "@/lib/logiquest/types";
import { FigTile } from "./Figure";

const SERIES = ["var(--lq-s1)", "var(--lq-s2)", "var(--lq-s3)", "var(--lq-s4)", "var(--lq-s5)", "var(--lq-s6)"];
const n = (v: number) => v.toLocaleString("en-IN", { maximumFractionDigits: 2 });

function niceMax(v: number) {
  const p = 10 ** Math.floor(Math.log10(Math.max(v, 1)));
  const m = v / p;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p;
}

function Legend({ names }: { names: string[] }) {
  if (names.length < 2) return null;
  return (
    <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted">
      {names.map((name, i) => (
        <li key={name} className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: SERIES[i % SERIES.length] }} />
          {name}
        </li>
      ))}
    </ul>
  );
}

function Caption({ text }: { text?: string }) {
  return text ? <p className="mb-2 text-center text-sm font-semibold text-story-navy dark:text-foreground">{text}</p> : null;
}

function XYChart({ media }: { media: Extract<Media, { type: "bar" | "line" }> }) {
  const W = 640, H = 300, L = 48, R = 12, T = 22, B = 44;
  const max = niceMax(Math.max(...media.series.flatMap((s) => s.values)) * 1.08);
  const y = (v: number) => T + (H - T - B) * (1 - v / max);
  const band = (W - L - R) / media.labels.length;
  const ticks = Array.from({ length: 5 }, (_, i) => (max / 4) * i);
  const groupW = band * 0.72;
  const barW = Math.max(6, groupW / media.series.length - 2);
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full min-w-[520px] max-w-2xl" role="img" aria-label={media.caption ?? "Chart"}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="var(--border-soft)" />
            <text x={L - 6} y={y(t)} textAnchor="end" dominantBaseline="central" fontSize="11" fill="var(--muted)">{n(t)}</text>
          </g>
        ))}
        {media.unit ? <text x={6} y={12} fontSize="11" fill="var(--muted)">{media.unit}</text> : null}
        {media.labels.map((label, i) => (
          <text key={label} x={L + band * i + band / 2} y={H - B + 18} textAnchor="middle" fontSize="11.5" fill="var(--foreground)">{label}</text>
        ))}
        {media.type === "bar"
          ? media.series.map((s, si) =>
              s.values.map((v, i) => {
                const x = L + band * i + (band - groupW) / 2 + si * (barW + 2);
                const top = y(v);
                const h = y(0) - top;
                return (
                  <g key={`${si}-${i}`}>
                    <title>{`${s.name} · ${media.labels[i]}: ${n(v)}`}</title>
                    <path d={`M ${x} ${y(0)} V ${top + 3} Q ${x} ${top} ${x + 3} ${top} H ${x + barW - 3} Q ${x + barW} ${top} ${x + barW} ${top + 3} V ${y(0)} Z`} fill={SERIES[si % SERIES.length]} />
                    {h > 0 ? <text x={x + barW / 2} y={top - 5} textAnchor="middle" fontSize={media.series.length > 2 ? 9 : 10.5} fill="var(--foreground)">{n(v)}</text> : null}
                  </g>
                );
              })
            )
          : media.series.map((s, si) => {
              const pts = s.values.map((v, i) => [L + band * i + band / 2, y(v)] as const);
              return (
                <g key={s.name}>
                  <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke={SERIES[si % SERIES.length]} strokeWidth={2} strokeLinejoin="round" />
                  {pts.map(([px, py], i) => (
                    <g key={i}>
                      <title>{`${s.name} · ${media.labels[i]}: ${n(s.values[i])}`}</title>
                      <circle cx={px} cy={py} r={4.5} fill={SERIES[si % SERIES.length]} stroke="var(--surface)" strokeWidth={2} />
                      <text x={px} y={py - 10 - si * 0} textAnchor="middle" fontSize="10.5" fill="var(--foreground)">{n(s.values[i])}</text>
                    </g>
                  ))}
                </g>
              );
            })}
        <line x1={L} x2={W - R} y1={y(0)} y2={y(0)} stroke="var(--muted)" />
      </svg>
      <Legend names={media.series.map((s) => s.name)} />
    </div>
  );
}

function Pie({ media }: { media: Extract<Media, { type: "pie" }> }) {
  const total = media.slices.reduce((a, s) => a + s.value, 0);
  const sweeps = media.slices.map((s) => (s.value / total) * 360);
  const starts = sweeps.map((_, i) => -90 + sweeps.slice(0, i).reduce((a, b) => a + b, 0));
  const R = 90, cx = 120, cy = 110;
  const point = (deg: number, r: number) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
      <svg viewBox="0 0 240 220" className="w-56 shrink-0" role="img" aria-label={media.caption ?? "Pie chart"}>
        {media.slices.map((s, i) => {
          const sweep = sweeps[i], angle = starts[i];
          const [x1, y1] = point(angle, R);
          const [x2, y2] = point(angle + sweep, R);
          const [lx, ly] = point(angle + sweep / 2, R * 0.66);
          const d = `M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${sweep > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;
          return (
            <g key={s.label}>
              <title>{`${s.label}: ${n(s.value)}`}</title>
              <path d={d} fill={SERIES[i % SERIES.length]} stroke="var(--surface)" strokeWidth={2} />
              {sweep > 22 ? <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight={700} fill="#fff">{n(s.value)}</text> : null}
            </g>
          );
        })}
      </svg>
      <ul className="grid gap-1.5 text-sm">
        {media.slices.map((s, i) => (
          <li key={s.label} className="flex items-center gap-2">
            <span aria-hidden className="h-3 w-3 shrink-0 rounded-sm" style={{ background: SERIES[i % SERIES.length] }} />
            <span className="flex-1">{s.label}</span>
            <span className="font-semibold tabular-nums">{n(s.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Clock({ h, m }: { h: number; m: number }) {
  const hourA = ((h % 12) + m / 60) * 30 - 90;
  const minA = m * 6 - 90;
  const hand = (deg: number, len: number) => [50 + len * Math.cos((deg * Math.PI) / 180), 50 + len * Math.sin((deg * Math.PI) / 180)];
  const [hx, hy] = hand(hourA, 24);
  const [mx, my] = hand(minA, 36);
  return (
    <svg viewBox="0 0 100 100" className="mx-auto h-36 w-36 text-story-navy dark:text-foreground" role="img" aria-label="Clock face">
      <circle cx="50" cy="50" r="46" fill="var(--surface)" stroke="currentColor" strokeWidth="2.5" />
      {Array.from({ length: 12 }, (_, i) => {
        const [x, y] = hand(i * 30 - 60, 37);
        return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="8" fill="currentColor">{i + 1}</text>;
      })}
      <line x1="50" y1="50" x2={hx} y2={hy} stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="50" y1="50" x2={mx} y2={my} stroke="var(--story-royal)" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="50" cy="50" r="2.5" fill="currentColor" />
    </svg>
  );
}

/** Data and figures attached to a question or a question set. Figure options are rendered by the question itself. */
export function MediaView({ media }: { media: Media }) {
  const box = "my-3 rounded-2xl border border-border-soft bg-surface p-3 sm:p-4";
  switch (media.type) {
    case "table":
      return (
        <div className={box}>
          <Caption text={media.caption} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-max border-collapse text-sm">
              <thead>
                <tr>{media.head.map((h) => <th key={h} className="border border-border-soft bg-story-mist px-3 py-2 text-left font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody>
                {media.rows.map((row, i) => (
                  <tr key={i}>{row.map((c, j) => <td key={j} className={`border border-border-soft px-3 py-1.5 ${typeof c === "number" ? "text-right tabular-nums" : ""}`}>{typeof c === "number" ? n(c) : c}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    case "bar":
    case "line":
      return <div className={box}><Caption text={media.caption} /><XYChart media={media} /></div>;
    case "pie":
      return <div className={box}><Caption text={media.caption} /><Pie media={media} />{media.note ? <p className="mt-2 text-center text-xs text-muted">{media.note}</p> : null}</div>;
    case "figs":
      if (!media.problem.length) return null;
      return (
        <div className={`${box} flex flex-wrap items-end justify-center gap-2`}>
          {media.grid ? (
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${media.grid}, minmax(0, 1fr))` }}>
              {media.problem.map((f, i) => <FigTile key={i} fig={f} size={72} />)}
            </div>
          ) : (
            media.problem.map((f, i) => <FigTile key={i} fig={f} label={media.options ? undefined : String(i + 1)} />)
          )}
        </div>
      );
    case "clock":
      return <div className={box}><Clock h={media.h} m={media.m} /></div>;
  }
}
