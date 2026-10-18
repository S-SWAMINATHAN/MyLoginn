import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getProblemDef } from "@/lib/logiquest/coding/catalog";
import { recordCodeSubmission } from "@/lib/logiquest/coding/progress";
import { checkReadOnly, runSql, sameResult } from "@/lib/logiquest/coding/sqlJudge";
import { clientKey, err, readBody } from "@/lib/logiquest/http";
import { allow } from "@/lib/logiquest/rateLimit";

export const runtime = "nodejs";

/**
 * Runs or submits a SQL answer. The query runs against a fresh in-memory copy of the problem's dataset on the server,
 * and the verdict compares it with the reference query's result, so SQL verdicts are trustworthy.
 */
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!allow(`code-sql:${user?.id ?? clientKey(request)}`, 30)) return err("You are running queries too quickly. Wait a moment.", 429);
  const p = getProblemDef(slug);
  if (!p || p.kind !== "sql") return err("Problem not found.", 404);
  const body = await readBody<{ query?: unknown; mode?: unknown }>(request, 20_000);
  const query = typeof body?.query === "string" ? body.query : "";
  const mode = body?.mode === "submit" ? "submit" : "run";
  const invalid = checkReadOnly(query);
  if (invalid) return err(invalid, 400);

  const [mine, expected] = await Promise.all([runSql(p.schema, query), runSql(p.schema, p.ref)]);
  if ("error" in expected) return err("This problem's dataset could not be loaded. Please report it.", 500);
  const verdict = "error" in mine ? (mine.error.startsWith("Time limit") ? "TIME_LIMIT" : "RUNTIME_ERROR") : sameResult(mine, expected, p.ordered) ? "ACCEPTED" : "WRONG_ANSWER";

  let record: Awaited<ReturnType<typeof recordCodeSubmission>> | null = null;
  if (mode === "submit" && user) {
    record = await recordCodeSubmission({ userId: user.id, slug, difficulty: p.difficulty, language: "sql", source: query, verdict, passed: verdict === "ACCEPTED" ? 1 : 0, total: 1, verified: true });
  }
  return NextResponse.json({
    verdict,
    result: "error" in mine ? null : mine,
    error: "error" in mine ? mine.error : null,
    // The expected table is shown on Run so learners can compare shapes; Submit only reports the verdict.
    expected: mode === "run" ? expected : null,
    ordered: p.ordered,
    saved: Boolean(record),
    xpAwarded: record?.xpAwarded ?? 0,
  });
}
