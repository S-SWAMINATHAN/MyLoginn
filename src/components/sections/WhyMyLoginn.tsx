"use client";

import { Chapter } from "@/components/experience/Chapter";
import { CrystalScrim } from "@/components/experience/CrystalScrim";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

const PILLARS = [
  { label: "Intelligence", desc: "AI and data built into how we work, not bolted on after." },
  { label: "Innovation", desc: "Modern engineering, applied without the hype." },
  { label: "Integrity", desc: "Clear scope, honest timelines, real communication." },
  { label: "Impact", desc: "Judged by what changes for your business, not the invoice." },
];

export function WhyMyLoginn() {
  return (
    <Chapter formation="crystal" variant="why" id="about" title="Why MyLoginn">
      <div className="relative mx-auto w-full max-w-4xl px-5 text-center sm:px-8">
        <CrystalScrim />

        <Reveal>
          <span className="story-eyebrow justify-center">Why MyLoginn</span>
        </Reveal>

        <SplitHeadline
          as="h2"
          text="Four principles behind every project."
          className="story-subheading mx-auto mt-4 max-w-xl text-story-navy"
        />

        <RevealGroup className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-3.5 sm:grid-cols-4" stagger={0.08}>
          {PILLARS.map((p) => (
            <RevealItem key={p.label}>
              <div className="story-panel flex h-full flex-col items-center gap-2 rounded-2xl px-4 py-6 text-center">
                <span className="brand-gradient-text text-sm font-bold uppercase tracking-[0.14em]">{p.label}</span>
                <span className="text-xs leading-snug text-muted">{p.desc}</span>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </Chapter>
  );
}
