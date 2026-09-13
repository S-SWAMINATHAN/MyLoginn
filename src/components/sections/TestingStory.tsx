"use client";

import { ShieldCheck } from "lucide-react";
import { Chapter } from "@/components/experience/Chapter";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { Pipeline } from "@/components/sections/parts/Pipeline";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { useScrollStep } from "@/lib/useScrollStep";

const FLOW = ["Build", "Test", "Validate", "Fix", "Retest", "Release"];
const CHECKS = ["Test cases", "API validation", "UI testing", "Automation", "Regression"];

export function TestingStory() {
  const { ref: flowRef, activeStep } = useScrollStep(FLOW.length);

  return (
    <Chapter formation="stream" variant="testing" title="Testing and quality engineering">
      <div className="mx-auto w-full max-w-3xl px-5 text-center sm:px-8">
        <Reveal>
          <span className="story-eyebrow justify-center">Testing &amp; quality</span>
        </Reveal>

        <SplitHeadline
          as="h2"
          text="Shipped with confidence, not crossed fingers."
          className="story-subheading mx-auto mt-4 max-w-xl text-story-navy"
        />

        <Reveal direction="up" delay={0.15}>
          <p className="mx-auto mt-4 max-w-lg text-sm text-muted sm:text-base">
            Every build goes through real quality checks before release &mdash; not just a quick look before
            shipping.
          </p>
        </Reveal>

        <div ref={flowRef} className="mt-10">
          <Pipeline steps={FLOW} activeIndex={activeStep} />
        </div>

        <RevealGroup className="mx-auto mt-10 flex max-w-lg flex-wrap justify-center gap-2.5" stagger={0.06}>
          {CHECKS.map((c) => (
            <RevealItem key={c}>
              <span className="card-shine glass-panel relative inline-flex items-center gap-1.5 overflow-hidden rounded-full px-3.5 py-1.5 text-xs font-medium text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success/10">
                  <ShieldCheck className="h-2.5 w-2.5 text-success" aria-hidden />
                </span>
                {c}
              </span>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </Chapter>
  );
}
