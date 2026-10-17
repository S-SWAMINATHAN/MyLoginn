import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getQuestion } from "@/lib/logiquest/bank";
import { MAX_COMMENT_LENGTH } from "@/lib/logiquest/constants";
import { err, readBody } from "@/lib/logiquest/http";
import { allow } from "@/lib/logiquest/rateLimit";

/** Adds a message to a question's discussion. */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return err("Log in to join the discussion.", 401);
  if (!allow(`comment:${user.id}`, 6)) return err("You are posting too quickly. Wait a minute.", 429);
  const body = await readBody<{ qid?: unknown; body?: unknown }>(request, 8000);
  const text = typeof body?.body === "string" ? body.body.trim() : "";
  if (typeof body?.qid !== "string" || !text) return err("Write something first.", 400);
  if (text.length > MAX_COMMENT_LENGTH) return err(`Keep it under ${MAX_COMMENT_LENGTH} characters.`, 400);
  if (!(await getQuestion(body.qid))) return err("Question not found.", 404);
  const c = await prisma.lqComment.create({ data: { qid: body.qid, userId: user.id, body: text } });
  return NextResponse.json({ id: c.id, createdAt: c.createdAt, body: c.body, name: user.name.split(/\s+/)[0] || "Learner", mine: true });
}

/** Deletes one of your own messages (admins can delete any). */
export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return err("Log in first.", 401);
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return err("Invalid request.", 400);
  const done = await prisma.lqComment.deleteMany({ where: { id, ...(user.role === "ADMIN" ? {} : { userId: user.id }) } });
  if (!done.count) return err("Not found.", 404);
  return NextResponse.json({ ok: true });
}
