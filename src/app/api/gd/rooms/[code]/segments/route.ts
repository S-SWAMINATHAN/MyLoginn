import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { err } from "@/lib/logiquest/http";
import { allow } from "@/lib/logiquest/rateLimit";
import { friendlyAiError, readAudio } from "@/lib/practice/sessions";
import { GdError, addSegment } from "@/lib/practice/gd/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type Ctx = { params: Promise<{ code: string }> };

/** One stretch of the caller's own speech (recorded in their browser), transcribed for the AI judge. */
export async function POST(request: Request, { params }: Ctx) {
  const userId = await getSessionUserId();
  if (!userId) return err("Please log in again.", 401);
  if (!allow(`gd-seg:${userId}`, 40)) return err("Too many uploads.", 429);
  const form = await request.formData().catch(() => null);
  if (!form) return err("Invalid request.", 400);
  const audio = await readAudio(form);
  if ("error" in audio) return err(audio.error, 400);
  try {
    const result = await addSegment(decodeURIComponent((await params).code), userId, { seq: Number(form.get("seq")), startMs: Number(form.get("startMs")), endMs: Number(form.get("endMs")) }, audio);
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof GdError) return err(e.message, e.status);
    const f = friendlyAiError(e);
    return err(f.error, f.status);
  }
}
