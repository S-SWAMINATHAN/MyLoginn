"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, AudioLines, BookOpen, Ear, Gamepad2, Image as ImageIcon, MessageSquareQuote, Repeat2, SpellCheck2, Timer } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { TWISTER_MODES } from "@/lib/practice/speaking/content";
import { Card, postJson } from "./ui";

export type PickerExercise = { kind: string; title: string; short: string; desc: string; group: string; perSession: number };

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
    <div className="grid gap-5 lg:grid-cols-[1fr_21rem]">
      <div className="space-y-4">
        <div role="tablist" aria-label="Exercise groups" className="flex flex-wrap gap-2">
          {GROUPS.map((g) => <button key={g.id} role="tab" type="button" aria-selected={group === g.id} onClick={() => setGroup(g.id)} className={cn("rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors", group === g.id ? "bg-story-royal text-white" : "bg-surface text-muted hover:text-story-royal")}>{g.label}</button>)}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {shown.map((e) => {
            const Icon = ICONS[e.kind] ?? AudioLines;
            return (
              <button key={e.kind} type="button" aria-pressed={kind === e.kind} onClick={() => setKind(e.kind)} className={cn("flex gap-3 rounded-3xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300", kind === e.kind ? "border-story-royal bg-story-royal/5" : "border-border-soft bg-surface hover:border-story-royal/40")}>
                <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-2xl", kind === e.kind ? "bg-story-royal text-white" : "bg-story-mist text-story-royal dark:bg-surface-2")}><Icon className="h-5 w-5" /></span>
                <span className="min-w-0"><span className="block font-semibold">{e.title}</span><span className="mt-0.5 block text-sm leading-6 text-muted">{e.short}</span></span>
              </button>
            );
          })}
        </div>
      </div>

      <Card className="h-fit space-y-4 lg:sticky lg:top-32">
        <div>
          <p className="text-lg font-bold">{selected.title}</p>
          <p className="mt-1 text-sm leading-6 text-muted">{selected.desc}</p>
          <p className="mt-2 text-xs text-muted">{selected.perSession} item{selected.perSession > 1 ? "s" : ""} per session · instant feedback after each attempt</p>
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
          <label className="block text-sm font-semibold">Type
            <select value={focus} onChange={(e) => setFocus(e.target.value)} className="mt-2 w-full rounded-2xl border border-border-soft bg-background px-3.5 py-2.5 text-sm outline-none focus:border-story-royal">
              {FLUENCY_FOCUS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select>
          </label>
        ) : null}
        {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
        <Button size="lg" className="w-full" onClick={() => void start()} disabled={busy} icon={<ArrowRight className="h-5 w-5" />}>{busy ? "Preparing…" : loggedIn ? "Start" : "Log in to start"}</Button>
      </Card>
    </div>
  );
}
