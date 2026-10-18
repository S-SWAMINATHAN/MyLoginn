import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { err } from "@/lib/logiquest/http";
import { GdError, evaluateRoom } from "@/lib/practice/gd/server";

export const runtime = "nodejs";
export const maxDuration = 180;

type Ctx = { params: Promise<{ code: string }> };

/** Runs (or reports on) the AI judge for an ended discussion. Safe to call from every participant at once. */
export async function POST(_request: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return err("Please log in again.", 401);
  try {
    const result = await evaluateRoom(decodeURIComponent((await params).code), user.id, Date.now() + (maxDuration - 15) * 1000);
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof GdError) return err(e.message, e.status);
    throw e;
  }
}
