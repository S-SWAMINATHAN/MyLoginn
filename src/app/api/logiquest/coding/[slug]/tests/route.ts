import { NextResponse } from "next/server";
import { getProblemDef, ioTests } from "@/lib/logiquest/coding/catalog";
import { clientKey, err } from "@/lib/logiquest/http";
import { allow } from "@/lib/logiquest/rateLimit";

/** All test cases of a stdin/stdout problem, used by the browser judge when the learner presses Submit. */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!allow(`code-tests:${clientKey(request)}`, 60)) return err("Too many requests. Wait a minute.", 429);
  const p = getProblemDef(slug);
  if (!p || p.kind !== "io") return err("Problem not found.", 404);
  return NextResponse.json({ tests: ioTests(slug) });
}
