import type { Fig, Shape } from "@/lib/logiquest/types";

function polygon(n: number, r: number, start = -90) {
  return Array.from({ length: n }, (_, i) => {
    const a = ((start + (360 / n) * i) * Math.PI) / 180;
    return `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
}

function star(r: number) {
  return Array.from({ length: 10 }, (_, i) => {
    const rr = i % 2 ? r * 0.45 : r;
    const a = ((-90 + 36 * i) * Math.PI) / 180;
    return `${(rr * Math.cos(a)).toFixed(2)},${(rr * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
}

function ShapeBody({ s }: { s: Shape }) {
  const r = s.r ?? 18;
  const fill = s.fill ? "currentColor" : "none";
  const common = { fill, stroke: "currentColor", strokeWidth: 3, strokeLinejoin: "round" as const };
  switch (s.k) {
    case "circle": return <circle r={r} {...common} />;
    case "dot": return <circle r={r / 3} fill="currentColor" />;
    case "square": return <rect x={-r} y={-r} width={2 * r} height={2 * r} {...common} />;
    case "diamond": return <polygon points={polygon(4, r * 1.2)} {...common} />;
    case "triangle": return <polygon points={polygon(3, r * 1.15)} {...common} />;
    case "pentagon": return <polygon points={polygon(5, r * 1.1)} {...common} />;
    case "hexagon": return <polygon points={polygon(6, r * 1.1)} {...common} />;
    case "star": return <polygon points={star(r * 1.2)} {...common} />;
    case "semicircle": return <path d={`M ${-r} 0 A ${r} ${r} 0 0 1 ${r} 0 Z`} {...common} />;
    case "plus": return <path d={`M ${-r} 0 H ${r} M 0 ${-r} V ${r}`} stroke="currentColor" strokeWidth={s.fill ? 6 : 3} strokeLinecap="round" />;
    case "line": return <path d={`M 0 ${-r} V ${r}`} stroke="currentColor" strokeWidth={3} strokeLinecap="round" />;
    case "arrow":
      // Points up at rot = 0.
      return <path d={`M 0 ${r} V ${-r} M ${-r * 0.55} ${-r * 0.45} L 0 ${-r} L ${r * 0.55} ${-r * 0.45}`} fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />;
    case "text": {
      const size = r * 1.5;
      if (s.glyphFlip) {
        const chars = [...(s.t ?? "")];
        const w = size * 0.62;
        const x0 = -((chars.length - 1) * w) / 2;
        return (
          <g>
            {chars.map((c, i) => (
              <g key={i} transform={`translate(${x0 + i * w} 0) scale(-1 1)`}>
                <text textAnchor="middle" dominantBaseline="central" fontSize={size} fontFamily="ui-monospace, monospace" fontWeight={700} fill="currentColor">{c}</text>
              </g>
            ))}
          </g>
        );
      }
      return <text textAnchor="middle" dominantBaseline="central" fontSize={size} fontFamily="ui-monospace, monospace" fontWeight={700} fill="currentColor" letterSpacing={size * 0.02}>{s.t}</text>;
    }
  }
}

function ShapeEl({ s }: { s: Shape }) {
  const sx = s.flip === "h" || s.flip === "hv" ? -1 : 1;
  const sy = s.flip === "v" || s.flip === "hv" ? -1 : 1;
  return (
    <g transform={`translate(${s.x ?? 50} ${s.y ?? 50}) rotate(${s.rot ?? 0}) scale(${sx} ${sy})`}>
      <ShapeBody s={s} />
    </g>
  );
}

/** One square figure tile. `null` renders the "?" tile of a series. */
export function FigTile({ fig, label, size = 84 }: { fig: Fig | null; label?: string; size?: number }) {
  return (
    <figure className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 100 100" width={size} height={size} className="rounded-lg border border-border-soft bg-surface text-story-navy dark:text-foreground" role="img" aria-label={label ? `Figure ${label}` : "Figure"}>
        {fig ? fig.map((s, i) => <ShapeEl key={i} s={s} />) : <text x="50" y="52" textAnchor="middle" dominantBaseline="central" fontSize="44" fontWeight={700} fill="currentColor" opacity={0.45}>?</text>}
      </svg>
      {label ? <figcaption className="text-xs font-bold text-muted">{label}</figcaption> : null}
    </figure>
  );
}
