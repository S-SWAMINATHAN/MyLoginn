"use client";

import { Chapter } from "@/components/experience/Chapter";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { Pipeline } from "@/components/sections/parts/Pipeline";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

const STAGES = ["Understand", "Analyze", "Generate", "Automate", "Optimize"];

export function AiStory() {
  return (
    <Chapter formation="orbitHub" variant="ai" id="ai" title="AI and generative AI">
      <div className="mx-auto w-full max-w-3xl px-5 text-center sm:px-8">
        <Reveal>
          <span className="story-eyebrow justify-center">AI &amp; generative AI</span>
        </Reveal>

        <SplitHeadline as="h2" text="Add intelligence." className="story-heading mx-auto mt-4 text-story-navy" />

        <Reveal direction="up" delay={0.15}>
          <p className="mx-auto mt-5 max-w-lg text-sm text-muted sm:text-base">
            We build AI into the software itself &mdash; understanding data, generating content, and making
            decisions inside the tools your team already uses. Not a chatbot bolted on the side.
          </p>
        </Reveal>

        <Reveal direction="up" delay={0.3} className="mt-10">
          <Pipeline steps={STAGES} />
        </Reveal>

        <Reveal direction="up" delay={0.45} className="mt-8">
          <Button href="/services/digital-marketing" variant="outline">
            See AI-driven growth
          </Button>
        </Reveal>
      </div>
    </Chapter>
  );
}
