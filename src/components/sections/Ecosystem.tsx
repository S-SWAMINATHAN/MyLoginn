"use client";

import { Chapter } from "@/components/experience/Chapter";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

const NODES = [
  { label: "Web", desc: "Sites & platforms" },
  { label: "App", desc: "iOS & Android" },
  { label: "Desktop & Software", desc: "Custom business tools" },
  { label: "AI", desc: "Generative & applied" },
  { label: "AI Agents", desc: "Autonomous workflows" },
  { label: "Automation", desc: "Fewer manual steps" },
  { label: "Testing", desc: "Quality engineering" },
  { label: "Training", desc: "Courses & mentoring" },
];

export function Ecosystem() {
  return (
    <Chapter formation="network" variant="ecosystem" id="ecosystem" title="What MyLoginn builds">
      <div className="mx-auto w-full max-w-5xl px-5 text-center sm:px-8">
        <Reveal>
          <span className="story-eyebrow justify-center">What we build</span>
        </Reveal>

        <SplitHeadline
          as="h2"
          text="One ecosystem. Every layer your business needs."
          className="story-subheading mx-auto mt-4 max-w-2xl text-story-navy"
        />

        <Reveal direction="up" delay={0.15}>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted sm:text-base">
            Web, mobile, software, AI and training aren&apos;t separate vendors here &mdash; they&apos;re one connected
            team working from the same playbook.
          </p>
        </Reveal>

        <RevealGroup className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4" stagger={0.07}>
          <RevealItem className="sm:col-start-2 sm:row-start-2">
            <div className="story-panel flex h-full flex-col items-center justify-center rounded-2xl px-4 py-6 shadow-[var(--shadow-lift)]">
              <span className="brand-gradient-text text-lg font-bold tracking-tight sm:text-xl">MyLoginn</span>
              <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted">Core</span>
            </div>
          </RevealItem>

          {NODES.map((n) => (
            <RevealItem key={n.label}>
              <NodeChip label={n.label} desc={n.desc} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </Chapter>
  );
}

function NodeChip({ label, desc, className }: { label: string; desc: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex h-full flex-col items-center justify-center rounded-2xl border border-border-soft bg-surface/80 px-3 py-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-[var(--shadow-soft)]",
        className
      )}
    >
      <span className="text-sm font-semibold text-foreground sm:text-base">{label}</span>
      <span className="mt-1 text-[10.5px] text-muted sm:text-xs">{desc}</span>
    </div>
  );
}
