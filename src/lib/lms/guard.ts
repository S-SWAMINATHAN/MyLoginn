import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCourseAccess, type CourseAccessResult } from "./entitlements";
import { lessonLockReason } from "./progression";
import { loadLearnerState, loadStructure, type CourseStructure, type LearnerState } from "./state";

type User = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export type LearnerContext = {
  user: User;
  structure: CourseStructure;
  access: CourseAccessResult;
  /** True when an administrator is previewing: reads are allowed, nothing is recorded. */
  preview: boolean;
};

const fail = (error: string, status: number, extra: Record<string, unknown> = {}) =>
  ({ ok: false as const, response: NextResponse.json({ error, ...extra }, { status }) });

/** Authenticated + course exists + learner is allowed into the course (enrolment / verified entitlement). */
export async function requireCourseLearner(slug: string, options: { write?: boolean } = {}): Promise<{ ok: true; ctx: LearnerContext } | { ok: false; response: NextResponse }> {
  const user = await getCurrentUser();
  if (!user) return fail("Log in to continue.", 401);
  const structure = await loadStructure(slug);
  if (!structure) return fail("Course not found.", 404);

  const access = await getCourseAccess(user, structure.course);
  if (!access.allowed) {
    const status = access.reason === "needs_purchase" || access.reason === "expired" ? 402 : access.reason === "not_published" ? 404 : 403;
    return fail(access.message, status, { reason: access.reason });
  }
  const preview = access.reason === "ok_admin";
  if (preview && options.write) return fail("Preview mode: progress is not recorded for administrators.", 403, { reason: "preview" });
  return { ok: true, ctx: { user, structure, access, preview } };
}

/** As above, and additionally the lesson must exist in the course and be unlocked for this learner. */
export async function requireLessonLearner(lessonId: string, options: { write?: boolean } = {}) {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { id: true, archivedAt: true, course: { select: { slug: true } } } });
  if (!lesson || lesson.archivedAt) return fail("Lesson not found.", 404);
  const base = await requireCourseLearner(lesson.course.slug, options);
  if (!base.ok) return base;

  let state: LearnerState | null = null;
  if (!base.ctx.preview) {
    state = await loadLearnerState(base.ctx.user.id, base.ctx.structure);
    const lock = lessonLockReason(state.view, lessonId);
    if (lock) return fail(lock, 423, { reason: "locked" });
  }
  return { ok: true as const, ctx: base.ctx, lessonId, state };
}

/** Reads a small JSON body safely. */
export async function readJson<T = Record<string, unknown>>(request: Request, maxBytes = 64_000): Promise<T | null> {
  try {
    const text = await request.text();
    if (text.length > maxBytes) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
