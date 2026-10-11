import { Award, CheckCircle2, Code2, Eye, Flag, Keyboard, LifeBuoy, Play, Target, Terminal, Zap } from "lucide-react";

type Props = { title: string; task: string; given: string[]; expectedOutput: string; hintCount: number; needsInput: boolean };

const PATH = [
  { label: "Read the task", icon: Eye },
  { label: "Write code", icon: Code2 },
  { label: "Run it", icon: Play },
  { label: "Submit", icon: Flag },
];
const MAX_OUTPUT_LINES = 6;

/** The graded challenge brief: the mission, what goes in, what must come out, and the path to finishing. */
export function ChallengeBrief({ title, task, given, expectedOutput, hintCount, needsInput }: Props) {
  const outputLines = expectedOutput.replace(/\r\n/g, "\n").trimEnd().split("\n");
  const shown = outputLines.slice(0, MAX_OUTPUT_LINES);
  return <section aria-label="Code challenge" className="mt-5 overflow-hidden rounded-3xl border border-brand-200 bg-background shadow-[0_24px_60px_-36px_rgba(31,86,214,0.55)] dark:border-brand-400/30">
    <div className="relative overflow-hidden bg-gradient-to-br from-story-navy via-story-royal to-story-electric px-5 py-5 text-white sm:px-7 sm:py-6">
      <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-story-cyan/30 blur-3xl" />
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-fuchsia-400/20 blur-3xl" />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/30 backdrop-blur"><Target className="h-6 w-6" aria-hidden="true" /></span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">Step 2 of 2 · Graded challenge</p>
            <h2 className="mt-0.5 text-lg leading-snug sm:truncate sm:text-2xl font-bold tracking-tight sm:text-2xl">{title}</h2>
          </div>
        </div>
        <ul className="flex flex-wrap gap-2 text-xs font-semibold">
          <li className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 ring-1 ring-white/20"><Zap className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />Auto-checked</li>
          <li className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 ring-1 ring-white/20"><Award className="h-3.5 w-3.5 text-cyan-200" aria-hidden="true" />Earns points</li>
          {hintCount > 0 && <li className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 ring-1 ring-white/20"><LifeBuoy className="h-3.5 w-3.5 text-lime-300" aria-hidden="true" />{hintCount} {hintCount === 1 ? "hint" : "hints"}</li>}
        </ul>
      </div>
    </div>

    <div className="p-4 sm:p-7">
      <div className="rounded-2xl border border-brand-200 bg-brand-50/70 p-4 sm:p-5 dark:border-brand-400/25 dark:bg-brand-900/15">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-200">Your mission</p>
        <p className="mt-2 text-lg font-semibold leading-8 text-foreground sm:text-xl">{task}</p>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-amber-300/60 bg-amber-50/60 dark:border-amber-400/25 dark:bg-amber-400/5">
          <p className="flex items-center gap-2 border-b border-amber-300/50 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-800 dark:border-amber-400/20 dark:text-amber-200"><Keyboard className="h-3.5 w-3.5" aria-hidden="true" />{needsInput ? "Input your program reads" : "Given"}</p>
          {given.length
            ? <pre className="overflow-x-auto px-4 py-3 font-mono text-[13px] leading-6 text-amber-950 dark:text-amber-100">{given.join("\n")}</pre>
            : <p className="px-4 py-4 text-sm leading-6 text-amber-900/80 dark:text-amber-100/80">Nothing to read in. Every value you need is in the mission above.</p>}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 shadow-lg">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-slate-900 px-4 py-2.5">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-300"><Terminal className="h-3.5 w-3.5" aria-hidden="true" />Expected result</p>
            <span className="flex gap-1.5" aria-hidden="true"><i className="h-2.5 w-2.5 rounded-full bg-rose-400" /><i className="h-2.5 w-2.5 rounded-full bg-amber-300" /><i className="h-2.5 w-2.5 rounded-full bg-emerald-400" /></span>
          </div>
          <ol className="overflow-x-auto py-3 font-mono text-[13px] leading-6 text-emerald-300">
            {shown.map((line, index) => <li key={index} className="grid min-w-max grid-cols-[2.25rem_1fr] pr-4"><span aria-hidden="true" className="select-none pr-3 text-right text-slate-600">{index + 1}</span><span className="whitespace-pre">{line || " "}</span></li>)}
            {outputLines.length > MAX_OUTPUT_LINES && <li className="pl-[2.25rem] text-slate-500">… {outputLines.length - MAX_OUTPUT_LINES} more {outputLines.length - MAX_OUTPUT_LINES === 1 ? "line" : "lines"}</li>}
          </ol>
        </div>
      </div>

      <ol className="mt-6 grid grid-cols-4 gap-1.5 sm:gap-3" aria-label="How to complete this challenge">
        {PATH.map((item, index) => <li key={item.label} className="relative flex min-w-0 flex-col items-center gap-1.5 rounded-2xl border border-border-soft bg-surface px-1.5 py-3 text-center sm:flex-row sm:gap-3 sm:px-3 sm:text-left">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-story-royal to-story-electric text-white shadow-md shadow-brand-600/25"><item.icon className="h-4 w-4" aria-hidden="true" /></span>
          <div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-wider text-muted sm:text-[10px]">Step {index + 1}</p><p className="text-[11px] font-semibold leading-4 sm:truncate sm:text-sm">{item.label}</p></div>
          {index < PATH.length - 1 && <span aria-hidden="true" className="absolute -right-2.5 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 place-items-center rounded-full bg-background text-brand-500 shadow sm:grid">›</span>}
        </li>)}
      </ol>

      <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-muted"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" /><span><strong className="font-semibold text-foreground">Stuck?</strong> Open Hints or Solution beside the editor. Passing the checks saves progress and unlocks the next lesson.</span></p>
    </div>
  </section>;
}
