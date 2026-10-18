import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { err } from "@/lib/logiquest/http";
import { allow } from "@/lib/logiquest/rateLimit";
import { isRoomCode, normalizeRoomCode } from "@/lib/practice/gd/config";
import { GdError, iceServers, joinRoom } from "@/lib/practice/gd/server";

type Ctx = { params: Promise<{ code: string }> };

/** Joins with a room code. Returns this tab's peer id and the ICE servers for WebRTC. */
export async function POST(_request: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return err("Please log in to join the discussion.", 401);
  if (!allow(`gd-join:${user.id}`, 12)) return err("Too many attempts. Please wait a moment.", 429);
  const code = normalizeRoomCode(decodeURIComponent((await params).code));
  if (!isRoomCode(code)) return err("That doesn't look like a room code. It looks like ML-GD-7K29.", 400);
  try {
    const { peerId } = await joinRoom(code, user.id);
    return NextResponse.json({ code, peerId, iceServers: iceServers(user.id) });
  } catch (e) {
    if (e instanceof GdError) return err(e.message, e.status);
    throw e;
  }
}
