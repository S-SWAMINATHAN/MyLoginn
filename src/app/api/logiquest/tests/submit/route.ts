import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { err, readBody } from "@/lib/logiquest/http";
import { submitTest } from "@/lib/logiquest/tests";

/** Grades a test on the server. Logged-in learners get it saved to their history and earn XP. */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  const body = await readBody<{ token?: unknown; answers?: unknown }>(request, 20_000);
  if (typeof body?.token !== "string") return err("Invalid request.", 400);
  const result = await submitTest(body.token, body.answers, user?.id ?? null);
  if ("error" in result) return err(result.error, 400);
  return NextResponse.json(result);
}
