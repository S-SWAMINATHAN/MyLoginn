"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, Loader2, MonitorUp, Play, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/useReducedMotion";

const CODE = `def max_subarray(nums):
    best = cur = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)
        best = max(best, cur)
    return best

n = int(input())
print(max_subarray(list(map(int, input().split()))))`;

const TESTS = ["Sample 1", "Sample 2", "Hidden 1", "Hidden 2", "Hidden 3"];
type Phase = "typing" | "running" | "passed" | "rest";

/** Syntax colouring for the preview only: keywords, builtins, numbers. */
function Line({ text }: { text: string }) {
  const parts = text.split(/(\b(?:def|for|in|return)\b|\b(?:max|int|input|print|list|map)\b|\d+)/g);
  return (
    <>
      {parts.map((p, i) =>
        /^(def|for|in|return)$/.test(p) ? <span key={i} className="text-[#7c3aed]">{p}</span>
        : /^(max|int|input|print|list|map)$/.test(p) ? <span key={i} className="text-[#1f56d6]">{p}</span>
        : /^\d+$/.test(p) ? <span key={i} className="text-[#c2410c]">{p}</span>
        : <span key={i}>{p}</span>
      )}
    </>
  );
}

/** A looping, light-theme mock of the competition arena for the landing hero. */
export function ArenaPreview() {
  const reduced = useReducedMotion();
  const [typed, setTyped] = useState(reduced ? CODE.length : 0);
  const [phase, setPhase] = useState<Phase>(reduced ? "passed" : "typing");
  const [passed, setPassed] = useState(reduced ? TESTS.length : 0);
  const [clock, setClock] = useState(5325);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setClock((c) => (c > 0 ? c - 1 : 5400)), 1000);
    return () => clearInterval(id);
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;
    let t: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      if (typed < CODE.length) t = setTimeout(() => setTyped((n) => Math.min(CODE.length, n + (CODE[n] === " " ? 2 : 1))), 28);
      else t = setTimeout(() => setPhase("running"), 500);
    } else if (phase === "running") {
      if (passed < TESTS.length) t = setTimeout(() => setPassed((n) => n + 1), 420);
      else t = setTimeout(() => setPhase("passed"), 300);
    } else if (phase === "passed") t = setTimeout(() => setPhase("rest"), 2600);
    else
      t = setTimeout(() => {
        setTyped(0);
        setPassed(0);
        setPhase("typing");
      }, 400);
    return () => clearTimeout(t);
  }, [phase, typed, passed, reduced]);

  const lines = CODE.slice(0, typed).split("\n");
  const mm = String(Math.floor(clock / 60) % 60).padStart(2, "0");
  const hh = String(Math.floor(clock / 3600)).padStart(2, "0");
  const ss = String(clock % 60).padStart(2, "0");

  return (
    <div aria-hidden="true" className="relative w-full overflow-hidden rounded-[1.4rem] border border-[#dbe5f7] bg-white text-[#0b1f4d] shadow-[0_24px_60px_-18px_rgba(31,86,214,0.35)]">
      {/* window bar */}
      <div className="flex items-center gap-2 border-b border-[#e6edf9] bg-[#f6f9ff] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b6b]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#ffc94d]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#38d27a]" />
        <span className="ml-3 truncate text-[11px] font-semibold text-[#576179]">Arena · Question 2 of 3</span>
        <span className="ml-auto flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold tabular-nums text-[#1f56d6] ring-1 ring-[#dbe5f7]">
          <Clock className="h-3 w-3" />
          {hh}:{mm}:{ss}
        </span>
      </div>
      <div className="grid sm:grid-cols-[0.9fr_1.1fr]">
        {/* problem */}
        <div className="hidden border-r border-[#eef2fa] p-4 sm:block">
          <span className="rounded-full bg-[#fff4e5] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#c2410c]">Medium · 30 marks</span>
          <p className="mt-2.5 text-sm font-bold">Maximum Subarray</p>
          <p className="mt-1.5 text-[11.5px] leading-5 text-[#576179]">Given n integers, print the largest sum of any non-empty contiguous subarray.</p>
          <div className="mt-3 rounded-lg bg-[#f6f9ff] p-2.5 font-mono text-[10.5px] leading-4 text-[#334155]">
            <p className="text-[9.5px] font-sans font-bold uppercase tracking-wide text-[#94a3b8]">Example</p>
            5<br />-2 1 -3 4 -1 → <b>4</b>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10.5px] font-semibold text-[#16a34a]">
            <MonitorUp className="h-3.5 w-3.5" /> Screen shared
            <ShieldCheck className="ml-2 h-3.5 w-3.5" /> Monitored
          </div>
        </div>
        {/* editor */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 border-b border-[#eef2fa] px-3 py-1.5 text-[10.5px] font-semibold text-[#576179]">
            <span className="rounded-md bg-[#eef4ff] px-2 py-0.5 text-[#1f56d6]">main.py</span>
            <span className="ml-auto">Python 3</span>
          </div>
          <pre className="h-[11.5rem] overflow-hidden px-3 py-2.5 font-mono text-[11.5px] leading-[1.35rem]">
            {lines.map((l, i) => (
              <div key={i} className="flex">
                <span className="w-5 shrink-0 select-none pr-2 text-right text-[#b6c2d9]">{i + 1}</span>
                <span className="whitespace-pre">
                  <Line text={l} />
                  {i === lines.length - 1 && phase === "typing" && <span className="ml-px inline-block h-4 w-[2px] translate-y-[3px] animate-pulse bg-[#1f56d6]" />}
                </span>
              </div>
            ))}
          </pre>
          <div className="border-t border-[#eef2fa] bg-[#fbfcff] px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className={cn("flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-bold transition-colors", phase === "running" ? "bg-[#1f56d6] text-white" : "bg-[#eef4ff] text-[#1f56d6]")}>
                {phase === "running" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />} Run
              </span>
              <div className="flex flex-1 flex-wrap gap-1">
                {TESTS.map((t, i) => (
                  <span key={t} className={cn("flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold transition-colors", i < passed ? "bg-[#e9f9ef] text-[#15803d]" : "bg-[#f1f4f9] text-[#94a3b8]")}>
                    {i < passed ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                    <span className="hidden min-[400px]:inline">{t}</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#eef2fa]">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-[#1f56d6] to-[#22d3ee]" animate={{ width: `${(passed / TESTS.length) * 100}%` }} transition={{ duration: 0.35 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
