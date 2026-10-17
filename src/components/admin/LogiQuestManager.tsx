"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type ReportRow = { id: string; qid: string; question: string; where: string; reason: string; details: string | null; status: string; by: string; createdAt: string; hidden: boolean };
export type HiddenRow = { qid: string; question: string; where: string; note: string | null };
export type CommentRow = { id: string; qid: string; body: string; by: string; hidden: boolean; createdAt: string };

/** Moderation for LogiQuest: error reports, hidden questions and discussion messages. */
export function LogiQuestManager({ reports, hidden, comments }: { reports: ReportRow[]; hidden: HiddenRow[]; comments: CommentRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(key: string, body: Record<string, string>) {
    setBusy(key); setError(null);
    const res = await fetch("/api/admin/logiquest", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) { setError(json.error ?? "Could not update."); return; }
    router.refresh();
  }

  const btn = "rounded-md border border-border-soft px-2 py-1 text-xs font-semibold hover:border-brand-500 hover:text-brand-600 disabled:opacity-50";

  return (
    <div className="space-y-8">
      {error ? <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

      <section>
        <h2 className="mb-2 text-lg font-bold">Error reports</h2>
        <div className="overflow-x-auto rounded-2xl border border-border-soft bg-surface">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-border-soft text-xs uppercase tracking-wider text-muted">
              <tr><th className="px-4 py-3">Question</th><th>Reason</th><th>Reporter</th><th>Status</th><th className="px-4">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-border-soft">
              {reports.map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="max-w-md px-4 py-3">
                    <Link href={`/logiquest/q/${r.qid}`} target="_blank" className="font-semibold hover:text-brand-600">{r.question}</Link>
                    <p className="text-xs text-muted">{r.where} · <code>{r.qid}</code></p>
                    {r.details ? <p className="mt-1 whitespace-pre-line text-xs">“{r.details}”</p> : null}
                  </td>
                  <td className="py-3">{r.reason.replace(/_/g, " ").toLowerCase()}</td>
                  <td className="py-3 text-xs">{r.by}<br /><span className="text-muted">{r.createdAt}</span></td>
                  <td className="py-3">{r.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {r.status === "OPEN" ? (
                        <>
                          <button disabled={busy === r.id} className={btn} onClick={() => act(r.id, { action: "resolve", id: r.id })}>Resolve</button>
                          <button disabled={busy === r.id} className={btn} onClick={() => act(r.id, { action: "dismiss", id: r.id })}>Dismiss</button>
                        </>
                      ) : <button disabled={busy === r.id} className={btn} onClick={() => act(r.id, { action: "reopen", id: r.id })}>Reopen</button>}
                      {r.hidden
                        ? <button disabled={busy === r.qid} className={btn} onClick={() => act(r.qid, { action: "unhide", qid: r.qid })}>Unhide question</button>
                        : <button disabled={busy === r.qid} className={btn} onClick={() => act(r.qid, { action: "hide", qid: r.qid, note: `Reported: ${r.reason}` })}>Hide question</button>}
                    </div>
                  </td>
                </tr>
              ))}
              {!reports.length ? <tr><td colSpan={5} className="px-4 py-6 text-center text-muted">No reports.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold">Hidden questions</h2>
        <p className="mb-2 text-sm text-muted">Hidden questions are removed from practice pages, search and tests until you unhide them or fix them in code.</p>
        <ul className="divide-y divide-border-soft rounded-2xl border border-border-soft bg-surface">
          {hidden.map((h) => (
            <li key={h.qid} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
              <span><span className="font-semibold">{h.question}</span><span className="block text-xs text-muted">{h.where}{h.note ? ` · ${h.note}` : ""}</span></span>
              <button disabled={busy === h.qid} className={btn} onClick={() => act(h.qid, { action: "unhide", qid: h.qid })}>Unhide</button>
            </li>
          ))}
          {!hidden.length ? <li className="px-4 py-6 text-center text-sm text-muted">No hidden questions.</li> : null}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold">Recent discussion</h2>
        <ul className="divide-y divide-border-soft rounded-2xl border border-border-soft bg-surface">
          {comments.map((c) => (
            <li key={c.id} className="flex flex-wrap items-start justify-between gap-2 px-4 py-3 text-sm">
              <span className="min-w-0 flex-1">
                <span className={c.hidden ? "line-through opacity-60" : ""}>{c.body}</span>
                <span className="block text-xs text-muted">{c.by} · {c.createdAt} · <Link href={`/logiquest/q/${c.qid}`} target="_blank" className="hover:text-brand-600">view question</Link></span>
              </span>
              <button disabled={busy === c.id} className={btn} onClick={() => act(c.id, { action: c.hidden ? "showComment" : "hideComment", id: c.id })}>{c.hidden ? "Show" : "Hide"}</button>
            </li>
          ))}
          {!comments.length ? <li className="px-4 py-6 text-center text-sm text-muted">No messages yet.</li> : null}
        </ul>
      </section>
    </div>
  );
}
