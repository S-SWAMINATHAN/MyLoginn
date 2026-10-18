"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, CircleDot, Search } from "lucide-react";
import { cn } from "@/lib/cn";

export type ProblemRow = { slug: string; title: string; difficulty: "Easy" | "Medium" | "Hard"; tags: string[]; tracks: string[]; kind: "io" | "sql"; status: "solved" | "attempted" | null; acceptance: number | null };

const DIFF_CLS: Record<string, string> = { Easy: "text-emerald-600", Medium: "text-amber-600", Hard: "text-rose-600" };

/** LeetCode-style problem set: search, difficulty, track and status filters. */
export function ProblemTable({ rows, tracks, fixedTrack }: { rows: ProblemRow[]; tracks: { slug: string; title: string }[]; fixedTrack?: string }) {
  const [q, setQ] = useState("");
  const [diff, setDiff] = useState("all");
  const [track, setTrack] = useState(fixedTrack ?? "all");
  const [status, setStatus] = useState("all");
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((r) =>
      (!s || r.title.toLowerCase().includes(s) || r.tags.some((t) => t.toLowerCase().includes(s))) &&
      (diff === "all" || r.difficulty === diff) &&
      (track === "all" || r.tracks.includes(track)) &&
      (status === "all" || (status === "todo" ? !r.status : r.status === status)));
  }, [rows, q, diff, track, status]);
  const select = "rounded-full border border-border-soft bg-surface px-3 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-story-royal";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative flex min-w-[12rem] flex-1 items-center">
          <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted" aria-hidden />
          <span className="sr-only">Search problems</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search problems or tags" className="w-full rounded-full border border-border-soft bg-surface py-2 pl-10 pr-4 text-sm outline-none focus:border-story-royal" />
        </label>
        <select aria-label="Difficulty" value={diff} onChange={(e) => setDiff(e.target.value)} className={select}><option value="all">All difficulties</option><option>Easy</option><option>Medium</option><option>Hard</option></select>
        {!fixedTrack ? <select aria-label="Track" value={track} onChange={(e) => setTrack(e.target.value)} className={select}><option value="all">All tracks</option>{tracks.map((t) => <option key={t.slug} value={t.slug}>{t.title}</option>)}</select> : null}
        <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)} className={select}><option value="all">Any status</option><option value="todo">To do</option><option value="attempted">Attempted</option><option value="solved">Solved</option></select>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border-soft bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border-soft bg-story-mist text-[11px] font-bold uppercase tracking-wider text-muted">
            <tr><th className="w-10 px-4 py-2.5"><span className="sr-only">Status</span></th><th className="py-2.5">Title</th><th className="hidden py-2.5 md:table-cell">Tags</th><th className="hidden py-2.5 text-right sm:table-cell">Acceptance</th><th className="px-4 py-2.5 text-right">Difficulty</th></tr>
          </thead>
          <tbody className="divide-y divide-border-soft">
            {shown.map((r) => (
              <tr key={r.slug} className="transition-colors hover:bg-story-mist/60">
                <td className="px-4 py-3">{r.status === "solved" ? <CheckCircle2 aria-label="Solved" className="h-4 w-4 text-emerald-600" /> : r.status === "attempted" ? <CircleDot aria-label="Attempted" className="h-4 w-4 text-amber-500" /> : null}</td>
                <td className="py-3 pr-3">
                  <Link href={`/logiquest/coding/problems/${r.slug}`} className="font-semibold hover:text-story-royal">{rows.indexOf(r) + 1}. {r.title}</Link>
                  {r.kind === "sql" ? <span className="ml-2 rounded bg-story-mist px-1.5 py-0.5 text-[10px] font-bold text-muted">SQL</span> : null}
                </td>
                <td className="hidden py-3 pr-3 md:table-cell"><span className="line-clamp-1 text-xs text-muted">{r.tags.join(" · ")}</span></td>
                <td className="hidden py-3 text-right tabular-nums text-muted sm:table-cell">{r.acceptance === null ? "—" : `${r.acceptance}%`}</td>
                <td className={cn("px-4 py-3 text-right font-semibold", DIFF_CLS[r.difficulty])}>{r.difficulty}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!shown.length ? <p className="p-8 text-center text-sm text-muted">No problems match these filters.</p> : null}
      </div>
      <p className="mt-2 text-xs text-muted">{shown.length} of {rows.length} problems</p>
    </div>
  );
}
