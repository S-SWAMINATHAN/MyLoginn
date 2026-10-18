"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { DIFFICULTIES, INTERVIEW_TYPES, LENGTHS, MAX_RESUME_CHARS, PERSONAS } from "@/lib/practice/interview/config";
import { Card, postJson } from "./ui";

export function InterviewSetup({ loggedIn }: { loggedIn: boolean }) {
  const router = useRouter();
  const [type, setType] = useState("hr");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [persona, setPersona] = useState("professional");
  const [length, setLength] = useState("standard");
  const [role, setRole] = useState("");
  const [resume, setResume] = useState("");
  const [showResume, setShowResume] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    if (busy) return;
    if (!loggedIn) { router.push("/login?next=%2Fpractice%2Finterview"); return; }
    setBusy(true);
    setError(null);
    const res = await postJson<{ id: string }>("/api/practice/sessions", { module: "INTERVIEW", config: { type, difficulty, persona, length, role, resume } });
    if (res.ok) router.push(`/practice/interview/${res.data.id}`);
    else { setError(res.error); setBusy(false); }
  };

  const chip = (active: boolean) => cn("rounded-2xl border px-3.5 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300", active ? "border-story-royal bg-story-royal/10 text-story-royal" : "border-border-soft bg-surface hover:border-story-royal/40");

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
      <Card>
        <fieldset>
          <legend className="text-sm font-semibold">Interview type</legend>
          <div className="mt-3 grid gap-2 min-[520px]:grid-cols-2 xl:grid-cols-3">
            {INTERVIEW_TYPES.map((t) => (
              <button key={t.id} type="button" aria-pressed={type === t.id} onClick={() => setType(t.id)} className={chip(type === t.id)}>
                <span className="block font-semibold">{t.label}</span>
                <span className="mt-0.5 block text-xs leading-5 text-muted">{t.desc}</span>
              </button>
            ))}
          </div>
        </fieldset>
      </Card>

      <div className="space-y-5">
        <Card className="space-y-5">
          <fieldset>
            <legend className="text-sm font-semibold">Difficulty</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {DIFFICULTIES.map((d) => <button key={d.id} type="button" title={d.desc} aria-pressed={difficulty === d.id} onClick={() => setDifficulty(d.id)} className={cn(chip(difficulty === d.id), "py-1.5")}>{d.label}</button>)}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-semibold">Interviewer</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {PERSONAS.map((p) => <button key={p.id} type="button" aria-pressed={persona === p.id} onClick={() => setPersona(p.id)} className={cn(chip(persona === p.id), "py-2")}><span className="block font-semibold">{p.label}</span><span className="text-xs text-muted">{p.name}</span></button>)}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-semibold">Length</legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {LENGTHS.map((l) => <button key={l.id} type="button" aria-pressed={length === l.id} onClick={() => setLength(l.id)} className={cn(chip(length === l.id), "py-2 text-center")}><span className="block font-semibold">{l.label}</span><span className="block text-xs text-muted">{l.questions} questions</span><span className="block text-xs text-muted">{l.note}</span></button>)}
            </div>
          </fieldset>
          <label className="block">
            <span className="text-sm font-semibold">Target role <span className="font-normal text-muted">(optional)</span></span>
            <input value={role} onChange={(e) => setRole(e.target.value.slice(0, 80))} placeholder="e.g. QA Automation Engineer" className="mt-2 w-full rounded-2xl border border-border-soft bg-background px-3.5 py-2.5 text-sm outline-none focus:border-story-royal" />
          </label>
          <div>
            <button type="button" onClick={() => setShowResume((v) => !v)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-story-royal hover:underline"><FileText className="h-4 w-4" />{showResume ? "Hide resume" : "Add resume for tailored questions"}</button>
            {showResume ? (
              <label className="mt-2 block">
                <span className="sr-only">Resume text</span>
                <textarea value={resume} onChange={(e) => setResume(e.target.value.slice(0, MAX_RESUME_CHARS))} rows={7} placeholder="Paste your resume text: skills, projects, experience, tools…" className="w-full rounded-2xl border border-border-soft bg-background px-3.5 py-2.5 text-sm leading-6 outline-none focus:border-story-royal" />
                <span className="mt-1 block text-xs text-muted">{resume.length}/{MAX_RESUME_CHARS} · The interviewer only asks about what your resume says.</span>
              </label>
            ) : null}
          </div>
        </Card>
        {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
        <Button size="lg" className="w-full" onClick={() => void start()} disabled={busy} icon={<ArrowRight className="h-5 w-5" />}>{busy ? "Preparing your interview…" : loggedIn ? "Start interview" : "Log in to start"}</Button>
      </div>
    </div>
  );
}
