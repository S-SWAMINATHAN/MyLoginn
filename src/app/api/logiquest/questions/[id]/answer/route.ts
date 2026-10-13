import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { err, readBody } from "@/lib/logiquest/api";
import { recordAnswer } from "@/lib/logiquest/progress";
import { allow } from "@/lib/logiquest/rateLimit";

/** Grades an answer on the server. The correct option is only revealed in the response, after the learner commits. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return err("Log in to continue.", 401);
  if (!allow(`answer:${user.id}`, 60)) return err("You are answering too quickly. Wait a moment.", 429);

  const body = await readBody<{ selected?: number }>(request, 500);
  const question = await prisma.lqQuestion.findFirst({ where: { id, status: "PUBLISHED" } });
  if (!question) return err("Question not found.", 404);
  if (!Number.isInteger(body?.selected) || body!.selected! < 0 || body!.selected! >= question.options.length) return err("Choose one of the options.", 400);

  const result = await recordAnswer({ userId: user.id, question, selected: body!.selected! });
  return NextResponse.json({ ...result, correctIndex: question.correctIndex, explanation: question.explanation });
}
