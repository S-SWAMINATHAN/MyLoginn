import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getProblemDef, ioTests } from "@/lib/logiquest/coding/catalog";
import { recordCodeSubmission } from "@/lib/logiquest/coding/progress";
import { err, readBody } from "@/lib/logiquest/http";
import { allow } from "@/lib/logiquest/rateLimit";

const VERDICTS = ["ACCEPTED", "WRONG_ANSWER", "RUNTIME_ERROR", "TIME_LIMIT"];

/**
 * Records a Python/JavaScript submission judged in the learner's browser (the MyLoginn IDE).
 * The server cannot re-run the code, so the verdict is the browser's report; counts are checked for consistency.
 */
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) return err("Log in to save your submissions.", 401);
  if (!allow(`code-submit:${user.id}`, 20)) return err("Too many submissions. Wait a minute.", 429);
  const p = getProblemDef(slug);
  if (!p || p.kind !== "io") return err("Problem not found.", 404);
  const body = await readBody<{ language?: unknown; source?: unknown; verdict?: unknown; passed?: unknown }>(request, 60_000);
  const languages = p.languages ?? ["python", "javascript"];
  const language = typeof body?.language === "string" && (languages as string[]).includes(body.language) ? body.language : null;
  const source = typeof body?.source === "string" ? body.source : "";
  const verdict = typeof body?.verdict === "string" && VERDICTS.includes(body.verdict) ? body.verdict : null;
  const total = ioTests(slug).length;
  const passed = Number.isInteger(body?.passed) ? Math.max(0, Math.min(total, body!.passed as number)) : -1;
  if (!language || !source.trim() || !verdict || passed < 0) return err("Invalid submission.", 400);
  if (source.length > 50_000) return err("Your code is too long.", 413);
  if ((verdict === "ACCEPTED") !== (passed === total)) return err("Inconsistent result.", 400);

  const r = await recordCodeSubmission({ userId: user.id, slug, difficulty: p.difficulty, language, source, verdict, passed, total, verified: false });
  return NextResponse.json({ saved: true, ...r });
}
