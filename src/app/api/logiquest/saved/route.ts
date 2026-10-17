import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getQuestion } from "@/lib/logiquest/bank";
import { err, readBody } from "@/lib/logiquest/http";

/** Bookmarks a question (save = true) or removes the bookmark. */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return err("Log in to bookmark questions.", 401);
  const body = await readBody<{ qid?: unknown; save?: unknown }>(request, 500);
  if (typeof body?.qid !== "string" || typeof body.save !== "boolean") return err("Invalid request.", 400);
  if (body.save) {
    if (!(await getQuestion(body.qid))) return err("Question not found.", 404);
    await prisma.lqSaved.upsert({ where: { userId_qid: { userId: user.id, qid: body.qid } }, create: { userId: user.id, qid: body.qid }, update: {} });
  } else {
    await prisma.lqSaved.deleteMany({ where: { userId: user.id, qid: body.qid } });
  }
  return NextResponse.json({ saved: body.save });
}
