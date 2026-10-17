import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { clientKey, err, readBody } from "@/lib/logiquest/http";
import { allow } from "@/lib/logiquest/rateLimit";
import { startTest } from "@/lib/logiquest/tests";

/** Starts an online test: returns the questions (without answers) and a signed token used to grade them. */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!allow(`test:${user?.id ?? clientKey(request)}`, 10)) return err("Too many tests started. Wait a minute.", 429);
  const body = await readBody<{ subject?: unknown; topic?: unknown }>(request, 500);
  if (typeof body?.subject !== "string") return err("Invalid request.", 400);
  const test = await startTest(body.subject, typeof body.topic === "string" && body.topic ? body.topic : null);
  if (!test) return err("This test is not available.", 404);
  return NextResponse.json(test);
}
