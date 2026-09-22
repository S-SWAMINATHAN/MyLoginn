"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Chapter } from "@/components/experience/Chapter";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { useTiltSpotlight } from "@/hooks/useTiltSpotlight";

const NODES = [
  { label: "Web Development", desc: "Sites & platforms" },
  { label: "Mobile Apps", desc: "iOS & Android" },
  { label: "Custom Software", desc: "Software shaped to fit" },
  { label: "Digital Marketing", desc: "Growth & visibility" },
  { label: "Automation Testing", desc: "Quality engineering" },
  { label: "Tutoring", desc: "Personalized learning" },
  { label: "Mentoring", desc: "Guidance that compounds" },
  { label: "Placement Support", desc: "From skills to opportunity" },
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

        <RevealGroup className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-3 sm:gap-4" stagger={0.07}>
          <RevealItem className="col-span-2 sm:col-span-1 sm:col-start-2 sm:row-start-2">
            <div className="story-panel flex h-full min-h-24 flex-col items-center justify-center rounded-2xl px-4 py-6 shadow-[var(--shadow-lift)]">
              <span className="brand-gradient-text text-lg font-bold tracking-tight sm:text-xl">MyLoginn</span>
              <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted">Core</span>
            </div>
          </RevealItem>
          {NODES.map((n) => (
            <RevealItem key={n.label}>
              <NodeChip {...n} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </Chapter>
  );
}

function NodeChip({ label, desc, className }: { label: string; desc: string; className?: string }) {
  const { rotateX, rotateY, spotlightBg, onMouseMove, onMouseLeave } = useTiltSpotlight();
  const [hovered, setHovered] = useState(false);
  return (
    <motion.article
      onMouseMove={(event) => { setHovered(true); onMouseMove(event); }}
      onMouseLeave={() => { setHovered(false); onMouseLeave(); }}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={cn(
        "group relative flex h-full min-h-24 flex-col items-center justify-center overflow-hidden rounded-2xl border border-border-soft bg-surface/90 px-3 py-5 text-center transition-[border-color,box-shadow] duration-300 hover:border-brand-300 hover:shadow-[0_16px_34px_-18px_rgba(31,86,214,0.6)]",
        className
      )}
    >
      <motion.span aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: spotlightBg, opacity: hovered ? 1 : 0 }} transition={{ duration: 0.22 }} />
      <span className="relative z-10 text-sm font-semibold text-foreground sm:text-base">{label}</span>
      <span className="relative z-10 mt-1 text-[10.5px] text-muted sm:text-xs">{desc}</span>
    </motion.article>
  );
}
