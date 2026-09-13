"use client";

import { Chapter } from "@/components/experience/Chapter";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { Pipeline } from "@/components/sections/parts/Pipeline";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

const TRACKS = [
  "Generative AI",
  "Agentic AI",
  "Data Analytics",
  "Full-Stack Development",
  "Testing & Automation",
  "Cloud & DevOps",
  "Digital Marketing",
  "Cybersecurity",
  "CBSE / State Board Tutoring",
];

const JOURNEY = ["Learn", "Practice", "Build", "Test", "Deploy", "Grow"];

export function Education() {
  return (
    <Chapter formation="tree" variant="education" id="training" title="Education and training">
      <div className="mx-auto w-full max-w-4xl px-5 text-center sm:px-8">
        <Reveal>
          <span className="story-eyebrow justify-center">Education &amp; training</span>
        </Reveal>

        <SplitHeadline
          as="h2"
          text="One idea grows into a whole skillset."
          className="story-subheading mx-auto mt-4 max-w-xl text-story-navy"
        />

        <Reveal direction="up" delay={0.15}>
          <p className="mx-auto mt-4 max-w-lg text-sm text-muted sm:text-base">
            Practical, mentor-led courses and 1:1 tutoring &mdash; the same technology we build with, taught the
            way it&apos;s actually used.
          </p>
        </Reveal>

        <RevealGroup className="mx-auto mt-10 flex max-w-2xl flex-wrap justify-center gap-2.5" stagger={0.05}>
          {TRACKS.map((t) => (
            <RevealItem key={t}>
              <span className="inline-flex rounded-full border border-border-soft bg-surface px-4 py-2 text-xs font-medium text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-[var(--shadow-soft)] sm:text-sm">
                {t}
              </span>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal direction="up" delay={0.3} className="mt-10">
          <Pipeline steps={JOURNEY} />
        </Reveal>

        <Reveal direction="up" delay={0.4} className="mt-8">
          <Button href="/courses" variant="outline">
            Browse courses
          </Button>
        </Reveal>
      </div>
    </Chapter>
  );
}
