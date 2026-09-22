"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, ClipboardList, CodeXml, Link2, PenTool, Rocket, Search, TrendingUp } from "lucide-react";
import { Chapter } from "@/components/experience/Chapter";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { Reveal } from "@/components/ui/Reveal";
import { useScrollStep } from "@/lib/useScrollStep";
import { cn } from "@/lib/cn";

const STEPS = [
  { n: "01", label: "Discover", desc: "Clarify the business, users and opportunity.", icon: Search },
  { n: "02", label: "Plan", desc: "Turn priorities into a focused delivery plan.", icon: ClipboardList },
  { n: "03", label: "Design", desc: "Shape a clear, intuitive product experience.", icon: PenTool },
  { n: "04", label: "Develop", desc: "Build robust, scalable product foundations.", icon: CodeXml },
  { n: "05", label: "Integrate", desc: "Connect the tools, data and intelligence.", icon: Link2 },
  { n: "06", label: "Test", desc: "Validate every important journey and detail.", icon: CheckCircle2 },
  { n: "07", label: "Deploy", desc: "Launch smoothly with a measured rollout.", icon: Rocket },
  { n: "08", label: "Evolve", desc: "Learn from use and improve continuously.", icon: TrendingUp },
];

export function HowWeBuild() {
  const { ref, activeStep } = useScrollStep(STEPS.length);

  return (
    <Chapter formation="grid" variant="process" title="How we build">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="grid gap-7 lg:grid-cols-[1fr_0.72fr] lg:items-end lg:gap-14">
          <div>
            <Reveal><span className="story-eyebrow">How we build</span></Reveal>
            <SplitHeadline as="h2" text="A disciplined path from first signal to lasting growth." className="story-subheading mt-4 max-w-2xl text-story-navy" />
          </div>
          <Reveal direction="up" delay={0.12}>
            <div className="relative overflow-hidden rounded-2xl border border-brand-200 bg-[linear-gradient(135deg,var(--brand-50),var(--surface)_65%)] px-5 py-4 dark:border-brand-800 dark:bg-[linear-gradient(135deg,rgba(31,86,214,.18),var(--surface)_65%)]">
              <span aria-hidden className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-brand-300/30 blur-2xl" />
              <div className="relative flex items-center gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-xl brand-gradient-bg text-sm font-bold text-white shadow-[var(--shadow-soft)]">08</span><div><p className="text-sm font-semibold text-story-navy">One connected delivery system</p><p className="mt-0.5 text-sm text-muted">Clear decisions, visible progress, better outcomes.</p></div></div>
            </div>
          </Reveal>
        </div>

        <div ref={ref} className="mt-9 grid gap-3 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4 lg:gap-4">
          {STEPS.map((step, index) => {
            const active = index <= activeStep;
            const current = index === activeStep;
            const Icon = step.icon;
            return (
              <motion.article key={step.n} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.45, delay: (index % 4) * 0.06 }} className={cn("group relative min-h-40 overflow-hidden rounded-2xl border bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-[var(--shadow-lift)]", active ? "border-brand-200" : "border-border-soft")}>
                <span aria-hidden className={cn("absolute inset-x-0 top-0 h-1 transition-colors duration-500", active ? "brand-gradient-bg" : "bg-surface-2")} />
                <div className="flex items-start justify-between gap-4"><span className={cn("flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-500", active ? "brand-gradient-bg text-white shadow-[0_8px_18px_-7px_rgba(31,86,214,.7)]" : "bg-surface-2 text-muted")}><Icon className="h-[18px] w-[18px]" /></span><span className={cn("font-mono text-xs font-semibold tracking-wider", active ? "text-brand-500" : "text-muted")}>{step.n}</span></div>
                <h3 className="mt-5 text-base font-semibold text-story-navy">{step.label}</h3>
                <p className="mt-1.5 max-w-52 text-sm leading-relaxed text-muted">{step.desc}</p>
                <span className={cn("absolute bottom-4 right-4 transition-all duration-500", current ? "text-brand-500 opacity-100" : "translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100")}><ArrowUpRight className="h-4 w-4" /></span>
              </motion.article>
            );
          })}
        </div>
      </div>
    </Chapter>
  );
}
