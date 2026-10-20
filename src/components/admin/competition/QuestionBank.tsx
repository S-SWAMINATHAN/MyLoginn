"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Lock, Plus, PlayCircle, Trash2 } from "lucide-react";
import { Modal, useToast } from "@/components/admin/Modal";
import { useLiveData } from "@/components/admin/useLiveData";
import { cn } from "@/lib/cn";
import { COMPETITION_LANGUAGES, LANGUAGE_KEYS, type CompetitionLanguage } from "@/lib/competition/languages";
import { DIFFICULTIES, type Difficulty } from "@/lib/competition/types";
import { adminCall, Badge, Btn, Empty, Field, inputCls, Panel } from "./ui";

type Row = { id: string; family: string; version: number; title: string; difficulty: Difficulty; topic: string; expectedMinutes: number; active: boolean; lockedAt: string | null; languages: string[]; _count: { tests: number; assignments: number } };
type Test = { input: string; expected: string; isSample: boolean; weight: number };
type Form = {
  family: string; title: string; statement: string; inputFormat: string; outputFormat: string; constraints: string;
  examples: { input: string; output: string; explanation?: string }[]; difficulty: Difficulty; topic: string; expectedMinutes: number;
  timeLimitMs: number; memoryLimitMb: number; languages: CompetitionLanguage[]; starterCode: Record<string, string>;
  referenceSolution: string; referenceLanguage: CompetitionLanguage; comparator: string; active: boolean; tests: Test[];
};
const blank = (): Form => ({ family: "", title: "", statement: "", inputFormat: "", outputFormat: "", constraints: "", examples: [], difficulty: "EASY", topic: "", expectedMinutes: 15, timeLimitMs: 2000, memoryLimitMb: 256, languages: [...LANGUAGE_KEYS], starterCode: {}, referenceSolution: "", referenceLanguage: "python", comparator: "trim", active: true, tests: [{ input: "", expected: "", isSample: true, weight: 0 }, { input: "", expected: "", isSample: false, weight: 1 }] });
const mono = cn(inputCls, "font-mono text-xs");

function Editor({ id, onSaved }: { id: string | null; onSaved: () => void }) {
  const toast = useToast();
  const [f, setF] = useState<Form | null>(id ? null : blank());
  const [meta, setMeta] = useState<{ lockedAt: string | null; assigned: number; version: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [verify, setVerify] = useState<{ status: string; result?: { compile: { ok: boolean; output: string }; tests: { id: string; status: string; passed?: boolean; timeMs: number | null }[] } } | null>(null);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => (p ? { ...p, [k]: v } : p));

  useEffect(() => {
    if (!id) return;
    let live = true;
    adminCall<{ question: Form & { tests: Test[]; lockedAt: string | null; version: number; _count: { assignments: number } } }>(`/api/admin/coding-competition/questions/${id}`)
      .then(({ question: q }) => {
        if (!live) return;
        setMeta({ lockedAt: q.lockedAt, assigned: q._count.assignments, version: q.version });
        setF({ ...blank(), ...q, examples: q.examples ?? [], starterCode: q.starterCode ?? {}, tests: q.tests.map((t) => ({ input: t.input, expected: t.expected, isSample: t.isSample, weight: t.weight })) });
      })
      .catch((e) => toast("error", (e as Error).message));
    return () => { live = false; };
  }, [id, toast]);
  if (!f) return <p className="p-6 text-center text-sm text-muted">Loading…</p>;

  async function save() {
    setBusy(true);
    try {
      const r = await adminCall<{ id: string; versioned?: boolean; version?: number }>(id ? `/api/admin/coding-competition/questions/${id}` : "/api/admin/coding-competition/questions", { ...f, expectedMinutes: Number(f!.expectedMinutes), timeLimitMs: Number(f!.timeLimitMs), memoryLimitMb: Number(f!.memoryLimitMb), tests: f!.tests.map((t) => ({ ...t, weight: Number(t.weight) })) }, id ? "PUT" : "POST");
      toast("success", r.versioned ? `Saved as version ${r.version}; existing assignments keep the old version` : "Question saved");
      onSaved();
    } catch (e) {
      toast("error", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function runVerify() {
    if (!id) return toast("error", "Save the question first");
    setVerify({ status: "QUEUED" });
    try {
      const { jobId } = await adminCall<{ jobId: string }>(`/api/admin/coding-competition/questions/${id}`, { verify: true });
      for (let i = 0; i < 90; i++) {
        await new Promise((r) => setTimeout(r, 1500));
        const r = await adminCall<{ status: string; result: never }>(`/api/admin/coding-competition/questions/${id}?verify=${jobId}`);
        setVerify(r);
        if (r.status === "DONE" || r.status === "FAILED") return;
      }
      toast("error", "No judge worker picked the job up. Is a judge worker online?");
    } catch (e) {
      toast("error", (e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      {meta?.lockedAt && <p className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800"><Lock className="h-4 w-4" /> Version {meta.version} is assigned to {meta.assigned} candidate(s). Saving creates version {meta.version + 1}; existing assignments keep this one.</p>}
      <div className="grid gap-3 md:grid-cols-4">
        <Field label="Family" hint="Variants of one problem share a family"><input className={inputCls} disabled={!!id} value={f.family} onChange={(e) => set("family", e.target.value.toLowerCase())} /></Field>
        <Field label="Title" className="md:col-span-2"><input className={inputCls} value={f.title} onChange={(e) => set("title", e.target.value)} /></Field>
        <Field label="Topic"><input className={inputCls} value={f.topic} onChange={(e) => set("topic", e.target.value)} /></Field>
        <Field label="Difficulty"><select className={inputCls} value={f.difficulty} onChange={(e) => set("difficulty", e.target.value as Difficulty)}>{DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}</select></Field>
        <Field label="Expected solving time (min)" hint="Calibrated: drives set balancing"><input type="number" className={inputCls} value={f.expectedMinutes} onChange={(e) => set("expectedMinutes", Number(e.target.value))} /></Field>
        <Field label="Time limit (ms)"><input type="number" className={inputCls} value={f.timeLimitMs} onChange={(e) => set("timeLimitMs", Number(e.target.value))} /></Field>
        <Field label="Memory limit (MB)"><input type="number" className={inputCls} value={f.memoryLimitMb} onChange={(e) => set("memoryLimitMb", Number(e.target.value))} /></Field>
        <Field label="Problem statement" className="md:col-span-4"><textarea className={inputCls} rows={5} value={f.statement} onChange={(e) => set("statement", e.target.value)} /></Field>
        <Field label="Input format" className="md:col-span-2"><textarea className={inputCls} rows={2} value={f.inputFormat} onChange={(e) => set("inputFormat", e.target.value)} /></Field>
        <Field label="Output format" className="md:col-span-2"><textarea className={inputCls} rows={2} value={f.outputFormat} onChange={(e) => set("outputFormat", e.target.value)} /></Field>
        <Field label="Constraints" className="md:col-span-2"><textarea className={inputCls} rows={2} value={f.constraints} onChange={(e) => set("constraints", e.target.value)} /></Field>
        <Field label="Output comparison" hint="trim (default), exact, or float:1e-6"><input className={inputCls} value={f.comparator} onChange={(e) => set("comparator", e.target.value)} /></Field>
        <Field label="Languages">
          <div className="flex flex-wrap gap-1.5">{LANGUAGE_KEYS.map((l) => <label key={l} className="flex items-center gap-1 rounded-full border border-slate-300 px-2 py-1 text-xs"><input type="checkbox" checked={f.languages.includes(l)} onChange={(e) => set("languages", e.target.checked ? [...f.languages, l] : f.languages.filter((x) => x !== l))} />{l}</label>)}</div>
        </Field>
      </div>

      <Panel title="Examples shown to candidates" actions={<Btn small tone="ghost" onClick={() => set("examples", [...f.examples, { input: "", output: "" }])}><Plus className="h-3.5 w-3.5" /> Example</Btn>}>
        {f.examples.length === 0 ? <Empty>No examples. Sample tests below are also runnable by candidates.</Empty> : f.examples.map((x, i) => (
          <div key={i} className="mb-2 grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto]">
            <textarea className={mono} rows={2} placeholder="input" value={x.input} onChange={(e) => set("examples", f.examples.map((y, j) => (j === i ? { ...y, input: e.target.value } : y)))} />
            <textarea className={mono} rows={2} placeholder="output" value={x.output} onChange={(e) => set("examples", f.examples.map((y, j) => (j === i ? { ...y, output: e.target.value } : y)))} />
            <textarea className={inputCls} rows={2} placeholder="explanation (optional)" value={x.explanation ?? ""} onChange={(e) => set("examples", f.examples.map((y, j) => (j === i ? { ...y, explanation: e.target.value } : y)))} />
            <button type="button" onClick={() => set("examples", f.examples.filter((_, j) => j !== i))} className="self-start rounded-lg p-2 text-slate-500 hover:text-danger" aria-label="Remove example"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </Panel>

      <Panel title={`Test cases (${f.tests.length})`} sub="Hidden tests are never sent to candidates or to judge workers' outputs. Weight 0 = not scored." actions={<Btn small tone="ghost" onClick={() => set("tests", [...f.tests, { input: "", expected: "", isSample: false, weight: 1 }])}><Plus className="h-3.5 w-3.5" /> Test</Btn>}>
        <div className="max-h-[26rem] space-y-2 overflow-auto pr-1">
          {f.tests.map((t, i) => {
            const v = verify?.result?.tests[i];
            return (
              <div key={i} className={cn("grid gap-2 rounded-xl border p-2 md:grid-cols-[1fr_1fr_8rem_auto]", v ? (v.passed ? "border-emerald-300" : "border-red-300") : "border-slate-200")}>
                <textarea className={mono} rows={2} placeholder="stdin" value={t.input} onChange={(e) => set("tests", f.tests.map((y, j) => (j === i ? { ...y, input: e.target.value } : y)))} />
                <textarea className={mono} rows={2} placeholder="expected stdout" value={t.expected} onChange={(e) => set("tests", f.tests.map((y, j) => (j === i ? { ...y, expected: e.target.value } : y)))} />
                <div className="space-y-1 text-xs">
                  <label className="flex items-center gap-1.5"><input type="checkbox" checked={t.isSample} onChange={(e) => set("tests", f.tests.map((y, j) => (j === i ? { ...y, isSample: e.target.checked, weight: e.target.checked ? 0 : Math.max(1, y.weight) } : y)))} /> Sample</label>
                  <label className="flex items-center gap-1.5">Weight <input type="number" min={0} className="w-14 rounded border border-slate-300 px-1.5 py-0.5" value={t.weight} onChange={(e) => set("tests", f.tests.map((y, j) => (j === i ? { ...y, weight: Number(e.target.value) } : y)))} /></label>
                  {v && <span className={v.passed ? "text-emerald-700" : "text-red-700"}>{v.passed ? "✓ passes" : v.status}{v.timeMs ? ` · ${v.timeMs} ms` : ""}</span>}
                </div>
                <button type="button" onClick={() => set("tests", f.tests.filter((_, j) => j !== i))} className="self-start rounded-lg p-2 text-slate-500 hover:text-danger" aria-label="Remove test"><Trash2 className="h-4 w-4" /></button>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title="Reference solution (server only)" actions={<Btn small tone="ghost" onClick={runVerify} disabled={!id || verify?.status === "QUEUED" || verify?.status === "RUNNING"}><PlayCircle className="h-3.5 w-3.5" /> {verify && !["DONE", "FAILED"].includes(verify.status) ? "Verifying…" : "Verify on judge"}</Btn>}>
        <div className="grid gap-2 md:grid-cols-[10rem_1fr]">
          <Field label="Language"><select className={inputCls} value={f.referenceLanguage} onChange={(e) => set("referenceLanguage", e.target.value as CompetitionLanguage)}>{LANGUAGE_KEYS.map((l) => <option key={l} value={l}>{COMPETITION_LANGUAGES[l].label}</option>)}</select></Field>
          <Field label="Source"><textarea className={mono} rows={8} value={f.referenceSolution} onChange={(e) => set("referenceSolution", e.target.value)} /></Field>
        </div>
        {verify?.status === "DONE" && verify.result && (
          <p className={cn("mt-3 rounded-xl p-3 text-sm", verify.result.compile.ok && verify.result.tests.every((t) => t.passed) ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800")}>
            {!verify.result.compile.ok ? `Compile error: ${verify.result.compile.output}` : `${verify.result.tests.filter((t) => t.passed).length}/${verify.result.tests.length} tests pass with the reference solution${verify.result.tests.every((t) => t.passed) ? "." : " — fix the expected outputs or the solution before using this question."}`}
          </p>
        )}
        {verify?.status === "FAILED" && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-800">The judge could not run the reference solution.</p>}
      </Panel>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} /> Active (usable in new assignments)</label>
        <Btn busy={busy} onClick={save}>{id ? "Save" : "Create question"}</Btn>
      </div>
    </div>
  );
}

export function QuestionBank() {
  const toast = useToast();
  const [q, setQ] = useState("");
  const { data, refresh } = useLiveData<{ questions: Row[] }>(`/api/admin/coding-competition/questions?q=${encodeURIComponent(q)}`, { intervalMs: 60_000 });
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const counts = (d: Difficulty) => data?.questions.filter((x) => x.difficulty === d && x.active).length ?? 0;
  async function toggle(r: Row) {
    try {
      await adminCall(`/api/admin/coding-competition/questions/${r.id}`, { active: !r.active });
      refresh();
    } catch (e) {
      toast("error", (e as Error).message);
    }
  }
  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/coding-competition" className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> Coding Competition</Link>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Question bank</h1>
            <p className="mt-1 text-sm text-muted">Active: {counts("EASY")} easy · {counts("MEDIUM")} medium · {counts("HARD")} hard. Questions used by a competition are locked; edits create a new version.</p>
          </div>
          <div className="flex gap-2">
            <input className={cn(inputCls, "w-56")} placeholder="Search title, family, topic" value={q} onChange={(e) => setQ(e.target.value)} />
            <Btn onClick={() => setEditing("new")}><Plus className="h-4 w-4" /> New question</Btn>
          </div>
        </div>
      </div>
      <Panel>
        {!data?.questions.length ? <Empty>No questions yet. Add at least enough per difficulty for your blueprint; the competition&apos;s Assignments tab shows whether the bank is large enough.</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead><tr className="text-left text-xs text-muted"><th className="py-2">Question</th><th>Difficulty</th><th>Time</th><th>Tests</th><th>Used</th><th>Status</th><th /></tr></thead>
              <tbody>{data.questions.map((r) => (
                <tr key={r.id} className={cn("border-t border-border-soft", !r.active && "opacity-60")}>
                  <td className="py-2.5"><button type="button" className="text-left font-semibold hover:text-story-royal" onClick={() => setEditing(r.id)}>{r.title}</button><br /><span className="text-xs text-muted">{r.family} · v{r.version} · {r.topic}</span></td>
                  <td><Badge tone={r.difficulty === "EASY" ? "green" : r.difficulty === "MEDIUM" ? "amber" : "red"}>{r.difficulty}</Badge></td>
                  <td>{r.expectedMinutes} min</td>
                  <td>{r._count.tests}</td>
                  <td>{r._count.assignments}</td>
                  <td>{r.lockedAt ? <Badge tone="amber"><Lock className="mr-1 h-3 w-3" />Locked</Badge> : <Badge>{r.active ? "Active" : "Inactive"}</Badge>}</td>
                  <td className="text-right"><Btn small tone="ghost" onClick={() => toggle(r)}>{r.active ? "Deactivate" : "Activate"}</Btn></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </Panel>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === "new" ? "New question" : "Edit question"} wide>
        {editing && <Editor key={editing} id={editing === "new" ? null : editing} onSaved={() => { setEditing(null); refresh(); }} />}
      </Modal>
    </div>
  );
}
