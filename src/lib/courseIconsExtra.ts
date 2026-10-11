/**
 * Animated icons for the W3Schools-style free courses (Bootstrap, jQuery, Node.js, TypeScript, AngularJS, ASP.NET,
 * XML, Excel, NumPy, Pandas, DSA, Django, Git, PostgreSQL, MongoDB). Same format as courseIcons.ts: a 64x64 SVG
 * string per key, SMIL animation only, gradient ids namespaced with the caller's prefix `p`.
 */
export type ExtraIconKey =
  | "bootstrap" | "jquery" | "nodejs" | "typescript" | "angularjs" | "aspnet" | "xml" | "excel"
  | "numpy" | "pandas" | "dsa" | "django" | "git" | "postgresql" | "mongodb";

export const EXTRA_GRAD: Record<ExtraIconKey, string> = {
  bootstrap: "linear-gradient(145deg,#1a0b33,#4c2889,#7952b3)",
  jquery: "linear-gradient(145deg,#02142b,#0b4f8a,#0769ad)",
  nodejs: "linear-gradient(145deg,#04140a,#1f5d2a,#5fa04e)",
  typescript: "linear-gradient(145deg,#04152e,#1e4f94,#3178c6)",
  angularjs: "linear-gradient(145deg,#220008,#8a0a24,#dd0031)",
  aspnet: "linear-gradient(145deg,#12083a,#3a1d96,#512bd4)",
  xml: "linear-gradient(145deg,#210d00,#8a3a08,#f26522)",
  excel: "linear-gradient(145deg,#02150b,#0f5132,#217346)",
  numpy: "linear-gradient(145deg,#06122c,#1e3f94,#4d77cf)",
  pandas: "linear-gradient(145deg,#0a0225,#2b0f73,#150458)",
  dsa: "linear-gradient(145deg,#02160f,#0a5c43,#04aa6d)",
  django: "linear-gradient(145deg,#02150d,#0a3d2a,#0c4b33)",
  git: "linear-gradient(145deg,#220a04,#8a2a14,#f05032)",
  postgresql: "linear-gradient(145deg,#04121f,#1d4a73,#336791)",
  mongodb: "linear-gradient(145deg,#031508,#14572a,#47a248)",
};

export const EXTRA_ACCENT: Record<ExtraIconKey, string> = {
  bootstrap: "#a78bfa", jquery: "#38bdf8", nodejs: "#86efac", typescript: "#60a5fa", angularjs: "#fb7185",
  aspnet: "#a78bfa", xml: "#fb923c", excel: "#4ade80", numpy: "#7dd3fc", pandas: "#e70488",
  dsa: "#34d399", django: "#4ade80", git: "#fb923c", postgresql: "#7dd3fc", mongodb: "#4ade80",
};

/** Technology keywords, checked before the generic categories in courseIcons.getKey. */
export function getExtraIconKey(s: string): ExtraIconKey | null {
  if (/bootstrap/.test(s)) return "bootstrap";
  if (/jquery/.test(s)) return "jquery";
  if (/angular/.test(s)) return "angularjs";
  if (/typescript/.test(s)) return "typescript";
  if (/node\.?js/.test(s)) return "nodejs";
  if (/asp\.?net|\basp\b/.test(s)) return "aspnet";
  if (/\bxml\b/.test(s)) return "xml";
  if (/excel|spreadsheet/.test(s)) return "excel";
  if (/numpy/.test(s)) return "numpy";
  if (/pandas/.test(s)) return "pandas";
  if (/\bdsa\b|data\s*structures?/.test(s)) return "dsa";
  if (/django/.test(s)) return "django";
  if (/\bgit\b|github/.test(s)) return "git";
  if (/postgres/.test(s)) return "postgresql";
  if (/mongo/.test(s)) return "mongodb";
  return null;
}

const HEAD = (p: string, c1: string, c2: string) => `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="${p}bg" cx="50%" cy="50%" r="55%"><stop offset="0%" stop-color="${c1}" stop-opacity=".3"/><stop offset="100%" stop-color="${c2}" stop-opacity="0"/></radialGradient>
  <filter id="${p}glow"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<circle cx="32" cy="32" r="30" fill="url(#${p}bg)"><animate attributeName="r" values="28;31;28" dur="4s" repeatCount="indefinite"/></circle>`;

const FLOAT = `<animateTransform attributeName="transform" type="translate" values="0,0;0,-2;0,0" dur="3s" repeatCount="indefinite"/>`;

/** Glossy highlight swept across a rounded tile, clipped to the tile so it never leaks outside the logo. */
const SHINE = (p: string, x: number, y: number, w: number, h: number, r: number) =>
  `<clipPath id="${p}clip"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/></clipPath>
  <g clip-path="url(#${p}clip)"><rect x="-24" y="${y - 4}" width="12" height="${h + 8}" fill="#fff" opacity=".28" transform="skewX(-20)"><animate attributeName="x" values="-24;84" dur="3.6s" repeatCount="indefinite"/></rect>
  <rect x="${x}" y="${y}" width="${w}" height="${h / 2}" fill="#fff" opacity=".08"/></g>`;

function svgBootstrap(p: string) {
  return `${HEAD(p, "#a78bfa", "#4c2889")}
<defs><linearGradient id="${p}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#9461e0"/><stop offset="100%" stop-color="#6a3fb0"/></linearGradient></defs>
<g filter="url(#${p}glow)">${FLOAT}
  <rect x="8" y="8" width="48" height="48" rx="11" fill="url(#${p}g)"/>
  <path d="M24.4 46.5V17.5h12.4c5.6 0 9 2.7 9 7.1 0 3.1-1.8 5.4-4.7 6.2 3.6.7 5.7 3.3 5.7 6.9 0 5-3.8 8.8-10.2 8.8H24.4zm5.4-17.2h6c2.6 0 4.2-1.3 4.2-3.5s-1.6-3.4-4.2-3.4h-6v6.9zm0 12.5h6.7c3 0 4.8-1.6 4.8-4.1s-1.8-4.1-4.8-4.1h-6.7v8.2z" fill="none"/>
  <path d="M21 14h14.3c6.4 0 10.2 3.3 10.2 8.6 0 3.7-2.1 6.5-5.5 7.5 4.2.8 6.8 3.9 6.8 8.2 0 6-4.6 10-12 10H21V14zm6.3 14.4h7.2c3 0 4.8-1.5 4.8-4.1 0-2.6-1.8-4.1-4.8-4.1h-7.2v8.2zm0 15.2h8.1c3.5 0 5.6-1.8 5.6-4.9 0-3-2.1-4.8-5.6-4.8h-8.1v9.7z" fill="#fff" fill-rule="evenodd" transform="translate(0.8 1.2) scale(.93)"/>
  ${SHINE(p, 8, 8, 48, 48, 11)}
</g>
</svg>`;
}

function svgJQuery(p: string) {
  return `${HEAD(p, "#38bdf8", "#0b4f8a")}
<defs>
  <linearGradient id="${p}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1a8fe0"/><stop offset="100%" stop-color="#0a5ca3"/></linearGradient>
  <linearGradient id="${p}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#4db8f5"/><stop offset="100%" stop-color="#1578c4"/></linearGradient>
  <linearGradient id="${p}c" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e6f7ff"/><stop offset="100%" stop-color="#8fd8fa"/></linearGradient>
</defs>
<g filter="url(#${p}glow)">${FLOAT}
  <path d="M9.5 20.5C4 31 7 45 17.5 52c9 5.8 20 5 28.5-1.5C34 55 18 49 14 36c-2.4-7.7.5-13.5 4-17.5-3.6.3-6.7 1.2-8.5 2z" fill="url(#${p}a)"><animate attributeName="opacity" values=".85;1;.85" dur="3s" repeatCount="indefinite"/></path>
  <path d="M17 19.5c-3.7 4.6-5.1 11-2.1 17 3.8 7.5 12.6 11.3 21.4 9.6 8.4-1.6 14-8 15.6-14.6-4.4 6.2-12 9-19.6 6.9-8.2-2.3-10.7-11-8.1-17.9-2.8-.4-5.1-.4-7.2-1z" fill="url(#${p}b)"><animate attributeName="opacity" values="1;.85;1" dur="3s" repeatCount="indefinite"/></path>
  <path d="M26.5 19c-2.4 3.3-2.5 7.7.6 11 3.6 3.8 9.5 4.3 14.2 1.6 3.8-2.2 6.4-6 7.2-10.2-3 3.8-8 5.3-12.4 3.7-4.7-1.7-6.7-6.4-5.5-11.2-1.6.4-3 1.1-4.1 2.1z" fill="url(#${p}c)"/>
</g>
</svg>`;
}

function svgNodeJs(p: string) {
  return `${HEAD(p, "#86efac", "#1f5d2a")}
<defs>
  <linearGradient id="${p}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#9bd964"/><stop offset="100%" stop-color="#3f8b3a"/></linearGradient>
  <linearGradient id="${p}d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2f6b2a"/><stop offset="100%" stop-color="#1d4a1c"/></linearGradient>
</defs>
<g filter="url(#${p}glow)">${FLOAT}
  <path d="M32 4l24 13.8v28.4L32 60 8 46.2V17.8z" fill="url(#${p}g)"/>
  <path d="M32 11l17.9 10.3v21.4L32 53 14.1 42.7V21.3z" fill="url(#${p}d)"/>
  <text x="32" y="39" font-family="Arial,sans-serif" font-size="18" font-weight="800" fill="#fff" text-anchor="middle">JS</text>
  <path d="M32 4l24 13.8v28.4L32 60 8 46.2V17.8z" stroke="#e8ffd6" stroke-width="1.2" stroke-dasharray="10 8" opacity=".7"><animate attributeName="stroke-dashoffset" values="0;-36" dur="3s" repeatCount="indefinite"/></path>
</g>
</svg>`;
}

function svgTypeScript(p: string) {
  return `${HEAD(p, "#60a5fa", "#1e4f94")}
<defs><linearGradient id="${p}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#3b8ae0"/><stop offset="100%" stop-color="#2865ad"/></linearGradient></defs>
<g filter="url(#${p}glow)">${FLOAT}
  <rect x="8" y="8" width="48" height="48" rx="5" fill="url(#${p}g)"/>
  <path d="M21.5 31.5h13.8v3.6h-5v14.2h-3.9V35.1h-4.9v-3.6z" fill="#fff"/>
  <path d="M43.8 49.6c-2.6 0-4.7-.9-6.2-2.6l2.4-2.4c1.1 1.2 2.4 1.9 3.9 1.9 1.4 0 2.1-.5 2.1-1.4 0-.9-.6-1.3-2.8-2.1-3.2-1-4.9-2.3-4.9-5.2 0-2.7 2.3-4.8 5.8-4.8 2.4 0 4.2.7 5.6 2.2l-2.3 2.4c-.9-.9-2-1.4-3.2-1.4-1.1 0-1.7.5-1.7 1.2 0 .8.6 1.1 2.8 1.9 3.3 1.1 5 2.4 5 5.3 0 3-2.5 5-6.5 5z" fill="#fff"/>
  ${SHINE(p, 8, 8, 48, 48, 5)}
</g>
</svg>`;
}

function svgAngularJs(p: string) {
  return `${HEAD(p, "#fb7185", "#8a0a24")}
<g filter="url(#${p}glow)">${FLOAT}
  <path d="M32 5L7.5 13.6l3.8 31.6L32 59l20.7-13.8 3.8-31.6z" fill="#dd0031"/>
  <path d="M32 5v54l20.7-13.8 3.8-31.6z" fill="#c3002f"/>
  <path d="M32 14.5L19 43.6h4.9l2.6-6.5h11l2.6 6.5H45L32 14.5zm0 9.3l3.8 9.4h-7.6l3.8-9.4z" fill="#fff" fill-rule="evenodd"/>
  <path d="M32 5L7.5 13.6l3.8 31.6L32 59l20.7-13.8 3.8-31.6z" stroke="#ffd1da" stroke-width="1" stroke-dasharray="10 8" opacity=".7"><animate attributeName="stroke-dashoffset" values="0;-36" dur="3s" repeatCount="indefinite"/></path>
  <path d="M32 5L7.5 13.6l3.8 31.6L32 59z" fill="#fff" opacity="0"><animate attributeName="opacity" values="0;.14;0" dur="3.6s" repeatCount="indefinite"/></path>
</g>
</svg>`;
}

function svgAspNet(p: string) {
  return `${HEAD(p, "#a78bfa", "#3a1d96")}
<defs><linearGradient id="${p}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#6a3fe6"/><stop offset="100%" stop-color="#43209f"/></linearGradient></defs>
<g filter="url(#${p}glow)">${FLOAT}
  <rect x="6" y="10" width="52" height="44" rx="9" fill="url(#${p}g)"/>
  <text x="32" y="40" font-family="Segoe UI,Arial,sans-serif" font-size="19" font-weight="700" fill="#fff" text-anchor="middle" letter-spacing="-.5">.NET</text>
  ${SHINE(p, 6, 10, 52, 44, 9)}
</g>
</svg>`;
}

function svgXml(p: string) {
  return `${HEAD(p, "#fb923c", "#8a3a08")}
<defs><linearGradient id="${p}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ff8a4c"/><stop offset="100%" stop-color="#e2501a"/></linearGradient></defs>
<g filter="url(#${p}glow)">${FLOAT}
  <path d="M14 6h25l13 13v37a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" fill="url(#${p}g)"/>
  <path d="M39 6l13 13H41a2 2 0 0 1-2-2V6z" fill="#fff" opacity=".4"/>
  <path d="M23 30l-6 6 6 6" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><animateTransform attributeName="transform" type="translate" values="0,0;-1.5,0;0,0" dur="1.8s" repeatCount="indefinite"/></path>
  <path d="M41 30l6 6-6 6" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none"><animateTransform attributeName="transform" type="translate" values="0,0;1.5,0;0,0" dur="1.8s" repeatCount="indefinite"/></path>
  <path d="M34 28l-4 16" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/>
  <text x="32" y="55" font-family="Arial,sans-serif" font-size="8" font-weight="800" fill="#fff" text-anchor="middle" opacity=".95">XML</text>
</g>
</svg>`;
}

function svgExcel(p: string) {
  const cells: string[] = [];
  let i = 0;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) {
    cells.push(`<rect x="${37 + c * 10}" y="${17 + r * 8.5}" width="8.4" height="6.6" rx="1" fill="#fff" opacity=".9"><animate attributeName="opacity" values=".35;1;.35" dur="2.8s" begin="${(i++ * 0.28).toFixed(2)}s" repeatCount="indefinite"/></rect>`);
  }
  return `${HEAD(p, "#4ade80", "#0f5132")}
<defs>
  <linearGradient id="${p}d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#33c481"/><stop offset="100%" stop-color="#107c41"/></linearGradient>
  <linearGradient id="${p}x" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1b8a50"/><stop offset="100%" stop-color="#0b5a30"/></linearGradient>
</defs>
<g filter="url(#${p}glow)">${FLOAT}
  <rect x="22" y="9" width="36" height="46" rx="4" fill="url(#${p}d)"/>
  <rect x="22" y="9" width="36" height="46" rx="4" fill="#fff" opacity=".06"/>
  ${cells.join("\n  ")}
  <rect x="6" y="18" width="30" height="30" rx="4.5" fill="url(#${p}x)"/>
  <path d="M14 26l14 14M28 26L14 40" stroke="#fff" stroke-width="4.2" stroke-linecap="round"/>
</g>
</svg>`;
}

function svgNumPy(p: string) {
  const top: string[] = [];
  const left: string[] = [];
  const right: string[] = [];
  // Isometric 3x3 tile grids on each visible face of the cube, like the NumPy logo.
  for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) {
    const d = ((a + b) * 0.25).toFixed(2);
    // top face tile
    const tx = 32 + (a - b) * 7.6, ty = 9 + (a + b) * 4.4;
    top.push(`<path d="M${tx} ${ty}l6.2 3.6-6.2 3.6-6.2-3.6z" fill="#9bd7ee"><animate attributeName="fill" values="#9bd7ee;#e6f7ff;#9bd7ee" dur="3s" begin="${d}s" repeatCount="indefinite"/></path>`);
    // left face tile
    const lx = 10.4 + a * 7.6, ly = 24.4 + a * 4.4 + b * 9.4;
    left.push(`<path d="M${lx} ${ly}l6.2 3.6v7.6l-6.2-3.6z" fill="#4d77cf"/>`);
    // right face tile
    const rx = 33.6 + a * 7.6, ry = 28 - a * 4.4 + b * 9.4 + 4.4 * 2 - 8.8 + 8.8;
    right.push(`<path d="M${rx} ${ry - 4.4}l6.2-3.6v7.6l-6.2 3.6z" fill="#013243" opacity=".9"/>`);
  }
  return `${HEAD(p, "#7dd3fc", "#1e3f94")}
<g filter="url(#${p}glow)">${FLOAT}
  <path d="M32 6l24 13.8v27.6L32 61.2 8 47.4V19.8z" fill="#4dabcf"/>
  <path d="M32 6l24 13.8L32 33.6 8 19.8z" fill="#8fd3ee"/>
  <path d="M8 19.8L32 33.6v27.6L8 47.4z" fill="#4d77cf"/>
  <path d="M56 19.8L32 33.6v27.6l24-13.8z" fill="#1b3f7a"/>
  <g stroke="#fff" stroke-width="1.1" opacity=".75" fill="none">
    <path d="M20 12.9l24 13.8M32 6l24 13.8M8 19.8L32 33.6M44 12.9L20 26.7"/>
    <path d="M16 38.5v-11M24 43.1V31.5M44 38.5v-11M40 43.1V31.5"/>
  </g>
  <g fill="#fff">
    <circle cx="20" cy="39" r="1.6"><animate attributeName="r" values="1;2.2;1" dur="2.8s" repeatCount="indefinite"/></circle>
    <circle cx="26" cy="46" r="1.6"><animate attributeName="r" values="1;2.2;1" dur="2.8s" begin=".4s" repeatCount="indefinite"/></circle>
    <circle cx="44" cy="46" r="1.6"><animate attributeName="r" values="1;2.2;1" dur="2.8s" begin=".8s" repeatCount="indefinite"/></circle>
  </g>
</g>
</svg>`;
}

function svgPandas(p: string) {
  const bar = (x: number, y: number, h: number, c: string, d: number, dh: number) =>
    `<rect x="${x}" y="${y}" width="7" height="${h}" rx="1.4" fill="${c}"><animate attributeName="height" values="${h};${h + dh};${h}" dur="3s" begin="${d}s" repeatCount="indefinite"/><animate attributeName="y" values="${y};${y - dh};${y}" dur="3s" begin="${d}s" repeatCount="indefinite"/></rect>`;
  return `${HEAD(p, "#a78bfa", "#2b0f73")}
<g filter="url(#${p}glow)">${FLOAT}
  <!-- left column of the logo -->
  ${bar(13, 10, 9, "#8d7bff", 0, 0)}
  <rect x="13" y="23" width="7" height="7" rx="1.4" fill="#ffca00"/>
  ${bar(13, 34, 20, "#e70488", 0.3, 5)}
  <!-- centre column -->
  <rect x="28.5" y="12" width="7" height="26" rx="1.4" fill="#fff" opacity=".95"/>
  <rect x="28.5" y="42" width="7" height="7" rx="1.4" fill="#ffca00"/>
  <!-- right column -->
  ${bar(44, 14, 20, "#e70488", 0.6, 6)}
  <rect x="44" y="38" width="7" height="7" rx="1.4" fill="#ffca00"/>
  <rect x="44" y="49" width="7" height="6" rx="1.4" fill="#8d7bff"/>
  <rect x="9" y="8" width="46" height="48" rx="6" stroke="#8d7bff" stroke-width="1" opacity=".35" fill="none"/>
</g>
</svg>`;
}

function svgDsa(p: string) {
  const node = (x: number, y: number, d: number, fill: string) => `<circle cx="${x}" cy="${y}" r="6" fill="url(#${p}n)" stroke="${fill}" stroke-width="2"><animate attributeName="stroke-width" values="2;4;2" dur="3.6s" begin="${d}s" repeatCount="indefinite"/></circle><circle cx="${x - 1.8}" cy="${y - 2}" r="1.6" fill="#fff" opacity=".7"/>`;
  return `${HEAD(p, "#34d399", "#0a5c43")}
<defs><radialGradient id="${p}n" cx="35%" cy="30%" r="75%"><stop offset="0%" stop-color="#6ee7b7"/><stop offset="100%" stop-color="#047857"/></radialGradient></defs>
<g filter="url(#${p}glow)">${FLOAT}
  <g stroke="#a7f3d0" stroke-width="2.2" stroke-linecap="round" opacity=".9">
    <path d="M32 15L17 31M32 15l15 16M17 31l-7 17M17 31l7 17M47 31l-7 17M47 31l7 17"/>
  </g>
  <circle r="2.4" fill="#fff"><animateMotion dur="3.6s" repeatCount="indefinite" path="M32 15L17 31L10 48"/></circle>
  ${node(32, 14, 0, "#d1fae5")}${node(17, 31, 0.6, "#a7f3d0")}${node(47, 31, 1.6, "#a7f3d0")}${node(10, 49, 1.1, "#6ee7b7")}${node(24, 49, 1.4, "#6ee7b7")}${node(40, 49, 2.2, "#6ee7b7")}${node(54, 49, 2.8, "#6ee7b7")}
</g>
</svg>`;
}

function svgDjango(p: string) {
  return `${HEAD(p, "#4ade80", "#0a3d2a")}
<defs><linearGradient id="${p}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#14573d"/><stop offset="100%" stop-color="#092e20"/></linearGradient></defs>
<g filter="url(#${p}glow)">${FLOAT}
  <rect x="8" y="8" width="48" height="48" rx="9" fill="url(#${p}g)" stroke="#44b78b" stroke-width="1.4"/>
  <path d="M38 13h7.4v27.4c0 7.4-3.7 11-10.4 11-1.9 0-3.3-.2-4.8-.6v-5.9c1 .4 2.2.6 3.6.6 3.4 0 4.2-1.9 4.2-5.6V13z" fill="#fff"/>
  <rect x="37.6" y="19.5" width="7.8" height="5.4" rx="1" fill="#44b78b"/>
  <path d="M20.4 25h7.4v18.2c-2.9.6-5.3.9-7.7.9-4.6 0-7.1-2.1-7.1-6.5 0-4.4 2.9-6.9 7.3-6.9.6 0 1.1.1 1.8.2V25zm0 10.2c-.6-.2-1-.2-1.7-.2-2.1 0-3.2 1.1-3.2 3.2 0 2.1 1.1 3.1 3.2 3.1.5 0 1-.1 1.7-.2v-5.9z" fill="#fff" fill-rule="evenodd"/>
  ${SHINE(p, 8, 8, 48, 48, 9)}
</g>
</svg>`;
}

function svgGit(p: string) {
  return `${HEAD(p, "#fb923c", "#8a2a14")}
<defs><linearGradient id="${p}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ff6a45"/><stop offset="100%" stop-color="#d93a1a"/></linearGradient></defs>
<g filter="url(#${p}glow)">${FLOAT}
  <rect x="11" y="11" width="42" height="42" rx="6" fill="url(#${p}g)" transform="rotate(45 32 32)"/>
  <g stroke="#fff" stroke-width="3.4" stroke-linecap="round" fill="none">
    <path d="M32 19.5v-0.01"/><path d="M32 22v21"/>
    <path d="M32 29.5l9 6.5"><animate attributeName="stroke-dasharray" values="0 12;12 0" dur="2s" repeatCount="indefinite"/></path>
  </g>
  <g fill="#fff">
    <circle cx="32" cy="19" r="4.2"/><circle cx="32" cy="45" r="4.2"/>
    <circle cx="43" cy="37" r="4.2"><animate attributeName="r" values="3.4;5;3.4" dur="2s" repeatCount="indefinite"/></circle>
  </g>
  <rect x="11" y="11" width="42" height="42" rx="6" stroke="#ffd0bd" stroke-width="1" fill="none" stroke-dasharray="9 7" opacity=".6" transform="rotate(45 32 32)"><animate attributeName="stroke-dashoffset" values="0;-32" dur="3s" repeatCount="indefinite"/></rect>
</g>
</svg>`;
}

function svgPostgres(p: string) {
  // PostgreSQL-blue database with the elephant emblem on a glass badge; lights and ear animate.
  return `${HEAD(p, "#7dd3fc", "#1d4a73")}
<defs>
  <linearGradient id="${p}body" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#1b3f66"/><stop offset="32%" stop-color="#4a82b8"/><stop offset="66%" stop-color="#2d5f93"/><stop offset="100%" stop-color="#16345a"/></linearGradient>
  <radialGradient id="${p}lid" cx="38%" cy="30%" r="85%"><stop offset="0%" stop-color="#dcecfb"/><stop offset="55%" stop-color="#7fb0dd"/><stop offset="100%" stop-color="#3c6ea3"/></radialGradient>
  <radialGradient id="${p}h" cx="38%" cy="28%" r="85%"><stop offset="0%" stop-color="#9cc3e6"/><stop offset="60%" stop-color="#4f84b8"/><stop offset="100%" stop-color="#2a5a8c"/></radialGradient>
  <radialGradient id="${p}badge" cx="40%" cy="30%" r="80%"><stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#cfe2f5"/></radialGradient>
  <radialGradient id="${p}floor" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#000" stop-opacity=".45"/><stop offset="100%" stop-color="#000" stop-opacity="0"/></radialGradient>
</defs>
<ellipse cx="32" cy="59" rx="24" ry="3.600" fill="url(#${p}floor)"/>
<g filter="url(#${p}glow)">${FLOAT}
  <path d="M8 16v32c0 5.500 10.700 9.500 24 9.500S56 53.500 56 48V16z" fill="url(#${p}body)"/>
  <path d="M8 30c0 5.500 10.700 9.500 24 9.500S56 35.500 56 30M8 44c0 5.500 10.700 9.500 24 9.500S56 49.500 56 44" stroke="#a9cdee" stroke-width="1" fill="none" opacity=".55"/>
  <path d="M12 20v26" stroke="#fff" stroke-width="2.600" stroke-linecap="round" opacity=".28"/>
  <ellipse cx="32" cy="16" rx="24" ry="9.500" fill="url(#${p}lid)"/>
  <ellipse cx="32" cy="16" rx="24" ry="9.500" fill="none" stroke="#f1f7fd" stroke-width="1.200"/>
  <ellipse cx="32" cy="16.500" rx="17" ry="5.800" fill="#1d4a73" opacity=".25"/>
  <circle cx="50" cy="44" r="1.800" fill="#86efac"><animate attributeName="opacity" values="1;.2;1" dur="2s" repeatCount="indefinite"/></circle>
  <circle cx="14" cy="44" r="1.800" fill="#fde68a"><animate attributeName="opacity" values="1;.2;1" dur="2s" begin=".7s" repeatCount="indefinite"/></circle>
  <!-- elephant emblem on a glass badge -->
  <circle cx="32" cy="35" r="14.500" fill="url(#${p}badge)" stroke="#eaf3fc" stroke-width="1.600"/>
  <g transform="translate(32 35) scale(.34) translate(-33 -33)">
    <path d="M43 10c10-3 18 3 17 14-1 10-7 17-15 17-6-9-7-21-2-31z" fill="#6b9bc9" stroke="#1d4a73" stroke-width="2.600" stroke-linejoin="round"><animateTransform attributeName="transform" type="rotate" values="0 42 22;7 42 22;0 42 22" dur="2.600s" repeatCount="indefinite"/></path>
    <circle cx="33" cy="26" r="17.500" fill="url(#${p}h)" stroke="#1d4a73" stroke-width="2.600"/>
    <path d="M21 32c-7 1-11 7-10 14 .8 5 6 6.500 9 3" stroke="#1d4a73" stroke-width="10.500" stroke-linecap="round" fill="none"/>
    <path d="M21 32c-7 1-11 7-10 14 .8 5 6 6.500 9 3" stroke="#5b8fc2" stroke-width="6.600" stroke-linecap="round" fill="none"/>
    <path d="M27 41c-1.500 5 1 9 5 10.500" stroke="#fff" stroke-width="3.200" stroke-linecap="round" fill="none"/>
    <path d="M24 20c2.500-2.200 7-2.600 10-.8" stroke="#10263f" stroke-width="1.800" stroke-linecap="round" fill="none"/>
    <ellipse cx="29.500" cy="25" rx="3.400" ry="3.600" fill="#fff"/><circle cx="30.200" cy="25.400" r="1.900" fill="#10263f"/>
  </g>
</g>
</svg>`;
}

function svgMongo(p: string) {
  return `${HEAD(p, "#4ade80", "#14572a")}
<defs>
  <linearGradient id="${p}g" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#599636"/><stop offset="55%" stop-color="#13aa52"/><stop offset="100%" stop-color="#0f8f45"/></linearGradient>
</defs>
<g filter="url(#${p}glow)">${FLOAT}
  <path d="M32.8 3c.9 3 2.3 5.3 4.2 7.6 4.4 5.4 9.6 10.8 9.6 22.8 0 10-5.9 16.7-12.7 19.1l-.4 0V59h-3.8v-6.5c-6.3-1.8-12-8.4-12-18.4 0-12.2 6.3-19 10.4-24C29.9 7.2 31.8 5.7 32.8 3z" fill="url(#${p}g)"/>
  <path d="M32.8 3c.3 12 1.2 31 .2 49.5h-.4l.4 0V59h-1.2V8c.4-1.5.8-3.5 1-5z" fill="#0b7a3a" opacity=".55"/>
  <path d="M31 9c-3 4-9 11-9 22 0 8 3.5 13.5 8.2 16.4C25 41 24 33 25.5 25c.9-5 3.5-10 5.5-16z" fill="#b7e4a0" opacity=".5"><animate attributeName="opacity" values=".25;.6;.25" dur="3s" repeatCount="indefinite"/></path>
  <rect x="31.6" y="52" width="1.8" height="8" rx=".8" fill="#a6a385"/>
</g>
</svg>`;
}


/** Realistic redraws of the original language icons (Python, Java, JavaScript, HTML, CSS, MySQL, C, C++, PHP). */
export type LangIconKey = "python" | "java" | "javascript" | "html" | "css" | "sql" | "mysql" | "c" | "cpp" | "php";

function svgPython(p: string) {
  return `${HEAD(p, "#60a5fa", "#1e3a8a")}
<defs>
  <linearGradient id="${p}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#5a9fd4"/><stop offset="100%" stop-color="#306998"/></linearGradient>
  <linearGradient id="${p}y" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffe873"/><stop offset="100%" stop-color="#ffd43b"/></linearGradient>
</defs>
<g filter="url(#${p}glow)">${FLOAT}
  <path d="M31.6 5C20.8 5 21.5 9.7 21.5 9.7v4.9h10.3v1.5H17.4S9.5 15.2 9.5 26.3c0 11 6.9 10.6 6.9 10.6h4.1v-5.1s-.2-6.9 6.8-6.9h11.7s6.5.1 6.5-6.3V12s1-7-11-7z" fill="url(#${p}b)"/>
  <circle cx="26.2" cy="10.6" r="2.1" fill="#fff"/>
  <path d="M32.4 59c10.8 0 10.1-4.7 10.1-4.7v-4.9H32.2v-1.5h14.4s7.9.9 7.9-10.2c0-11-6.9-10.6-6.9-10.6h-4.1v5.1s.2 6.9-6.8 6.9H25.2s-6.5-.1-6.5 6.3V52s-1 7 13.7 7z" fill="url(#${p}y)"/>
  <circle cx="37.8" cy="53.4" r="2.1" fill="#fff"/>
</g>
</svg>`;
}

function svgJava(p: string) {
  return `${HEAD(p, "#fb923c", "#9a3412")}
<defs>
  <linearGradient id="${p}c" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#6aa0cc"/><stop offset="100%" stop-color="#3b6d97"/></linearGradient>
  <linearGradient id="${p}r" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f89820"/><stop offset="100%" stop-color="#e76f00"/></linearGradient>
</defs>
<g filter="url(#${p}glow)">${FLOAT}
  <path d="M26 5c4 4-5 7-3 11 1.500 3 5 4.200 5 8-3-1.500-5.500-4-4-7 1.500-3.500 6-5.500 2-12z" fill="url(#${p}r)"><animate attributeName="opacity" values="1;.55;1" dur="2.4s" repeatCount="indefinite"/></path>
  <path d="M36 12c3 3-3.500 5-2 8 1 2 3.500 3 3.500 5.500-2.500-1-4-3-3-5 1-2.500 4.500-4 1.500-8.500z" fill="url(#${p}r)" opacity=".85"><animate attributeName="opacity" values=".4;.9;.4" dur="2.4s" begin=".5s" repeatCount="indefinite"/></path>
  <path d="M13 30h30v8c0 8-6 14-15 14s-15-6-15-14z" fill="url(#${p}c)"/>
  <path d="M43 32h4.500c4 0 6.500 2.500 6.500 5.500S51.500 44 47 44h-4.500" stroke="#4a7ba3" stroke-width="3.400" fill="none" stroke-linecap="round"/>
  <ellipse cx="28" cy="30" rx="15" ry="3" fill="#8bbbe0"/>
  <ellipse cx="28" cy="30" rx="12.500" ry="2" fill="#2f5f86"/>
  <path d="M8 55c10 4 28 4 40 0-2 3-8 5-20 5S10 58 8 55z" fill="#e76f00"/>
</g>
</svg>`;
}

function svgJavaScript(p: string) {
  return `${HEAD(p, "#fde047", "#a16207")}
<g filter="url(#${p}glow)">${FLOAT}
  <rect x="8" y="8" width="48" height="48" rx="4" fill="#f7df1e"/>
  <text x="50" y="50" font-family="Arial,sans-serif" font-size="24" font-weight="800" fill="#323330" text-anchor="end">JS</text>
  ${SHINE(p, 8, 8, 48, 48, 4)}
</g>
</svg>`;
}

const SHIELD_OUTER = "M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438z";

/** Official-style W3C shield: dark left half, lighter right half, white glyph cut-out, animated glint. */
function webShield(p: string, dark: string, light: string, glyph: string, c1: string, c2: string) {
  return `${HEAD(p, c1, c2)}
<defs>
  <linearGradient id="${p}d" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${dark}"/><stop offset="100%" stop-color="${c2}"/></linearGradient>
  <linearGradient id="${p}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${light}"/><stop offset="100%" stop-color="${dark}"/></linearGradient>
  <clipPath id="${p}clip"><path d="${SHIELD_OUTER}"/></clipPath>
</defs>
<g filter="url(#${p}glow)">${FLOAT}
  <g transform="translate(4.2 3.6) scale(2.35)">
    <path d="${SHIELD_OUTER}" fill="url(#${p}d)"/>
    <path d="M12 .6h10.2l-1.8 20.800L12 23.400z" fill="url(#${p}l)"/>
    <path d="${glyph}" fill="#fff" fill-rule="evenodd"/>
    <g clip-path="url(#${p}clip)"><rect x="-8" y="-2" width="4" height="30" fill="#fff" opacity=".35" transform="skewX(-18)"><animate attributeName="x" values="-8;34" dur="3.4s" repeatCount="indefinite"/></rect></g>
  </g>
</g>
</svg>`;
}
const HTML5_GLYPH = "M7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z";
const CSS3_GLYPH = "M18.59 4.413L5.41 4.41l.213 2.622 10.125.002-.255 2.716h-6.64l.24 2.573h6.182l-.366 3.523-2.91.804-2.956-.81-.188-2.11h-2.61l.29 3.855L12 19.288l5.373-1.53L18.59 4.414z";
const svgHtml = (p: string) => webShield(p, "#e44d26", "#f16529", HTML5_GLYPH, "#f16529", "#b9381b");
const svgCss = (p: string) => webShield(p, "#1572b6", "#33a9dc", CSS3_GLYPH, "#33a9dc", "#0e4f86");

function svgSql(p: string) {
  // Glossy two-tier database at the back, a floating data table (header + rows) in front with a row highlight sweeping down.
  const row = (y: number, d: number) => `<rect x="36" y="${y}" width="22" height="5.400" fill="#fff" opacity="0"><animate attributeName="opacity" values="0;.35;0" dur="3s" begin="${d}s" repeatCount="indefinite"/></rect>
    <rect x="38" y="${y + 1.700}" width="5" height="2" rx="1" fill="#475569"/><rect x="46" y="${y + 1.700}" width="9" height="2" rx="1" fill="#94a3b8"/>`;
  return `${HEAD(p, "#22d3ee", "#0e7490")}
<defs>
  <linearGradient id="${p}body" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#083f55"/><stop offset="30%" stop-color="#22a8c9"/><stop offset="65%" stop-color="#0f7894"/><stop offset="100%" stop-color="#062f42"/></linearGradient>
  <radialGradient id="${p}lid" cx="38%" cy="30%" r="85%"><stop offset="0%" stop-color="#e6fcff"/><stop offset="55%" stop-color="#5fd0e8"/><stop offset="100%" stop-color="#1693b4"/></radialGradient>
  <linearGradient id="${p}card" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#dbeafe"/></linearGradient>
  <linearGradient id="${p}head" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#2563eb"/><stop offset="100%" stop-color="#06b6d4"/></linearGradient>
  <radialGradient id="${p}floor" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#000" stop-opacity=".45"/><stop offset="100%" stop-color="#000" stop-opacity="0"/></radialGradient>
  <clipPath id="${p}cc"><rect x="34" y="30" width="26" height="26" rx="4"/></clipPath>
</defs>
<ellipse cx="32" cy="59" rx="26" ry="3.600" fill="url(#${p}floor)"/>
<g filter="url(#${p}glow)">${FLOAT}
  <path d="M5 28v15c0 5.500 8.500 9.500 19 9.500S43 48.500 43 43V28z" fill="url(#${p}body)"/>
  <path d="M5 14v14c0 5.500 8.500 9.500 19 9.500S43 33.500 43 28V14z" fill="url(#${p}body)"/>
  <ellipse cx="24" cy="28" rx="19" ry="7.500" fill="none" stroke="#9eeaf8" stroke-width="1" opacity=".6"/>
  <ellipse cx="24" cy="14" rx="19" ry="7.500" fill="url(#${p}lid)"/>
  <ellipse cx="24" cy="14" rx="19" ry="7.500" fill="none" stroke="#f0fdff" stroke-width="1.100"/>
  <ellipse cx="24" cy="14.500" rx="13" ry="4.600" fill="#0b6f8b" opacity=".35"/>
  <path d="M9 18v22" stroke="#fff" stroke-width="2.400" stroke-linecap="round" opacity=".3"/>
  <circle cx="38" cy="38" r="1.800" fill="#86efac"><animate attributeName="opacity" values="1;.2;1" dur="2s" repeatCount="indefinite"/></circle>
  <circle cx="38" cy="30" r="1.800" fill="#fde68a"><animate attributeName="opacity" values="1;.2;1" dur="2s" begin=".6s" repeatCount="indefinite"/></circle>
  <g>
    <animateTransform attributeName="transform" type="translate" values="0,0;0,-1.600;0,0" dur="3s" repeatCount="indefinite"/>
    <rect x="33.500" y="29.500" width="27" height="27" rx="4.500" fill="#0f172a" opacity=".25" transform="translate(1 1.500)"/>
    <rect x="34" y="30" width="26" height="26" rx="4" fill="url(#${p}card)"/>
    <g clip-path="url(#${p}cc)">
      <rect x="34" y="30" width="26" height="6.500" fill="url(#${p}head)"/>
      <rect x="37" y="32.200" width="4.500" height="2.200" rx="1.100" fill="#fff"/><rect x="45" y="32.200" width="10" height="2.200" rx="1.100" fill="#fff" opacity=".85"/>
      ${row(37, 0)}
      ${row(43, 0.5)}
      ${row(49, 1)}
      <path d="M34 42.500h26M34 48.500h26M43.500 36.500V56" stroke="#cbd5e1" stroke-width=".7"/>
    </g>
    <rect x="34" y="30" width="26" height="26" rx="4" fill="none" stroke="#fff" stroke-width="1" opacity=".8"/>
  </g>
</g>
</svg>`;
}

function svgMySql(p: string) {
  return `${HEAD(p, "#38bdf8", "#075985")}
<defs><linearGradient id="${p}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2fb5d6"/><stop offset="100%" stop-color="#00758f"/></linearGradient></defs>
<g filter="url(#${p}glow)">${FLOAT}
  <path d="M6 38C10 24 20 12 36 10c8-1 15 3 20 10-5-2-9-1-11 3-2 4-3 9-8 13-5 5-13 7-21 7-4 0-7 1-9 4 1-5 1-9-1-9z" fill="url(#${p}g)"/>
  <circle cx="45" cy="20" r="1.800" fill="#fff"/>
  <path d="M26 30c3-3 8-3 11-1" stroke="#bff0fb" stroke-width="1.600" stroke-linecap="round" fill="none"><animate attributeName="opacity" values=".3;1;.3" dur="2.600s" repeatCount="indefinite"/></path>
  <text x="32" y="59" font-family="Arial,sans-serif" font-size="11" font-weight="800" text-anchor="middle"><tspan fill="#00758f" stroke="#fff" stroke-width=".6">My</tspan><tspan fill="#f29111" stroke="#fff" stroke-width=".6">SQL</tspan></text>
</g>
</svg>`;
}

function hexLogo(p: string, label: string, size: number) {
  return `${HEAD(p, "#60a5fa", "#1e3a8a")}
<defs><linearGradient id="${p}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#659ad2"/><stop offset="100%" stop-color="#004482"/></linearGradient></defs>
<g filter="url(#${p}glow)">${FLOAT}
  <path d="M32 4l24 13.800v28.400L32 60 8 46.200V17.800z" fill="url(#${p}g)"/>
  <path d="M32 4l24 13.800v28.400L32 60z" fill="#00599c" opacity=".55"/>
  <text x="32" y="${size > 20 ? 43 : 40}" font-family="Arial,sans-serif" font-size="${size}" font-weight="800" fill="#fff" text-anchor="middle">${label}</text>
  <path d="M32 4l24 13.800v28.400L32 60 8 46.200V17.800z" stroke="#dbeafe" stroke-width="1.100" stroke-dasharray="10 8" opacity=".6" fill="none"><animate attributeName="stroke-dashoffset" values="0;-36" dur="3s" repeatCount="indefinite"/></path>
</g>
</svg>`;
}
const svgC = (p: string) => hexLogo(p, "C", 30);
const svgCpp = (p: string) => hexLogo(p, "C++", 19);

function svgPhp(p: string) {
  return `${HEAD(p, "#a5b4fc", "#3730a3")}
<defs><radialGradient id="${p}g" cx="35%" cy="30%" r="80%"><stop offset="0%" stop-color="#aeb2d5"/><stop offset="100%" stop-color="#6c71a8"/></radialGradient></defs>
<g filter="url(#${p}glow)">${FLOAT}
  <ellipse cx="32" cy="32" rx="28" ry="17" fill="url(#${p}g)"/>
  <ellipse cx="32" cy="32" rx="28" ry="17" fill="none" stroke="#fff" stroke-width="1.200" opacity=".5" stroke-dasharray="8 6"><animate attributeName="stroke-dashoffset" values="0;-28" dur="3s" repeatCount="indefinite"/></ellipse>
  <text x="32" y="38.500" font-family="Arial,sans-serif" font-size="19" font-weight="800" font-style="italic" fill="#000" text-anchor="middle">php</text>
  <path d="M12 22c8-7 24-9 38-3" stroke="#fff" stroke-width="1.800" stroke-linecap="round" opacity=".35" fill="none"/>
</g>
</svg>`;
}

export const LANG_SVGS: Record<LangIconKey, (p: string) => string> = {
  python: svgPython, java: svgJava, javascript: svgJavaScript, html: svgHtml, css: svgCss, sql: svgSql, mysql: svgMySql, c: svgC, cpp: svgCpp, php: svgPhp,
};

export const EXTRA_SVGS: Record<ExtraIconKey, (p: string) => string> = {
  bootstrap: svgBootstrap, jquery: svgJQuery, nodejs: svgNodeJs, typescript: svgTypeScript, angularjs: svgAngularJs,
  aspnet: svgAspNet, xml: svgXml, excel: svgExcel, numpy: svgNumPy, pandas: svgPandas, dsa: svgDsa,
  django: svgDjango, git: svgGit, postgresql: svgPostgres, mongodb: svgMongo,
};
