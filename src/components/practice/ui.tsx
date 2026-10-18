"use client";

import { useEffect, useRef } from "react";
import { Loader2, MicOff } from "lucide-react";
import { cn } from "@/lib/cn";
import { band, bandColor } from "@/lib/practice/speech";
import { MIC_HELP, type MicProblem } from "@/lib/practice/client/recorder";

/** Circular score with the rubric band underneath. */
export function ScoreRing({ score, size = 112, label }: { score: number; size?: number; label?: string }) {
  const r = 42, c = 2 * Math.PI * r;
  const color = bandColor(score);
  return (
    <div className="flex flex-col items-center gap-1.5" role="img" aria-label={`${label ?? "Score"} ${score} out of 100, ${band(score)}`}>
      <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="9" className="text-border-soft" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} style={{ transition: "stroke-dashoffset 700ms cubic-bezier(.16,1,.3,1)" }} />
        <text x="50" y="50" textAnchor="middle" dominantBaseline="central" className="rotate-90 fill-current text-foreground" style={{ transformOrigin: "50px 50px", fontSize: 26, fontWeight: 700 }}>{score}</text>
      </svg>
      <span className="text-xs font-semibold" style={{ color }}>{band(score)}</span>
    </div>
  );
}

/** Horizontal score bars for report dimensions. */
export function DimensionBars({ dims }: { dims: { key: string; label: string; score: number }[] }) {
  return (
    <ul className="grid gap-2.5">
      {dims.map((d) => (
        <li key={d.key} className="grid grid-cols-[minmax(0,9rem)_1fr_2.5rem] items-center gap-3 text-sm">
          <span className="truncate text-muted">{d.label}</span>
          <span className="h-2 overflow-hidden rounded-full bg-story-mist dark:bg-surface-2">
            <span className="block h-full rounded-full" style={{ width: `${d.score}%`, background: bandColor(d.score) }} />
          </span>
          <span className="text-right font-semibold tabular-nums">{d.score}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Live microphone level. Reads the level from a getter on every animation frame and writes straight to the DOM, so a
 * 60 fps meter causes zero React re-renders.
 */
export function LevelMeter({ getLevel, active, bars = 24 }: { getLevel: () => number; active: boolean; bars?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const history = new Array(bars).fill(0);
    const tick = () => {
      history.shift();
      history.push(Math.min(1, getLevel() * 9));
      const el = ref.current;
      if (el) for (let i = 0; i < el.children.length; i++) (el.children[i] as HTMLElement).style.transform = `scaleY(${0.08 + history[i] * 0.92})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, bars, getLevel]);
  return (
    <div ref={ref} aria-hidden className="flex h-10 items-center gap-[3px]">
      {Array.from({ length: bars }, (_, i) => (
        <span key={i} className={cn("h-full w-1 origin-center rounded-full transition-colors", active ? "bg-story-royal" : "bg-border-soft")} style={{ transform: "scaleY(0.08)" }} />
      ))}
    </div>
  );
}

export function MicHelp({ problem, onRetry }: { problem: MicProblem; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm">
      <MicOff className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
      <div className="min-w-0">
        <p className="font-semibold text-danger">Microphone unavailable</p>
        <p className="mt-1 leading-6 text-muted">{MIC_HELP[problem]}</p>
        {onRetry ? <button type="button" onClick={onRetry} className="mt-2 text-sm font-semibold text-story-royal hover:underline">Try again</button> : null}
      </div>
    </div>
  );
}

/** A status line with a spinner, e.g. "Analysing your answer… 6s". */
export function Working({ label, detail }: { label: string; detail?: string }) {
  return (
    <p role="status" aria-live="polite" className="inline-flex items-center gap-2 text-sm font-medium text-story-royal">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
      {detail ? <span className="text-muted tabular-nums">{detail}</span> : null}
    </p>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-3xl border border-border-soft bg-surface p-5 sm:p-6", className)}>{children}</div>;
}

export function Chip({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "good" | "warn" | "bad" | "brand" }) {
  const tones = { default: "bg-story-mist text-muted dark:bg-surface-2", good: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", warn: "bg-amber-500/10 text-amber-700 dark:text-amber-300", bad: "bg-danger/10 text-danger", brand: "bg-story-royal/10 text-story-royal" };
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone])}>{children}</span>;
}

/** Sends a recorded answer. Keeps the error message student-friendly and distinguishes "offline" from "server". */
export async function sendForm<T>(url: string, form: FormData, timeoutMs = 75_000): Promise<{ ok: true; data: T } | { ok: false; error: string; noSpeech?: boolean; status: number }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method: "POST", body: form, signal: controller.signal });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error ?? "Something went wrong. Your session is safe — please retry.", noSpeech: data.noSpeech, status: res.status };
    return { ok: true, data: data as T };
  } catch {
    const offline = typeof navigator !== "undefined" && !navigator.onLine;
    return { ok: false, status: 0, error: offline ? "You appear to be offline. Your answer is kept — tap Retry when you're connected." : controller.signal.aborted ? "The request timed out. Your answer is kept — tap Retry." : "Network problem. Your answer is kept — tap Retry." };
  } finally {
    clearTimeout(timer);
  }
}

export async function postJson<T>(url: string, body?: unknown): Promise<{ ok: true; data: T } | { ok: false; error: string; status: number }> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error ?? "Something went wrong. Please retry.", status: res.status };
    return { ok: true, data: data as T };
  } catch {
    return { ok: false, status: 0, error: "Network problem. Please check your connection and retry." };
  }
}

export const fmtClock = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
