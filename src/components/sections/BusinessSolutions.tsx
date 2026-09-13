"use client";

import { ArrowRight, ShoppingCart, Package, CalendarCheck, Users, Rocket, TrendingUp, GraduationCap, BadgeCheck, Building2, LayoutDashboard, type LucideIcon } from "lucide-react";
import { Chapter } from "@/components/experience/Chapter";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

const SCENARIOS: {
  from: string;
  to: string;
  impact: string;
  accent: string;
  icons: LucideIcon[];
}[] = [
  { from: "Retail", to: "Digital commerce", impact: "Sell and manage stock online", accent: "#1f56d6", icons: [ShoppingCart, Package] },
  { from: "Service business", to: "Custom platform", impact: "Bookings and clients in one place", accent: "#0891b2", icons: [CalendarCheck, Users] },
  { from: "Startup", to: "Scalable product", impact: "Ship fast without rebuilding later", accent: "#9333ea", icons: [Rocket, TrendingUp] },
  { from: "Education", to: "Learning platform", impact: "Courses, tracking and certificates", accent: "#d97706", icons: [GraduationCap, BadgeCheck] },
  { from: "Enterprise", to: "Business software", impact: "Systems that fit existing workflows", accent: "#0b1f4d", icons: [Building2, LayoutDashboard] },
];

function FloatingIcon({ Icon, accent, delay }: { Icon: LucideIcon; accent: string; delay: number }) {
  return (
    <span
      className="animate-float flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-surface"
      style={{
        background: `${accent}14`,
        color: accent,
        boxShadow: "var(--shadow-soft)",
        animationDelay: `${delay}s`,
      }}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </span>
  );
}

export function BusinessSolutions() {
  return (
    <Chapter formation="grid" variant="business" id="solutions" title="Business solutions">
      <div className="mx-auto w-full max-w-6xl px-5 text-center sm:px-8">
        <Reveal>
          <span className="story-eyebrow justify-center">Business solutions</span>
        </Reveal>

        <SplitHeadline
          as="h2"
          text="Real businesses. Real outcomes."
          className="story-subheading mx-auto mt-4 max-w-xl text-story-navy"
        />

        <Reveal direction="up" delay={0.15}>
          <p className="mx-auto mt-4 max-w-lg text-sm text-muted sm:text-base">
            The technology changes shape depending on the problem &mdash; the standard of work doesn&apos;t.
          </p>
        </Reveal>

        <RevealGroup
          className="no-scrollbar mx-auto mt-12 flex snap-x gap-4 overflow-x-auto px-1 pb-3 sm:grid sm:grid-cols-5 sm:overflow-visible"
          stagger={0.07}
        >
          {SCENARIOS.map((s, i) => (
            <RevealItem key={s.from} className="w-[14rem] shrink-0 snap-start sm:w-auto">
              <div className="card-shine group relative flex h-full flex-col items-start gap-3 overflow-hidden rounded-2xl border border-border-soft bg-surface p-5 text-left transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[var(--shadow-lift)]">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl transition-opacity duration-300 group-hover:opacity-80"
                  style={{ background: s.accent, opacity: 0.12 }}
                />

                <div className="relative flex w-full items-start justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{s.from}</span>
                  <div className="flex -space-x-2">
                    {s.icons.map((Icon, j) => (
                      <FloatingIcon key={j} Icon={Icon} accent={s.accent} delay={i * 0.12 + j * 0.25} />
                    ))}
                  </div>
                </div>

                <span className="relative inline-flex items-center gap-1.5 text-sm font-semibold text-story-navy">
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" style={{ color: s.accent }} aria-hidden />
                  {s.to}
                </span>
                <span className="relative text-xs leading-snug text-muted">{s.impact}</span>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </Chapter>
  );
}
