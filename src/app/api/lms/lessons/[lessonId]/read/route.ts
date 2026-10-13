import { NextResponse } from "next/server";
import { requireLessonLearner } from "@/lib/lms/guard";
import { recordRead } from "@/lib/lms/completion";

export async function POST(_request: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const guard = await requireLessonLearner(lessonId, { write: true });
  if (!guard.ok) return guard.response;
  const result = await recordRead(guard.ctx.user.id, guard.ctx.structure, lessonId);
  if (!result.ok) return NextResponse.json({ error: result.error, retryAfterSeconds: result.retryAfterSeconds }, { status: 425 });
  return NextResponse.json(result);
}
