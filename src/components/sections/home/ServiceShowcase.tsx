"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Check } from "lucide-react";
import { FancyLink } from "@/components/ui/FancyButton";
import { Chapter } from "@/components/experience/Chapter";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { Reveal } from "@/components/ui/Reveal";
import { ServiceVisual } from "@/components/sections/home/ServiceVisuals";
import { CORE_SERVICES, type CoreService } from "@/lib/coreServices";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

/** One service row: copy on one side, its live product tour on the other. Rows alternate sides on large screens. */
function ServiceRow({ service, index }: { service: CoreService; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px" });
  const flip = index % 2 === 1;
  const Icon = service.icon;

  return (
    <article ref={ref} className="grid items-center gap-8 py-10 lg:grid-cols-2 lg:gap-16 lg:py-16">
      <motion.div
        className={cn("min-w-0", flip && "lg:order-2")}
        initial={{ opacity: 0, x: flip ? 40 : -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-story-royal">
          <Icon className="h-4 w-4" />
          {service.name}
          <span className="text-muted">· 0{index + 1} / 0{CORE_SERVICES.length}</span>
        </p>
        <h3 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-story-navy sm:text-4xl lg:text-[2.75rem] dark:text-foreground">{service.headline}</h3>
        <p className="mt-4 max-w-md text-base leading-7 text-muted">{service.summary}</p>
        <ul className="mt-5 space-y-2.5">
          {service.points.map((p, i) => (
            <motion.li key={p} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }} className="flex items-start gap-2.5 text-sm font-medium text-story-navy dark:text-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-story-royal" strokeWidth={3} />
              {p}
            </motion.li>
          ))}
        </ul>
        <div className="mt-7 hidden lg:block"><FancyLink href={service.href} variant="dark">Explore {service.name.toLowerCase()}</FancyLink></div>
      </motion.div>

      <motion.div
        className={cn("min-w-0", flip && "lg:order-1")}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
      >
        <ServiceVisual id={service.id} play={inView} />
      </motion.div>

      {/* below large screens the call to action sits under the demo instead of above it */}
      <div className="lg:hidden"><FancyLink href={service.href} variant="dark" block className="sm:!w-auto sm:!pl-5">Explore {service.name.toLowerCase()}</FancyLink></div>
    </article>
  );
}

/**
 * 02 — What we build. Each core service is a row with its copy on one side and a live, multi-page product tour on
 * the other. The rows alternate sides, and every tour has the same frame so the rows line up. On small screens each
 * row stacks, copy first.
 */
export function ServiceShowcase() {
  return (
    <Chapter formation="grid" variant="services" id="services" title="What we build">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <Reveal><span className="story-eyebrow">What we build</span></Reveal>
          <SplitHeadline as="h2" text="Technology built around the way your business works." className="story-subheading mt-4 text-story-navy" />
          <Reveal direction="up" delay={0.1}>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted">
              We don&apos;t just ship digital products. We start from your operations, customers and goals, then design, develop, automate and market the technology that serves them, across five core capabilities.
            </p>
          </Reveal>
        </div>
        <div className="mt-4 divide-y divide-border-soft">
          {CORE_SERVICES.map((s, i) => <ServiceRow key={s.id} service={s} index={i} />)}
        </div>
      </div>
    </Chapter>
  );
}
