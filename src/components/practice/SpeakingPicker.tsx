"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, AudioLines, BookOpen, Ear, Gamepad2, Image as ImageIcon, MessageSquareQuote, Repeat2, SpellCheck2, Timer } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { TWISTER_MODES } from "@/lib/practice/speaking/content";
import { Card, postJson } from "./ui";

export type PickerExercise = { kind: string; title: string; short: string; desc: string; group: string; perSession: number; itemCount: number };

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  repeat: Repeat2, pronounce: SpellCheck2, describe: ImageIcon, story: BookOpen, listen: Ear, comprehension: AudioLines, grammar: MessageSquareQuote, fluency: Timer, twister: Gamepad2,
};
const GROUPS = [
  { id: "all", label: "All" },
  { id: "verbal", label: "Verbal communication" },
  { id: "fluency", label: "Fluency" },
  { id: "games", label: "Games" },
];
const FLUENCY_FOCUS = [
  { id: "", label: "Mixed" }, { id: "one-minute", label: "One minute" }, { id: "two-minute", label: "Two minutes" }, { id: "opinion", label: "Opinion" },
  { id: "workplace", label: "Workplace" }, { id: "interview", label: "Interview answer" }, { id: "impromptu", label: "Impromptu" },
];

export function SpeakingPicker({ exercises, loggedIn, initialKind, initialGroup }: { exercises: PickerExercise[]; loggedIn: boolean; initialKind?: string; initialGroup?: string }) {
  const router = useRouter();
  const [group, setGroup] = useState(initialGroup && GROUPS.some((g) => g.id === initialGroup) ? initialGroup : "all");
  const [kind, setKind] = useState(initialKind && exercises.some((e) => e.kind === initialKind) ? initialKind : exercises[0].kind);
  const [mode, setMode] = useState<string>("practice");
  const [focus, setFocus] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shown = exercises.filter((e) => group === "all" || e.group === group || (group === "fluency" && (e.kind === "pronounce" || e.kind === "twister")));
  const selected = exercises.find((e) => e.kind === kind)!;

  const start = async () => {
    if (busy) return;
    if (!loggedIn) { router.push("/login?next=%2Fpractice%2Fspeaking"); return; }
    setBusy(true);
    setError(null);
    const res = await postJson<{ id: string }>("/api/practice/sessions", { module: "SPEAKING", config: { kind, mode, focus } });
    if (res.ok) router.push(`/practice/speaking/${res.data.id}`);
    else { setError(res.error); setBusy(false); }
  };

  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,26rem)]">
      <div className="min-w-0 space-y-5">
        <div role="tablist" aria-label="Exercise groups" className="flex flex-wrap gap-2">
          {GROUPS.map((g) => <button key={g.id} role="tab" type="button" aria-selected={group === g.id} onClick={() => setGroup(g.id)} className={cn("rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors", group === g.id ? "bg-story-royal text-white" : "bg-surface text-muted hover:text-story-royal")}>{g.label}</button>)}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          {shown.map((e) => {
            const Icon = ICONS[e.kind] ?? AudioLines;
            return (
              <button key={e.kind} type="button" aria-pressed={kind === e.kind} onClick={() => setKind(e.kind)} className={cn("flex min-h-28 gap-3 rounded-2xl border p-4 text-left transition-[border-color,background-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300", kind === e.kind ? "border-story-royal bg-story-royal/5 shadow-[var(--shadow-soft)]" : "border-border-soft bg-surface hover:border-story-royal/40")}>
                <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", kind === e.kind ? "bg-[#10264A] text-white" : "bg-story-mist text-story-royal dark:bg-surface-2")}><Icon className="h-5 w-5" /></span>
                <span className="min-w-0"><span className="block font-semibold">{e.title}</span><span className="mt-1 block text-sm leading-6 text-muted">{e.short}</span></span>
              </button>
            );
          })}
        </div>
      </div>

      <Card className="h-fit space-y-5 p-5 sm:p-6 xl:sticky xl:top-32">
        <div>
          <p className="text-xs font-semibold text-story-royal">Selected exercise</p>
          <p className="mt-1 text-xl font-bold tracking-tight">{selected.title}</p>
          <p className="mt-1 text-sm leading-6 text-muted">{selected.desc}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 border-y border-border-soft py-3">
            <p><span className="block text-xs text-muted">This session</span><strong className="mt-1 block text-2xl font-bold tabular-nums text-foreground">{selected.perSession}</strong></p>
            <p><span className="block text-xs text-muted">Question bank</span><strong className="mt-1 block text-2xl font-bold tabular-nums text-foreground">{selected.itemCount}</strong></p>
          </div>
        </div>
        {kind === "twister" ? (
          <fieldset>
            <legend className="text-sm font-semibold">Game mode</legend>
            <div className="mt-2 grid gap-2">
              {TWISTER_MODES.map((m) => <button key={m.id} type="button" aria-pressed={mode === m.id} onClick={() => setMode(m.id)} className={cn("rounded-2xl border px-3 py-2 text-left text-sm", mode === m.id ? "border-story-royal bg-story-royal/10" : "border-border-soft hover:border-story-royal/40")}><span className="font-semibold">{m.label}</span><span className="block text-xs text-muted">{m.desc}</span></button>)}
            </div>
          </fieldset>
        ) : null}
        {kind === "fluency" ? (
          <Select
            label="Focus"
            value={focus}
            options={FLUENCY_FOCUS.map((f) => ({ label: f.label, value: f.id }))}
            className="rounded-2xl"
            onChange={(e) => setFocus(e.target.value)}
          />
        ) : null}
        {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
        <Button size="lg" className="w-full" onClick={() => void start()} disabled={busy} icon={<ArrowRight className="h-5 w-5" />}>{busy ? "Preparing…" : loggedIn ? "Start" : "Log in to start"}</Button>
      </Card>
    </div>
  );
}
