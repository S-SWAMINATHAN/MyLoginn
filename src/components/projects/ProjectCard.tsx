"use client";

import { useRef } from "react";
import type { PointerEvent } from "react";
import { gsap } from "gsap";
import { Card } from "@/components/ui/Card";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { AnimatedTrending } from "@/components/ui/icons/AnimatedTrending";
import { AnimatedUsers } from "@/components/ui/icons/AnimatedUsers";
import { getCourseIconInfo } from "@/lib/courseIcons";
import { useReducedMotion } from "@/lib/useReducedMotion";
import type { ShowcaseProject } from "@/lib/showcaseProjects";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const AVATAR_COLORS = [
  "linear-gradient(135deg,#7c3aed,#c084fc)",
  "linear-gradient(135deg,#0ea5e9,#7dd3fc)",
  "linear-gradient(135deg,#059669,#6ee7b7)",
  "linear-gradient(135deg,#e11d48,#fda4af)",
  "linear-gradient(135deg,#d97706,#fde68a)",
  "linear-gradient(135deg,#4f46e5,#a5b4fc)",
];

/** Deterministic (not index-based) so the same student always gets the same
 * avatar color, no matter which category filter they show up under. */
function hashIndex(str: string, mod: number) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % mod;
}

export function ProjectCard({ project: p, className }: { project: ShowcaseProject; className?: string }) {
  const reducedMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const quickRotX = useRef<((v: number) => void) | null>(null);
  const quickRotY = useRef<((v: number) => void) | null>(null);

  const primaryTag = p.tags[0] ?? p.title;
  const visual = getCourseIconInfo(primaryTag, `card-${p.id}`);
  const avatar = AVATAR_COLORS[hashIndex(p.student, AVATAR_COLORS.length)];

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (reducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    cardRef.current.style.setProperty("--spot-x", `${px * 100}%`);
    cardRef.current.style.setProperty("--spot-y", `${py * 100}%`);

    quickRotX.current ??= gsap.quickTo(cardRef.current, "rotateY", { duration: 0.4, ease: "power3.out" });
    quickRotY.current ??= gsap.quickTo(cardRef.current, "rotateX", { duration: 0.4, ease: "power3.out" });
    quickRotX.current((px - 0.5) * 10);
    quickRotY.current((py - 0.5) * -10);
  }

  function handlePointerLeave() {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, { rotateX: 0, rotateY: 0, duration: 0.5, ease: "power3.out" });
  }

  return (
    <div className={className} style={{ perspective: 1200 }}>
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="group h-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        <Card className="card-shine relative flex h-full flex-col overflow-hidden transition-shadow duration-300 group-hover:shadow-[var(--shadow-lift)]">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(420px circle at var(--spot-x, 50%) var(--spot-y, 50%), color-mix(in srgb, var(--brand-400) 16%, transparent), transparent 70%)",
            }}
          />

          {/* Category banner */}
          <div
            className="relative flex h-36 shrink-0 items-center overflow-hidden px-6"
            style={{ background: visual.gradient }}
          >
            <span className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <span className="pointer-events-none absolute -left-6 -bottom-10 h-32 w-32 rounded-full bg-black/20 blur-2xl" />
            <span className="absolute right-4 top-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/90 text-brand-600 shadow-[var(--shadow-soft)] transition-transform duration-300 group-hover:scale-110">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
                <path d="M7 17 17 7M17 7H9M17 7v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="relative flex items-center gap-3 text-white">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <ContentIcon keyword={primaryTag} className="h-7 w-7" />
              </span>
              <p className="truncate text-lg font-semibold leading-snug">{p.title}</p>
            </div>
          </div>

          <div className="relative z-10 flex flex-1 flex-col p-6">
            <span
              className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{
                background: `color-mix(in srgb, ${visual.accent} 14%, transparent)`,
                color: visual.accent,
              }}
            >
              <ContentIcon keyword={primaryTag} className="h-4 w-4" />
              {primaryTag}
            </span>

            <h3 className="mt-3 text-base font-semibold leading-snug transition-colors duration-300 group-hover:text-brand-500">
              {p.title}
            </h3>
            <p className="mt-2 flex-1 text-sm text-muted">{p.description}</p>

            <div className="mt-5 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white transition-transform duration-300 group-hover:scale-110"
                  style={{ background: avatar }}
                >
                  {initials(p.student)}
                </span>
                <p className="truncate text-xs font-medium text-foreground">{p.student}</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-foreground/80">
                <AnimatedUsers className="h-4 w-4" />
                {p.mentor}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-xl bg-success/10 px-3 py-2.5 text-xs font-semibold text-success">
              <AnimatedTrending className="h-5 w-5 shrink-0" />
              {p.result}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
