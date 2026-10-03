/**
 * Illustrated "mascot scene" artwork for project/internship card banners.
 * Unlike the small keyword glyphs in courseIcons.ts, these are wide,
 * full-bleed banner illustrations (a character + floating props) so a card
 * banner reads as a little scene instead of a flat gradient with an icon in
 * the corner. Same hand-authored inline-SVG approach as the rest of the
 * animated icon system — no external image assets.
 */
import { getCourseIconKey, type CourseIconKey } from "./courseIcons";

export type CardArtKey = "ml" | "cyber" | "testing" | "marketing" | "cloud" | "webdev";

export const FREE_WEB_DEVELOPMENT_PREVIEW_URL =
  "https://cdnl.iconscout.com/lottie/free/preview/free-designer-building-website-animation-gif-download-5967182.mp4";

function toArtKey(key: CourseIconKey): CardArtKey {
  switch (key) {
    case "ai":
    case "ml":
    case "data":
    case "student":
      return "ml";
    case "cyber":
    case "network":
      return "cyber";
    case "testing":
      return "testing";
    case "marketing":
    case "comm":
    case "leader":
    case "career":
      return "marketing";
    case "cloud":
    case "devops":
    case "linux":
      return "cloud";
    default:
      return "webdev";
  }
}

/* ── Shared bits ─────────────────────────────────────────────────────── */
function sparkles(p: string, color: string) {
  return `<g fill="${color}">
    <circle cx="52" cy="34" r="2"><animate attributeName="opacity" values=".2;1;.2" dur="2.4s" repeatCount="indefinite"/></circle>
    <circle cx="94" cy="118" r="1.6"><animate attributeName="opacity" values="1;.2;1" dur="3s" repeatCount="indefinite"/></circle>
    <circle cx="140" cy="26" r="1.4"><animate attributeName="opacity" values=".3;1;.3" dur="2.1s" repeatCount="indefinite"/></circle>
    <circle cx="38" cy="86" r="1.8"><animate attributeName="opacity" values="1;.3;1" dur="2.7s" repeatCount="indefinite"/></circle>
    <circle cx="180" cy="130" r="1.5"><animate attributeName="opacity" values=".3;1;.3" dur="2.9s" begin=".5s" repeatCount="indefinite"/></circle>
  </g>`;
}

function wrap(p: string, bgId: string, glowId: string, body: string) {
  return `<svg viewBox="0 0 400 170" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="170" fill="url(#${bgId})"/>
    <rect width="400" height="170" fill="url(#${glowId})"/>
    ${body}
  </svg>`;
}

/* ── AI & ML / Data — friendly robot with floating chat bubbles ────────── */
function artML(p: string) {
  return wrap(
    p,
    `${p}bg`,
    `${p}glow`,
    `<defs>
      <linearGradient id="${p}bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1b0a45"/>
        <stop offset="55%" stop-color="#4c1d95"/>
        <stop offset="100%" stop-color="#7c3aed"/>
      </linearGradient>
      <radialGradient id="${p}glow" cx="74%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#c4b5fd" stop-opacity=".4"/>
        <stop offset="100%" stop-color="#c4b5fd" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${p}head" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#ddd6fe"/>
      </linearGradient>
      <filter id="${p}shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5"/>
      </filter>
    </defs>
    ${sparkles(p, "#e9d5ff")}
    <ellipse cx="295" cy="128" rx="46" ry="9" fill="#1b0a45" opacity=".4" filter="url(#${p}shadow)"/>
    <g opacity=".9">
      <rect x="248" y="18" width="48" height="27" rx="10" fill="#ffffff" opacity=".14">
        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-5; 0,0" dur="3.4s" repeatCount="indefinite"/>
      </rect>
      <circle cx="258" cy="31" r="2.4" fill="#fff" opacity=".7"/>
      <circle cx="268" cy="31" r="2.4" fill="#fff" opacity=".7"/>
      <circle cx="278" cy="31" r="2.4" fill="#fff" opacity=".7"/>
      <rect x="308" y="58" width="36" height="22" rx="8" fill="#ffffff" opacity=".12">
        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-4; 0,0" dur="3.8s" begin=".5s" repeatCount="indefinite"/>
      </rect>
    </g>
    <g transform="translate(250,44)">
      <line x1="45" y1="-2" x2="45" y2="-19" stroke="url(#${p}head)" stroke-width="4" stroke-linecap="round"/>
      <circle cx="45" cy="-23" r="6" fill="#67e8f9">
        <animate attributeName="opacity" values=".5;1;.5" dur="1.6s" repeatCount="indefinite"/>
      </circle>
      <rect x="-9" y="21" width="11" height="27" rx="5.5" fill="url(#${p}head)"/>
      <rect x="88" y="21" width="11" height="27" rx="5.5" fill="url(#${p}head)"/>
      <rect x="0" y="0" width="90" height="78" rx="27" fill="url(#${p}head)"/>
      <rect x="13" y="13" width="64" height="48" rx="16" fill="#1b0a45" opacity=".3"/>
      <g fill="#f5f3ff">
        <ellipse cx="30" cy="37" rx="7" ry="9">
          <animate attributeName="ry" values="9;9;1;9;9" keyTimes="0;.42;.5;.58;1" dur="3.4s" repeatCount="indefinite"/>
        </ellipse>
        <ellipse cx="60" cy="37" rx="7" ry="9">
          <animate attributeName="ry" values="9;9;1;9;9" keyTimes="0;.42;.5;.58;1" dur="3.4s" repeatCount="indefinite"/>
        </ellipse>
      </g>
      <path d="M28 54 Q45 64 62 54" stroke="#f5f3ff" stroke-width="4.5" stroke-linecap="round" fill="none"/>
    </g>`
  );
}

/* ── Cybersecurity — shield guardian with a scan sweep ──────────────────── */
function artCyber(p: string) {
  return wrap(
    p,
    `${p}bg`,
    `${p}glow`,
    `<defs>
      <linearGradient id="${p}bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1a0000"/>
        <stop offset="55%" stop-color="#7f1d1d"/>
        <stop offset="100%" stop-color="#dc2626"/>
      </linearGradient>
      <radialGradient id="${p}glow" cx="74%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#fca5a5" stop-opacity=".35"/>
        <stop offset="100%" stop-color="#fca5a5" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${p}shield" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#fecaca"/>
      </linearGradient>
      <clipPath id="${p}clip">
        <path d="M45 0 L88 17 L88 50 C88 80 70 98 45 108 C20 98 2 80 2 50 L2 17 Z"/>
      </clipPath>
      <filter id="${p}shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5"/>
      </filter>
    </defs>
    ${sparkles(p, "#fecaca")}
    <ellipse cx="300" cy="148" rx="42" ry="8" fill="#1a0000" opacity=".4" filter="url(#${p}shadow)"/>
    <g transform="translate(255,30)">
      <path d="M45 0 L88 17 L88 50 C88 80 70 98 45 108 C20 98 2 80 2 50 L2 17 Z" fill="url(#${p}shield)"/>
      <rect x="2" y="0" width="86" height="18" fill="#fff" opacity=".18" clip-path="url(#${p}clip)">
        <animate attributeName="y" values="-10;98;-10" dur="2.8s" repeatCount="indefinite" calcMode="spline" keySplines=".4 0 .6 1;.4 0 .6 1"/>
      </rect>
      <g fill="#7f1d1d">
        <circle cx="30" cy="44" r="6"/>
        <circle cx="60" cy="44" r="6"/>
      </g>
      <g fill="#fecaca">
        <circle cx="31.5" cy="43" r="2.2"/>
        <circle cx="61.5" cy="43" r="2.2"/>
      </g>
      <path d="M28 56 Q45 66 62 56" stroke="#7f1d1d" stroke-width="4" stroke-linecap="round" fill="none"/>
    </g>
    <g transform="translate(330,88)">
      <rect x="-9" y="0" width="18" height="15" rx="3" fill="#fecaca" opacity=".9"/>
      <path d="M-6 0 L-6 -6 C-6 -11 6 -11 6 -6 L6 0" stroke="#fecaca" stroke-width="3" fill="none" opacity=".9"/>
    </g>`
  );
}

/* ── Testing / QA — magnifying glass with a caught bug ──────────────────── */
function artTesting(p: string) {
  return wrap(
    p,
    `${p}bg`,
    `${p}glow`,
    `<defs>
      <linearGradient id="${p}bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1a0f00"/>
        <stop offset="55%" stop-color="#92400e"/>
        <stop offset="100%" stop-color="#d97706"/>
      </linearGradient>
      <radialGradient id="${p}glow" cx="74%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#fde68a" stop-opacity=".4"/>
        <stop offset="100%" stop-color="#fde68a" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${p}ring" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#fde68a"/>
      </linearGradient>
      <filter id="${p}shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5"/>
      </filter>
    </defs>
    ${sparkles(p, "#fde68a")}
    <ellipse cx="300" cy="148" rx="44" ry="8" fill="#1a0f00" opacity=".35" filter="url(#${p}shadow)"/>
    <g transform="translate(300,80)">
      <line x1="30" y1="30" x2="55" y2="55" stroke="url(#${p}ring)" stroke-width="9" stroke-linecap="round"/>
      <circle cx="0" cy="0" r="40" fill="rgba(255,255,255,.14)" stroke="url(#${p}ring)" stroke-width="6">
        <animate attributeName="r" values="38;41;38" dur="2.6s" repeatCount="indefinite"/>
      </circle>
      <g>
        <ellipse cx="-4" cy="2" rx="12" ry="9" fill="#b45309"/>
        <path d="M-16 2 A12 9 0 0 1 8 2" fill="#7c2d12"/>
        <circle cx="-9" cy="-1" r="2" fill="#fef3c7"/>
        <circle cx="0" cy="-1" r="2" fill="#fef3c7"/>
        <circle cx="-14" cy="6" r="1.6" fill="#fde68a"/>
        <circle cx="-4" cy="8" r="1.6" fill="#fde68a"/>
        <circle cx="4" cy="4" r="1.6" fill="#fde68a"/>
      </g>
    </g>
    <g transform="translate(232,26)" opacity=".92">
      <rect width="58" height="46" rx="8" fill="#fff" opacity=".14"/>
      <polyline points="10,16 16,22 27,10" stroke="#4ade80" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <animate attributeName="opacity" values="0;1;1;0" dur="3s" repeatCount="indefinite" keyTimes="0;.4;.8;1"/>
      </polyline>
      <polyline points="10,32 16,38 27,26" stroke="#4ade80" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <animate attributeName="opacity" values="0;1;1;0" dur="3s" begin=".4s" repeatCount="indefinite" keyTimes="0;.4;.8;1"/>
      </polyline>
      <line x1="34" y1="17" x2="48" y2="17" stroke="#fef3c7" stroke-width="3" stroke-linecap="round" opacity=".7"/>
      <line x1="34" y1="33" x2="46" y2="33" stroke="#fef3c7" stroke-width="3" stroke-linecap="round" opacity=".7"/>
    </g>`
  );
}

/* ── Digital Marketing — megaphone with sound rings & growth arrow ─────── */
function artMarketing(p: string) {
  return wrap(
    p,
    `${p}bg`,
    `${p}glow`,
    `<defs>
      <linearGradient id="${p}bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1a0510"/>
        <stop offset="55%" stop-color="#9f1239"/>
        <stop offset="100%" stop-color="#e11d48"/>
      </linearGradient>
      <radialGradient id="${p}glow" cx="74%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#fecdd3" stop-opacity=".4"/>
        <stop offset="100%" stop-color="#fecdd3" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${p}horn" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#fecdd3"/>
      </linearGradient>
      <filter id="${p}shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5"/>
      </filter>
    </defs>
    ${sparkles(p, "#fecdd3")}
    <ellipse cx="300" cy="128" rx="48" ry="8" fill="#1a0510" opacity=".4" filter="url(#${p}shadow)"/>
    <g transform="translate(255,42)">
      <path d="M0 30 L32 8 L32 66 L0 44 Z" fill="url(#${p}horn)"/>
      <rect x="-14" y="24" width="16" height="22" rx="5" fill="url(#${p}horn)"/>
      <path d="M32 8 C64 -8 92 14 92 37 C92 60 64 82 32 66 Z" fill="url(#${p}horn)"/>
      <g fill="#9f1239">
        <circle cx="56" cy="30" r="6"/>
        <circle cx="72" cy="42" r="6"/>
      </g>
      <g fill="#fecdd3">
        <circle cx="57.3" cy="29" r="2.2"/>
        <circle cx="73.3" cy="41" r="2.2"/>
      </g>
      <path d="M50 48 Q62 56 74 52" stroke="#9f1239" stroke-width="3.6" stroke-linecap="round" fill="none"/>
      <g stroke="#fecdd3" fill="none" stroke-linecap="round">
        <path d="M100 20 Q112 37 100 54" stroke-width="3" opacity=".7">
          <animate attributeName="opacity" values=".8;.2;.8" dur="2s" repeatCount="indefinite"/>
        </path>
        <path d="M110 10 Q128 37 110 64" stroke-width="3" opacity=".5">
          <animate attributeName="opacity" values=".6;.1;.6" dur="2.4s" repeatCount="indefinite"/>
        </path>
      </g>
    </g>
    <g transform="translate(70,110)" opacity=".9">
      <polyline points="0,26 16,12 28,20 46,0" stroke="#fecdd3" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M38 0 L46 0 L46 8" stroke="#fecdd3" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </g>`
  );
}

/* ── Cloud Computing — happy cloud with sync arrows ─────────────────────── */
function artCloud(p: string) {
  return wrap(
    p,
    `${p}bg`,
    `${p}glow`,
    `<defs>
      <linearGradient id="${p}bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#02101f"/>
        <stop offset="55%" stop-color="#075985"/>
        <stop offset="100%" stop-color="#0ea5e9"/>
      </linearGradient>
      <radialGradient id="${p}glow" cx="74%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#bae6fd" stop-opacity=".4"/>
        <stop offset="100%" stop-color="#bae6fd" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${p}puff" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#dbeefe"/>
      </linearGradient>
      <filter id="${p}shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5"/>
      </filter>
    </defs>
    ${sparkles(p, "#bae6fd")}
    <ellipse cx="300" cy="132" rx="52" ry="8" fill="#02101f" opacity=".35" filter="url(#${p}shadow)"/>
    <g transform="translate(238,50)">
      <ellipse cx="30" cy="46" rx="30" ry="22" fill="url(#${p}puff)"/>
      <ellipse cx="66" cy="34" rx="36" ry="28" fill="url(#${p}puff)"/>
      <ellipse cx="102" cy="48" rx="26" ry="19" fill="url(#${p}puff)"/>
      <rect x="14" y="46" width="118" height="26" rx="13" fill="url(#${p}puff)"/>
      <g fill="#0369a1">
        <circle cx="54" cy="36" r="6"/>
        <circle cx="80" cy="36" r="6"/>
      </g>
      <g fill="#f0f9ff">
        <circle cx="55.3" cy="35" r="2.2"/>
        <circle cx="81.3" cy="35" r="2.2"/>
      </g>
      <path d="M52 50 Q67 58 82 50" stroke="#0369a1" stroke-width="3.6" stroke-linecap="round" fill="none"/>
    </g>
    <g stroke="#e0f2fe" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <g>
        <line x1="270" y1="128" x2="270" y2="112">
          <animate attributeName="y1" values="132;118" dur="1.8s" repeatCount="indefinite"/>
          <animate attributeName="y2" values="118;104" dur="1.8s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="1;0" dur="1.8s" repeatCount="indefinite"/>
        </line>
        <polyline points="264,116 270,110 276,116">
          <animate attributeName="points" values="264,120 270,114 276,120; 264,106 270,100 276,106" dur="1.8s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="1;0" dur="1.8s" repeatCount="indefinite"/>
        </polyline>
      </g>
      <g>
        <line x1="312" y1="132" x2="312" y2="116">
          <animate attributeName="y1" values="136;122" dur="1.8s" begin=".6s" repeatCount="indefinite"/>
          <animate attributeName="y2" values="122;108" dur="1.8s" begin=".6s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="1;0" dur="1.8s" begin=".6s" repeatCount="indefinite"/>
        </line>
        <polyline points="306,120 312,114 318,120">
          <animate attributeName="points" values="306,124 312,118 318,124; 306,110 312,104 318,110" dur="1.8s" begin=".6s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="1;0" dur="1.8s" begin=".6s" repeatCount="indefinite"/>
        </polyline>
      </g>
    </g>`
  );
}

/* ── AI analysis — floating data panels around a neural core ────────────── */
function artWebdev(p: string) {
  return wrap(
    p,
    `${p}bg`,
    `${p}glow`,
    `<defs>
      <linearGradient id="${p}bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#103C56"/>
        <stop offset="55%" stop-color="#167B88"/>
        <stop offset="100%" stop-color="#43A88F"/>
      </linearGradient>
      <radialGradient id="${p}glow" cx="74%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#B5F2E2" stop-opacity=".5"/>
        <stop offset="100%" stop-color="#B5F2E2" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${p}robot" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#D8F7F5"/>
        <stop offset="100%" stop-color="#69C7D9"/>
      </linearGradient>
      <linearGradient id="${p}panel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#E4F6F3"/>
      </linearGradient>
      <linearGradient id="${p}coral" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FF9A73"/>
        <stop offset="100%" stop-color="#EF5F57"/>
      </linearGradient>
      <filter id="${p}shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5"/>
      </filter>
    </defs>
    ${sparkles(p, "#C9FFF1")}
    <ellipse cx="260" cy="137" rx="102" ry="10" fill="#103C56" opacity=".38" filter="url(#${p}shadow)"/>
    <g stroke="#B8F5E8" stroke-width="1.5" opacity=".55">
      <path d="M163 86 214 70 250 94 307 57 350 82"/>
      <path d="M196 119 231 97 278 115 330 105" stroke-dasharray="3 5"/>
    </g>
    <g>
      <rect x="48" y="42" width="116" height="78" rx="10" fill="url(#${p}panel)" transform="rotate(-8 48 42)"/>
      <g transform="rotate(-8 48 42)">
        <rect x="62" y="52" width="5" height="5" rx="2.5" fill="#3A91A0"/>
        <rect x="71" y="53" width="30" height="3" rx="1.5" fill="#A7CFD0"/>
        <path d="M64 107V71m17 36V81m17 26V66m17 41V76m17 31V61" stroke="#D2E9E6" stroke-width="8" stroke-linecap="round"/>
        <path d="M64 107V89m17 18V92m17 15V80m17 27V87m17 20V73" stroke="#52B69E" stroke-width="8" stroke-linecap="round">
          <animate attributeName="stroke-dasharray" values="0 80;30 80;30 80" dur="2.8s" repeatCount="indefinite"/>
        </path>
      </g>
    </g>
    <g transform="translate(324,48)">
      <ellipse cx="24" cy="52" rx="30" ry="7" fill="#103C56" opacity=".28" filter="url(#${p}shadow)"/>
      <path d="M24 6a23 23 0 0 1 20 35L24 29Z" fill="url(#${p}coral)"/>
      <path d="M24 6v23L4 40A23 23 0 0 1 24 6Z" fill="#F6C86E"/>
      <path d="M4 40a23 23 0 0 0 40 1L24 29Z" fill="#EC7664"/>
      <animateTransform attributeName="transform" type="translate" values="324 48;324 43;324 48" dur="3.6s" repeatCount="indefinite"/>
    </g>
    <g>
      <path d="M229 62 242 42m45 22 18-17m-18 72 24 12m-67-13-20 15" stroke="#B8F5E8" stroke-width="2" stroke-linecap="round"/>
      <circle cx="242" cy="42" r="4" fill="#F8CB74"/>
      <circle cx="305" cy="47" r="4" fill="#72D6C0"/>
      <circle cx="320" cy="131" r="4" fill="#F18772"/>
      <circle cx="209" cy="133" r="4" fill="#7AD4E1"/>
    </g>
    <g>
      <ellipse cx="263" cy="91" rx="43" ry="39" fill="#0B3348" opacity=".18"/>
      <path d="M228 65c0-17 14-30 32-30h8c18 0 32 13 32 30v27c0 19-15 34-34 34h-4c-19 0-34-15-34-34V65Z" fill="url(#${p}robot)" stroke="#D9FFFA" stroke-width="2"/>
      <path d="M239 69c0-10 8-18 18-18h15c10 0 18 8 18 18v21c0 10-8 18-18 18h-15c-10 0-18-8-18-18V69Z" fill="#164D64"/>
      <circle cx="255" cy="79" r="4" fill="#F5FFFE">
        <animate attributeName="opacity" values="1;.45;1" dur="2.2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="275" cy="79" r="4" fill="#F5FFFE">
        <animate attributeName="opacity" values=".45;1;.45" dur="2.2s" repeatCount="indefinite"/>
      </circle>
      <path d="M256 94h18" stroke="#72D6C0" stroke-width="3" stroke-linecap="round"/>
      <path d="M263 35V24" stroke="#D9FFFA" stroke-width="3" stroke-linecap="round"/>
      <circle cx="263" cy="21" r="5" fill="#F18772">
        <animate attributeName="r" values="4;6;4" dur="2.6s" repeatCount="indefinite"/>
      </circle>
      <path d="M223 75h7m69 0h7" stroke="#D9FFFA" stroke-width="4" stroke-linecap="round"/>
      <animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="4s" repeatCount="indefinite"/>
    </g>`
  );
}

const ART: Record<CardArtKey, (p: string) => string> = {
  ml: artML,
  cyber: artCyber,
  testing: artTesting,
  marketing: artMarketing,
  cloud: artCloud,
  webdev: artWebdev,
};

/** idSeed must be stable across server/client render (e.g. React's useId()). */
export function getProjectCardArt(
  titleOrKey: string,
  idSeed: string
): { key: CardArtKey; svg: string; animationUrl?: string } {
  const courseKey = getCourseIconKey(titleOrKey);
  const key = toArtKey(courseKey);
  const id = "pca" + idSeed.replace(/[^a-zA-Z0-9]/g, "");
  return {
    key,
    svg: ART[key](id),
    animationUrl: key === "webdev" ? FREE_WEB_DEVELOPMENT_PREVIEW_URL : undefined,
  };
}
