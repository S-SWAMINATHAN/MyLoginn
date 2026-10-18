import { prisma } from "@/lib/prisma";
import { StatTile } from "@/components/logiquest/ui";
import { MODULE_LABEL } from "@/lib/practice/report";

export const metadata = { title: "Practice — MyLoginn Admin" };

const since = (days: number) => new Date(Date.now() - days * 24 * 3600_000);

type LatencyRow = { kind: string; n: bigint; failed: bigint; p50: number | null; p75: number | null; p95: number | null; p99: number | null };
type ErrorRow = { error: string; n: bigint };

export default async function AdminPractice() {
  const week = since(7);
  const [byModule, completed, avgScores, modes, latency, errors, gdRooms, active] = await Promise.all([
    prisma.practiceSession.groupBy({ by: ["module"], _count: { _all: true } }),
    prisma.practiceSession.groupBy({ by: ["module"], where: { status: "COMPLETED" }, _count: { _all: true } }),
    prisma.practiceSession.groupBy({ by: ["module"], where: { status: "COMPLETED", score: { not: null } }, _avg: { score: true } }),
    prisma.practiceSession.groupBy({ by: ["module", "mode"], _count: { _all: true }, orderBy: { _count: { mode: "desc" } }, take: 10 }),
    // Percentiles in the database: never pulls the log rows into the app.
    prisma.$queryRaw<LatencyRow[]>`
      SELECT kind, COUNT(*) AS n, COUNT(*) FILTER (WHERE NOT ok) AS failed,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY ms) FILTER (WHERE ok) AS p50,
        percentile_cont(0.75) WITHIN GROUP (ORDER BY ms) FILTER (WHERE ok) AS p75,
        percentile_cont(0.95) WITHIN GROUP (ORDER BY ms) FILTER (WHERE ok) AS p95,
        percentile_cont(0.99) WITHIN GROUP (ORDER BY ms) FILTER (WHERE ok) AS p99
      FROM "PracticeAiLog" WHERE "createdAt" >= ${week} GROUP BY kind ORDER BY kind`,
    prisma.$queryRaw<ErrorRow[]>`SELECT error, COUNT(*) AS n FROM "PracticeAiLog" WHERE "createdAt" >= ${week} AND NOT ok GROUP BY error ORDER BY n DESC`,
    prisma.gdRoom.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.practiceSession.count({ where: { status: "ACTIVE", startedAt: { gte: since(1) } } }),
  ]);

  const count = (rows: { module: string; _count: { _all: number } }[], m: string) => rows.find((r) => r.module === m)?._count._all ?? 0;
  const started = (m: string) => count(byModule, m);
  const done = (m: string) => count(completed, m);
  const calls = latency.reduce((n, r) => n + Number(r.n), 0);
  const failed = latency.reduce((n, r) => n + Number(r.failed), 0);
  const ms = (v: number | null) => (v === null ? "—" : `${(v / 1000).toFixed(1)} s`);
  const turnStats = latency.find((r) => r.kind === "interview_turn");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Practice</h1>
        <p className="mt-1 text-sm text-muted">AI interviews, speaking lab and group discussions. Performance figures cover the last 7 days.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Practice sessions" value={byModule.reduce((n, r) => n + r._count._all, 0)} hint={`${active} active in the last 24 h`} />
        <StatTile label="Interviews completed" value={done("INTERVIEW")} hint={`${started("INTERVIEW")} started · ${started("INTERVIEW") ? Math.round((done("INTERVIEW") / started("INTERVIEW")) * 100) : 0}% completion`} />
        <StatTile label="GD reports" value={done("GD")} hint={gdRooms.map((g) => `${g._count._all} ${g.status.toLowerCase()}`).join(" · ") || "No rooms yet"} />
        <StatTile label="Speaking sessions" value={done("SPEAKING")} hint={`${started("SPEAKING")} started`} />
        <StatTile label="AI calls (7 d)" value={calls} hint={`${failed} failed`} />
        <StatTile label="AI failure rate" value={calls ? `${((failed / calls) * 100).toFixed(1)}%` : "—"} />
        <StatTile label="Interview turn P50" value={ms(turnStats?.p50 ?? null)} hint={`P95 ${ms(turnStats?.p95 ?? null)}`} />
        <StatTile label="Average scores" value={avgScores.map((a) => `${Math.round(a._avg.score ?? 0)}`).join(" / ") || "—"} hint={avgScores.map((a) => MODULE_LABEL[a.module]).join(" / ")} />
      </div>

      <section className="rounded-3xl border border-border-soft bg-surface p-5">
        <h2 className="font-semibold">AI response time by call type</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted"><tr><th className="py-2 pr-4">Call</th><th className="pr-4">Calls</th><th className="pr-4">Failed</th><th className="pr-4">P50</th><th className="pr-4">P75</th><th className="pr-4">P95</th><th>P99</th></tr></thead>
            <tbody>
              {latency.map((r) => (
                <tr key={r.kind} className="border-t border-border-soft tabular-nums">
                  <td className="py-2 pr-4 font-medium">{r.kind}</td><td className="pr-4">{Number(r.n)}</td><td className="pr-4">{Number(r.failed)}</td>
                  <td className="pr-4">{ms(r.p50)}</td><td className="pr-4">{ms(r.p75)}</td><td className="pr-4">{ms(r.p95)}</td><td>{ms(r.p99)}</td>
                </tr>
              ))}
              {!latency.length ? <tr><td colSpan={7} className="py-4 text-muted">No AI calls in the last 7 days.</td></tr> : null}
            </tbody>
          </table>
        </div>
        {errors.length ? <p className="mt-3 text-xs text-muted">Failures: {errors.map((e) => `${e.error ?? "unknown"} ${Number(e.n)}`).join(" · ")}</p> : null}
      </section>

      <section className="rounded-3xl border border-border-soft bg-surface p-5">
        <h2 className="font-semibold">Most practised</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {modes.map((m) => <li key={`${m.module}-${m.mode}`} className="flex justify-between rounded-2xl bg-story-mist/60 px-3 py-2 text-sm dark:bg-surface-2"><span>{MODULE_LABEL[m.module]} · {m.mode}</span><span className="font-semibold tabular-nums">{m._count._all}</span></li>)}
        </ul>
      </section>
    </div>
  );
}
