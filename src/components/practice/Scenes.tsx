/**
 * Flat illustrations for the image-description and storytelling exercises. Each scene draws exactly what its text in
 * SCENES (speaking/content.ts) describes, because the evaluator scores the learner against that description.
 */

type Fig = {
  x: number; y: number; s?: number; skin?: string; hair?: string; shirt: string; pants?: string;
  /** Arm angles in degrees from straight down (positive = forward/right). */
  la?: number; ra?: number; run?: boolean; sit?: boolean; long?: boolean; grey?: boolean;
};

const SKINS = ["#c68642", "#8d5524", "#e0ac69", "#a0663a"];

function Person({ x, y, s = 1, skin = SKINS[0], hair = "#2b1d14", shirt, pants = "#334155", la = 10, ra = -10, run, sit, long, grey }: Fig) {
  const arm = (side: 1 | -1, deg: number) => {
    const r = (deg * Math.PI) / 180, len = 22;
    const sx = side * 9, sy = -40;
    return <line x1={sx} y1={sy} x2={sx + Math.sin(r) * len * side} y2={sy + Math.cos(r) * len} stroke={skin} strokeWidth="5" strokeLinecap="round" />;
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {sit ? (
        <>
          <line x1="-5" y1="-12" x2="-5" y2="0" stroke={pants} strokeWidth="7" /><line x1="-5" y1="-12" x2="10" y2="-12" stroke={pants} strokeWidth="7" />
          <line x1="5" y1="-12" x2="16" y2="-12" stroke={pants} strokeWidth="7" /><line x1="14" y1="-12" x2="14" y2="2" stroke={pants} strokeWidth="6" />
        </>
      ) : run ? (
        <>
          <line x1="0" y1="-16" x2="-14" y2="2" stroke={pants} strokeWidth="7" strokeLinecap="round" /><line x1="0" y1="-16" x2="12" y2="0" stroke={pants} strokeWidth="7" strokeLinecap="round" />
        </>
      ) : (
        <>
          <line x1="-4" y1="-16" x2="-5" y2="2" stroke={pants} strokeWidth="7" strokeLinecap="round" /><line x1="4" y1="-16" x2="5" y2="2" stroke={pants} strokeWidth="7" strokeLinecap="round" />
        </>
      )}
      <rect x="-11" y={sit ? -44 : -48} width="22" height="34" rx="9" fill={shirt} />
      {arm(-1, la)}{arm(1, ra)}
      <circle cx="0" cy={sit ? -54 : -58} r="10" fill={skin} />
      <path d={long ? "M-11 -58 a11 11 0 0 1 22 0 v12 h-5 v-10 h-12 v10 h-5z" : "M-10 -60 a10 10 0 0 1 20 0 q-10 -6 -20 0z"} transform={sit ? "translate(0 4)" : undefined} fill={grey ? "#cbd5e1" : hair} />
    </g>
  );
}

function OfficeStandup() {
  return (
    <>
      <rect width="480" height="300" fill="#eef2f7" />
      <rect x="24" y="24" width="190" height="130" rx="6" fill="#bfe3ff" stroke="#94a3b8" strokeWidth="4" />
      {[[36, 80, 34, 74], [76, 60, 28, 94], [110, 90, 40, 64], [156, 70, 30, 84], [190, 98, 20, 56]].map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} fill={i % 2 ? "#64748b" : "#7c8ea6"} />)}
      <line x1="119" y1="24" x2="119" y2="154" stroke="#94a3b8" strokeWidth="3" />
      <circle cx="270" cy="44" r="18" fill="#fff" stroke="#334155" strokeWidth="3" /><line x1="270" y1="44" x2="270" y2="31" stroke="#334155" strokeWidth="3" /><line x1="270" y1="44" x2="259" y2="44" stroke="#334155" strokeWidth="3" />
      <rect x="236" y="76" width="140" height="92" rx="4" fill="#fff" stroke="#94a3b8" strokeWidth="3" />
      {[0, 1, 2].map((c) => <line key={c} x1={236 + 46.6 * (c + 1)} y1="80" x2={236 + 46.6 * (c + 1)} y2="164" stroke="#e2e8f0" strokeWidth="2" />)}
      {[[244, 86, "#fde047"], [264, 104, "#fda4af"], [290, 86, "#86efac"], [312, 110, "#fde047"], [336, 88, "#93c5fd"], [352, 120, "#fda4af"], [246, 130, "#93c5fd"], [292, 138, "#fde047"]].map(([x, y, c], i) => <rect key={i} x={x as number} y={y as number} width="16" height="14" fill={c as string} />)}
      <rect x="0" y="236" width="480" height="64" fill="#cbd5e1" />
      <rect x="392" y="176" width="80" height="8" fill="#92400e" /><rect x="398" y="184" width="6" height="56" fill="#92400e" /><rect x="460" y="184" width="6" height="56" fill="#92400e" />
      <rect x="404" y="140" width="44" height="30" rx="3" fill="#1e293b" /><rect x="422" y="170" width="8" height="6" fill="#1e293b" />
      <rect x="452" y="160" width="14" height="16" fill="#b45309" /><path d="M459 160 q-14 -20 -4 -30 q4 14 4 30 q2 -18 12 -26 q-2 18 -12 26" fill="#16a34a" />
      <Person x={226} y={266} shirt="#be185d" long skin={SKINS[2]} ra={-120} la={8} />
      <Person x={160} y={268} shirt="#0f766e" skin={SKINS[1]} la={-60} ra={-10} />
      <rect x="136" y="214" width="9" height="11" rx="2" fill="#fff" stroke="#92400e" strokeWidth="2" />
      <Person x={300} y={270} shirt="#4338ca" skin={SKINS[3]} la={60} ra={-60} />
      <rect x="288" y="222" width="26" height="4" fill="#475569" /><path d="M289 222 l4 -16 h20 l-2 16z" fill="#94a3b8" />
      <Person x={360} y={270} shirt="#ca8a04" long skin={SKINS[0]} la={50} ra={-40} />
      <rect x="346" y="224" width="14" height="18" fill="#fff" stroke="#64748b" strokeWidth="1.5" />
    </>
  );
}

function RailwayPlatform() {
  return (
    <>
      <defs><linearGradient id="eve" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#4c1d95" /><stop offset="1" stopColor="#fb923c" /></linearGradient></defs>
      <rect width="480" height="300" fill="url(#eve)" />
      <rect x="0" y="0" width="480" height="30" fill="#334155" />
      {[60, 180, 300, 420].map((x) => <g key={x}><line x1={x} y1="30" x2={x} y2="40" stroke="#94a3b8" strokeWidth="2" /><circle cx={x} cy="44" r="5" fill="#fef9c3" /></g>)}
      <rect x="196" y="52" width="120" height="34" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="2" />
      <text x="256" y="74" textAnchor="middle" fontFamily="monospace" fontSize="13" fill="#f59e0b">18:45 CHENNAI</text>
      <rect x="0" y="96" width="170" height="150" rx="10" fill="#1d4ed8" /><rect x="0" y="176" width="170" height="16" fill="#facc15" />
      <rect x="18" y="114" width="40" height="30" rx="4" fill="#bae6fd" /><rect x="110" y="114" width="40" height="30" rx="4" fill="#bae6fd" />
      <rect x="66" y="112" width="34" height="98" fill="#0f172a" /><rect x="60" y="112" width="6" height="98" fill="#facc15" /><rect x="100" y="112" width="6" height="98" fill="#facc15" />
      <rect x="0" y="230" width="480" height="70" fill="#9ca3af" /><rect x="0" y="236" width="480" height="6" fill="#facc15" />
      <Person x={150} y={278} shirt="#16a34a" skin={SKINS[1]} run la={-50} ra={60} />
      <rect x="135" y="216" width="14" height="22" rx="4" fill="#7c2d12" />
      <Person x={232} y={280} shirt="#db2777" long skin={SKINS[2]} la={-150} ra={-10} />
      <rect x="216" y="210" width="6" height="10" rx="1" fill="#0f172a" />
      <rect x="244" y="252" width="22" height="28" rx="3" fill="#475569" /><line x1="255" y1="252" x2="255" y2="242" stroke="#475569" strokeWidth="3" />
      <rect x="290" y="250" width="70" height="8" fill="#78350f" /><rect x="294" y="258" width="5" height="22" fill="#78350f" /><rect x="352" y="258" width="5" height="22" fill="#78350f" />
      <Person x={318} y={254} shirt="#64748b" skin={SKINS[3]} grey sit la={60} ra={-60} />
      <rect x="300" y="210" width="34" height="22" fill="#f1f5f9" stroke="#94a3b8" />
      <rect x="380" y="150" width="96" height="100" fill="#b45309" /><path d="M374 150 h108 l-10 -22 h-88z" fill="#dc2626" />
      <text x="428" y="172" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">TEA</text>
      <rect x="396" y="196" width="22" height="20" rx="4" fill="#e5e7eb" /><path d="M402 192 q4 -10 0 -18 M410 192 q4 -10 0 -18" stroke="#fff" strokeWidth="2" fill="none" />
      <Person x={446} y={240} shirt="#f8fafc" skin={SKINS[0]} la={40} ra={-20} />
    </>
  );
}

function ParkMorning() {
  return (
    <>
      <defs><linearGradient id="dawn" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#fdba74" /><stop offset="1" stopColor="#fef3c7" /></linearGradient></defs>
      <rect width="480" height="300" fill="url(#dawn)" />
      <circle cx="380" cy="118" r="30" fill="#f97316" />
      {[[120, 40], [150, 30], [300, 50]].map(([x, y], i) => <path key={i} d={`M${x} ${y} q6 -6 12 0 q6 -6 12 0`} stroke="#334155" strokeWidth="2" fill="none" />)}
      <rect x="0" y="130" width="480" height="170" fill="#4ade80" />
      <path d="M0 290 C120 230, 260 260, 480 170" stroke="#e7d7b1" strokeWidth="26" fill="none" />
      {[[40, 140], [450, 150], [90, 128]].map(([x, y], i) => <g key={i}><rect x={x - 5} y={y - 10} width="10" height="40" fill="#78350f" /><circle cx={x} cy={y - 24} r="26" fill="#15803d" /></g>)}
      <ellipse cx="370" cy="232" rx="62" ry="20" fill="#38bdf8" />
      {[350, 390].map((x) => <g key={x}><ellipse cx={x} cy="230" rx="9" ry="5" fill="#fff" /><circle cx={x + 7} cy="224" r="4" fill="#fff" /><path d={`M${x + 10} 224 l5 1 -5 2z`} fill="#f59e0b" /></g>)}
      <Person x={260} y={250} shirt="#ef4444" skin={SKINS[1]} run la={-60} ra={60} s={0.9} />
      <Person x={110} y={226} shirt="#a855f7" long skin={SKINS[2]} s={0.75} ra={-150} la={10} />
      <line x1="122" y1="152" x2="168" y2="70" stroke="#334155" strokeWidth="1" /><path d="M160 58 l14 10 -8 16 -14 -10z" fill="#dc2626" />
      <Person x={180} y={286} shirt="#0ea5e9" skin={SKINS[0]} ra={-40} la={10} />
      <line x1="196" y1="262" x2="220" y2="276" stroke="#334155" strokeWidth="1.5" />
      <g transform="translate(222 266)"><ellipse cx="10" cy="8" rx="14" ry="7" fill="#92400e" /><circle cx="24" cy="2" r="6" fill="#92400e" /><line x1="0" y1="12" x2="0" y2="20" stroke="#92400e" strokeWidth="3" /><line x1="18" y1="12" x2="18" y2="20" stroke="#92400e" strokeWidth="3" /></g>
      <rect x="22" y="250" width="44" height="6" fill="#0891b2" /><Person x={44} y={252} shirt="#f472b6" long grey skin={SKINS[3]} s={0.7} la={-170} ra={-170} />
      <rect x="62" y="270" width="44" height="6" fill="#7c3aed" /><Person x={84} y={272} shirt="#facc15" long grey skin={SKINS[0]} s={0.7} la={-90} ra={-90} />
      <rect x="300" y="168" width="54" height="6" fill="#78350f" /><rect x="304" y="174" width="4" height="12" fill="#78350f" /><rect x="346" y="174" width="4" height="12" fill="#78350f" />
      <rect x="448" y="250" width="16" height="22" rx="2" fill="#166534" />
    </>
  );
}

function HelpDesk() {
  return (
    <>
      <rect width="480" height="300" fill="#f1f5f9" />
      <rect x="20" y="22" width="150" height="34" rx="6" fill="#1f56d6" /><text x="95" y="44" textAnchor="middle" fontSize="15" fontWeight="700" fill="#fff">May I help you?</text>
      <rect x="196" y="20" width="74" height="40" rx="4" fill="#0f172a" /><text x="233" y="48" textAnchor="middle" fontFamily="monospace" fontSize="22" fill="#22c55e">42</text>
      <rect x="430" y="140" width="34" height="96" rx="4" fill="#e2e8f0" stroke="#94a3b8" /><rect x="434" y="110" width="26" height="34" rx="8" fill="#7dd3fc" />
      <rect x="0" y="236" width="480" height="64" fill="#cbd5e1" />
      <Person x={110} y={196} shirt="#1e3a8a" long skin={SKINS[2]} la={30} ra={-70} />
      <path d="M100 136 a12 12 0 0 1 20 0" stroke="#0f172a" strokeWidth="2.5" fill="none" /><circle cx="121" cy="141" r="3" fill="#0f172a" />
      <rect x="104" y="166" width="8" height="10" rx="1" fill="#fff" stroke="#0f172a" />
      <rect x="40" y="150" width="46" height="34" rx="3" fill="#1e293b" />
      <rect x="20" y="186" width="230" height="56" fill="#a16207" /><rect x="20" y="182" width="230" height="8" fill="#ca8a04" />
      <Person x={208} y={270} shirt="#f97316" skin={SKINS[1]} la={-120} ra={-20} />
      <rect x="182" y="198" width="14" height="18" fill="#fff" stroke="#64748b" transform="rotate(-10 189 207)" />
      <path d="M200 196 q8 -4 16 0" stroke="#7c2d12" strokeWidth="1.5" fill="none" />
      {[[290, "#0d9488", SKINS[0], -100], [346, "#6366f1", SKINS[3], 10], [400, "#e11d48", SKINS[2], 10]].map(([x, c, sk, la], i) => (
        <Person key={i} x={x as number} y={272} shirt={c as string} skin={sk as string} long={i === 1} la={la as number} ra={i === 0 ? -110 : -10} />
      ))}
      <rect x="296" y="212" width="8" height="6" rx="2" fill="#0f172a" />
    </>
  );
}

const SCENE_ART: Record<string, () => React.ReactNode> = {
  "office-standup": OfficeStandup,
  "railway-platform": RailwayPlatform,
  "park-morning": ParkMorning,
  "help-desk": HelpDesk,
};

export function Scene({ id, title, className }: { id: string; title: string; className?: string }) {
  const Art = SCENE_ART[id];
  if (!Art) return null;
  return (
    <svg viewBox="0 0 480 300" role="img" aria-label={title} className={className}>
      <title>{title}</title>
      <Art />
    </svg>
  );
}
