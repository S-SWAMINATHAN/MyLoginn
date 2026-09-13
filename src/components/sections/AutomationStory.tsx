"use client";

import { Check, X } from "lucide-react";
import { Chapter } from "@/components/experience/Chapter";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { Pipeline } from "@/components/sections/parts/Pipeline";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { useScrollStep } from "@/lib/useScrollStep";

const FLOW = ["Human action", "AI agent", "Workflow", "API", "Database", "Notification", "Result"];

const MANUAL = ["Repetitive data entry", "Slow handoffs between tools", "Easy to forget a step"];
const AUTOMATED = ["Triggers run themselves", "Systems stay in sync", "Nothing falls through"];

export function AutomationStory() {
  const { ref: flowRef, activeStep } = useScrollStep(FLOW.length);

  return (
    <Chapter formation="stream" variant="automation" title="Automation">
      <div className="mx-auto w-full max-w-4xl px-5 text-center sm:px-8">
        <Reveal>
          <span className="story-eyebrow justify-center">Automation</span>
        </Reveal>

        <SplitHeadline
          as="h2"
          text="Less manual work. More done."
          className="story-subheading mx-auto mt-4 max-w-xl text-story-navy"
        />

        <Reveal direction="up" delay={0.15}>
          <p className="mx-auto mt-4 max-w-lg text-sm text-muted sm:text-base">
            We replace the repetitive parts of a process with workflows that just run &mdash; so people spend
            time on judgment calls, not busywork.
          </p>
        </Reveal>

        <Reveal direction="up" delay={0.3}>
          <div className="mx-auto mt-10 grid max-w-xl grid-cols-1 gap-3 text-left sm:grid-cols-2">
            <div className="card-shine story-panel relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-muted">Manual process</p>
              <RevealGroup className="mt-3 space-y-2" stagger={0.08}>
                {MANUAL.map((m) => (
                  <RevealItem key={m} className="flex items-start gap-2.5 text-sm text-muted">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-danger/10">
                      <X className="h-3 w-3 text-danger" aria-hidden />
                    </span>
                    {m}
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>
            <div
              className="card-shine story-panel relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1"
              style={{ borderColor: "var(--brand-200)" }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-story-royal">Automated process</p>
              <RevealGroup className="mt-3 space-y-2" stagger={0.08}>
                {AUTOMATED.map((a) => (
                  <RevealItem key={a} className="flex items-start gap-2.5 text-sm text-foreground">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/10">
                      <Check className="h-3 w-3 text-success" aria-hidden />
                    </span>
                    {a}
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>
          </div>
        </Reveal>

        <div ref={flowRef} className="mt-12">
          <Pipeline steps={FLOW} activeIndex={activeStep} />
        </div>

        <Reveal direction="up" delay={0.1} className="mt-10">
          <Button href="/services/app-web-development" variant="outline">
            Automate a workflow
          </Button>
        </Reveal>
      </div>
    </Chapter>
  );
}
