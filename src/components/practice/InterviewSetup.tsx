"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
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
  const selectedType = INTERVIEW_TYPES.find((t) => t.id === type)!;
  const selectedDifficulty = DIFFICULTIES.find((d) => d.id === difficulty)?.label ?? difficulty;
  const selectedPersona = PERSONAS.find((p) => p.id === persona)?.label ?? persona;
  const selectedLength = LENGTHS.find((l) => l.id === length)?.label ?? length;

  const start = async () => {
    if (busy) return;
    if (!loggedIn) { router.push("/login?next=%2Fpractice%2Finterview"); return; }
    setBusy(true);
    setError(null);
    const res = await postJson<{ id: string }>("/api/practice/sessions", { module: "INTERVIEW", config: { type, difficulty, persona, length, role, resume } });
    if (res.ok) router.push(`/practice/interview/${res.data.id}`);
    else { setError(res.error); setBusy(false); }
  };

  const chip = (active: boolean) => cn("rounded-2xl border px-3.5 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300", active ? "border-[#10264A] bg-[#10264A] text-white" : "border-border-soft bg-surface hover:border-story-royal/50");

  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(21rem,0.7fr)] 2xl:grid-cols-[minmax(0,1.45fr)_minmax(23rem,0.65fr)]">
      <Card className="min-w-0 p-5 sm:p-7 lg:p-8">
        <fieldset>
          <legend className="text-lg font-bold tracking-tight">Choose an interview focus</legend>
          <p className="mt-1 text-sm leading-6 text-muted">Each format has its own question mix and follow-up style.</p>
          <div className="mt-5 grid gap-3 min-[520px]:grid-cols-2 2xl:grid-cols-3">
            {INTERVIEW_TYPES.map((t) => (
              <button key={t.id} type="button" aria-pressed={type === t.id} onClick={() => setType(t.id)} className={chip(type === t.id)}>
                <span className="block font-semibold">{t.label}</span>
                <span className={cn("mt-1 block text-xs leading-5", type === t.id ? "text-blue-100/80" : "text-muted")}>{t.desc}</span>
              </button>
            ))}
          </div>
        </fieldset>
      </Card>

      <div className="min-w-0 space-y-5 xl:sticky xl:top-32 xl:self-start">
        <Card className="space-y-5 p-5 sm:p-6">
          <div className="rounded-2xl bg-[#10264A] p-4 text-white">
            <p className="text-xs font-semibold text-blue-100/70">Your interview profile</p>
            <p className="mt-1 text-lg font-bold">{selectedType.label}</p>
            <p className="mt-1 text-xs leading-5 text-blue-100/75">{selectedDifficulty} · {selectedPersona} interviewer · {selectedLength.toLowerCase()} session</p>
          </div>
          <Select
            label="Difficulty"
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
            options={DIFFICULTIES.map(({ id, label }) => ({ value: id, label }))}
          />
          <p className="-mt-3 text-xs leading-5 text-muted">
            {DIFFICULTIES.find((item) => item.id === difficulty)?.desc}
          </p>
          <Select
            label="Interviewer"
            value={persona}
            onChange={(event) => setPersona(event.target.value)}
            options={PERSONAS.map(({ id, label, name }) => ({ value: id, label: `${label} · ${name}` }))}
          />
          <Select
            label="Length"
            value={length}
            onChange={(event) => setLength(event.target.value)}
            options={LENGTHS.map(({ id, label, questions, note }) => ({
              value: id,
              label: `${label} · ${questions} questions · ${note}`,
            }))}
          />
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
