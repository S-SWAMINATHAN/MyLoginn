import "server-only";
import { prisma } from "@/lib/prisma";
import { problemSummaries } from "./catalog";
import { codeProgressFor } from "./progress";

/** Problem rows with acceptance rate and (for a logged-in learner) solved / attempted status. */
export async function problemRows(userId: string | null) {
  const [stats, progress] = await Promise.all([
    prisma.lqCodeSubmission.groupBy({ by: ["slug", "verdict"], _count: { _all: true } }).catch(() => []),
    userId ? codeProgressFor(userId).catch(() => new Map()) : Promise.resolve(new Map()),
  ]);
  const totals = new Map<string, { all: number; ok: number }>();
  for (const s of stats) {
    const t = totals.get(s.slug) ?? { all: 0, ok: 0 };
    t.all += s._count._all;
    if (s.verdict === "ACCEPTED") t.ok += s._count._all;
    totals.set(s.slug, t);
  }
  return problemSummaries().map((p) => {
    const t = totals.get(p.slug);
    const pr = progress.get(p.slug) as { solved: boolean; attempts: number } | undefined;
    return { ...p, acceptance: t && t.all ? Math.round((t.ok / t.all) * 100) : null, status: pr?.solved ? ("solved" as const) : pr?.attempts ? ("attempted" as const) : null };
  });
}
