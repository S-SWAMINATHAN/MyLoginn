"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, ExternalLink, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import { ConfirmDialog, useToast, type ConfirmState } from "@/components/admin/Modal";
import { useLiveData } from "@/components/admin/useLiveData";
import { cn } from "@/lib/cn";
import { MANUAL_TRANSITIONS } from "@/lib/competition/state";
import { CERTIFICATE_LABEL, STATUS_LABEL, STATUS_ORDER, type CertificateKind, type CompetitionStatus, type LeaderboardEntry } from "@/lib/competition/types";
import { CompetitionForm, type CompetitionRow } from "./CompetitionForm";
import { ReviewPanel } from "./ReviewPanel";
import { adminCall, Badge, Btn, Empty, Field, fmtDate, fromLocalInput, inputCls, Panel, StatusPill, toLocalInput } from "./ui";

type Reward = { role: string; stipendAmount: number; stipendCurrency: string; stipendPeriod: string; durationText: string; expectedStartDate: string | null; workMode: string; location: string; eligibility: string; requiredDocuments: string; offerValidDays: number };
type Metrics = {
  registrations: number; assigned: number; attemptsStarted: number; activeAttempts: number; connectedLast2Min: number; finalizedTotal: number; submissionRate: number;
  evaluations: Record<string, number>; pendingReviews: number; certificates: Record<string, number>; openAppeals: number; events: Record<string, number>;
  judgeJobsLastHour: number; judgeFailuresLastHour: number; judgeErrorRate: number;
  judge: { workers: { id: string; version: string; languages: string[]; running: number; lastSeenAt: string; online: boolean }[]; queued: Record<string, number>; running: number; failedEvaluations: number };
};
type Bank = { ok: boolean; errors: string[]; warnings: string[]; targetMinutes: number; combinations: number; balancedCombinations: number; poolSize: number; participants: number; slots: { difficulty: string; available: number; perCandidate: number; expectedExposure: number; minutesMin: number; minutesMax: number }[] };
type Detail = {
  competition: CompetitionRow & { reward: Reward | null; registrationCount: number; assignmentsGeneratedAt: string | null; resultsApprovedAt: string | null; resultsPublishedAt: string | null; evaluationVersion: number };
  metrics: Metrics;
  bank: Bank;
  openBlockers: { blockers: string[]; warnings: string[] } | null;
  snapshot: { id: string; version: number; total: number; approvedAt: string | null; publishedAt: string | null; createdAt: string; top: LeaderboardEntry[] } | null;
  approvalBlockers: string[];
};

const TABS = ["Overview", "Settings", "Reward", "Questions & assignments", "Candidates", "Review", "Results", "Certificates & offers", "Appeals", "Audit"] as const;
type Tab = (typeof TABS)[number];

function Tile({ label, value, sub, tone }: { label: string; value: string | number; sub?: string; tone?: "red" | "amber" | "green" }) {
  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-4">
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className={cn("mt-1 text-2xl font-bold tabular-nums", tone === "red" && "text-danger", tone === "amber" && "text-amber-600", tone === "green" && "text-emerald-600")}>{typeof value === "number" ? value.toLocaleString("en-IN") : value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-muted">{sub}</p>}
    </div>
  );
}

function useAction(id: string, refresh: () => void) {
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const run = async (key: string, body: Record<string, unknown>, ok = "Done") => {
    setBusy(key);
    try {
      const r = await adminCall(`/api/admin/coding-competition/${id}`, body);
      toast("success", ok);
      refresh();
      return r;
    } catch (e) {
      const err = e as Error & { code?: string };
      if (err.code !== "NEEDS_ACK") toast("error", err.message);
      throw err;
    } finally {
      setBusy(null);
    }
  };
  return { busy, run };
}

function Overview({ d, id, refresh }: { d: Detail; id: string; refresh: () => void }) {
  const c = d.competition;
  const status = c.status as CompetitionStatus;
  const { busy, run } = useAction(id, refresh);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const m = d.metrics;
  const idx = STATUS_ORDER.indexOf(status);

  const move = (to: CompetitionStatus) =>
    setConfirm({
      title: `Move to “${STATUS_LABEL[to]}”?`,
      message: to === "SUBMISSION_CLOSED" ? "This ends the competition now and auto-submits every active attempt." : to === "ARCHIVED" ? "Archived competitions disappear from the public pages." : "The change is recorded in the audit trail.",
      confirmLabel: "Yes, continue",
      tone: to === "SUBMISSION_CLOSED" || to === "ARCHIVED" ? "danger" : "primary",
      onConfirm: async () => {
        try {
          await run(`t-${to}`, { action: "transition", to }, `Now: ${STATUS_LABEL[to]}`);
        } catch (e) {
          if ((e as { code?: string }).code === "NEEDS_ACK")
            setConfirm({ title: "Question-bank warnings", message: <p className="whitespace-pre-line text-sm">{(e as Error).message}</p>, confirmLabel: "Yes, proceed anyway", tone: "danger", onConfirm: () => run(`t-${to}`, { action: "transition", to, acknowledgeWarnings: true }, `Now: ${STATUS_LABEL[to]}`).then(() => undefined) });
        }
      },
    });

  return (
    <div className="space-y-5">
      <Panel title="Lifecycle" sub="Clock-driven steps (closing registration, going live, ending, evaluating) happen automatically on the server.">
        <ol className="flex flex-wrap gap-1.5">
          {STATUS_ORDER.map((s, i) => (
            <li key={s} className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold", i < idx ? "bg-emerald-50 text-emerald-700" : i === idx ? "bg-story-royal text-white" : "bg-slate-100 text-slate-500")}>
              {i < idx && <CheckCircle2 className="h-3.5 w-3.5" />}
              {STATUS_LABEL[s]}
            </li>
          ))}
        </ol>
        {d.openBlockers && (d.openBlockers.blockers.length > 0 || d.openBlockers.warnings.length > 0) && (
          <div className="mt-4 space-y-2">
            {d.openBlockers.blockers.map((b) => <p key={b} className="flex gap-2 rounded-xl bg-red-50 p-2.5 text-xs text-red-800"><ShieldAlert className="h-4 w-4 shrink-0" />{b}</p>)}
            {d.openBlockers.warnings.map((w) => <p key={w} className="flex gap-2 rounded-xl bg-amber-50 p-2.5 text-xs text-amber-800"><ShieldAlert className="h-4 w-4 shrink-0" />{w}</p>)}
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {(MANUAL_TRANSITIONS[status] ?? []).map((to) => (
            <Btn key={to} tone={to === "ARCHIVED" || to === "SUBMISSION_CLOSED" ? "ghost" : "primary"} busy={busy === `t-${to}`} onClick={() => move(to)}>
              {to === "REGISTRATION_OPEN" ? (status === "DRAFT" ? "Open registration" : "Reopen registration") : to === "REGISTRATION_CLOSED" ? (status === "SCHEDULED" ? "Unschedule" : "Close registration now") : to === "SCHEDULED" ? "Schedule (lock for start)" : to === "SUBMISSION_CLOSED" ? "End competition now" : to === "ARCHIVED" ? "Archive" : STATUS_LABEL[to]}
            </Btn>
          ))}
          {status === "UNDER_REVIEW" && <p className="self-center text-xs text-muted">Approve and publish results from the Results tab.</p>}
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
        <Tile label="Registrations" value={m.registrations} sub={`${c.maxParticipants.toLocaleString("en-IN")} seats`} />
        <Tile label="Sets assigned" value={m.assigned} />
        <Tile label="Attempts started" value={m.attemptsStarted} />
        <Tile label="Active now" value={m.activeAttempts} sub={`${m.connectedLast2Min} seen in last 2 min`} tone={m.activeAttempts ? "green" : undefined} />
        <Tile label="Finalized" value={m.finalizedTotal} sub={`${m.submissionRate}% submitted answers`} />
        <Tile label="Pending reviews" value={m.pendingReviews} tone={m.pendingReviews ? "amber" : undefined} />
        <Tile label="Evaluations done" value={m.evaluations.DONE ?? 0} sub={`${m.evaluations.PENDING ?? 0} pending · ${m.evaluations.FAILED ?? 0} failed`} tone={(m.evaluations.FAILED ?? 0) ? "red" : undefined} />
        <Tile label="Judge queue" value={(m.judge.queued.RUN ?? 0) + (m.judge.queued.EVALUATE ?? 0)} sub={`${m.judge.running} running`} />
        <Tile label="Judge error rate" value={`${m.judgeErrorRate}%`} sub={`${m.judgeJobsLastHour} jobs last hour`} tone={m.judgeErrorRate > 2 ? "red" : undefined} />
        <Tile label="Certificates" value={Object.values(m.certificates).reduce((a, b) => a + b, 0)} />
        <Tile label="Open appeals" value={m.openAppeals} tone={m.openAppeals ? "amber" : undefined} />
        <Tile label="Monitoring events" value={Object.values(m.events).reduce((a, b) => a + b, 0)} />
      </div>

      <Panel title="Judge workers" sub="Isolated sandbox hosts running judge-worker/worker.mjs. Without an online worker, Run and evaluation wait in the queue.">
        {!m.judge.workers.length ? <Empty>No judge worker has connected yet. See docs/coding-competition.md → “Judge servers”.</Empty> : (
          <div className="grid gap-2 md:grid-cols-2">
            {m.judge.workers.map((w) => (
              <div key={w.id} className="flex items-center gap-3 rounded-xl border border-border-soft p-3 text-sm">
                <span className={cn("h-2.5 w-2.5 rounded-full", w.online ? "bg-emerald-500" : "bg-slate-300")} />
                <span className="min-w-0 flex-1"><b>{w.id}</b> <span className="text-xs text-muted">v{w.version} · {w.languages.join(", ") || "no languages"}</span></span>
                <span className="text-xs text-muted">{w.online ? `${w.running} running` : `last seen ${fmtDate(w.lastSeenAt)}`}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
      <ConfirmDialog state={confirm} onClose={() => setConfirm(null)} />
    </div>
  );
}

function RewardTab({ d, id, refresh }: { d: Detail; id: string; refresh: () => void }) {
  const r = d.competition.reward;
  const locked = d.competition.status !== "DRAFT";
  const { busy, run } = useAction(id, refresh);
  const [f, setF] = useState<Reward>(r ?? { role: "", stipendAmount: 0, stipendCurrency: "INR", stipendPeriod: "per month", durationText: "", expectedStartDate: null, workMode: "Remote", location: "", eligibility: "", requiredDocuments: "", offerValidDays: 14 });
  const set = <K extends keyof Reward>(k: K, v: Reward[K]) => setF((p) => ({ ...p, [k]: v }));
  return (
    <Panel title="First-place internship reward" sub={locked ? "Locked: candidates registered on these terms." : "Required before registration opens. Shown on the landing page and copied into the winner's offer."}>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Internship role"><input className={inputCls} disabled={locked} value={f.role} onChange={(e) => set("role", e.target.value)} /></Field>
        <Field label="Stipend amount"><input type="number" className={inputCls} disabled={locked} value={f.stipendAmount || ""} onChange={(e) => set("stipendAmount", Number(e.target.value))} /></Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Currency"><input className={inputCls} disabled={locked} value={f.stipendCurrency} onChange={(e) => set("stipendCurrency", e.target.value.toUpperCase())} /></Field>
          <Field label="Period"><select className={inputCls} disabled={locked} value={f.stipendPeriod} onChange={(e) => set("stipendPeriod", e.target.value)}><option>per month</option><option>total</option></select></Field>
        </div>
        <Field label="Duration" hint="e.g. 3 months"><input className={inputCls} disabled={locked} value={f.durationText} onChange={(e) => set("durationText", e.target.value)} /></Field>
        <Field label="Work mode"><select className={inputCls} disabled={locked} value={f.workMode} onChange={(e) => set("workMode", e.target.value)}><option>Remote</option><option>On-site</option><option>Hybrid</option></select></Field>
        <Field label="Location"><input className={inputCls} disabled={locked} value={f.location} onChange={(e) => set("location", e.target.value)} /></Field>
        <Field label="Expected start date"><input type="datetime-local" className={inputCls} disabled={locked} value={toLocalInput(f.expectedStartDate)} onChange={(e) => set("expectedStartDate", e.target.value ? fromLocalInput(e.target.value) : null)} /></Field>
        <Field label="Offer valid for (days)"><input type="number" className={inputCls} disabled={locked} value={f.offerValidDays} onChange={(e) => set("offerValidDays", Number(e.target.value))} /></Field>
        <div />
        <Field label="Eligibility criteria" className="md:col-span-3"><textarea className={inputCls} rows={3} disabled={locked} value={f.eligibility} onChange={(e) => set("eligibility", e.target.value)} /></Field>
        <Field label="Required documents" className="md:col-span-3"><textarea className={inputCls} rows={2} disabled={locked} value={f.requiredDocuments} onChange={(e) => set("requiredDocuments", e.target.value)} /></Field>
      </div>
      {!locked && <div className="mt-4 flex justify-end"><Btn busy={busy === "reward"} onClick={() => run("reward", { action: "reward", reward: { ...f, expectedStartDate: f.expectedStartDate || null } }, "Reward saved").catch(() => undefined)}>Save reward</Btn></div>}
    </Panel>
  );
}

function AssignmentsTab({ d, id, refresh }: { d: Detail; id: string; refresh: () => void }) {
  const { busy, run } = useAction(id, refresh);
  const exposure = useLiveData<{ questions: { id: string; title: string; family: string; version: number; difficulty: string; candidates: number }[]; distinctSets: number; largestSharedSet: number; assignments: number }>(`/api/admin/coding-competition/${id}/lists?kind=exposure`, { intervalMs: 60_000 });
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const b = d.bank;
  const generate = (ack = false) =>
    run("gen", { action: "generateAssignments", acknowledgeWarnings: ack }, "Assignments generated")
      .then(() => exposure.refresh())
      .catch((e) => {
        if ((e as { code?: string }).code === "NEEDS_ACK") setConfirm({ title: "Question-bank warnings", message: <p className="text-sm">{(e as Error).message}</p>, confirmLabel: "Yes, generate anyway", tone: "danger", onConfirm: () => generate(true) });
      });
  return (
    <div className="space-y-5">
      <Panel title="Question-bank capacity" sub={`${b.poolSize} eligible questions for ${b.participants.toLocaleString("en-IN")} candidates · target set time ${b.targetMinutes} min`} actions={<Link href="/admin/coding-competition/questions" className="text-sm font-semibold text-story-royal">Manage question bank →</Link>}>
        <div className="grid gap-3 md:grid-cols-3">
          {b.slots.map((s) => <Tile key={s.difficulty} label={`${s.difficulty} · ${s.perCandidate} per set`} value={s.available} sub={`questions · ~${s.expectedExposure} candidates each · ${s.minutesMin}–${s.minutesMax} min`} />)}
        </div>
        <p className="mt-3 text-sm">Distinct balanced sets available: <b>{b.balancedCombinations.toLocaleString("en-IN")}</b> (of {b.combinations.toLocaleString("en-IN")} combinations)</p>
        {[...b.errors.map((x) => ["red", x]), ...b.warnings.map((x) => ["amber", x])].map(([t, x]) => <p key={x} className={cn("mt-2 rounded-xl p-2.5 text-xs", t === "red" ? "bg-red-50 text-red-800" : "bg-amber-50 text-amber-800")}>{x}</p>)}
      </Panel>
      <Panel title="Candidate question sets" sub={d.competition.assignmentsGeneratedAt ? `Generated ${fmtDate(d.competition.assignmentsGeneratedAt)} · seeded and reproducible` : "Generate after registration closes, before scheduling."} actions={["REGISTRATION_CLOSED", "SCHEDULED"].includes(d.competition.status) ? <Btn busy={busy === "gen"} onClick={() => generate()}>{d.competition.assignmentsGeneratedAt ? "Regenerate" : "Generate assignments"}</Btn> : undefined}>
        {exposure.data?.assignments ? (
          <>
            <p className="mb-3 text-sm">{exposure.data.assignments} sets · <b>{exposure.data.distinctSets}</b> distinct · largest group sharing one set: {exposure.data.largestSharedSet}</p>
            <div className="max-h-80 overflow-auto"><table className="w-full text-sm"><tbody>{exposure.data.questions.map((q) => <tr key={q.id} className="border-t border-border-soft"><td className="py-2"><Badge>{q.difficulty}</Badge> {q.title} <span className="text-xs text-muted">{q.family} v{q.version}</span></td><td className="text-right tabular-nums">{q.candidates} candidates</td></tr>)}</tbody></table></div>
          </>
        ) : <Empty>No sets generated yet.</Empty>}
      </Panel>
      <ConfirmDialog state={confirm} onClose={() => setConfirm(null)} />
    </div>
  );
}

type CandRow = { registrationId: string; candidateId: string; name: string; email: string; phone: string; registeredAt: string; attempt: { id: string; status: string; finalReason: string | null; resumeCount: number; sharedNetwork: number } | null; result: { finalScore: number; maxScore: number; rank: number | null; reviewStatus: string; integrityRisk: number } | null };
function CandidatesTab({ id }: { id: string }) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const { data } = useLiveData<{ total: number; rows: CandRow[] }>(`/api/admin/coding-competition/${id}/lists?kind=candidates&q=${encodeURIComponent(q)}&page=${page}`, { intervalMs: 30_000 });
  return (
    <Panel title="Candidates" sub={data ? `${data.total.toLocaleString("en-IN")} registered` : undefined} actions={<input className={cn(inputCls, "w-64")} placeholder="Search ID, name, email or phone" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} />}>
      {!data?.rows.length ? <Empty>No candidates found.</Empty> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead><tr className="text-left text-xs text-muted"><th className="py-2">Candidate</th><th>Contact (masked)</th><th>Registered</th><th>Attempt</th><th>Score</th><th>Review</th></tr></thead>
            <tbody>{data.rows.map((r) => (
              <tr key={r.registrationId} className="border-t border-border-soft">
                <td className="py-2.5"><b>{r.candidateId}</b><br /><span className="text-xs text-muted">{r.name}</span></td>
                <td className="text-xs text-muted">{r.email}<br />{r.phone}</td>
                <td className="text-xs">{fmtDate(r.registeredAt)}</td>
                <td className="text-xs">{r.attempt ? <>{r.attempt.status}{r.attempt.finalReason ? ` · ${r.attempt.finalReason}` : ""}{r.attempt.resumeCount ? ` · ${r.attempt.resumeCount} reconnects` : ""}{r.attempt.sharedNetwork ? <> · <Badge tone="amber">shared network ×{r.attempt.sharedNetwork}</Badge></> : null}</> : "Not started"}</td>
                <td>{r.result ? `${r.result.finalScore}/${r.result.maxScore}${r.result.rank ? ` · #${r.result.rank}` : ""}` : "—"}</td>
                <td>{r.result ? <Badge tone={r.result.reviewStatus === "FLAGGED" ? "amber" : r.result.reviewStatus === "CLEARED" ? "green" : r.result.reviewStatus === "NONE" ? "slate" : "red"}>{r.result.reviewStatus}</Badge> : null}</td>
              </tr>
            ))}</tbody>
          </table>
          <div className="mt-3 flex justify-end gap-2"><Btn small tone="ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Btn><Btn small tone="ghost" disabled={(page + 1) * 50 >= data.total} onClick={() => setPage(page + 1)}>Next</Btn></div>
        </div>
      )}
    </Panel>
  );
}

function ResultsTab({ d, id, refresh }: { d: Detail; id: string; refresh: () => void }) {
  const { busy, run } = useAction(id, refresh);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [postAt, setPostAt] = useState(toLocalInput(d.competition.resultsPublishAt));
  const [reason, setReason] = useState("");
  const s = d.snapshot;
  const status = d.competition.status;
  const canWork = ["EVALUATION", "UNDER_REVIEW", "RESULTS_PUBLISHED"].includes(status);
  const ask = (title: string, message: string, fn: () => Promise<unknown>, tone: "primary" | "danger" = "primary") => setConfirm({ title, message, confirmLabel: "Yes, continue", tone, onConfirm: () => fn().then(() => undefined).catch(() => undefined) });
  return (
    <div className="space-y-5">
      <Panel title="Evaluation" sub={`Evaluation version ${d.competition.evaluationVersion}. Scores come only from hidden tests and recorded review decisions.`}>
        <div className="flex flex-wrap gap-2">
          <Btn tone="ghost" disabled={!canWork} busy={busy === "retry"} onClick={() => run("retry", { action: "retryFailed" }, "Failed evaluations re-queued").catch(() => undefined)}><RefreshCw className="h-3.5 w-3.5" /> Retry failed evaluations</Btn>
          <Btn tone="ghost" disabled={!canWork} busy={busy === "integrity"} onClick={() => run("integrity", { action: "analyzeIntegrity" }, "Integrity analysis complete").catch(() => undefined)}><ShieldCheck className="h-3.5 w-3.5" /> Re-run integrity analysis</Btn>
          <Btn tone="ghost" disabled={!["EVALUATION", "UNDER_REVIEW"].includes(status) || reason.trim().length < 10} busy={busy === "reeval"} onClick={() => ask("Re-evaluate every attempt?", "All final answers are judged again under a new evaluation version. Approval is reset.", () => run("reeval", { action: "reevaluate", reason }, "Re-evaluation queued"), "danger")}>Re-evaluate all</Btn>
        </div>
      </Panel>

      <Panel title="Ranking & publication" sub={`Results are scheduled for ${fmtDate(d.competition.resultsPublishAt, d.competition.timezone)}. Approved results publish automatically at that time.`}>
        <div className="flex flex-wrap gap-2">
          <Btn disabled={!["UNDER_REVIEW", "RESULTS_PUBLISHED"].includes(status)} busy={busy === "snap"} onClick={() => run("snap", { action: "snapshot" }, "Snapshot built").catch(() => undefined)}>Build ranking snapshot</Btn>
          <Btn disabled={!s || status !== "UNDER_REVIEW" || d.approvalBlockers.length > 0 || !!s?.approvedAt} busy={busy === "approve"} onClick={() => ask(`Approve snapshot v${s?.version}?`, "This freezes the ranking that will be published.", () => run("approve", { action: "approve", snapshotId: s!.id }, "Results approved"))}>Approve results</Btn>
          <Btn disabled={status !== "UNDER_REVIEW" || !d.competition.resultsApprovedAt} busy={busy === "pub"} onClick={() => ask("Publish results now?", "Only possible once the scheduled time has passed. Candidates are notified and certificates are issued.", () => run("pub", { action: "publish" }, "Published"))}>Publish now</Btn>
        </div>
        {d.approvalBlockers.length > 0 && <ul className="mt-3 space-y-1 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">{d.approvalBlockers.map((x) => <li key={x}>• {x}</li>)}</ul>}
        {status !== "RESULTS_PUBLISHED" && status !== "ARCHIVED" && (
          <div className="mt-4 grid gap-3 rounded-xl border border-border-soft p-3 md:grid-cols-[14rem_1fr_auto] md:items-end">
            <Field label="Postpone publication to"><input type="datetime-local" className={inputCls} value={postAt} onChange={(e) => setPostAt(e.target.value)} /></Field>
            <Field label="Reason (shown to candidates) / re-evaluation reason"><input className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
            <Btn tone="ghost" busy={busy === "post"} onClick={() => run("post", { action: "postpone", at: fromLocalInput(postAt), reason }, "Publication rescheduled").catch(() => undefined)}>Postpone</Btn>
          </div>
        )}
      </Panel>

      <Panel title={s ? `Snapshot v${s.version} — ${s.total} ranked` : "Snapshot"} sub={s ? `${s.publishedAt ? `Published ${fmtDate(s.publishedAt)}` : s.approvedAt ? `Approved ${fmtDate(s.approvedAt)}` : "Preview — not approved"} · built ${fmtDate(s.createdAt)}` : undefined}>
        {!s ? <Empty>No snapshot yet. Build one once evaluation has finished.</Empty> : (
          <div className="max-h-[28rem] overflow-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-muted"><th className="py-2">Rank</th><th>Candidate</th><th>Score</th><th>Award</th></tr></thead>
              <tbody>{s.top.map((e) => <tr key={e.candidateId} className="border-t border-border-soft"><td className="py-2 font-bold">#{e.rank}</td><td><b>{e.candidateId}</b> <span className="text-muted">{e.displayName}</span></td><td>{e.finalScore}/{e.maxScore}</td><td>{e.award && <Badge tone="amber">{CERTIFICATE_LABEL[e.award as CertificateKind]}</Badge>}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </Panel>
      <ConfirmDialog state={confirm} onClose={() => setConfirm(null)} />
    </div>
  );
}

type Cert = { id: string; code: string; kind: string; candidateName: string; rank: number | null; issuedAt: string; revokedAt: string | null; revokeReason: string | null; registration: { candidateId: string } };
type Offer = { id: string; status: string; eligibilityNotes: string | null; sentAt: string | null; expiresAt: string | null; respondedAt: string | null; registration: { candidateId: string; displayName: string } };
function CertificatesTab({ id }: { id: string }) {
  const certs = useLiveData<{ rows: Cert[] }>(`/api/admin/coding-competition/${id}/lists?kind=certificates`, { intervalMs: 60_000 });
  const offers = useLiveData<{ rows: Offer[] }>(`/api/admin/coding-competition/${id}/lists?kind=offers`, { intervalMs: 30_000 });
  const { busy, run } = useAction(id, () => { certs.refresh(); offers.refresh(); });
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  return (
    <div className="space-y-5">
      <Panel title="Internship offers" sub="Created for first place after publication. Verify eligibility, approve, then send. The candidate accepts or declines from their dashboard.">
        {!offers.data?.rows.length ? <Empty>No offers yet.</Empty> : offers.data.rows.map((o) => (
          <div key={o.id} className="rounded-xl border border-border-soft p-4">
            <div className="flex flex-wrap items-center gap-2"><b>{o.registration.candidateId}</b><span className="text-muted">{o.registration.displayName}</span><Badge tone={o.status === "ACCEPTED" ? "green" : o.status === "SENT" ? "blue" : o.status === "ELIGIBILITY_CHECK" ? "amber" : "slate"}>{o.status.replace("_", " ")}</Badge>{o.expiresAt && <span className="text-xs text-muted">expires {fmtDate(o.expiresAt)}</span>}</div>
            {o.eligibilityNotes && <p className="mt-2 whitespace-pre-line text-xs text-muted">{o.eligibilityNotes}</p>}
            {["ELIGIBILITY_CHECK", "APPROVED", "SENT"].includes(o.status) && (
              <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto_auto] md:items-end">
                <Field label="Eligibility check notes / withdrawal reason"><input className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
                {o.status === "ELIGIBILITY_CHECK" && <Btn busy={busy === `a-${o.id}`} onClick={() => run(`a-${o.id}`, { action: "offer", offerId: o.id, step: "approve", reason: notes }, "Offer approved").catch(() => undefined)}>Approve eligibility</Btn>}
                {o.status === "APPROVED" && <Btn busy={busy === `s-${o.id}`} onClick={() => run(`s-${o.id}`, { action: "offer", offerId: o.id, step: "send", reason: "" }, "Offer sent").catch(() => undefined)}>Send offer</Btn>}
                <Btn tone="ghost" busy={busy === `w-${o.id}`} onClick={() => run(`w-${o.id}`, { action: "offer", offerId: o.id, step: "withdraw", reason: notes }, "Offer withdrawn").catch(() => undefined)}>Withdraw</Btn>
              </div>
            )}
          </div>
        ))}
      </Panel>
      <Panel title="Certificates" sub="Issued automatically from the published results. Revoke or reissue with a recorded reason.">
        {!certs.data?.rows.length ? <Empty>No certificates issued yet.</Empty> : (
          <>
            <div className="mb-3 grid gap-2 md:grid-cols-2"><Field label="Reason for revoke / reissue"><input className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field><Field label="Corrected name (reissue only)"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></Field></div>
            <div className="max-h-[28rem] overflow-auto">
              <table className="w-full min-w-[720px] text-sm">
                <tbody>{certs.data.rows.map((c) => (
                  <tr key={c.id} className="border-t border-border-soft">
                    <td className="py-2"><b>{c.registration.candidateId}</b> {c.candidateName}</td>
                    <td><Badge tone={c.kind === "PARTICIPATION" ? "blue" : "amber"}>{CERTIFICATE_LABEL[c.kind as CertificateKind]}</Badge></td>
                    <td className="font-mono text-xs"><a href={`/coding-competition/verify/${c.code}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-story-royal">{c.code}<ExternalLink className="h-3 w-3" /></a></td>
                    <td className="text-xs">{c.revokedAt ? <span className="text-danger">Revoked</span> : fmtDate(c.issuedAt)}</td>
                    <td className="text-right">{!c.revokedAt && <span className="inline-flex gap-1"><Btn small tone="ghost" busy={busy === `r-${c.id}`} onClick={() => run(`r-${c.id}`, { action: "reissueCertificate", certificateId: c.id, reason: notes, candidateName: name }, "Reissued").catch(() => undefined)}>Reissue</Btn><Btn small tone="danger" busy={busy === `v-${c.id}`} onClick={() => run(`v-${c.id}`, { action: "revokeCertificate", certificateId: c.id, reason: notes }, "Revoked").catch(() => undefined)}>Revoke</Btn></span>}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}

type Appeal = { id: string; topic: string; message: string; status: string; response: string | null; createdAt: string; registration: { candidateId: string; displayName: string } };
function AppealsTab({ id }: { id: string }) {
  const { data, refresh } = useLiveData<{ rows: Appeal[] }>(`/api/admin/coding-competition/${id}/lists?kind=appeals`, { intervalMs: 30_000 });
  const { busy, run } = useAction(id, refresh);
  const [resp, setResp] = useState<Record<string, string>>({});
  return (
    <Panel title="Appeals" sub="Candidates appeal integrity decisions or scores from their dashboard. Upholding an appeal does not change a score by itself; record a correction in Review if needed.">
      {!data?.rows.length ? <Empty>No appeals.</Empty> : data.rows.map((a) => (
        <div key={a.id} className="mb-3 rounded-xl border border-border-soft p-4">
          <div className="flex flex-wrap items-center gap-2 text-sm"><b>{a.registration.candidateId}</b><span className="text-muted">{a.registration.displayName}</span><Badge>{a.topic}</Badge><Badge tone={a.status === "OPEN" ? "amber" : a.status === "UPHELD" ? "green" : "slate"}>{a.status}</Badge><span className="text-xs text-muted">{fmtDate(a.createdAt)}</span></div>
          <p className="mt-2 whitespace-pre-line text-sm">{a.message}</p>
          {a.response && <p className="mt-2 rounded-lg bg-slate-50 p-2 text-sm text-muted">Response: {a.response}</p>}
          {a.status === "OPEN" && (
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <input className={cn(inputCls, "min-w-64 flex-1")} placeholder="Response to the candidate" value={resp[a.id] ?? ""} onChange={(e) => setResp({ ...resp, [a.id]: e.target.value })} />
              <Btn busy={busy === `u-${a.id}`} onClick={() => run(`u-${a.id}`, { action: "resolveAppeal", appealId: a.id, upheld: true, reason: resp[a.id] ?? "" }, "Appeal upheld").catch(() => undefined)}>Uphold</Btn>
              <Btn tone="ghost" busy={busy === `j-${a.id}`} onClick={() => run(`j-${a.id}`, { action: "resolveAppeal", appealId: a.id, upheld: false, reason: resp[a.id] ?? "" }, "Appeal rejected").catch(() => undefined)}>Reject</Btn>
            </div>
          )}
        </div>
      ))}
    </Panel>
  );
}

function AuditTab({ id }: { id: string }) {
  const { data } = useLiveData<{ rows: { id: string; seq: number; actorId: string; action: string; entity: string; meta: unknown; createdAt: string }[]; chainIntact: boolean }>(`/api/admin/coding-competition/${id}/lists?kind=audit`, { intervalMs: 60_000 });
  return (
    <Panel title="Audit trail" sub={data ? (data.chainIntact ? "Hash chain verified: no entry has been altered or removed." : "WARNING: the audit hash chain is broken — an entry was altered or removed.") : undefined}>
      {!data?.rows.length ? <Empty>No entries.</Empty> : (
        <div className="max-h-[32rem] overflow-auto">
          <table className="w-full text-xs">
            <tbody>{data.rows.map((r) => <tr key={r.id} className="border-t border-border-soft align-top"><td className="py-2 pr-3 text-muted">#{r.seq}</td><td className="whitespace-nowrap pr-3">{fmtDate(r.createdAt)}</td><td className="pr-3 font-semibold">{r.action}</td><td className="pr-3 text-muted">{r.actorId}</td><td className="max-w-md truncate font-mono text-[11px] text-muted">{r.meta ? JSON.stringify(r.meta) : ""}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

/** One competition: every admin control in tabs, refreshed live from the database. */
export function CompetitionConsole({ id }: { id: string }) {
  const { data, error, refresh, updatedAt } = useLiveData<Detail>(`/api/admin/coding-competition/${id}`, { intervalMs: 10_000 });
  const [tab, setTab] = useState<Tab>("Overview");
  if (error && !data) return <p className="rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">{error}</p>;
  if (!data) return <p className="p-10 text-center text-sm text-muted">Loading…</p>;
  const c = data.competition;
  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/coding-competition" className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> All competitions</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">{c.title}</h1>
          <StatusPill status={c.status as CompetitionStatus} />
          <a href="/coding-competition" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-story-royal">Public page <ExternalLink className="h-3 w-3" /></a>
          <span className="ml-auto text-[11px] text-muted">{updatedAt ? `Live · updated ${updatedAt.toLocaleTimeString("en-IN")}` : ""}</span>
        </div>
        <p className="mt-1 text-sm text-muted">Starts {fmtDate(c.startsAt, c.timezone)} · {c.durationMinutes} min · registration {fmtDate(c.registrationOpensAt, c.timezone)} – {fmtDate(c.registrationClosesAt, c.timezone)}</p>
      </div>
      <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        {TABS.map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={cn("relative shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors", tab === t ? "text-white" : "text-foreground/75 hover:bg-surface-2")}>
            {tab === t && <motion.span layoutId="cc-admin-tab" className="absolute inset-0 rounded-full bg-story-royal" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span className="relative">{t}{t === "Review" && data.metrics.pendingReviews ? ` (${data.metrics.pendingReviews})` : ""}{t === "Appeals" && data.metrics.openAppeals ? ` (${data.metrics.openAppeals})` : ""}</span>
          </button>
        ))}
      </div>
      {tab === "Overview" && <Overview d={data} id={id} refresh={refresh} />}
      {tab === "Settings" && <CompetitionForm key={c.status} initial={c} onSaved={() => refresh()} />}
      {tab === "Reward" && <RewardTab d={data} id={id} refresh={refresh} />}
      {tab === "Questions & assignments" && <AssignmentsTab d={data} id={id} refresh={refresh} />}
      {tab === "Candidates" && <CandidatesTab id={id} />}
      {tab === "Review" && <ReviewPanel competitionId={id} />}
      {tab === "Results" && <ResultsTab d={data} id={id} refresh={refresh} />}
      {tab === "Certificates & offers" && <CertificatesTab id={id} />}
      {tab === "Appeals" && <AppealsTab id={id} />}
      {tab === "Audit" && <AuditTab id={id} />}
    </div>
  );
}
