import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { err, readBody } from "@/lib/logiquest/http";
import { GdError, controlRoom } from "@/lib/practice/gd/server";

type Ctx = { params: Promise<{ code: string }> };

/** start | end | cancel (host) · mute | leave (anyone). Idempotent. */
export async function POST(request: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return err("Please log in again.", 401);
  const body = await readBody<{ action?: unknown; value?: unknown }>(request, 2000);
  if (typeof body?.action !== "string") return err("Invalid request.", 400);
  try {
    await controlRoom(decodeURIComponent((await params).code), user.id, body.action, body.value);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof GdError) return err(e.message, e.status);
    throw e;
  }
}
