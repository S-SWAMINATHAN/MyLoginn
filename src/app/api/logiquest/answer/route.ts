import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getQuestion } from "@/lib/logiquest/bank";
import { err, readBody } from "@/lib/logiquest/http";
import { recordAnswer } from "@/lib/logiquest/progress";
import { allow } from "@/lib/logiquest/rateLimit";

/** Records a logged-in learner's practice answer. Grading uses the server's copy of the question. */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return err("Log in to save your progress.", 401);
  if (!allow(`answer:${user.id}`, 90)) return err("You are answering too quickly. Wait a moment.", 429);
  const body = await readBody<{ qid?: unknown; selected?: unknown }>(request, 500);
  if (typeof body?.qid !== "string" || !Number.isInteger(body.selected)) return err("Invalid request.", 400);
  const question = await getQuestion(body.qid);
  if (!question || question.kind !== "mcq") return err("Question not found.", 404);
  const selected = body.selected as number;
  if (selected < 0 || selected >= question.o.length) return err("Choose one of the options.", 400);
  return NextResponse.json(await recordAnswer(user.id, question, selected));
}
