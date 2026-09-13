"use client";

import { Chapter } from "@/components/experience/Chapter";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { Pipeline } from "@/components/sections/parts/Pipeline";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { useScrollStep } from "@/lib/useScrollStep";

const AGENTS = [
  { n: "01", label: "Research", desc: "Gathers and structures information" },
  { n: "02", label: "Customer Support", desc: "Answers, routes and resolves" },
  { n: "03", label: "Workflow Automation", desc: "Runs the repeatable steps" },
  { n: "04", label: "Data Analysis", desc: "Finds the pattern in the numbers" },
  { n: "05", label: "Testing", desc: "Checks the work before it ships" },
  { n: "06", label: "Content Generation", desc: "Drafts, variants and copy" },
  { n: "07", label: "Business Operations", desc: "Keeps the process moving" },
];

const FLOW = ["User request", "Research agent", "Analysis agent", "Decision agent", "Automation agent"];
const FLOW_BRANCH = ["Validation agent", "Final result"];

export function AgentsStory() {
  const { ref: flowRef, activeStep } = useScrollStep(FLOW.length + FLOW_BRANCH.length);

  return (
    <Chapter formation="orbitHub" variant="agents" id="agents" title="AI agents">
      <div className="mx-auto w-full max-w-5xl px-5 text-center sm:px-8">
        <Reveal>
          <span className="story-eyebrow justify-center">AI agents</span>
        </Reveal>

        <SplitHeadline
          as="h2"
          text="AI agents that work together."
          className="story-subheading mx-auto mt-4 max-w-2xl text-story-navy"
        />

        <Reveal direction="up" delay={0.15}>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted sm:text-base">
            One request can pass through several specialized agents &mdash; each doing its part and handing off
            to the next &mdash; before a result ever reaches a person.
          </p>
        </Reveal>

        <RevealGroup className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4" stagger={0.06}>
          {AGENTS.map((a) => (
            <RevealItem key={a.n}>
              <div className="story-panel flex h-full flex-col items-center gap-1 rounded-2xl px-3 py-4 text-center">
                <span className="text-[10px] font-bold tracking-widest text-brand-400">AGENT {a.n}</span>
                <span className="text-sm font-semibold text-story-navy">{a.label}</span>
                <span className="text-[10.5px] leading-snug text-muted">{a.desc}</span>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        <div ref={flowRef} className="mt-14">
          <p className="story-eyebrow mb-4 justify-center">Example workflow</p>
          <Pipeline steps={FLOW} branch={FLOW_BRANCH} activeIndex={activeStep} />
        </div>

        <Reveal direction="up" delay={0.1} className="mt-10">
          <Button href="/services/app-web-development" variant="outline">
            Build an agent workflow
          </Button>
        </Reveal>
      </div>
    </Chapter>
  );
}
