"use client";

import { useState } from "react";
import { Bot, Eye } from "lucide-react";
import { Modal, useToast } from "@/components/admin/Modal";
import { useLiveData } from "@/components/admin/useLiveData";
import { EVENT_LABEL } from "@/lib/competition/policy";
import { cn } from "@/lib/cn";
import { adminCall, Badge, Btn, Empty, Field, fmtDate, inputCls, Panel } from "./ui";

type QueueRow = { attemptId: string; candidateId: string; name: string; reviewStatus: string; integrityRisk: number; finalScore: number; maxScore: number; reports: number; similarity: number };
type Detail = {
  attempt: {
    id: string;
    status: string;
    startedAt: string;
    deadlineAt: string;
    finalizedAt: string | null;
    finalReason: string | null;
    resumeCount: number;
    registration: { candidateId: string; displayName: string; assignment: { items: { questionId: string; position: number; marks: number; question: { title: string; family: string; version: number; difficulty: string } }[] } | null };
    events: { id: string; type: string; serverAt: string; action: string; meta: Record<string, unknown> | null }[];
    evaluations: { id: string; questionId: string; score: number; marks: number; passedWeight: number; totalWeight: number; verdict: string | null; compileOutput: string | null; tests: { testCaseId: string; status: string; passed: boolean; timeMs: number | null }[] }[];
    reports: { id: string; kind: string; riskScore: number; questionId: string | null; otherAttemptId: string | null; evidence: Record<string, unknown>; generator: string }[];
    adjustments: { id: string; kind: string; delta: number; reason: string; actorId: string; createdAt: string }[];
    result: { finalScore: number; maxScore: number; rawScore: number; reviewStatus: string; integrityRisk: number } | null;
  };
  finals: { id: string; questionId: string; language: string; source: string; createdAt: string; fromDraft: boolean }[];
  submissionCount: number;
  counterparts: Record<string, string>;
  counterpartCode: { attemptId: string; questionId: string; source?: string; language?: string }[];
};

const STATUS_TONE: Record<string, "slate" | "green" | "amber" | "red" | "blue"> = { NONE: "slate", FLAGGED: "amber", CLEARED: "green", PENALIZED: "red", DISQUALIFIED: "red" };

function AttemptDetail({ competitionId, attemptId, onDone }: { competitionId: string; attemptId: string; onDone: () => void }) {
  const toast = useToast();
  const { data, refresh } = useLiveData<Detail>(`/api/admin/coding-competition/${competitionId}/attempts/${attemptId}`, { intervalMs: 60_000 });
  const [decision, setDecision] = useState("CLEAR");
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [ai, setAi] = useState<string | null>(null);
  if (!data) return <p className="p-6 text-center text-sm text-muted">Loading…</p>;
  const a = data.attempt;
  const items = a.registration.assignment?.items ?? [];

  async function submit() {
    setBusy(true);
    try {
      await adminCall(`/api/admin/coding-competition/${competitionId}`, { action: "decide", attemptId, decision, delta: Number(delta) || 0, reason });
      toast("success", "Decision recorded");
      setReason("");
      setDelta("");
      refresh();
      onDone();
    } catch (e) {
      toast("error", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function summarise() {
    setBusy(true);
    try {
      const r = await adminCall<{ text: string }>(`/api/admin/coding-competition/${competitionId}`, { action: "aiSummary", attemptId });
      setAi(r.text);
    } catch (e) {
      toast("error", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge tone={STATUS_TONE[a.result?.reviewStatus ?? "NONE"]}>{a.result?.reviewStatus ?? "NOT SCORED"}</Badge>
        <span>Score <b>{a.result?.finalScore ?? "—"}</b> / {a.result?.maxScore ?? "—"}</span>
        <span className="text-muted">· Risk {a.result?.integrityRisk ?? 0}/100 · {data.submissionCount} submissions · {a.resumeCount} reconnects · {a.finalReason ?? a.status}</span>
      </div>

      {items.map((it) => {
        const ev = a.evaluations.find((e) => e.questionId === it.questionId);
        const fin = data.finals.find((s) => s.questionId === it.questionId);
        const sims = a.reports.filter((r) => r.kind === "SIMILARITY" && r.questionId === it.questionId);
        return (
          <Panel key={it.questionId} title={`Q${it.position + 1}. ${it.question.title}`} sub={`${it.question.difficulty} · ${it.question.family} v${it.question.version} · ${ev ? `${ev.score}/${ev.marks} marks, ${ev.passedWeight}/${ev.totalWeight} tests` : "not evaluated"}${ev?.verdict ? ` · ${ev.verdict}` : ""}`}>
            {ev && ev.tests.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1">
                {ev.tests.map((t, i) => <span key={t.testCaseId} title={`${t.status}${t.timeMs ? ` · ${t.timeMs} ms` : ""}`} className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", t.passed ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>T{i + 1} {t.passed ? "✓" : t.status.replace("_", " ").toLowerCase()}</span>)}
              </div>
            )}
            {ev?.compileOutput && <pre className="mb-3 max-h-32 overflow-auto rounded-lg bg-red-50 p-2 text-[11px] text-red-800">{ev.compileOutput}</pre>}
            <div className={cn("grid gap-3", sims.length ? "lg:grid-cols-2" : "")}>
              <div>
                <p className="mb-1 text-xs font-semibold text-muted">{fin ? `${a.registration.candidateId} · ${fin.language}${fin.fromDraft ? " · from autosave" : ""} · ${fmtDate(fin.createdAt)}` : "No answer"}</p>
                {fin && <pre className="max-h-80 overflow-auto rounded-xl bg-slate-950 p-3 font-mono text-[11.5px] leading-5 text-slate-100">{fin.source}</pre>}
              </div>
              {sims.slice(0, 1).map((r) => {
                const other = data.counterpartCode.find((x) => x.attemptId === r.otherAttemptId && x.questionId === it.questionId);
                const e = r.evidence as { similarity?: number; verbatim?: boolean; zScore?: number; baselineMean?: number; matchingLines?: string[] };
                return (
                  <div key={r.id}>
                    <p className="mb-1 text-xs font-semibold text-amber-700">Similar to {data.counterparts[r.otherAttemptId ?? ""] ?? "another candidate"} · {Math.round((e.similarity ?? 0) * 100)}%{e.verbatim ? " (verbatim)" : ""} · z {e.zScore} vs question mean {Math.round((e.baselineMean ?? 0) * 100)}%</p>
                    {other?.source && <pre className="max-h-80 overflow-auto rounded-xl bg-slate-900 p-3 font-mono text-[11.5px] leading-5 text-slate-100 ring-2 ring-amber-400/50">{other.source}</pre>}
                  </div>
                );
              })}
            </div>
          </Panel>
        );
      })}

      <Panel title="Monitoring timeline" sub="Server timestamps. Browser events are signals for review, not proof.">
        <div className="max-h-64 overflow-auto">
          <table className="w-full text-xs">
            <tbody>
              {a.events.map((e) => (
                <tr key={e.id} className="border-b border-border-soft last:border-0">
                  <td className="whitespace-nowrap py-1.5 pr-3 text-muted">{new Date(e.serverAt).toLocaleTimeString("en-IN")}</td>
                  <td className="py-1.5 pr-3">{EVENT_LABEL[e.type as keyof typeof EVENT_LABEL] ?? e.type}{e.meta?.durationMs ? ` (${Math.round(Number(e.meta.durationMs) / 1000)} s)` : ""}{e.meta?.chars ? ` (${String(e.meta.chars)} chars)` : ""}</td>
                  <td className="py-1.5 text-right">{e.action !== "NONE" && <Badge tone={e.action === "FLAG" ? "red" : e.action === "WARNING" ? "slate" : "amber"}>{e.action}</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="AI assistant summary" sub="Advisory text from MyBuddy over the evidence above. It never assigns marks." actions={<Btn small tone="ghost" busy={busy} onClick={summarise}><Bot className="h-3.5 w-3.5" /> Summarise evidence</Btn>}>
        {ai || a.reports.find((r) => r.kind === "AI_SUMMARY") ? <p className="whitespace-pre-line text-sm leading-6">{ai ?? String((a.reports.find((r) => r.kind === "AI_SUMMARY")!.evidence as { text?: string }).text ?? "")}</p> : <p className="text-sm text-muted">No summary yet.</p>}
      </Panel>

      {a.adjustments.length > 0 && (
        <Panel title="Decisions so far">
          <ul className="space-y-2 text-sm">{a.adjustments.map((x) => <li key={x.id}><Badge tone={x.kind === "CLEAR" ? "green" : "red"}>{x.kind}</Badge> {x.delta ? `${x.delta > 0 ? "+" : ""}${x.delta} · ` : ""}{x.reason} <span className="text-xs text-muted">— {fmtDate(x.createdAt)}</span></li>)}</ul>
        </Panel>
      )}

      <Panel title="Record a decision" sub="Candidates see the reason for penalties and disqualification, and can appeal.">
        <div className="grid gap-3 md:grid-cols-[12rem_8rem_1fr]">
          <Field label="Decision"><select className={inputCls} value={decision} onChange={(e) => setDecision(e.target.value)}><option value="CLEAR">Clear (no action)</option><option value="PENALTY">Penalty</option><option value="CORRECTION">Score correction</option><option value="DISQUALIFY">Disqualify</option></select></Field>
          <Field label="Marks" hint={decision === "PENALTY" ? "Negative, e.g. -10" : decision === "CORRECTION" ? "+ or −" : "—"}><input className={inputCls} disabled={decision === "CLEAR" || decision === "DISQUALIFY"} value={delta} onChange={(e) => setDelta(e.target.value)} /></Field>
          <Field label="Evidence and reasoning (required)"><textarea className={inputCls} rows={2} value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
        </div>
        <div className="mt-3 flex justify-end"><Btn tone={decision === "DISQUALIFY" ? "danger" : "primary"} busy={busy} onClick={submit}>Record decision</Btn></div>
      </Panel>
    </div>
  );
}

export function ReviewPanel({ competitionId }: { competitionId: string }) {
  const { data, refresh } = useLiveData<{ rows: QueueRow[] }>(`/api/admin/coding-competition/${competitionId}/lists?kind=review`, { intervalMs: 30_000 });
  const [open, setOpen] = useState<QueueRow | null>(null);
  return (
    <Panel title="Integrity review queue" sub="Flagged attempts first, then by risk. Run the integrity analysis from the Results tab after evaluation.">
      {!data?.rows.length ? (
        <Empty>Nothing to review.</Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead><tr className="text-left text-xs text-muted"><th className="py-2">Candidate</th><th>Status</th><th>Risk</th><th>Score</th><th>Evidence</th><th /></tr></thead>
            <tbody>
              {data.rows.map((r) => (
                <tr key={r.attemptId} className="border-t border-border-soft">
                  <td className="py-2.5"><b>{r.candidateId}</b> <span className="text-muted">{r.name}</span></td>
                  <td><Badge tone={STATUS_TONE[r.reviewStatus]}>{r.reviewStatus}</Badge></td>
                  <td><span className={cn("font-semibold", r.integrityRisk >= 70 ? "text-danger" : r.integrityRisk >= 40 ? "text-amber-600" : "")}>{r.integrityRisk}</span></td>
                  <td>{r.finalScore}/{r.maxScore}</td>
                  <td className="text-xs text-muted">{r.reports} reports · {r.similarity} similarity</td>
                  <td className="text-right"><Btn small tone="ghost" onClick={() => setOpen(r)}><Eye className="h-3.5 w-3.5" /> Review</Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={!!open} onClose={() => setOpen(null)} title={open ? `Review ${open.candidateId}` : ""} subtitle={open?.name} wide>
        {open && <AttemptDetail competitionId={competitionId} attemptId={open.attemptId} onDone={refresh} />}
      </Modal>
    </Panel>
  );
}
