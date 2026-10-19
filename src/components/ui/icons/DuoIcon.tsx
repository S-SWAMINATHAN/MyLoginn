"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * The mobile menu icons: solid, filled glyphs, one modern colour each. Details (the door, the check, the eyes) are cut
 * out in white so every icon reads as a single confident silhouette. On mount the icon pops in with a small spring;
 * `delay` staggers it down the list.
 */
type Glyph = { color: string; shape: ReactNode };

const W = { stroke: "#fff", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;
const C = { stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;

const briefcase: ReactNode = (
  <>
    <path fillRule="evenodd" d="M9 4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1h4a2 2 0 0 1 2 2v4H3V7a2 2 0 0 1 2-2h4V4zm2 0v1h2V4h-2z" />
    <path d="M3 13h7v1.5a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V13h7v5a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-5z" />
  </>
);

export const MENU_ICONS = {
  home: {
    color: "#6366f1",
    shape: <path d="M11.3 2.3a1 1 0 0 1 1.4 0l9 8.2a1 1 0 0 1-.7 1.7h-1V20a2 2 0 0 1-2 2h-3.5v-6.5a1.5 1.5 0 0 0-1.5-1.5h-2a1.5 1.5 0 0 0-1.5 1.5V22H6a2 2 0 0 1-2-2v-7.8H3a1 1 0 0 1-.7-1.7l9-8.2z" />,
  },
  about: {
    color: "#0ea5e9",
    shape: <path fillRule="evenodd" d="M4 3a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v6h4a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3zm3 2v2h2V5H7zm4 0v2h2V5h-2zM7 9v2h2V9H7zm4 0v2h2V9h-2zM7 13v2h2v-2H7zm4 0v2h2v-2h-2zm6-1v2h1v-2h-1zm0 4v2h1v-2h-1zM9 19v3h3v-3H9z" />,
  },
  marketing: {
    color: "#f43f5e",
    shape: (
      <>
        <path d="M20 4a1 1 0 0 0-1.5-.86L10 8H5a3 3 0 0 0-3 3v1a3 3 0 0 0 3 3h.4l1.2 4.6a1.5 1.5 0 0 0 1.45 1.1h1.2a1 1 0 0 0 .97-1.25L9.4 15.3l9.1 4.9A1 1 0 0 0 20 19.3V4z" />
        <path d="M22 9.5v4" {...C} />
      </>
    ),
  },
  web: {
    color: "#8b5cf6",
    shape: (
      <>
        <rect x="2.5" y="3" width="19" height="18" rx="3.5" />
        <path d="m9.5 9.5-3 2.5 3 2.5M14.5 9.5l3 2.5-3 2.5" {...W} />
      </>
    ),
  },
  ai: {
    color: "#06b6d4",
    shape: (
      <>
        <path d="M12 2a1.6 1.6 0 0 1 .85 2.96V6.5H17a4 4 0 0 1 4 4V17a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-6.5a4 4 0 0 1 4-4h4.15V4.96A1.6 1.6 0 0 1 12 2z" />
        <path d="M9 11a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" fill="#fff" />
        <path d="M9.5 17.2h5" {...W} />
      </>
    ),
  },
  testing: {
    color: "#10b981",
    shape: (
      <>
        <path d="M12 2.2 20 5v6.2c0 5-3.3 9.3-8 10.8-4.7-1.5-8-5.8-8-10.8V5l8-2.8z" />
        <path d="m8.4 12 2.6 2.6 4.6-5" {...W} strokeWidth={2.1} />
      </>
    ),
  },
  projects: {
    color: "#f59e0b",
    shape: <path d="M3 6a2 2 0 0 1 2-2h4.2a2 2 0 0 1 1.5.7L12 6h7a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6z" />,
  },
  careers: { color: "#ec4899", shape: briefcase },
  internships: { color: "#ec4899", shape: briefcase },
  courses: {
    color: "#14b8a6",
    shape: <path d="M12 6.2C10.4 5 8.2 4.5 5.5 4.5A2.5 2.5 0 0 0 3 7v11c0 .6.5 1 1 1 2.6 0 5 .3 7.2 1.8.25.15.55.2.8.2V6.2zm0 0c1.6-1.2 3.8-1.7 6.5-1.7A2.5 2.5 0 0 1 21 7v11c0 .6-.5 1-1 1-2.6 0-5 .3-7.2 1.8-.25.15-.55.2-.8.2V6.2z" />,
  },
  practice: {
    color: "#f97316",
    shape: (
      <>
        <path d="M12 2a4 4 0 0 0-4 4v5a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4z" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" {...C} />
      </>
    ),
  },
  logiquest: {
    color: "#a855f7",
    shape: (
      <>
        <rect x="2.5" y="3" width="19" height="18" rx="3.5" />
        <path d="m7.5 9.5 3 2.5-3 2.5M12.5 15h4" {...W} />
      </>
    ),
  },
  leaderboard: {
    color: "#eab308",
    shape: (
      <>
        <path d="M7 3h10v6a5 5 0 0 1-10 0V3z" />
        <path d="M7 5H4.5v1.2A3 3 0 0 0 7.5 9.2M17 5h2.5v1.2a3 3 0 0 1-3 3" {...C} strokeWidth={1.8} />
        <path d="M10.5 14h3v3H16a1 1 0 0 1 1 1v3H7v-3a1 1 0 0 1 1-1h2.5v-3z" />
      </>
    ),
  },
  contact: {
    color: "#3b82f6",
    shape: (
      <>
        <rect x="2" y="4" width="20" height="16" rx="3" />
        <path d="m3.5 7.5 8.5 5.5 8.5-5.5" {...W} />
      </>
    ),
  },
} satisfies Record<string, Glyph>;

export type MenuIconKey = keyof typeof MENU_ICONS;

export function DuoIcon({ name, delay = 0, className }: { name: MenuIconKey; delay?: number; className?: string }) {
  const { color, shape } = MENU_ICONS[name];
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center" style={{ color, ["--icon-delay" as string]: `${delay}s` }}>
      <svg viewBox="0 0 24 24" aria-hidden className={cn("icon-solid h-[28px] w-[28px]", className)} fill="currentColor">
        {shape}
      </svg>
    </span>
  );
}
