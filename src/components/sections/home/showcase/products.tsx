"use client";

import { useId } from "react";

/** Product finishes: a base colour with lighter and darker tones for shading. */
export const FINISHES = {
  midnight: { name: "Midnight", base: "#2b3445", light: "#5a6577", dark: "#10151e", swatch: "#2b3445" },
  sky: { name: "Sky", base: "#5b8fd9", light: "#a3c4f0", dark: "#27508f", swatch: "#5b8fd9" },
  sand: { name: "Sand", base: "#cdb08a", light: "#efe0c9", dark: "#8f7350", swatch: "#cdb08a" },
} as const;
export type Finish = keyof typeof FINISHES;

/** A soft, two-layer contact shadow and a faint floor reflection, as in a studio product shot. */
function Ground({ id, cx, cy, rx }: { id: string; cx: number; cy: number; rx: number }) {
  return (
    <>
      <defs>
        <filter id={`blur-${id}`} x="-30%" y="-300%" width="160%" height="700%"><feGaussianBlur stdDeviation="4" /></filter>
        <filter id={`blur2-${id}`} x="-30%" y="-300%" width="160%" height="700%"><feGaussianBlur stdDeviation="1.4" /></filter>
      </defs>
      <ellipse cx={cx} cy={cy} rx={rx} ry="8" fill="rgba(11,31,77,0.22)" filter={`url(#blur-${id})`} />
      <ellipse cx={cx} cy={cy - 1} rx={rx * 0.62} ry="3" fill="rgba(11,31,77,0.38)" filter={`url(#blur2-${id})`} />
    </>
  );
}

/** Over-ear wireless headphones: brushed metal yokes, a padded band, glossy shells and stitched cushions. */
export function Headphones({ finish = "midnight", className }: { finish?: Finish; className?: string }) {
  const f = FINISHES[finish];
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 200 190" className={className} aria-hidden>
      <defs>
        <radialGradient id={`cup-${id}`} cx="34%" cy="26%" r="85%">
          <stop offset="0%" stopColor={f.light} />
          <stop offset="45%" stopColor={f.base} />
          <stop offset="100%" stopColor={f.dark} />
        </radialGradient>
        <linearGradient id={`band-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={f.light} />
          <stop offset="40%" stopColor={f.base} />
          <stop offset="100%" stopColor={f.dark} />
        </linearGradient>
        <linearGradient id={`metal-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7d8693" />
          <stop offset="28%" stopColor="#f4f6f8" />
          <stop offset="55%" stopColor="#aeb5bf" />
          <stop offset="100%" stopColor="#6e7783" />
        </linearGradient>
        <radialGradient id={`pad-${id}`} cx="45%" cy="38%" r="75%">
          <stop offset="0%" stopColor="#4a4f59" />
          <stop offset="70%" stopColor="#1d2128" />
          <stop offset="100%" stopColor="#0d0f13" />
        </radialGradient>
        <linearGradient id={`rim-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f4f6f8" />
          <stop offset="50%" stopColor="#8e96a2" />
          <stop offset="100%" stopColor="#d9dde3" />
        </linearGradient>
        <filter id={`soft-${id}`}><feGaussianBlur stdDeviation="1.6" /></filter>
      </defs>
      <Ground id={id} cx={100} cy={177} rx={72} />
      {/* headband: padded underside, then the shell with a soft top light */}
      <path d="M46 114 C42 32, 158 32, 154 114" fill="none" stroke={f.dark} strokeWidth="16" strokeLinecap="round" />
      <path d="M46 114 C42 32, 158 32, 154 114" fill="none" stroke={`url(#band-${id})`} strokeWidth="12" strokeLinecap="round" />
      <path d="M56 78 C70 46, 130 46, 144 78" fill="none" stroke="rgba(255,255,255,0.42)" strokeWidth="2.2" strokeLinecap="round" filter={`url(#soft-${id})`} />
      <path d="M62 70 C80 52, 120 52, 138 70" fill="none" stroke="#0a0d12" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
      {/* brushed metal yokes */}
      {[43, 157].map((x) => <rect key={x} x={x - 6.5} y="96" width="13" height="30" rx="4.5" fill={`url(#metal-${id})`} />)}
      {[43, 157].map((x) => <rect key={`l${x}`} x={x - 4} y="103" width="8" height="1.2" fill="rgba(0,0,0,0.18)" />)}
      {/* ear cups */}
      {[52, 148].map((cx, i) => {
        const dir = i ? -1 : 1;
        return (
          <g key={cx}>
            <ellipse cx={cx + dir * 7} cy="138" rx="19" ry="31" fill={`url(#pad-${id})`} />
            <ellipse cx={cx + dir * 7} cy="138" rx="15.5" ry="27" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="0.8" strokeDasharray="2 2.2" />
            <ellipse cx={cx} cy="136" rx="28" ry="35" fill={`url(#cup-${id})`} />
            <ellipse cx={cx} cy="136" rx="28" ry="35" fill="none" stroke={`url(#rim-${id})`} strokeWidth="1.6" />
            <ellipse cx={cx} cy="136" rx="17" ry="22" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
            <ellipse cx={cx - dir * 7} cy="118" rx="9" ry="14" fill="rgba(255,255,255,0.32)" filter={`url(#soft-${id})`} />
            <path d={`M${cx - 14} 150 Q${cx} 166 ${cx + 14} 150`} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="2" strokeLinecap="round" />
          </g>
        );
      })}
      {/* control and status light */}
      <rect x="168" y="126" width="4" height="14" rx="2" fill={f.dark} />
      <circle cx="147" cy="164" r="1.6" fill="#4ade80" />
    </svg>
  );
}

/** A smartwatch: ridged strap, brushed case with bevel, knurled crown, sapphire glass with a real reflection. */
export function SmartWatch({ finish = "midnight", className }: { finish?: Finish; className?: string }) {
  const f = FINISHES[finish];
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 140 190" className={className} aria-hidden>
      <defs>
        <linearGradient id={`strap-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={f.dark} />
          <stop offset="35%" stopColor={f.base} />
          <stop offset="55%" stopColor={f.light} />
          <stop offset="100%" stopColor={f.dark} />
        </linearGradient>
        <linearGradient id={`case-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbfcfd" />
          <stop offset="30%" stopColor="#b9c0ca" />
          <stop offset="62%" stopColor="#7e8794" />
          <stop offset="100%" stopColor="#c9ced6" />
        </linearGradient>
        <linearGradient id={`glass-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.34)" />
          <stop offset="38%" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="40%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <clipPath id={`screen-${id}`}><rect x="34" y="56" width="72" height="80" rx="19" /></clipPath>
      </defs>
      <Ground id={id} cx={70} cy={181} rx={46} />
      {/* strap with fine ridges */}
      <rect x="44" y="4" width="52" height="66" rx="15" fill={`url(#strap-${id})`} />
      <rect x="44" y="120" width="52" height="58" rx="15" fill={`url(#strap-${id})`} />
      {[12, 19, 26, 33, 40, 47, 54, 61].map((y) => <rect key={y} x="50" y={y} width="40" height="0.9" rx="0.45" fill="rgba(255,255,255,0.12)" />)}
      {[128, 135, 142, 149, 156, 163, 170].map((y) => <rect key={y} x="50" y={y} width="40" height="0.9" rx="0.45" fill="rgba(255,255,255,0.12)" />)}
      <circle cx="70" cy="150" r="2.4" fill={f.dark} /><circle cx="70" cy="159" r="2.4" fill={f.dark} />
      {/* case */}
      <rect x="27" y="49" width="86" height="94" rx="25" fill={`url(#case-${id})`} />
      <rect x="29.5" y="51.5" width="81" height="89" rx="23" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" />
      {/* digital crown, knurled, and side button */}
      <rect x="112" y="76" width="7" height="22" rx="3" fill="#8d96a3" />
      {[79, 82, 85, 88, 91, 94].map((y) => <rect key={y} x="112" y={y} width="7" height="0.8" fill="rgba(0,0,0,0.25)" />)}
      <rect x="112" y="106" width="4" height="12" rx="2" fill="#9aa2ae" />
      {/* display */}
      <rect x="34" y="56" width="72" height="80" rx="19" fill="#03050a" />
      <g clipPath={`url(#screen-${id})`}>
        <text x="70" y="92" textAnchor="middle" fontSize="21" fontWeight="600" fill="#ffffff" fontFamily="system-ui, sans-serif">10:09</text>
        <text x="70" y="106" textAnchor="middle" fontSize="6.5" letterSpacing="0.8" fill="#8b93a1" fontFamily="system-ui, sans-serif">THU 19 OCT</text>
        <circle cx="56" cy="122" r="5.5" fill="none" stroke="#1f3a2a" strokeWidth="2.2" /><circle cx="56" cy="122" r="5.5" fill="none" stroke="#22c55e" strokeWidth="2.2" strokeDasharray="24 11" strokeLinecap="round" transform="rotate(-90 56 122)" />
        <circle cx="70" cy="122" r="5.5" fill="none" stroke="#1d2f4d" strokeWidth="2.2" /><circle cx="70" cy="122" r="5.5" fill="none" stroke="#3b82f6" strokeWidth="2.2" strokeDasharray="20 15" strokeLinecap="round" transform="rotate(-90 70 122)" />
        <circle cx="84" cy="122" r="5.5" fill="none" stroke="#4a1d27" strokeWidth="2.2" /><circle cx="84" cy="122" r="5.5" fill="none" stroke="#f43f5e" strokeWidth="2.2" strokeDasharray="29 6" strokeLinecap="round" transform="rotate(-90 84 122)" />
        <rect x="34" y="56" width="72" height="80" fill={`url(#glass-${id})`} />
      </g>
      <rect x="34" y="56" width="72" height="80" rx="19" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
    </svg>
  );
}

/** A neutral studio backdrop for product shots: a lit wall that falls into a soft floor. */
export const STUDIO = "radial-gradient(120% 90% at 50% 18%, #ffffff 0%, #f3f5f8 52%, #e1e6ed 100%)";

/** A fabric-covered portable speaker: anodised end caps, fine woven grille, rubber foot and a lit control ring. */
export function Speaker({ finish = "midnight", className }: { finish?: Finish; className?: string }) {
  const f = FINISHES[finish];
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 120 190" className={className} aria-hidden>
      <defs>
        <linearGradient id={`spk-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={f.dark} />
          <stop offset="22%" stopColor={f.base} />
          <stop offset="42%" stopColor={f.light} />
          <stop offset="70%" stopColor={f.base} />
          <stop offset="100%" stopColor={f.dark} />
        </linearGradient>
        <linearGradient id={`cap-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6e7783" />
          <stop offset="35%" stopColor="#f2f4f7" />
          <stop offset="65%" stopColor="#a7aeb9" />
          <stop offset="100%" stopColor="#68717d" />
        </linearGradient>
        <pattern id={`mesh-${id}`} width="3.4" height="3.4" patternUnits="userSpaceOnUse">
          <rect width="3.4" height="3.4" fill="rgba(0,0,0,0.05)" />
          <circle cx="1.7" cy="1.7" r="0.75" fill="rgba(0,0,0,0.28)" />
        </pattern>
        <filter id={`soft-${id}`}><feGaussianBlur stdDeviation="2" /></filter>
      </defs>
      <Ground id={id} cx={60} cy={182} rx={42} />
      {/* body */}
      <rect x="24" y="14" width="72" height="162" rx="30" fill={`url(#spk-${id})`} />
      <rect x="24" y="14" width="72" height="162" rx="30" fill={`url(#mesh-${id})`} />
      {/* rubber foot */}
      <rect x="28" y="160" width="64" height="16" rx="8" fill="#0d0f13" />
      <rect x="32" y="162" width="56" height="1.2" rx="0.6" fill="rgba(255,255,255,0.14)" />
      {/* anodised top cap with control ring */}
      <rect x="24" y="14" width="72" height="26" rx="13" fill={`url(#cap-${id})`} />
      <rect x="25" y="15" width="70" height="24" rx="12" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="0.7" />
      <circle cx="42" cy="27" r="3.4" fill="#3b4350" /><path d="M40.4 27h3.2" stroke="#e5e7eb" strokeWidth="0.9" />
      <circle cx="60" cy="27" r="4.2" fill="#2b3340" /><circle cx="60" cy="27" r="1.7" fill="#4ade80" />
      <circle cx="78" cy="27" r="3.4" fill="#3b4350" /><path d="M76.4 27h3.2M78 25.4v3.2" stroke="#e5e7eb" strokeWidth="0.9" />
      {/* light falling down the left edge, and a soft bloom on the fabric */}
      <path d="M33 52 C35 92, 35 126, 33 156" stroke="rgba(255,255,255,0.34)" strokeWidth="4" fill="none" strokeLinecap="round" filter={`url(#soft-${id})`} />
      <rect x="44" y="146" width="32" height="4" rx="2" fill="rgba(255,255,255,0.28)" />
    </svg>
  );
}

export type ProductKind = "headphones" | "watch" | "speaker";

/** A product photo tile: the product on a studio backdrop. */
export function ProductThumb({ kind, finish = "midnight", className = "", fit = "h-[86%]" }: { kind: ProductKind; finish?: Finish; className?: string; fit?: string }) {
  const P = kind === "headphones" ? Headphones : kind === "watch" ? SmartWatch : Speaker;
  return (
    <span className={`grid place-items-center overflow-hidden ${className}`} style={{ background: STUDIO }}>
      <P finish={finish} className={`${fit} w-auto`} />
    </span>
  );
}
