/**
 * Illustrated "mascot scene" artwork for project/internship card banners.
 * Unlike the small keyword glyphs in courseIcons.ts, these are wide,
 * full-bleed banner illustrations — a rotated floating UI panel + a small
 * orbiting accent badge, connected by a faint line, over a layered gradient
 * — so a card banner reads as a little product-illustration scene instead of
 * a flat gradient with an icon in the corner. Same hand-authored inline-SVG
 * approach as the rest of the animated icon system — no external assets.
 */
import { getCourseIconKey, type CourseIconKey } from "./courseIcons";

export type CardArtKey =
  | "ml"
  | "cyber"
  | "testing"
  | "marketing"
  | "cloud"
  | "webdev"
  | "mobile"
  | "ecommerce"
  | "travel"
  | "platform";

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

/** Soft ground shadow beneath the floating panel, for depth. */
function shadow(p: string, cx: number, cy: number, rx: number, ry: number, color: string, opacity = 0.4) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${color}" opacity="${opacity}" filter="url(#${p}shadow)"/>`;
}

/** Faint dashed line connecting the hero panel to its satellite badge. */
function link(x1: number, y1: number, x2: number, y2: number, color: string) {
  return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${color}" stroke-width="1.4" stroke-dasharray="3 5" opacity=".45"/>`;
}

/** A rotated, gently-bobbing "floating panel" — the hero mockup per scene. */
function floatPanel(p: string, x: number, y: number, w: number, h: number, rotate: number, content: string, dur = 4, delay = "0s") {
  const cx = x + w / 2;
  const cy = y + h / 2;
  return `<g transform="rotate(${rotate} ${cx} ${cy})">
    <g transform="translate(${x},${y})">
      <animateTransform attributeName="transform" type="translate" values="${x},${y}; ${x},${y - 4}; ${x},${y}" dur="${dur}s" begin="${delay}" repeatCount="indefinite"/>
      <rect width="${w}" height="${h}" rx="10" fill="url(#${p}panel)"/>
      ${content}
    </g>
  </g>`;
}

/** A small bobbing satellite badge/icon orbiting near the panel. */
function floatBadge(p: string, x: number, y: number, content: string, dur = 3.4, delay = "0s") {
  return `<g transform="translate(${x},${y})">
    <animateTransform attributeName="transform" type="translate" values="${x},${y}; ${x},${y - 6}; ${x},${y}" dur="${dur}s" begin="${delay}" repeatCount="indefinite"/>
    ${content}
  </g>`;
}

/* ── AI & ML / Data — neural-node panel + pulsing core badge ────────────── */
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
      <radialGradient id="${p}glow" cx="74%" cy="38%" r="60%">
        <stop offset="0%" stop-color="#c4b5fd" stop-opacity=".4"/>
        <stop offset="100%" stop-color="#c4b5fd" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${p}panel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#f3eeff"/>
      </linearGradient>
      <radialGradient id="${p}core" cx="35%" cy="35%" r="70%">
        <stop offset="0%" stop-color="#f3e8ff"/>
        <stop offset="100%" stop-color="#a855f7"/>
      </radialGradient>
      <filter id="${p}shadow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
    </defs>
    ${sparkles(p, "#e9d5ff")}
    ${shadow(p, 258, 140, 96, 10, "#1b0a45", 0.38)}
    ${link(330, 56, 262, 70, "#c4b5fd")}
    ${floatPanel(
      p,
      206,
      36,
      112,
      72,
      -7,
      `<circle cx="20" cy="18" r="3" fill="#7c3aed"/>
      <circle cx="48" cy="30" r="3" fill="#a855f7"/>
      <circle cx="78" cy="16" r="3" fill="#7c3aed"/>
      <circle cx="60" cy="48" r="3" fill="#a855f7"/>
      <circle cx="30" cy="50" r="3" fill="#7c3aed"/>
      <path d="M20 18 48 30M48 30 78 16M48 30 60 48M60 48 30 50M20 18 30 50" stroke="#c4b5fd" stroke-width="1.3" opacity=".7" fill="none"/>
      <rect x="14" y="60" width="50" height="4" rx="2" fill="#ddd6fe"/>
      <rect x="14" y="60" width="0" height="4" rx="2" fill="#7c3aed"><animate attributeName="width" values="0;34;0" dur="2.6s" repeatCount="indefinite"/></rect>`
    )}
    ${floatBadge(
      p,
      330,
      56,
      `<circle r="22" fill="url(#${p}core)"/>
      <circle r="22" fill="none" stroke="#e9d5ff" stroke-width="2" opacity=".6">
        <animate attributeName="r" values="16;26;16" dur="2.4s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values=".7;0;.7" dur="2.4s" repeatCount="indefinite"/>
      </circle>
      <circle r="7" fill="#fff"/>`,
      3.6,
      ".2s"
    )}`
  );
}

/* ── Cybersecurity — scan-readout panel + shield badge ──────────────────── */
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
      <radialGradient id="${p}glow" cx="74%" cy="38%" r="60%">
        <stop offset="0%" stop-color="#fca5a5" stop-opacity=".35"/>
        <stop offset="100%" stop-color="#fca5a5" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${p}panel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#fff1f1"/>
      </linearGradient>
      <linearGradient id="${p}shield" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#fecaca"/>
      </linearGradient>
      <clipPath id="${p}clip"><path d="M18 0 L35 7 L35 20 C35 32 28 39 18 43 C8 39 1 32 1 20 L1 7Z"/></clipPath>
      <filter id="${p}shadow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
    </defs>
    ${sparkles(p, "#fecaca")}
    ${shadow(p, 258, 140, 96, 10, "#1a0000", 0.4)}
    ${link(332, 54, 264, 70, "#fca5a5")}
    ${floatPanel(
      p,
      206,
      36,
      112,
      72,
      -6,
      `<rect x="14" y="16" width="14" height="14" rx="4" fill="#fee2e2"/>
      <path d="M18 23v-4a3 3 0 0 1 6 0v4" stroke="#dc2626" stroke-width="1.6" fill="none"/>
      <rect x="34" y="18" width="52" height="4" rx="2" fill="#fecaca"/>
      <rect x="34" y="26" width="36" height="4" rx="2" fill="#fee2e2"/>
      <rect x="14" y="44" width="72" height="18" rx="6" fill="#fef2f2"/>
      <path d="M22 53 27 58 36 48" stroke="#16a34a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <rect x="44" y="51" width="34" height="4" rx="2" fill="#fca5a5"/>`
    )}
    ${floatBadge(
      p,
      332,
      54,
      `<g transform="translate(-18,-22)">
        <path d="M18 0 L35 7 L35 20 C35 32 28 39 18 43 C8 39 1 32 1 20 L1 7Z" fill="url(#${p}shield)"/>
        <rect x="1" y="2" width="34" height="8" fill="#fff" opacity=".25" clip-path="url(#${p}clip)">
          <animate attributeName="y" values="-4;40;-4" dur="2.6s" repeatCount="indefinite"/>
        </rect>
        <path d="M11 20 16 25 25 14" stroke="#dc2626" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </g>`,
      3.4,
      ".3s"
    )}`
  );
}

/* ── Testing / QA — checklist panel + magnifier badge ───────────────────── */
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
      <radialGradient id="${p}glow" cx="74%" cy="38%" r="60%">
        <stop offset="0%" stop-color="#fde68a" stop-opacity=".4"/>
        <stop offset="100%" stop-color="#fde68a" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${p}panel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#fffbea"/>
      </linearGradient>
      <linearGradient id="${p}ring" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#fde68a"/>
      </linearGradient>
      <filter id="${p}shadow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
    </defs>
    ${sparkles(p, "#fde68a")}
    ${shadow(p, 258, 140, 96, 10, "#1a0f00", 0.38)}
    ${link(334, 60, 264, 70, "#fde68a")}
    ${floatPanel(
      p,
      206,
      34,
      116,
      76,
      -5,
      `<g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 18 19 23 28 12" stroke="#16a34a" stroke-width="2.4"><animate attributeName="opacity" values="0;1;1;0" dur="3s" repeatCount="indefinite" keyTimes="0;.3;.8;1"/></path>
        <path d="M14 34 19 39 28 28" stroke="#16a34a" stroke-width="2.4"><animate attributeName="opacity" values="0;1;1;0" dur="3s" begin=".3s" repeatCount="indefinite" keyTimes="0;.3;.8;1"/></path>
        <path d="M14 50 19 55 28 44" stroke="#d97706" stroke-width="2.4"><animate attributeName="opacity" values="0;1;1;0" dur="3s" begin=".6s" repeatCount="indefinite" keyTimes="0;.3;.8;1"/></path>
      </g>
      <rect x="36" y="15" width="64" height="4" rx="2" fill="#fde68a"/>
      <rect x="36" y="31" width="48" height="4" rx="2" fill="#fef3c7"/>
      <rect x="36" y="47" width="56" height="4" rx="2" fill="#fde68a"/>`
    )}
    ${floatBadge(
      p,
      334,
      60,
      `<g transform="translate(-20,-20)">
        <circle cx="16" cy="16" r="14" fill="none" stroke="url(#${p}ring)" stroke-width="5"><animate attributeName="r" values="13;15;13" dur="2.4s" repeatCount="indefinite"/></circle>
        <circle cx="16" cy="16" r="14" fill="#fff" opacity=".12"/>
        <line x1="26" y1="26" x2="36" y2="36" stroke="url(#${p}ring)" stroke-width="5" stroke-linecap="round"/>
      </g>`,
      3.2,
      ".1s"
    )}`
  );
}

/* ── Digital Marketing — growth-chart panel + megaphone badge ──────────── */
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
      <radialGradient id="${p}glow" cx="74%" cy="38%" r="60%">
        <stop offset="0%" stop-color="#fecdd3" stop-opacity=".4"/>
        <stop offset="100%" stop-color="#fecdd3" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${p}panel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#fff1f3"/>
      </linearGradient>
      <linearGradient id="${p}horn" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#fecdd3"/>
      </linearGradient>
      <filter id="${p}shadow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
    </defs>
    ${sparkles(p, "#fecdd3")}
    ${shadow(p, 258, 140, 96, 10, "#1a0510", 0.4)}
    ${link(336, 58, 266, 68, "#fecdd3")}
    ${floatPanel(
      p,
      206,
      36,
      116,
      72,
      -6,
      `<polyline points="12,52 32,38 50,44 70,20 100,14" stroke="#e11d48" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="100" cy="14" r="3.4" fill="#e11d48"/>
      <rect x="14" y="56" width="10" height="0" fill="#fda4af"><animate attributeName="height" values="0;10;0" dur="2.4s" repeatCount="indefinite"/><animate attributeName="y" values="62;52;62" dur="2.4s" repeatCount="indefinite"/></rect>
      <rect x="30" y="56" width="10" height="0" fill="#fb7185"><animate attributeName="height" values="0;16;0" dur="2.4s" begin=".2s" repeatCount="indefinite"/><animate attributeName="y" values="62;46;62" dur="2.4s" begin=".2s" repeatCount="indefinite"/></rect>
      <rect x="46" y="56" width="10" height="0" fill="#e11d48"><animate attributeName="height" values="0;22;0" dur="2.4s" begin=".4s" repeatCount="indefinite"/><animate attributeName="y" values="62;40;62" dur="2.4s" begin=".4s" repeatCount="indefinite"/></rect>`
    )}
    ${floatBadge(
      p,
      336,
      58,
      `<g transform="translate(-20,-16)">
        <path d="M0 10 L14 3 L14 27 L0 20Z" fill="url(#${p}horn)"/>
        <path d="M14 3 C28 -4 40 6 40 15 C40 24 28 34 14 27Z" fill="url(#${p}horn)"/>
        <path d="M44 8 Q52 15 44 22" stroke="#fecdd3" stroke-width="2" fill="none" opacity=".7"><animate attributeName="opacity" values=".8;.1;.8" dur="1.8s" repeatCount="indefinite"/></path>
      </g>`,
      3.4,
      ".2s"
    )}`
  );
}

/* ── Cloud Computing — sync panel + cloud badge ──────────────────────────── */
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
      <radialGradient id="${p}glow" cx="74%" cy="38%" r="60%">
        <stop offset="0%" stop-color="#bae6fd" stop-opacity=".4"/>
        <stop offset="100%" stop-color="#bae6fd" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${p}panel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#eef9ff"/>
      </linearGradient>
      <linearGradient id="${p}puff" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#dbeefe"/>
      </linearGradient>
      <filter id="${p}shadow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
    </defs>
    ${sparkles(p, "#bae6fd")}
    ${shadow(p, 258, 140, 96, 10, "#02101f", 0.36)}
    ${link(332, 56, 264, 68, "#bae6fd")}
    ${floatPanel(
      p,
      206,
      36,
      116,
      72,
      -6,
      `<rect x="12" y="14" width="92" height="14" rx="4" fill="#e0f2fe"/>
      <circle cx="20" cy="21" r="3" fill="#0ea5e9"/>
      <rect x="12" y="34" width="92" height="14" rx="4" fill="#f0f9ff"/>
      <circle cx="20" cy="41" r="3" fill="#38bdf8"/>
      <g stroke="#0ea5e9" stroke-width="2" stroke-linecap="round">
        <line x1="90" y1="58" x2="90" y2="48"><animate attributeName="opacity" values="1;0" dur="1.6s" repeatCount="indefinite"/></line>
        <polyline points="85,52 90,47 95,52" fill="none"><animate attributeName="opacity" values="1;0" dur="1.6s" repeatCount="indefinite"/></polyline>
      </g>`
    )}
    ${floatBadge(
      p,
      332,
      56,
      `<g transform="translate(-26,-18)">
        <ellipse cx="10" cy="22" rx="10" ry="9" fill="url(#${p}puff)"/>
        <ellipse cx="24" cy="15" rx="14" ry="13" fill="url(#${p}puff)"/>
        <ellipse cx="38" cy="22" rx="9" ry="8" fill="url(#${p}puff)"/>
        <rect x="4" y="20" width="42" height="12" rx="6" fill="url(#${p}puff)"/>
      </g>`,
      3.6,
      ".15s"
    )}`
  );
}

/* ── Web / app development — browser window + phone + code badge ────────── */
function artWebdev(p: string) {
  return wrap(
    p,
    `${p}bg`,
    `${p}glow`,
    `<defs>
      <linearGradient id="${p}bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0b1f4d"/>
        <stop offset="55%" stop-color="#1f56d6"/>
        <stop offset="100%" stop-color="#22a6d3"/>
      </linearGradient>
      <radialGradient id="${p}glow" cx="74%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#bfe3ff" stop-opacity=".45"/>
        <stop offset="100%" stop-color="#bfe3ff" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${p}panel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#E8F1FF"/>
      </linearGradient>
      <linearGradient id="${p}accent" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#5590ff"/>
        <stop offset="100%" stop-color="#22d3ee"/>
      </linearGradient>
      <filter id="${p}shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5"/>
      </filter>
    </defs>
    ${sparkles(p, "#d6ecff")}
    ${shadow(p, 262, 144, 104, 10, "#0b1f4d", 0.4)}
    ${link(330, 52, 290, 70, "#bfe3ff")}
    ${floatPanel(
      p,
      182,
      30,
      150,
      98,
      -4,
      `<path d="M0 10a10 10 0 0 1 10-10h130a10 10 0 0 1 10 10v10H0Z" fill="#DCE9FF"/>
      <circle cx="12" cy="10" r="2.6" fill="#F28B82"/>
      <circle cx="21" cy="10" r="2.6" fill="#F6C86E"/>
      <circle cx="30" cy="10" r="2.6" fill="#72D6C0"/>
      <rect x="44" y="6" width="90" height="8" rx="4" fill="#FFFFFF"/>
      <rect x="12" y="30" width="62" height="7" rx="3.5" fill="#1f56d6"/>
      <rect x="12" y="43" width="86" height="4" rx="2" fill="#B7CCF0"/>
      <rect x="12" y="51" width="70" height="4" rx="2" fill="#CFDDF5"/>
      <rect x="12" y="62" width="30" height="11" rx="5.5" fill="url(#${p}accent)"/>
      <rect x="104" y="30" width="34" height="43" rx="6" fill="#DCE9FF"/>
      <path d="M110 66V54m8 12V46m8 20V58m8 8V50" stroke="#5590ff" stroke-width="4" stroke-linecap="round">
        <animate attributeName="stroke-dasharray" values="0 30;20 30;20 30" dur="2.8s" repeatCount="indefinite"/>
      </path>
      <rect x="12" y="80" width="38" height="10" rx="4" fill="#E8F1FF"/>
      <rect x="54" y="80" width="38" height="10" rx="4" fill="#E8F1FF"/>
      <rect x="96" y="80" width="42" height="10" rx="4" fill="#E8F1FF"/>`
    )}
    ${floatBadge(
      p,
      318,
      72,
      `<g transform="translate(0,0)">
        <rect width="44" height="76" rx="9" fill="#0b1f4d" stroke="#d6ecff" stroke-width="2"/>
        <rect x="5" y="9" width="34" height="58" rx="4" fill="url(#${p}panel)"/>
        <rect x="9" y="14" width="26" height="14" rx="3" fill="url(#${p}accent)"/>
        <rect x="9" y="33" width="26" height="4" rx="2" fill="#B7CCF0"/>
        <rect x="9" y="41" width="18" height="4" rx="2" fill="#CFDDF5"/>
        <rect x="9" y="51" width="26" height="9" rx="4.5" fill="#1f56d6"/>
        <rect x="16" y="3" width="12" height="2.5" rx="1.25" fill="#5b7bb8"/>
      </g>`,
      3.8,
      ".2s"
    )}
    ${floatBadge(
      p,
      196,
      112,
      `<g transform="translate(-4,-4)">
        <rect width="46" height="30" rx="9" fill="#0b1f4d" stroke="#bfe3ff" stroke-width="1.5"/>
        <path d="m15 9-6 6 6 6m16-12 6 6-6 6M26 7l-6 16" stroke="#22d3ee" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </g>`,
      3.4,
      ".5s"
    )}`
  );
}

/* ── Mobile app — two app screens + location/pin badge ──────────────────── */
function artMobile(p: string) {
  const screen = (x: number, y: number, rot: number, dur: number, delay: string, body: string) => `<g transform="rotate(${rot} ${x + 36} ${y + 62})">
      <g transform="translate(${x},${y})">
        <animateTransform attributeName="transform" type="translate" values="${x},${y}; ${x},${y - 5}; ${x},${y}" dur="${dur}s" begin="${delay}" repeatCount="indefinite"/>
        <rect width="72" height="124" rx="13" fill="#0b1f4d" stroke="#d6ecff" stroke-width="2"/>
        <rect x="5" y="5" width="62" height="114" rx="9" fill="url(#${p}panel)"/>
        <rect x="26" y="8" width="20" height="4" rx="2" fill="#0b1f4d" opacity=".85"/>
        ${body}
      </g>
    </g>`;
  return wrap(
    p,
    `${p}bg`,
    `${p}glow`,
    `<defs>
      <linearGradient id="${p}bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0b1f4d"/>
        <stop offset="55%" stop-color="#0f766e"/>
        <stop offset="100%" stop-color="#2dd4bf"/>
      </linearGradient>
      <radialGradient id="${p}glow" cx="74%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#b5f2e2" stop-opacity=".45"/>
        <stop offset="100%" stop-color="#b5f2e2" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${p}panel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#E6F7F4"/>
      </linearGradient>
      <linearGradient id="${p}accent" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#14b8a6"/>
        <stop offset="100%" stop-color="#0369a1"/>
      </linearGradient>
      <filter id="${p}shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5"/>
      </filter>
    </defs>
    ${sparkles(p, "#d6fff6")}
    ${shadow(p, 268, 150, 96, 9, "#0b1f4d", 0.4)}
    ${screen(
      206,
      26,
      -6,
      4,
      "0s",
      `<rect x="11" y="20" width="50" height="30" rx="6" fill="url(#${p}accent)"/>
      <rect x="11" y="56" width="34" height="4" rx="2" fill="#9fd8d0"/>
      <rect x="11" y="64" width="24" height="4" rx="2" fill="#c6e8e3"/>
      <rect x="11" y="76" width="50" height="14" rx="5" fill="#E6F7F4"/>
      <rect x="11" y="94" width="50" height="14" rx="5" fill="#E6F7F4"/>
      <circle cx="19" cy="83" r="3.5" fill="#14b8a6"/>
      <circle cx="19" cy="101" r="3.5" fill="#0369a1"/>`
    )}
    ${screen(
      282,
      40,
      5,
      4.6,
      ".4s",
      `<rect x="11" y="20" width="50" height="6" rx="3" fill="#0f766e"/>
      <rect x="11" y="32" width="50" height="34" rx="6" fill="#d6f2ee"/>
      <path d="M11 58 24 46l10 8 12-14 15 12" stroke="#14b8a6" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="11" y="72" width="50" height="14" rx="5" fill="#E6F7F4"/>
      <rect x="11" y="92" width="50" height="14" rx="7" fill="url(#${p}accent)"/>`
    )}
    ${floatBadge(
      p,
      196,
      112,
      `<g transform="translate(-4,-4)">
        <path d="M14 0C6 0 0 6 0 14c0 10 14 24 14 24s14-14 14-24C28 6 22 0 14 0Z" fill="#FFFFFF"/>
        <circle cx="14" cy="14" r="6" fill="#0f766e"/>
        <circle cx="14" cy="14" r="2.5" fill="#FFFFFF"/>
      </g>`,
      3.4,
      ".3s"
    )}`
  );
}

/* ── E-commerce — storefront/product-grid panel + bag badge ─────────────── */
function artEcommerce(p: string) {
  return wrap(
    p,
    `${p}bg`,
    `${p}glow`,
    `<defs>
      <linearGradient id="${p}bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#2d0a1f"/>
        <stop offset="55%" stop-color="#86198f"/>
        <stop offset="100%" stop-color="#d946ef"/>
      </linearGradient>
      <radialGradient id="${p}glow" cx="74%" cy="38%" r="60%">
        <stop offset="0%" stop-color="#f5d0fe" stop-opacity=".4"/>
        <stop offset="100%" stop-color="#f5d0fe" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${p}panel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#fdf2ff"/>
      </linearGradient>
      <linearGradient id="${p}bag" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#fae8ff"/>
      </linearGradient>
      <filter id="${p}shadow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
    </defs>
    ${sparkles(p, "#fae8ff")}
    ${shadow(p, 258, 140, 96, 10, "#2d0a1f", 0.4)}
    ${link(334, 58, 266, 70, "#f5d0fe")}
    ${floatPanel(
      p,
      206,
      34,
      116,
      76,
      -6,
      `<rect x="12" y="12" width="26" height="26" rx="6" fill="#fae8ff"/>
      <rect x="44" y="12" width="26" height="26" rx="6" fill="#f5d0fe"/>
      <rect x="76" y="12" width="26" height="26" rx="6" fill="#fae8ff"/>
      <rect x="12" y="46" width="90" height="5" rx="2.5" fill="#f5d0fe"/>
      <rect x="12" y="56" width="50" height="5" rx="2.5" fill="#fae8ff"/>
      <rect x="70" y="54" width="32" height="12" rx="6" fill="#d946ef" opacity=".85"/>`
    )}
    ${floatBadge(
      p,
      334,
      58,
      `<g transform="translate(-16,-19)">
        <path d="M10 8 C10 1 20 1 20 8" stroke="url(#${p}bag)" stroke-width="3.6" fill="none" stroke-linecap="round"/>
        <rect y="8" width="32" height="34" rx="7" fill="url(#${p}bag)"/>
        <circle cx="11" cy="24" r="2.6" fill="#86198f"/>
        <circle cx="21" cy="24" r="2.6" fill="#86198f"/>
        <path d="M9 31 Q16 35 23 31" stroke="#86198f" stroke-width="2" stroke-linecap="round" fill="none"/>
      </g>`,
      3.4,
      ".25s"
    )}`
  );
}

/* ── Travel — route/map panel + hill-station pin badge ──────────────────── */
function artTravel(p: string) {
  return wrap(
    p,
    `${p}bg`,
    `${p}glow`,
    `<defs>
      <linearGradient id="${p}bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0c2b24"/>
        <stop offset="55%" stop-color="#0f766e"/>
        <stop offset="100%" stop-color="#f59e0b"/>
      </linearGradient>
      <radialGradient id="${p}glow" cx="74%" cy="36%" r="60%">
        <stop offset="0%" stop-color="#fde68a" stop-opacity=".45"/>
        <stop offset="100%" stop-color="#fde68a" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${p}panel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#ecfdf5"/>
      </linearGradient>
      <linearGradient id="${p}pin" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#d1fae5"/>
      </linearGradient>
      <filter id="${p}shadow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
    </defs>
    ${sparkles(p, "#fde68a")}
    <circle cx="340" cy="34" r="14" fill="#fde68a" opacity=".85"><animate attributeName="opacity" values=".6;1;.6" dur="3s" repeatCount="indefinite"/></circle>
    ${shadow(p, 258, 140, 96, 10, "#0c2b24", 0.38)}
    ${link(330, 58, 264, 68, "#fde68a")}
    ${floatPanel(
      p,
      206,
      36,
      116,
      72,
      -6,
      `<polyline points="12,50 32,30 54,38 76,16 102,24" stroke="#0f766e" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="4 4"/>
      <circle cx="12" cy="50" r="3.4" fill="#0f766e"/>
      <circle cx="54" cy="38" r="3.4" fill="#f59e0b"/>
      <circle cx="102" cy="24" r="3.4" fill="#0f766e"/>
      <rect x="12" y="58" width="48" height="5" rx="2.5" fill="#d1fae5"/>`
    )}
    ${floatBadge(
      p,
      330,
      58,
      `<g transform="translate(-16,-32)">
        <path d="M16 0C7 0 0 7 0 16c0 12 16 28 16 28s16-16 16-28C32 7 25 0 16 0Z" fill="url(#${p}pin)"/>
        <circle cx="16" cy="16" r="7" fill="#0f766e"/>
        <circle cx="16" cy="16" r="3" fill="#fff"/>
      </g>`,
      3.2,
      ".3s"
    )}`
  );
}

/* ── Platform / admin dashboard — chart panel + check badge ──────────────── */
function artPlatform(p: string) {
  return wrap(
    p,
    `${p}bg`,
    `${p}glow`,
    `<defs>
      <linearGradient id="${p}bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1e1b4b"/>
        <stop offset="55%" stop-color="#4338ca"/>
        <stop offset="100%" stop-color="#818cf8"/>
      </linearGradient>
      <radialGradient id="${p}glow" cx="74%" cy="38%" r="60%">
        <stop offset="0%" stop-color="#c7d2fe" stop-opacity=".4"/>
        <stop offset="100%" stop-color="#c7d2fe" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${p}panel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#eef0ff"/>
      </linearGradient>
      <filter id="${p}shadow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
    </defs>
    ${sparkles(p, "#c7d2fe")}
    ${shadow(p, 258, 142, 100, 10, "#1e1b4b", 0.4)}
    ${link(336, 60, 266, 72, "#c7d2fe")}
    ${floatPanel(
      p,
      204,
      34,
      120,
      78,
      -5,
      `<rect x="12" y="12" width="60" height="5" rx="2.5" fill="#c7d2fe"/>
      <rect x="12" y="22" width="40" height="4" rx="2" fill="#e0e7ff"/>
      <g opacity=".85">
        <rect x="14" y="48" width="9" height="16" rx="2" fill="#a5b4fc"/>
        <rect x="27" y="38" width="9" height="26" rx="2" fill="#818cf8"/>
        <rect x="40" y="30" width="9" height="34" rx="2" fill="#4338ca">
          <animate attributeName="height" values="34;40;34" dur="2.4s" repeatCount="indefinite"/>
          <animate attributeName="y" values="30;24;30" dur="2.4s" repeatCount="indefinite"/>
        </rect>
      </g>
      <circle cx="92" cy="44" r="18" fill="none" stroke="#e0e7ff" stroke-width="4"/>
      <circle cx="92" cy="44" r="18" fill="none" stroke="#4338ca" stroke-width="4" stroke-linecap="round" stroke-dasharray="76 113" transform="rotate(-90 92 44)">
        <animate attributeName="stroke-dasharray" values="0 113;60 113;60 113" dur="2.6s" repeatCount="indefinite"/>
      </circle>`
    )}
    ${floatBadge(
      p,
      336,
      60,
      `<g transform="translate(-18,-18)">
        <circle cx="18" cy="18" r="18" fill="#fff" opacity=".16"/>
        <circle cx="18" cy="18" r="13" fill="#fff"/>
        <path d="M11 18 16 23 25 12" stroke="#4338ca" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </g>`,
      3.4,
      ".1s"
    )}`
  );
}

const ART: Record<CardArtKey, (p: string) => string> = {
  ml: artML,
  cyber: artCyber,
  testing: artTesting,
  marketing: artMarketing,
  cloud: artCloud,
  webdev: artWebdev,
  mobile: artMobile,
  ecommerce: artEcommerce,
  travel: artTravel,
  platform: artPlatform,
};

/** Look up art by an explicit key (e.g. for data that already knows its own
 * category) rather than inferring one from a free-text title/keyword. */
export function getCardArtByKey(key: CardArtKey, idSeed: string): { key: CardArtKey; svg: string } {
  const id = "pca" + idSeed.replace(/[^a-zA-Z0-9]/g, "");
  return { key, svg: ART[key](id) };
}

/** idSeed must be stable across server/client render (e.g. React's useId()). */
export function getProjectCardArt(titleOrKey: string, idSeed: string): { key: CardArtKey; svg: string } {
  const courseKey = getCourseIconKey(titleOrKey);
  const key = toArtKey(courseKey);
  const id = "pca" + idSeed.replace(/[^a-zA-Z0-9]/g, "");
  return { key, svg: ART[key](id) };
}
