"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Code2, Megaphone, MessageCircle, MonitorCog, Smartphone, type LucideIcon } from "lucide-react";
import { Chapter } from "@/components/experience/Chapter";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { Reveal } from "@/components/ui/Reveal";
import { PlanButton } from "@/components/ui/PlanButton";
import { ServiceGlyph, type GlyphName } from "@/components/ui/ServiceGlyph";
import { toWhatsAppLink } from "@/lib/whatsapp";
import { WHATSAPP_PHONE } from "@/lib/contactInfo";
import { openProjectRequest } from "@/components/services/ProjectRequestModal";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/useReducedMotion";

type Option = {
  key: string;
  label: string;
  noun: string;
  service: "web" | "mobile" | "software" | "marketing";
  Icon: LucideIcon;
  icon: string;
  points: { t: string; d: string }[];
};

const OPTIONS: Option[] = [
  { key: "web", label: "Website", noun: "website", service: "web", Icon: Code2, icon: "webdev", points: [{ t: "Design & build", d: "Designed and built around your goals." }, { t: "Fast & SEO-ready", d: "Fast, responsive pages that search engines can read." }, { t: "Launch & support", d: "Launch and maintenance support after go-live." }] },
  { key: "mobile", label: "Mobile app", noun: "mobile app", service: "mobile", Icon: Smartphone, icon: "mobile", points: [{ t: "Android & iOS", d: "Android, iOS or cross-platform apps." }, { t: "Shared backend", d: "Shares a backend with your website." }, { t: "Test & release", d: "Testing and release support." }] },
  { key: "ai", label: "AI agent", noun: "AI agent", service: "software", Icon: Bot, icon: "ai", points: [{ t: "Assistants", d: "Chatbots, assistants and agents." }, { t: "Your data", d: "Answers from your own data." }, { t: "Human approval", d: "A person approves important actions." }] },
  { key: "marketing", label: "Marketing", noun: "growth campaign", service: "marketing", Icon: Megaphone, icon: "marketing", points: [{ t: "Campaigns", d: "Search, social and paid campaigns." }, { t: "Lead paths", d: "Lead paths, including WhatsApp." }, { t: "Measurement", d: "Clear measurement and reviews." }] },
  { key: "software", label: "Software", noun: "software product", service: "software", Icon: MonitorCog, icon: "software", points: [{ t: "Your workflow", d: "CRMs, ERPs and internal tools shaped to your workflow." }, { t: "Desktop apps", d: "Windows and cross-platform desktop applications." }, { t: "Integrations", d: "Connected to the systems you already use." }] },
];

/** One-line stepper: three connected nodes that light up in turn (or on click), with the detail for the active step below. */
function OptionSteps({ option }: { option: Option }) {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);
  const n = option.points.length;

  useEffect(() => {
    if (reduced || !auto) return;
    const id = window.setInterval(() => setStep((x) => (x + 1) % n), 2600);
    return () => window.clearInterval(id);
  }, [reduced, auto, n]);

  return (
    <div>
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Your next {option.noun}</p>

      <div className="relative mt-5">
        <div aria-hidden className="absolute left-[16.66%] right-[16.66%] top-[1.125rem] h-1 rounded-full bg-border-soft">
          <motion.div className="h-full rounded-full bg-story-royal" initial={false} animate={{ width: `${(step / (n - 1)) * 100}%` }} transition={{ type: "spring", stiffness: 140, damping: 22 }} />
          {!reduced && (
            <motion.span className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-story-cyan shadow-[0_0_10px_2px_rgba(34,211,238,0.7)]" initial={false} animate={{ left: `calc(${(step / (n - 1)) * 100}% - 5px)` }} transition={{ type: "spring", stiffness: 140, damping: 22 }} />
          )}
        </div>

        <div role="tablist" aria-label={`${option.label} highlights`} className="relative grid grid-cols-3">
          {option.points.map((pt, i) => {
            const done = i < step;
            const on = i === step;
            return (
              <button key={pt.t} type="button" role="tab" aria-selected={on} onClick={() => { setAuto(false); setStep(i); }} className="group flex flex-col items-center gap-2 outline-none">
                <motion.span
                  className="relative grid h-9 w-9 place-items-center rounded-full border text-xs font-bold"
                  animate={{ backgroundColor: done || on ? "#1f56d6" : "#ffffff", borderColor: done || on ? "#1f56d6" : "rgba(11,31,77,0.1)", color: done || on ? "#ffffff" : "#64748b" }}
                  transition={{ duration: 0.25 }}
                >
                  {done ? "✓" : i + 1}
                </motion.span>
                <span className={cn("text-center text-[11px] font-semibold leading-tight transition-colors sm:text-xs", on ? "text-story-royal" : "text-muted group-hover:text-foreground")}>{pt.t}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 h-6 text-center" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="text-[13px] font-medium text-foreground">
            {option.points[step].d}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function FinalCta() {
  const [picked, setPicked] = useState(0);
  const opt = OPTIONS[picked];
  const whatsapp = toWhatsAppLink(WHATSAPP_PHONE, `Hi MyLoginn team! I'd like to talk about a ${opt.noun}.`) ?? "/contact";

  return (
    <Chapter formation="crystal" variant="final" title="What will you build next?">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <Reveal>
          <div className="grid gap-8 rounded-3xl border border-border-soft bg-surface p-6 shadow-[var(--shadow-soft)] sm:p-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12 lg:p-10">
            {/* left: copy and actions */}
            <div className="flex min-w-0 flex-col justify-center text-center lg:text-left">
              <Reveal><span className="story-eyebrow justify-center lg:justify-start">Let&apos;s build it</span></Reveal>
              <SplitHeadline as="h2" text="What will you build next?" className="mt-3 text-3xl font-bold leading-[1.08] tracking-tight text-story-navy sm:text-4xl dark:text-foreground" />
              <Reveal direction="up" delay={0.15}>
                <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted sm:text-base lg:mx-0">
                  Have an idea, a business challenge, or a product you want to bring to life? Choose what you have in mind and we will take it from there.
                </p>
              </Reveal>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <PlanButton label="Start a project" onClick={() => openProjectRequest(opt.service)} />
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-sweep group inline-flex h-11 items-center gap-2 rounded-full border border-border-soft px-5 text-sm font-medium active:scale-95"
                >
                  <MessageCircle className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                  Talk to us
                </a>
              </div>
            </div>

            {/* right: round project-type picker + what that type includes */}
            <div className="min-w-0">
              <div className="relative">
                {/* track behind the circles, filled up to the selected one */}
                <div aria-hidden className="absolute left-[10%] right-[10%] top-6 h-0.5 sm:top-7">
                  <div className="absolute inset-0 rounded-full border-t-2 border-dashed border-border-soft" />
                  <motion.div className="absolute inset-y-0 left-0 rounded-full bg-story-royal" initial={false} animate={{ width: `${(picked / (OPTIONS.length - 1)) * 100}%` }} transition={{ type: "spring", stiffness: 160, damping: 22 }} />
                </div>

                <div role="radiogroup" aria-label="What would you like to build?" className="relative grid grid-cols-5">
                  {OPTIONS.map((o, i) => {
                    const on = i === picked;
                    return (
                      <button key={o.key} type="button" role="radio" aria-checked={on} onClick={() => setPicked(i)} className="group flex flex-col items-center gap-2 outline-none">
                        <span className="relative grid h-12 w-12 place-items-center rounded-full sm:h-14 sm:w-14">
                          <motion.span
                            className="absolute inset-0 rounded-full"
                            initial={false}
                            animate={{ backgroundColor: on ? "#1f56d6" : "#eaf1ff", boxShadow: on ? "0 10px 22px -10px rgba(31,86,214,0.85)" : "0 0 0 rgba(0,0,0,0)" }}
                            transition={{ duration: 0.3 }}
                          />
                          <ServiceGlyph name={o.key as GlyphName} active={on} className="relative h-7 w-7 sm:h-9 sm:w-9" />
                        </span>
                        <span className={cn("text-[10px] font-semibold transition-colors sm:text-xs", on ? "text-story-royal" : "text-muted group-hover:text-foreground")}>{o.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="relative mt-6 rounded-[2rem] bg-story-mist p-5 sm:p-6">
                {/* pointer that follows the selected circle */}
                <motion.span aria-hidden className="absolute -top-2 h-4 w-4 -translate-x-1/2 rotate-45 rounded-sm bg-story-mist" initial={false} animate={{ left: `${((picked + 0.5) / OPTIONS.length) * 100}%` }} transition={{ type: "spring", stiffness: 260, damping: 26 }} />
                <OptionSteps key={opt.key} option={opt} />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Chapter>
  );
}
