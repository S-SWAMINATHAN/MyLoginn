"use client";

import Image from "next/image";
import { ArrowRight, Check, Code2, GitBranch, Lightbulb, Pause, Play, RotateCcw, SkipBack, SkipForward, Sparkles, Variable } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Step = { code: string; explanation: string };
function unquote(value: string) {
  const trimmed = value.trim().replace(/;$/, "");
  const formatted = trimmed.match(/^f(["'])(.*)\1$/i) ?? trimmed.match(/^(["'`])(.*)\1$/);
  return formatted ? formatted[2] : trimmed;
}

function traceAt(steps: Step[], active: number, visibleOutputLines: string[]) {
  const memory = new Map<string, string>();
  let operation = "Instruction";
  let result = steps[active]?.code.trim() ?? "";
  let resultLabel = "Current effect";
  let currentKind: "value" | "output" | "decision" | "loop" | "function" | "comment" | "instruction" = "instruction";

  for (const step of steps.slice(0, active + 1)) {
    const line = step.code.trim();
    if (!line) continue;
    if (/^(#|\/\/|<!--|\/\*|--)/.test(line)) {
      if (step === steps[active]) { operation = "Comment"; result = "Notes for the reader · no runtime change"; resultLabel = "Effect"; currentKind = "comment"; }
      continue;
    }
    if (/\b(print|console\.log|printf|System\.out\.print|cout\s*<<)\b/i.test(line)) {
      if (step === steps[active]) { operation = "Display output"; result = visibleOutputLines.at(-1) ?? "Output appears when this line runs"; resultLabel = "Printed value"; currentKind = "output"; }
      continue;
    }
    if (/^(if\b|elif\b|else\b|switch\b|case\b)/i.test(line)) {
      if (step === steps[active]) { operation = "Decision"; result = line.replace(/\s*:\s*$/, "").replace(/\s*\{\s*$/, ""); resultLabel = "Condition being checked"; currentKind = "decision"; }
      continue;
    }
    if (/^(for\b|while\b)/i.test(line)) {
      if (step === steps[active]) { operation = "Loop"; result = "Check the loop rule, then repeat its indented block"; resultLabel = line.replace(/\s*:\s*$/, "").replace(/\s*\{\s*$/, ""); currentKind = "loop"; }
      continue;
    }
    if (/^(def\b|function\b|class\b|public\s+static\b)/i.test(line) || /\breturn\b/.test(line)) {
      if (step === steps[active]) { operation = /\breturn\b/.test(line) ? "Return value" : "Reusable code"; result = line.replace(/\s*\{\s*$/, ""); resultLabel = "Call stack / function"; currentKind = "function"; }
      continue;
    }

    const assignment = line.match(/^(?:(?:const|let|var|int|float|double|String|boolean|bool|char|long|short|final|auto)\s+)*([\w.$]+)\s*=\s*(?![=])(.+?);?$/);
    if (assignment) {
      const name = assignment[1].split(".").at(-1) ?? assignment[1];
      let value = unquote(assignment[2]);
      value = value.replace(/\{([\w$]+)\}/g, (match, variable: string) => memory.get(variable) ?? match);
      value = value.replace(/\$\{([\w$]+)\}/g, (match, variable: string) => memory.get(variable) ?? match);
      if (memory.has(value)) value = memory.get(value) ?? value;
      memory.set(name, value);
      if (step === steps[active]) { operation = "Store a value"; result = `${name} = ${value}`; resultLabel = "Updated memory"; currentKind = "value"; }
      continue;
    }
    if (/\b(import|from)\b|#include/.test(line) && step === steps[active]) {
      operation = "Load a tool"; result = line; resultLabel = "Available to the program";
    } else if (step === steps[active]) {
      operation = "Run instruction"; result = line; resultLabel = "Current effect";
    }
  }
  return { memory: [...memory.entries()].map(([name, value]) => ({ name, value })), operation, result, resultLabel, currentKind };
}

export function AnimatedLessonWalkthrough({ title, steps, output, sqlQuery }: { title: string; steps: Step[]; output: string; sqlQuery?: string }) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [queriedOutput, setQueriedOutput] = useState<string | null>(null);
  const codeLineRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const step = steps[active];
  const visibleOutput = queriedOutput ?? output;
  const outputLines = visibleOutput.split("\n");
  const executedPrints = steps.slice(0, active + 1).filter((item) => /\bprint\s*\(|console\.log\s*\(|System\.out\.print|printf\s*\(/i.test(item.code)).length;
  const visibleOutputLines = active === steps.length - 1
    ? outputLines
    : outputLines.slice(0, Math.min(outputLines.length, executedPrints));
  const trace = traceAt(steps, active, visibleOutputLines);
  const progress = steps.length ? ((active + 1) / steps.length) * 100 : 0;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      if (active >= steps.length - 1) setPlaying(false);
      else setActive((current) => current + 1);
    }, 4200);
    return () => window.clearTimeout(timer);
  }, [playing, active, steps.length]);

  useEffect(() => {
    if (!sqlQuery) return;
    let activeRequest = true;
    fetch("/api/courses/sql-practice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: sqlQuery }),
    }).then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not run the SQL example.");
      if (activeRequest) setQueriedOutput(result.output);
    }).catch((error: unknown) => {
      if (activeRequest) setQueriedOutput(error instanceof Error ? error.message : "Could not run the SQL example.");
    });
    return () => { activeRequest = false; };
  }, [sqlQuery]);

  useEffect(() => {
    codeLineRefs.current[active]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [active]);

  if (!step) return null;

  function goTo(index: number) {
    setPlaying(false);
    setActive(Math.max(0, Math.min(index, steps.length - 1)));
  }

  function togglePlayback() {
    if (!playing && active === steps.length - 1) setActive(0);
    setPlaying((current) => !current);
  }

  return <section className="mt-8 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-indigo-50 shadow-[0_20px_60px_-38px_rgba(30,64,175,0.45)]" aria-label={`Animated step-by-step lesson for ${title}`}>
    <header className="relative overflow-hidden border-b border-indigo-100 bg-white/80 px-5 py-5 sm:px-7">
      <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-cyan-100/70 blur-3xl" />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-500/20"><Code2 className="h-5 w-5" /></span>
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[.19em] text-blue-700"><Sparkles className="h-3.5 w-3.5" /> Interactive code guide</p>
            <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-950 sm:text-xl">Animated lesson walkthrough</h2>
            <p className="mt-1 text-sm text-slate-600">Watch each instruction and understand what it changes.</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-800"><span className="h-2 w-2 rounded-full bg-blue-500" />Step {active + 1}<span className="font-medium text-blue-500">of {steps.length}</span></span>
      </div>
      <div className="relative mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Walkthrough progress" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={active + 1}>
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 transition-[width] duration-500" style={{ width: `${progress}%` }} />
      </div>
    </header>

    <div className="grid items-start gap-4 p-4 sm:p-6 lg:gap-5">
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#080d18] text-white shadow-xl shadow-slate-900/10">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[.03] px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2.5"><span className="flex gap-1"><i className="h-2 w-2 rounded-full bg-rose-400"/><i className="h-2 w-2 rounded-full bg-amber-300"/><i className="h-2 w-2 rounded-full bg-emerald-400"/></span><span className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">Code focus</span></div>
          <span className="rounded-md border border-white/10 px-2 py-1 font-mono text-[10px] font-semibold text-slate-400">{title}</span>
        </div>
        <div className="max-h-56 overflow-y-auto px-2 py-3 sm:px-3">
          <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[.2em] text-cyan-300">Live code · line {active + 1} of {steps.length}</p>
          <ol className="space-y-1 font-mono text-sm leading-6 sm:text-base">
            {steps.map((line, index) => <li key={`${line.code}-${index}`}>
              <button ref={(element) => { codeLineRefs.current[index] = element; }} type="button" onClick={() => goTo(index)} aria-current={index === active ? "step" : undefined} aria-label={`Play from line ${index + 1}: ${line.code}`} className={`group flex w-full items-start gap-3 rounded-lg px-2 py-1.5 text-left transition-colors ${index === active ? "bg-cyan-300/15 text-emerald-200 ring-1 ring-inset ring-cyan-300/35" : index < active ? "text-slate-400 hover:bg-white/5 hover:text-slate-200" : "text-slate-500 hover:bg-white/5 hover:text-slate-300"}`}>
                <span className={`w-6 shrink-0 select-none text-right text-xs ${index === active ? "font-bold text-cyan-300" : "text-slate-600"}`}>{index + 1}</span><code className="min-w-0 whitespace-pre-wrap break-words">{line.code}</code>
              </button>
            </li>)}
          </ol>
        </div>
        <div className="flex items-center justify-between border-t border-white/10 bg-white/[.025] px-4 py-3 sm:px-5">
          <p className="flex items-center gap-2 text-xs font-medium text-slate-300"><span className="grid h-5 w-5 place-items-center rounded-full bg-cyan-400/15 text-cyan-300"><Check className="h-3 w-3" /></span>Follow the highlighted instruction</p>
          <div className="flex items-center gap-1.5 opacity-70"><Image src="/myloginn-logo.png" alt="" width={17} height={17} className="h-4 w-4 object-contain"/><span className="text-[9px] font-bold text-slate-300">MyLoginn</span></div>
        </div>
      </div>

      <div className="flex flex-col rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.18em] text-blue-700"><span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-50"><Lightbulb className="h-4 w-4" /></span>What happens now</div>
        <div key={`explanation-${active}`} className="lesson-frame-enter mt-4 flex-1">
          <p className="text-base leading-7 text-slate-700 sm:text-[17px] sm:leading-8" aria-live="polite">{step.explanation}</p>
        </div>
        <section className="mt-4 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-sky-50 p-3.5" aria-label="Live code execution visualization" aria-live="polite">
          <div className="flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.15em] text-indigo-800"><GitBranch className="h-3.5 w-3.5" />Live execution map</h3>
            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-indigo-700 shadow-sm">{trace.operation}</span>
          </div>
          <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
            <div className="min-w-0 rounded-lg border border-indigo-100 bg-white p-2.5"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Line {active + 1}</p><code className="mt-1 block overflow-hidden text-ellipsis whitespace-nowrap font-mono text-xs font-semibold text-slate-800">{step.code.trim() || "(blank line)"}</code></div>
            <ArrowRight className="h-4 w-4 text-indigo-400" aria-hidden="true" />
            <div className="min-w-0 rounded-lg border border-cyan-200 bg-white p-2.5"><p className="text-[9px] font-bold uppercase tracking-wider text-cyan-800">{trace.resultLabel}</p><code className="mt-1 block overflow-hidden text-ellipsis whitespace-nowrap font-mono text-xs font-semibold text-slate-800">{trace.result}</code></div>
          </div>
          <div className="mt-3 border-t border-indigo-100 pt-2.5">
            <p className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-500"><Variable className="h-3.5 w-3.5" />Program memory</p>
            {trace.memory.length ? <div className="mt-2 flex flex-wrap gap-1.5">{trace.memory.slice(-5).map((item) => <span key={item.name} className="max-w-full rounded-lg border border-white bg-white px-2.5 py-1.5 font-mono text-[10px] shadow-sm"><strong className="text-indigo-700">{item.name}</strong><span className="px-1 text-slate-400">=</span><span className="text-slate-700">{item.value}</span></span>)}</div> : <p className="mt-1 text-xs text-slate-500">No values stored yet. The current line’s effect will appear here as code runs.</p>}
          </div>
        </section>
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-950 p-3.5 text-white shadow-inner">
          <div className="flex items-center justify-between"><h3 className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">Program output</h3><span className="text-[10px] font-medium text-slate-500">{visibleOutputLines.length} / {outputLines.length} lines</span></div>
          <pre aria-live="polite" className="mt-2 min-h-8 whitespace-pre-wrap break-words font-mono text-sm leading-6 text-emerald-300">{visibleOutputLines.length ? visibleOutputLines.join("\n") : <span className="text-slate-600">Waiting for output…</span>}</pre>
        </div>
        <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4">
          <button type="button" onClick={() => goTo(0)} aria-label="Restart walkthrough" title="Restart walkthrough" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><RotateCcw className="h-4 w-4" /></button>
          <button type="button" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous walkthrough step" title="Previous step" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><SkipBack className="h-4 w-4" /></button>
          <button type="button" onClick={togglePlayback} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}{playing ? "Pause steps" : active === steps.length - 1 ? "Replay walkthrough" : "Play walkthrough"}</button>
          <button type="button" onClick={() => goTo(active + 1)} disabled={active === steps.length - 1} aria-label="Next walkthrough step" title="Next step" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><SkipForward className="h-4 w-4" /></button>
        </div>
      </div>
    </div>

    {steps.length > 1 && <nav aria-label="Walkthrough steps" className="flex flex-wrap items-center gap-2 border-t border-indigo-100 bg-white/70 px-4 py-3 sm:px-6">
      <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Jump to</span>
      {steps.map((item, index) => <button key={`${item.code}-${index}`} type="button" onClick={() => goTo(index)} aria-label={`Go to step ${index + 1}`} aria-current={index === active ? "step" : undefined} className={`grid h-8 min-w-8 place-items-center rounded-lg px-2 text-xs font-bold transition ${index === active ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : index < active ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{index < active ? <Check className="h-3.5 w-3.5" /> : index + 1}</button>)}
    </nav>}
  </section>;
}
