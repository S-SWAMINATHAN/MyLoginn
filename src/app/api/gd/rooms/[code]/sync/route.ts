import { NextResponse, type NextRequest } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { err } from "@/lib/logiquest/http";
import { GdError, syncRoom } from "@/lib/practice/gd/server";

type Ctx = { params: Promise<{ code: string }> };

/** Polled by every participant: room state, presence and WebRTC signals for this tab. */
export async function GET(request: NextRequest, { params }: Ctx) {
  const userId = await getSessionUserId();
  if (!userId) return err("Your login has expired. Please log in again.", 401);
  const code = decodeURIComponent((await params).code);
  const peer = request.nextUrl.searchParams.get("peer") ?? "";
  const after = Math.max(0, Number(request.nextUrl.searchParams.get("after")) || 0);
  try {
    return NextResponse.json(await syncRoom(code, userId, peer, after), { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    if (e instanceof GdError) return err(e.message, e.status);
    throw e;
  }
}
