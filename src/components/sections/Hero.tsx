"use client";

import Link from "next/link";
import { Chapter } from "@/components/experience/Chapter";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Reveal } from "@/components/ui/Reveal";
import { PillTicker } from "@/components/ui/PillTicker";
import { HeroHeadline } from "@/components/sections/HeroHeadline";
import { HeroPlatformMonitor } from "@/components/sections/HeroPlatformMonitor";

// Every phrase is exactly two short lines so the headline always takes the same height (no gaps, nothing below moves).
const heroPhrases: [string, string][] = [
  ["AI, Web & Mobile Solutions", "for Modern Businesses"],
  ["Where Potential", "Meets Opportunity"],
  ["Elevating Learning,", "Empowering Careers"],
  ["Learning with Direction.", "Careers with Impact."],
  ["From Aspiration", "to Achievement"],
  ["A Smarter Path to", "Professional Growth"],
];

const pills = ["AI/ML courses", "Real internships", "Growth services"];

/**
 * Home hero in the same flat, animated, interactive style as the service pages: copy and calls to action on the
 * left, a live platform preview on the right. It keeps an opaque background so the persistent 3D scene behind the
 * other chapters never shows through.
 */
export function Hero() {
  return (
    <Chapter formation="stream" variant="hero" title="MyLoginn — where potential meets opportunity" className="!min-h-0 !py-0">
      <div className="relative overflow-hidden bg-background">
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-12 pt-10 sm:px-8 sm:pt-14 lg:grid-cols-[1.2fr_1fr] lg:gap-12 lg:pb-16 lg:pt-20">
          <div className="relative z-10 min-w-0 text-center lg:text-left">
            <Reveal><span className="story-eyebrow justify-center lg:justify-start">AI Agent · Live now</span></Reveal>

            <h1 className="mx-auto mt-5 max-w-[40rem] text-2xl font-bold leading-[1.12] tracking-tight text-story-navy min-[400px]:text-[1.7rem] sm:text-4xl lg:mx-0 dark:text-foreground">
              <HeroHeadline phrases={heroPhrases} highlightClassName="text-story-royal" />
            </h1>

            <Reveal direction="up" delay={0.15}>
              <p className="mx-auto mt-5 max-w-lg text-base leading-8 text-muted sm:text-lg lg:mx-0">
                Advanced AI/ML &amp; digital marketing courses, real internships, and AI-driven growth services &mdash; all on one premium platform. Supporting businesses and learners across India and worldwide.
              </p>
            </Reveal>

            <Reveal direction="up" delay={0.25} className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <ArrowLink href="/signup">Get started free</ArrowLink>
              <Link href="/courses" className="rounded-full border border-border-soft bg-surface px-6 py-2.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-1 hover:border-story-royal hover:text-story-royal active:scale-95">
                Explore courses
              </Link>
            </Reveal>

            <Reveal direction="up" delay={0.35} className="mt-8"><PillTicker items={pills} /></Reveal>
          </div>

          <Reveal direction="left" delay={0.15} className="min-w-0">
            <HeroPlatformMonitor />
          </Reveal>
        </div>
      </div>
    </Chapter>
  );
}
