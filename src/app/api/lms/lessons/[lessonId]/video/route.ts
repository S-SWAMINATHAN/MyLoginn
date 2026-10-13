import { NextResponse } from "next/server";
import { readJson, requireLessonLearner } from "@/lib/lms/guard";
import { recordVideo } from "@/lib/lms/completion";

export async function POST(request: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const guard = await requireLessonLearner(lessonId, { write: true });
  if (!guard.ok) return guard.response;
  const body = await readJson<{ positionSeconds?: unknown; durationSeconds?: unknown }>(request, 1000);
  if (!body || typeof body.positionSeconds !== "number" || typeof body.durationSeconds !== "number") {
    return NextResponse.json({ error: "Invalid video report." }, { status: 400 });
  }
  const result = await recordVideo(guard.ctx.user.id, guard.ctx.structure, lessonId, { positionSeconds: body.positionSeconds, durationSeconds: body.durationSeconds });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result);
}
