"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Lock, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/admin/Modal";
import { COMPETITION_LANGUAGES, LANGUAGE_KEYS, type CompetitionLanguage } from "@/lib/competition/languages";
import { DEFAULT_POLICY, describePolicy, parsePolicy, type ViolationPolicy } from "@/lib/competition/policy";
import { scheduleProblems } from "@/lib/competition/state";
import { blueprintMaxScore, DIFFICULTIES, type BlueprintSlot, type Difficulty } from "@/lib/competition/types";
import { adminCall, Btn, Field, fromLocalInput, inputCls, Panel, toLocalInput } from "./ui";

export type CompetitionRow = {
  id: string;
  status: string;
  slug: string;
  title: string;
  description: string;
  eligibility: string;
  rules: string;
  timezone: string;
  registrationOpensAt: string;
  registrationClosesAt: string;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  lateJoinMinutes: number;
  resultsPublishAt: string;
  maxParticipants: number;
  languages: unknown;
  blueprint: unknown;
  negativeMarkPerWrong: number;
  timeBalanceTolerance: number;
  violationPolicy: unknown;
  screenShareRequired: boolean;
  fullscreenRequired: boolean;
  tieBreakBySubmitTime: boolean;
  autosaveCountsAsSubmission: boolean;
  certificateMinPercent: number;
  candidatePrefix: string;
};

const POLICY_LABEL: Record<keyof ViolationPolicy, string> = {
  ignoreFocusLossUnderMs: "Ignore focus loss shorter than (ms)",
  warningsBeforeRisk: "Warnings before risk",
  flagAfterFocusLosses: "Flag after focus losses",
  flagAfterFullscreenExits: "Flag after full-screen exits",
  flagAfterShareStops: "Flag after screen-share stops",
  largePasteChars: "Large paste (characters)",
  flagAfterResumes: "Flag after reconnects",
};

const addMinutes = (iso: string, m: number) => (iso ? new Date(new Date(iso).getTime() + m * 60_000).toISOString() : "");

/** Create or edit a competition. After registration opens, the rules candidates signed up for are read-only. */
export function CompetitionForm({ initial, onSaved }: { initial: CompetitionRow | null; onSaved: (id: string) => void }) {
  const toast = useToast();
  const locked = !!initial && initial.status !== "DRAFT";
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState(() => ({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    eligibility: initial?.eligibility ?? "",
    rules: initial?.rules ?? "",
    timezone: initial?.timezone ?? "Asia/Kolkata",
    registrationOpensAt: initial?.registrationOpensAt ?? "",
    registrationClosesAt: initial?.registrationClosesAt ?? "",
    startsAt: initial?.startsAt ?? "",
    endsAt: initial?.endsAt ?? "",
    durationMinutes: initial?.durationMinutes ?? 90,
    lateJoinMinutes: initial?.lateJoinMinutes ?? 15,
    resultsPublishAt: initial?.resultsPublishAt ?? "",
    maxParticipants: initial?.maxParticipants ?? 1000,
    candidatePrefix: initial?.candidatePrefix ?? "MLC",
    languages: (Array.isArray(initial?.languages) ? initial!.languages : ["python", "javascript", "java", "cpp"]) as CompetitionLanguage[],
    blueprint: (Array.isArray(initial?.blueprint) && (initial!.blueprint as BlueprintSlot[]).length ? initial!.blueprint : [{ difficulty: "EASY", count: 1, marks: 20 }, { difficulty: "MEDIUM", count: 1, marks: 30 }, { difficulty: "HARD", count: 1, marks: 50 }]) as BlueprintSlot[],
    negativeMarkPerWrong: initial?.negativeMarkPerWrong ?? 0,
    timeBalanceTolerance: initial?.timeBalanceTolerance ?? 0.15,
    certificateMinPercent: initial?.certificateMinPercent ?? 0,
    screenShareRequired: initial?.screenShareRequired ?? true,
    fullscreenRequired: initial?.fullscreenRequired ?? true,
    tieBreakBySubmitTime: initial?.tieBreakBySubmitTime ?? true,
    autosaveCountsAsSubmission: initial?.autosaveCountsAsSubmission ?? true,
    violationPolicy: initial ? parsePolicy(initial.violationPolicy) : { ...DEFAULT_POLICY },
  }));
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  const problems = useMemo(() => {
    if (!f.registrationOpensAt || !f.registrationClosesAt || !f.startsAt || !f.endsAt || !f.resultsPublishAt) return ["Fill in every date and time."];
    return scheduleProblems({ registrationOpensAt: new Date(f.registrationOpensAt), registrationClosesAt: new Date(f.registrationClosesAt), startsAt: new Date(f.startsAt), endsAt: new Date(f.endsAt), resultsPublishAt: new Date(f.resultsPublishAt), durationMinutes: Number(f.durationMinutes), lateJoinMinutes: Number(f.lateJoinMinutes) });
  }, [f]);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (problems.length) return toast("error", problems[0]);
    setBusy(true);
    try {
      const body = { ...f, durationMinutes: Number(f.durationMinutes), lateJoinMinutes: Number(f.lateJoinMinutes), maxParticipants: Number(f.maxParticipants), negativeMarkPerWrong: Number(f.negativeMarkPerWrong), timeBalanceTolerance: Number(f.timeBalanceTolerance), certificateMinPercent: Number(f.certificateMinPercent), blueprint: f.blueprint.map((b) => ({ ...b, count: Number(b.count), marks: Number(b.marks) })) };
      if (initial) {
        await adminCall(`/api/admin/coding-competition/${initial.id}`, body, "PUT");
        toast("success", "Competition saved");
        onSaved(initial.id);
      } else {
        const r = await adminCall<{ id: string }>("/api/admin/coding-competition", body);
        toast("success", "Competition created as a draft");
        onSaved(r.id);
      }
    } catch (err) {
      toast("error", (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const dt = (k: "registrationOpensAt" | "registrationClosesAt" | "startsAt" | "endsAt" | "resultsPublishAt") => (
    <input type="datetime-local" className={inputCls} value={toLocalInput(f[k])} onChange={(e) => set(k, fromLocalInput(e.target.value))} />
  );
  const lockNote = locked ? <span className="ml-1 inline-flex items-center gap-1 text-[11px] font-medium text-amber-700"><Lock className="h-3 w-3" /> locked after registration opened</span> : null;

  return (
    <form onSubmit={save} className="space-y-5">
      <Panel title="Details">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title"><input className={inputCls} value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="MyLoginn Coding Cup 2026" required /></Field>
          <Field label="URL slug" hint="Lowercase letters, digits and hyphens. Internal reference only."><input className={inputCls} value={f.slug} disabled={locked} onChange={(e) => set("slug", e.target.value.toLowerCase())} placeholder="coding-cup-2026" required /></Field>
          <Field label="Description" className="md:col-span-2"><textarea className={inputCls} rows={3} value={f.description} onChange={(e) => set("description", e.target.value)} /></Field>
          <Field label="Eligibility" className="md:col-span-2"><textarea className={inputCls} rows={3} value={f.eligibility} onChange={(e) => set("eligibility", e.target.value)} /></Field>
          <Field label="Rules (shown on the rules page)" className="md:col-span-2"><textarea className={inputCls} rows={5} value={f.rules} onChange={(e) => set("rules", e.target.value)} /></Field>
        </div>
      </Panel>

      <Panel title="Schedule" sub="Enter times in your browser's time zone; candidates see them in the competition time zone.">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Time zone"><input className={inputCls} value={f.timezone} onChange={(e) => set("timezone", e.target.value)} /></Field>
          <Field label="Registration opens">{dt("registrationOpensAt")}</Field>
          <Field label="Registration closes">{dt("registrationClosesAt")}</Field>
          <Field label="Competition starts">{dt("startsAt")}</Field>
          <Field label={`Duration (minutes)`}><input type="number" className={inputCls} disabled={locked} value={f.durationMinutes} onChange={(e) => set("durationMinutes", Number(e.target.value))} /></Field>
          <Field label="Late-join window (minutes)" hint="Candidates may start until start + this."><input type="number" className={inputCls} disabled={locked} value={f.lateJoinMinutes} onChange={(e) => set("lateJoinMinutes", Number(e.target.value))} /></Field>
          <Field label="Window ends" hint={<button type="button" className="font-semibold text-story-royal" onClick={() => set("endsAt", addMinutes(f.startsAt, Number(f.lateJoinMinutes) + Number(f.durationMinutes)))}>Set to start + late-join + duration</button>}>{dt("endsAt")}</Field>
          <Field label="Results published">{dt("resultsPublishAt")}</Field>
          <Field label="Maximum participants"><input type="number" className={inputCls} disabled={locked} value={f.maxParticipants} onChange={(e) => set("maxParticipants", Number(e.target.value))} /></Field>
        </div>
        {problems.length > 0 && <ul className="mt-4 space-y-1 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">{problems.map((p) => <li key={p}>• {p}</li>)}</ul>}
      </Panel>

      <Panel title="Questions & scoring" sub={<>Total {blueprintMaxScore(f.blueprint)} marks. {lockNote}</>}>
        <div className="space-y-2">
          {f.blueprint.map((b, i) => (
            <div key={i} className="grid grid-cols-[1fr_6rem_6rem_auto] items-end gap-2">
              <Field label={i ? "" : "Difficulty"}><select className={inputCls} disabled={locked} value={b.difficulty} onChange={(e) => set("blueprint", f.blueprint.map((x, j) => (j === i ? { ...x, difficulty: e.target.value as Difficulty } : x)))}>{DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}</select></Field>
              <Field label={i ? "" : "Questions"}><input type="number" min={1} className={inputCls} disabled={locked} value={b.count} onChange={(e) => set("blueprint", f.blueprint.map((x, j) => (j === i ? { ...x, count: Number(e.target.value) } : x)))} /></Field>
              <Field label={i ? "" : "Marks each"}><input type="number" min={1} className={inputCls} disabled={locked} value={b.marks} onChange={(e) => set("blueprint", f.blueprint.map((x, j) => (j === i ? { ...x, marks: Number(e.target.value) } : x)))} /></Field>
              <button type="button" disabled={locked || f.blueprint.length < 2} onClick={() => set("blueprint", f.blueprint.filter((_, j) => j !== i))} className="mb-1 rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-danger disabled:opacity-30" aria-label="Remove slot"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          {!locked && <Btn small tone="ghost" onClick={() => set("blueprint", [...f.blueprint, { difficulty: "MEDIUM", count: 1, marks: 25 }])}><Plus className="h-3.5 w-3.5" /> Add slot</Btn>}
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <Field label="Languages" className="md:col-span-4">
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_KEYS.map((l) => (
                <label key={l} className="flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-sm">
                  <input type="checkbox" disabled={locked} checked={f.languages.includes(l)} onChange={(e) => set("languages", e.target.checked ? [...f.languages, l] : f.languages.filter((x) => x !== l))} />
                  {COMPETITION_LANGUAGES[l].label}
                </label>
              ))}
            </div>
          </Field>
          <Field label="Negative marks per zero-score answer"><input type="number" step="0.5" min={0} className={inputCls} disabled={locked} value={f.negativeMarkPerWrong} onChange={(e) => set("negativeMarkPerWrong", Number(e.target.value))} /></Field>
          <Field label="Time-balance tolerance" hint="0.15 = sets within ±15% of target time"><input type="number" step="0.01" className={inputCls} disabled={locked} value={f.timeBalanceTolerance} onChange={(e) => set("timeBalanceTolerance", Number(e.target.value))} /></Field>
          <Field label="Certificate minimum score %"><input type="number" min={0} max={100} className={inputCls} disabled={locked} value={f.certificateMinPercent} onChange={(e) => set("certificateMinPercent", Number(e.target.value))} /></Field>
          <Field label="Candidate ID prefix"><input className={inputCls} disabled={locked} value={f.candidatePrefix} onChange={(e) => set("candidatePrefix", e.target.value.toUpperCase())} /></Field>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {([
            ["screenShareRequired", "Require entire-screen sharing"],
            ["fullscreenRequired", "Require full screen"],
            ["tieBreakBySubmitTime", "Break ties by earlier final scoring submission"],
            ["autosaveCountsAsSubmission", "Autosaved code counts as the answer if not submitted"],
          ] as const).map(([k, label]) => (
            <label key={k} className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
              <input type="checkbox" disabled={locked} checked={f[k]} onChange={(e) => set(k, e.target.checked)} /> {label}
            </label>
          ))}
        </div>
      </Panel>

      <Panel title="Monitoring policy" sub={<>Published to candidates exactly as configured. {lockNote}</>}>
        <div className="grid gap-4 md:grid-cols-4">
          {(Object.keys(POLICY_LABEL) as (keyof ViolationPolicy)[]).map((k) => (
            <Field key={k} label={POLICY_LABEL[k]}><input type="number" min={0} className={inputCls} disabled={locked} value={f.violationPolicy[k]} onChange={(e) => set("violationPolicy", { ...f.violationPolicy, [k]: Number(e.target.value) })} /></Field>
          ))}
        </div>
        <ul className="mt-4 space-y-1 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">{describePolicy(f.violationPolicy, f).map((l) => <li key={l}>• {l}</li>)}</ul>
      </Panel>

      <div className="flex justify-end gap-2">
        <Btn type="submit" busy={busy}>{initial ? "Save changes" : "Create draft"}</Btn>
      </div>
    </form>
  );
}
