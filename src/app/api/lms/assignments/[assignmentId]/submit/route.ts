import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readJson, requireCourseLearner, requireLessonLearner } from "@/lib/lms/guard";

/** Learner submits (or resubmits) an assignment/project. An administrator reviews it; only approval counts as completion. */
export async function POST(request: Request, { params }: { params: Promise<{ assignmentId: string }> }) {
  const { assignmentId } = await params;
  const assignment = await prisma.courseAssignment.findUnique({ where: { id: assignmentId }, include: { course: { select: { slug: true } } } });
  if (!assignment || assignment.archivedAt) return NextResponse.json({ error: "Assignment not found." }, { status: 404 });

  const guard = assignment.lessonId
    ? await requireLessonLearner(assignment.lessonId, { write: true })
    : await requireCourseLearner(assignment.course.slug, { write: true });
  if (!guard.ok) return guard.response;

  const body = await readJson<{ content?: unknown; linkUrl?: unknown }>(request, 40_000);
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  const linkUrl = typeof body?.linkUrl === "string" ? body.linkUrl.trim() : "";
  if (content.length < 20 || content.length > 10_000) return NextResponse.json({ error: "Describe your work in 20 to 10,000 characters." }, { status: 400 });
  if (linkUrl) {
    try {
      const url = new URL(linkUrl);
      if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("scheme");
    } catch {
      return NextResponse.json({ error: "Enter a valid http(s) link or leave it empty." }, { status: 400 });
    }
  }

  const existing = await prisma.assignmentSubmission.findUnique({ where: { userId_assignmentId: { userId: guard.ctx.user.id, assignmentId } } });
  if (existing?.status === "approved") return NextResponse.json({ error: "This assignment is already approved." }, { status: 409 });

  const submission = await prisma.assignmentSubmission.upsert({
    where: { userId_assignmentId: { userId: guard.ctx.user.id, assignmentId } },
    create: { userId: guard.ctx.user.id, assignmentId, content, linkUrl: linkUrl || null },
    update: { content, linkUrl: linkUrl || null, status: "submitted", feedback: null, score: null, reviewedAt: null, reviewedById: null },
  });
  return NextResponse.json({ status: submission.status });
}
