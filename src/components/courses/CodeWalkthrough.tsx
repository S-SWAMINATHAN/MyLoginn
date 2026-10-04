"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";

type Step = { code: string; explanation: string };

export function CodeWalkthrough({ steps }: { steps: Step[] }) {
  const [activeStep, setActiveStep] = useState(0);
  if (!steps.length) return null;
  const step = steps[activeStep];

  return <section className="mt-8 rounded-2xl border border-brand-200 bg-brand-50/50 p-5 dark:bg-brand-900/10 sm:p-6" aria-label="Interactive step-by-step code walkthrough">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-lg font-bold">Step-by-step code walkthrough</h2><p className="mt-1 text-xs text-muted">Move through the example one instruction at a time.</p></div>
      <span className="rounded-full bg-surface px-3 py-1.5 text-xs font-semibold">Step {activeStep + 1} of {steps.length}</span>
    </div>
    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-brand-100 dark:bg-brand-950"><div className="h-full rounded-full bg-brand-600 transition-[width] duration-300" style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }} /></div>
    <div className="relative mt-4 min-h-36 rounded-xl border border-border-soft bg-surface p-4 sm:p-5" aria-live="polite" aria-atomic="true">
      <div className="pointer-events-none absolute bottom-2 right-3 flex items-center gap-1 opacity-35" aria-hidden="true"><Image src="/myloginn-logo.png" alt="" width={16} height={16} className="h-4 w-4 object-contain" /><span className="text-[9px] font-semibold text-muted">MyLoginn</span></div>
      <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-sm leading-6 text-brand-700 dark:text-brand-200"><code>{step.code}</code></pre>
      <p className="mt-3 max-w-3xl pr-16 text-sm leading-6 text-foreground/85">{step.explanation}</p>
    </div>
    <div className="mt-4 flex justify-between gap-3">
      <button type="button" onClick={() => setActiveStep((current) => Math.max(0, current - 1))} disabled={activeStep === 0} className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45"><ArrowLeft className="h-4 w-4" />Previous step</button>
      <button type="button" onClick={() => setActiveStep((current) => Math.min(steps.length - 1, current + 1))} disabled={activeStep === steps.length - 1} className="inline-flex items-center gap-2 rounded-full brand-gradient-bg px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45">Next step<ArrowRight className="h-4 w-4" /></button>
    </div>
  </section>;
}
