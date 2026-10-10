"use client";

import Image from "next/image";
import { Boxes, Braces, Check, ChevronRight, Cpu, GitBranch, Pause, Play, Repeat, RotateCcw, SkipBack, SkipForward, StickyNote, Terminal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Step = { code: string; explanation: string };

const STEP_MS = 3200;
const SPEEDS = [0.5, 1, 2];
const KIND_META = {
  value: { Icon: Braces, color: "#7c3aed" },
  output: { Icon: Terminal, color: "#059669" },
  decision: { Icon: GitBranch, color: "#d97706" },
  loop: { Icon: Repeat, color: "#0284c7" },
  function: { Icon: Boxes, color: "#db2777" },
  comment: { Icon: StickyNote, color: "#64748b" },
  instruction: { Icon: Cpu, color: "#0891b2" },
} as const;
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


const POINTER_NAME = /^(i|j|k|idx|index|low|high|mid|left|right|lo|hi|l|r|start|end|pos|cur|current|min|max)$/i;
const POINTER_HUES = ["#0891b2", "#65a30d", "#db2777", "#d97706", "#7c3aed"];

function parseArray(value: string) {
  const match = value.trim().match(/^[[{(]\s*(.*?)\s*[\]})]$/);
  if (!match || !match[1]) return null;
  const items = match[1].split(",").map((item) => unquote(item.trim())).filter((item) => item !== "");
  return items.length > 1 ? items.slice(0, 12) : null;
}

function ArrayStage({ name, items, pointers }: { name: string; items: string[]; pointers: { name: string; index: number; hue: string }[] }) {
  const numeric = items.every((item) => /^-?\d+(\.\d+)?$/.test(item));
  const max = numeric ? Math.max(...items.map((item) => Math.abs(Number(item))), 1) : 1;
  return <div className="wt-panel p-4 sm:p-5">
    <p className="wt-label">Array · <span className="font-mono normal-case tracking-normal text-cyan-700">{name}</span></p>
    <div className="mt-4 flex items-end justify-center gap-1.5 sm:gap-2.5">
      {items.map((item, index) => {
        const here = pointers.filter((pointer) => pointer.index === index);
        const hue = here[0]?.hue;
        const height = numeric ? 28 + (Math.abs(Number(item)) / max) * 62 : 44;
        return <div key={index} className="flex min-w-0 flex-1 flex-col items-center" style={{ maxWidth: 64 }}>
          <div key={`${index}-${here.map((p) => p.name).join()}`} className={`wt-cell flex w-full items-end justify-center rounded-lg border pb-1.5 font-mono text-sm font-bold ${hue ? "wt-cell-hot" : ""}`} style={{ height, ["--hue" as string]: hue ?? "#94a3b8", borderColor: hue ?? "rgba(148,163,184,.25)", background: hue ? `${hue}26` : "rgba(148,163,184,.08)", color: hue ? "#0f172a" : "#475569" }}>{item}</div>
          <span className="mt-1.5 font-mono text-[10px] text-slate-500">{index}</span>
          <div className="flex min-h-5 flex-col items-center">{here.map((pointer) => <span key={pointer.name} className="wt-drop mt-0.5 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold text-white" style={{ background: pointer.hue }}>▲ {pointer.name}</span>)}</div>
        </div>;
      })}
    </div>
  </div>;
}

const VOID_TAGS = new Set(["meta", "link", "img", "br", "hr", "input", "source"]);
const TAG_HUES = ["#0891b2", "#65a30d", "#db2777", "#d97706", "#7c3aed"];

// Builds the element tree from the markup typed so far; unclosed tags stay open like a browser would treat them.
function domNodes(markup: string) {
  const nodes: { tag: string; depth: number; text: string }[] = [];
  const stack: string[] = [];
  for (const match of markup.matchAll(/<(\/?)([a-zA-Z][\w-]*)[^>]*?(\/?)>([^<]*)/g)) {
    const tag = match[2].toLowerCase();
    if (match[1]) { const at = stack.lastIndexOf(tag); if (at >= 0) stack.length = at; continue; }
    nodes.push({ tag, depth: stack.length, text: match[4].trim() });
    if (!match[3] && !VOID_TAGS.has(tag)) stack.push(tag);
  }
  return nodes;
}

function WebStage({ courseSlug, steps, active }: { courseSlug: string; steps: Step[]; active: number }) {
  const typed = steps.slice(0, active + 1).map((item) => item.code).join("\n");
  const isCss = courseSlug === "css-fundamentals" && !/<\w+/.test(typed);
  const demo = '<h1>Hello, web!</h1><p>A paragraph of body text.</p><div class="card">Card</div>';
  const doc = `<!doctype html><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;margin:14px;color:#0f172a}${isCss ? typed : ""}</style>${isCss ? demo : typed.replace(/<link[^>]*>/gi, "")}`;
  const nodes = domNodes(isCss ? demo : typed);
  return <div className="grid gap-3">
    <div className="wt-panel overflow-hidden">
      <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2"><span className="flex gap-1"><i className="h-2 w-2 rounded-full bg-rose-400"/><i className="h-2 w-2 rounded-full bg-amber-300"/><i className="h-2 w-2 rounded-full bg-emerald-400"/></span><span className="flex-1 truncate rounded-md bg-slate-100 px-2.5 py-1 font-mono text-[10px] text-slate-500">localhost:3000</span><span className="wt-live font-mono text-[9px] font-bold uppercase text-emerald-700">● live</span></div>
      <iframe key={active} title="Live page preview" sandbox="" srcDoc={doc} className="wt-pop h-32 w-full bg-white @3xl:h-40" />
    </div>
    <div className="wt-panel p-3">
      <p className="wt-label">Page structure</p>
      <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto font-mono text-xs">
        {nodes.length ? nodes.map((node, index) => {
          const hue = TAG_HUES[node.depth % TAG_HUES.length];
          const fresh = index === nodes.length - 1;
          return <li key={`${index}-${node.tag}-${fresh}`} className={fresh ? "wt-pop" : ""} style={{ paddingLeft: node.depth * 16 }}>
            <span className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5" style={{ borderColor: `${hue}${fresh ? "" : "55"}`, background: fresh ? `${hue}26` : "transparent", color: hue, boxShadow: fresh ? `0 0 14px -2px ${hue}` : "none" }}>&lt;{node.tag}&gt;{node.text && <span className="max-w-[9rem] truncate text-slate-700">{node.text}</span>}</span>
          </li>;
        }) : <li className="text-slate-500">Tags appear here as you read the code.</li>}
      </ul>
    </div>
  </div>;
}

export function AnimatedLessonWalkthrough({ courseSlug = "", title, steps, output, sqlQuery }: { courseSlug?: string; title: string; steps: Step[]; output: string; sqlQuery?: string }) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
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
  const previous = active > 0 ? traceAt(steps, active - 1, []) : null;
  const changed = new Set(trace.memory.filter((item) => previous?.memory.find((old) => old.name === item.name)?.value !== item.value).map((item) => item.name));
  const arrayVar = trace.memory.map((item) => ({ name: item.name, items: parseArray(item.value) })).find((item) => item.items);
  const arrayItems = arrayVar?.items ?? null;
  const pointers = arrayItems ? trace.memory
    .filter((item) => POINTER_NAME.test(item.name) && /^\d+$/.test(item.value) && Number(item.value) < arrayItems.length)
    .map((item, index) => ({ name: item.name, index: Number(item.value), hue: POINTER_HUES[index % POINTER_HUES.length] })) : [];
  const isWeb = courseSlug === "html-fundamentals" || (courseSlug === "css-fundamentals" && steps.some((item) => /[{<]/.test(item.code)));
  const progress = steps.length ? ((active + 1) / steps.length) * 100 : 0;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      if (active >= steps.length - 1) setPlaying(false);
      else setActive((current) => current + 1);
    }, STEP_MS / speed);
    return () => window.clearTimeout(timer);
  }, [playing, active, steps.length, speed]);

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

  const kind = KIND_META[trace.currentKind];
  const KindIcon = kind.Icon;
  const stepMs = STEP_MS / speed;
  const btn = "grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500";

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.key === "ArrowRight") { event.preventDefault(); goTo(active + 1); }
    else if (event.key === "ArrowLeft") { event.preventDefault(); goTo(active - 1); }
    else if (event.key === " ") { event.preventDefault(); togglePlayback(); }
    else if (event.key === "Home") { event.preventDefault(); goTo(0); }
    else if (event.key === "End") { event.preventDefault(); goTo(steps.length - 1); }
  }

  return <section tabIndex={0} onKeyDown={handleKeyDown} style={{ ["--accent" as string]: kind.color }} className="wt-root @container relative mt-4 w-full overflow-hidden rounded-3xl border border-brand-200 bg-white text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-brand-500" aria-label={`Animated step-by-step lesson for ${title}. Use arrow keys to move between steps and space to play or pause.`}>
    <header className="flex flex-wrap items-center justify-between gap-2 px-3 pb-3 pt-3 @xl:px-6 @xl:pt-4">
      <div className="min-w-0"><h3 className="truncate text-sm font-semibold tracking-tight">Visual walkthrough</h3><p className="truncate text-xs text-slate-500">{title}</p></div>
      <div className="flex shrink-0 items-center gap-2">
        <div role="group" aria-label="Playback speed" className="flex rounded-full border border-slate-200 bg-white p-0.5">
          {SPEEDS.map((value) => <button key={value} type="button" onClick={() => setSpeed(value)} aria-pressed={speed === value} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tabular-nums transition ${speed === value ? "bg-brand-600 text-white" : "text-slate-500 hover:text-slate-900"}`}>{value}×</button>)}
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold tabular-nums text-slate-800">{String(active + 1).padStart(2, "0")}<span className="text-slate-500"> / {String(steps.length).padStart(2, "0")}</span></span>
      </div>
    </header>

    <div className="relative mx-3 @xl:mx-6">
      <div className="relative h-1.5 overflow-hidden rounded-full bg-brand-100" role="progressbar" aria-label="Walkthrough progress" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={active + 1}>
        <div className="absolute inset-y-0 left-0 rounded-full bg-brand-600 transition-[width] duration-500" style={{ width: `${progress}%` }} />
        {playing && active < steps.length - 1 && <div key={`fill-${active}-${speed}`} className="wt-step-fill absolute inset-y-0 rounded-full bg-white/40" style={{ left: `${progress}%`, width: `${100 / steps.length}%`, animationDuration: `${stepMs}ms` }} />}
      </div>
      {steps.length > 1 && <input type="range" min={0} max={steps.length - 1} value={active} onChange={(event) => goTo(Number(event.target.value))} aria-label="Scrub through walkthrough steps" className="absolute -top-2 left-0 h-6 w-full cursor-pointer opacity-0" />}
    </div>

    <div className="grid gap-3 p-3 @xl:gap-4 @xl:p-5 @3xl:grid-cols-2 @3xl:items-stretch">
      <div className="flex min-w-0 flex-col gap-3 @xl:gap-4">
        <div key={`now-${active}`} className="wt-panel wt-pop wt-accent flex flex-1 flex-col gap-3 p-4 @xl:p-5" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "color-mix(in srgb, var(--accent) 14%, white)", color: "var(--accent)" }}><KindIcon className="h-3.5 w-3.5" aria-hidden="true" />{trace.operation}</span>
            <span className="text-xs font-medium tabular-nums text-slate-500">Line {active + 1} of {steps.length}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="wt-label">Reading</p>
            <code className="mt-1 block whitespace-pre-wrap break-words font-mono text-[15px] font-semibold text-slate-900 @xl:text-base">{step.code.trim() || "(blank line)"}</code>
          </div>
          <div aria-hidden="true" className="wt-drop -my-1 grid h-5 place-items-center text-slate-400">↓</div>
          <div className="rounded-2xl border px-4 py-3" style={{ borderColor: "color-mix(in srgb, var(--accent) 45%, white)", background: "color-mix(in srgb, var(--accent) 7%, white)" }}>
            <p className="wt-label" style={{ color: "var(--accent)" }}>{trace.resultLabel}</p>
            <code className="mt-1 block whitespace-pre-wrap break-words font-mono text-[15px] font-semibold text-slate-900 @xl:text-base">{trace.result}</code>
          </div>
          {step.explanation && <div className="mt-auto border-t border-slate-200 pt-3">
            <p className="wt-label">What is happening</p>
            <p className="mt-1 text-sm leading-6 text-slate-700 @xl:text-base @xl:leading-7">{step.explanation}</p>
          </div>}
        </div>

        {arrayVar && arrayItems && <ArrayStage name={arrayVar.name} items={arrayItems} pointers={pointers} />}
        {isWeb && <WebStage courseSlug={courseSlug} steps={steps} active={active} />}
      </div>

      <div className="flex min-w-0 flex-col gap-3 @xl:gap-4">
        <div className="wt-panel overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
            <span className="flex gap-1.5" aria-hidden="true"><i className="h-2.5 w-2.5 rounded-full bg-rose-400/90" /><i className="h-2.5 w-2.5 rounded-full bg-amber-300/90" /><i className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" /></span>
            <span className="min-w-0 truncate text-xs font-medium text-slate-500">{title}</span>
            <Image src="/myloginn-logo.png" alt="" width={16} height={16} className="h-4 w-4 shrink-0 object-contain opacity-70" />
          </div>
          <div className="max-h-[min(18rem,36dvh)] overflow-y-auto px-1.5 py-2">
            <ol className="space-y-0.5 font-mono text-[13px] leading-6 @xl:text-sm">
              {steps.map((line, index) => <li key={`${line.code}-${index}`}>
                <button ref={(element) => { codeLineRefs.current[index] = element; }} type="button" onClick={() => goTo(index)} aria-current={index === active ? "step" : undefined} aria-label={`Go to line ${index + 1}: ${line.code}`} className={`relative flex w-full items-start gap-2.5 rounded-lg px-2 py-1 text-left transition-colors duration-300 ${index === active ? "wt-line-active font-semibold text-slate-900" : index < active ? "text-slate-600 hover:bg-slate-100" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"}`}>
                  <span className={`grid w-5 shrink-0 select-none place-items-center text-xs leading-6 ${index === active ? "font-bold text-[color:var(--accent)]" : "text-slate-400"}`}>{index === active ? <ChevronRight className="wt-nudge h-4 w-4" aria-hidden="true" /> : index < active ? <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" /> : index + 1}</span>
                  <code className="min-w-0 whitespace-pre-wrap break-words">{line.code || " "}</code>
                </button>
              </li>)}
            </ol>
          </div>
        </div>

        {!isWeb && <div className="grid flex-1 gap-3 @xl:gap-4 @md:grid-cols-2 @3xl:grid-cols-1 @5xl:grid-cols-2">
          <div className="wt-panel p-4">
            <p className="wt-label">Memory</p>
            {trace.memory.length
              ? <ul className="mt-3 space-y-2">{trace.memory.slice(-6).map((item) => {
                const before = previous?.memory.find((old) => old.name === item.name)?.value;
                return <li key={`${item.name}-${item.value}`} className={`flex max-w-full flex-wrap items-center gap-x-2 gap-y-0.5 rounded-xl border px-3 py-2 font-mono text-sm ${changed.has(item.name) ? "wt-flash border-emerald-300 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
                  <strong className="text-brand-700">{item.name}</strong>
                  {changed.has(item.name) && before !== undefined && <><span className="break-all text-slate-400 line-through">{before}</span><span className="text-slate-400" aria-hidden="true">→</span></>}
                  <span className="break-all font-semibold">{item.value}</span>
                </li>;
              })}</ul>
              : <p className="mt-3 text-sm leading-6 text-slate-500">Empty. Variables appear here as lines run.</p>}
          </div>
          <div className="wt-panel flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5"><p className="wt-label">Output</p><span className="text-xs tabular-nums text-slate-500">{visibleOutputLines.length}/{outputLines.length}</span></div>
            <pre aria-live="polite" className="max-h-40 min-h-16 flex-1 overflow-y-auto whitespace-pre-wrap break-words px-4 py-3 font-mono text-sm leading-6 text-emerald-700"><span className="select-none text-slate-400">$ </span>{visibleOutputLines.length ? visibleOutputLines.map((line, i) => <span key={`${i}-${line}`} className={i === visibleOutputLines.length - 1 ? "wt-type block" : "block"}>{line}</span>) : <span className="text-slate-500">waiting…</span>}</pre>
          </div>
        </div>}
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-brand-100 bg-brand-50 px-3 py-3 @xl:px-6">
      <div className="flex w-full items-center gap-2 @2xl:w-auto @2xl:flex-1">
        <button type="button" onClick={() => goTo(0)} aria-label="Restart walkthrough" title="Restart" className={btn}><RotateCcw className="h-4 w-4" /></button>
        <button type="button" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous walkthrough step" title="Previous step (←)" className={btn}><SkipBack className="h-4 w-4" /></button>
        <button type="button" onClick={togglePlayback} className="inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">{playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}{playing ? "Pause" : active === steps.length - 1 ? "Replay" : "Play"}</button>
        <button type="button" onClick={() => goTo(active + 1)} disabled={active === steps.length - 1} aria-label="Next walkthrough step" title="Next step (→)" className={btn}><SkipForward className="h-4 w-4" /></button>
      </div>
      {steps.length > 1 && <nav aria-label="Walkthrough steps" className="no-scrollbar flex w-full max-w-full gap-1.5 overflow-x-auto pb-1 @2xl:w-auto @2xl:max-w-[45%]">
        {steps.map((item, index) => <button key={`${item.code}-${index}`} type="button" onClick={() => goTo(index)} aria-label={`Go to step ${index + 1}`} aria-current={index === active ? "step" : undefined} className={`grid h-7 min-w-7 shrink-0 place-items-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums transition ${index === active ? "bg-brand-600 text-white" : index < active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-white text-slate-500 hover:bg-slate-100"}`}>{index < active ? <Check className="h-3 w-3" /> : index + 1}</button>)}
      </nav>}
      <p className="hidden w-full text-center text-[11px] text-slate-500 @3xl:block">Tip: click any code line, drag the progress bar, or focus the player and use <kbd className="rounded bg-white px-1.5 py-0.5 font-mono text-slate-700 ring-1 ring-slate-200">←</kbd> <kbd className="rounded bg-white px-1.5 py-0.5 font-mono text-slate-700 ring-1 ring-slate-200">→</kbd> <kbd className="rounded bg-white px-1.5 py-0.5 font-mono text-slate-700 ring-1 ring-slate-200">Space</kbd>.</p>
    </div>
  </section>;
}
