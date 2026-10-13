"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type AdminRow = { id: string; kind: "challenge" | "question"; title: string; category: string; difficulty: string; attempts: number; solved: number; status: string; access: string };

const STATUSES = ["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"];

export function LogiQuestManager({ rows }: { rows: AdminRow[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function patch(row: AdminRow, change: Record<string, string>) {
    setBusy(row.id); setError(null);
    const res = await fetch("/api/admin/logiquest", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: row.kind, id: row.id, ...change }) });
    const json = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) { setError(json.error ?? "Could not update."); return; }
    router.refresh();
  }

  return (
    <div>
      {error ? <p role="alert" className="mb-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      <div className="overflow-x-auto rounded-2xl border border-border-soft bg-surface">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-border-soft text-xs uppercase tracking-wider text-muted">
            <tr><th className="px-4 py-3">Item</th><th>Category</th><th>Difficulty</th><th className="text-right">Attempts</th><th className="text-right">Solved</th><th className="text-right">Accuracy</th><th>Access</th><th className="px-4">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-border-soft">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 font-semibold">{r.title}<span className="ml-2 text-xs font-normal text-muted">{r.kind}</span></td>
                <td>{r.category.replace("_", " ")}</td>
                <td>{r.difficulty}</td>
                <td className="text-right tabular-nums">{r.attempts}</td>
                <td className="text-right tabular-nums">{r.solved}</td>
                <td className="text-right tabular-nums">{r.attempts ? `${Math.round((r.solved / r.attempts) * 100)}%` : "—"}</td>
                <td>
                  <select aria-label={`Access for ${r.title}`} value={r.access} disabled={busy === r.id} onChange={(e) => patch(r, { access: e.target.value })} className="rounded-md border border-border-soft bg-background px-2 py-1">
                    <option value="FREE">Free</option><option value="PREMIUM">Premium</option>
                  </select>
                </td>
                <td className="px-4">
                  <div className="flex items-center gap-2">
                    <select aria-label={`Status for ${r.title}`} value={r.status} disabled={busy === r.id} onChange={(e) => patch(r, { status: e.target.value })} className="rounded-md border border-border-soft bg-background px-2 py-1">
                      {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                    </select>
                    {r.kind === "challenge" ? <button disabled={busy === r.id} onClick={() => patch(r, { action: "duplicate" })} className="text-xs font-semibold text-brand-600">Duplicate</button> : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
