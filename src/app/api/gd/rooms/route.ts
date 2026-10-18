import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { err, readBody } from "@/lib/logiquest/http";
import { allow } from "@/lib/logiquest/rateLimit";
import { isAiConfigured } from "@/lib/practice/ai";
import { GdError, createRoom } from "@/lib/practice/gd/server";

/** Creates a group discussion room; the creator is the host. */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return err("Please log in to create a group discussion.", 401);
  if (!isAiConfigured()) return err("Group discussion evaluation is not available right now. Please try again later.", 503);
  if (!allow(`gd-create:${user.id}`, 5)) return err("Please wait a moment before creating another room.", 429);
  const body = await readBody<Record<string, unknown>>(request, 4000);
  if (!body) return err("Invalid request.", 400);
  try {
    return NextResponse.json({ code: await createRoom(user.id, body) });
  } catch (e) {
    if (e instanceof GdError) return err(e.message, e.status);
    throw e;
  }
}
