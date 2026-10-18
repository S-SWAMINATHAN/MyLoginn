import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { err, readBody } from "@/lib/logiquest/http";
import { allow } from "@/lib/logiquest/rateLimit";
import { GdError, postSignal } from "@/lib/practice/gd/server";

type Ctx = { params: Promise<{ code: string }> };

/** Sends one WebRTC offer/answer to another participant's tab. */
export async function POST(request: Request, { params }: Ctx) {
  const userId = await getSessionUserId();
  if (!userId) return err("Please log in again.", 401);
  if (!allow(`gd-signal:${userId}`, 120)) return err("Too many signals.", 429);
  const body = await readBody<{ from?: unknown; to?: unknown; kind?: unknown; payload?: unknown }>(request, 40_000);
  if (typeof body?.from !== "string" || typeof body.to !== "string" || typeof body.kind !== "string") return err("Invalid signal.", 400);
  try {
    await postSignal(decodeURIComponent((await params).code), userId, body.from, body.to, body.kind, body.payload ?? null);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof GdError) return err(e.message, e.status);
    throw e;
  }
}
