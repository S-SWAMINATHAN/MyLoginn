"use client";

import { Search, ClipboardList, PenTool, CodeXml, Link2, CheckCircle2, Rocket, TrendingUp } from "lucide-react";
import { Chapter } from "@/components/experience/Chapter";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { Reveal } from "@/components/ui/Reveal";
import { useScrollStep } from "@/lib/useScrollStep";
import { cn } from "@/lib/cn";

const STEPS = [
  { n: "01", label: "Discover", desc: "Understand the business", icon: Search },
  { n: "02", label: "Plan", desc: "Define the solution", icon: ClipboardList },
  { n: "03", label: "Design", desc: "Create the experience", icon: PenTool },
  { n: "04", label: "Develop", desc: "Build the product", icon: CodeXml },
  { n: "05", label: "Integrate", desc: "Connect APIs, data and intelligence", icon: Link2 },
  { n: "06", label: "Test", desc: "Validate quality", icon: CheckCircle2 },
  { n: "07", label: "Deploy", desc: "Launch", icon: Rocket },
  { n: "08", label: "Evolve", desc: "Improve continuously", icon: TrendingUp },
];

export function HowWeBuild() {
  const { ref, activeStep } = useScrollStep(STEPS.length);

  return (
    <Chapter formation="grid" variant="process" title="How we build">
      <div className="mx-auto w-full max-w-2xl px-5 text-center sm:px-8">
        <Reveal>
          <span className="story-eyebrow justify-center">How we build</span>
        </Reveal>

        <SplitHeadline
          as="h2"
          text="One process, from idea to evolution."
          className="story-subheading mx-auto mt-4 max-w-lg text-story-navy"
        />

        <div ref={ref} className="mx-auto mt-12 max-w-md text-left">
          {STEPS.map((s, i) => {
            const done = i <= activeStep;
            const isCurrent = i === activeStep;
            return (
              <div key={s.n} className="relative flex gap-4 pb-8 last:pb-0">
                {i < STEPS.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute left-[17px] top-9 bottom-0 w-px transition-colors duration-500"
                    style={{
                      backgroundImage: `repeating-linear-gradient(180deg, ${
                        done ? "var(--story-royal)" : "var(--border-soft)"
                      } 0, ${done ? "var(--story-royal)" : "var(--border-soft)"} 4px, transparent 4px, transparent 9px)`,
                    }}
                  />
                )}
                <span
                  className={cn(
                    "card-shine relative isolate z-10 flex h-[34px] w-[34px] shrink-0 items-center justify-center overflow-hidden rounded-full transition-all duration-500",
                    done ? "text-white" : "border border-border-soft bg-surface-2 text-muted"
                  )}
                  style={
                    done
                      ? {
                          background: "linear-gradient(150deg, var(--story-navy), var(--story-royal) 55%, var(--story-electric))",
                          boxShadow: "0 1px 0 rgba(255,255,255,0.25) inset, 0 8px 20px -6px rgba(31,86,214,0.55)",
                        }
                      : undefined
                  }
                >
                  {isCurrent && (
                    <span
                      aria-hidden
                      className="animate-pulse-glow absolute -inset-1.5 -z-10 rounded-full blur-md"
                      style={{ background: "var(--story-cyan)" }}
                    />
                  )}
                  <s.icon className={cn("relative h-4 w-4 transition-transform duration-500", done && "scale-110")} aria-hidden />
                  <span
                    className={cn(
                      "absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold transition-colors duration-500",
                      done ? "bg-story-navy text-white" : "border border-border-soft bg-surface text-muted"
                    )}
                  >
                    {i + 1}
                  </span>
                </span>
                <div className="pt-1.5">
                  <p className={cn("text-sm font-semibold transition-colors duration-500", done ? "text-story-navy" : "text-muted")}>
                    {s.label}
                  </p>
                  <p className="text-xs text-muted">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Chapter>
  );
}
