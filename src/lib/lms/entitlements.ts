import { prisma } from "@/lib/prisma";
import { evaluateAccess, type AccessDecision } from "./access";
import { isUniqueViolation } from "./points";

type CourseForAccess = { id: string; status: string; price: number };

/**
 * The learner's entitlement for a course.
 *
 * Back-fill: a course bought under the old flow has a paid Payment but no entitlement row.
 * The old policy had no expiry, so such buyers keep lifetime access; an entitlement row with
 * expiresAt = null is created on first read. Nobody is expired retroactively and nobody who
 * already paid is asked to pay again.
 */
export async function getEntitlement(userId: string, courseId: string) {
  const existing = await prisma.courseEntitlement.findUnique({ where: { userId_courseId: { userId, courseId } } });
  if (existing) return existing;

  const legacyPayment = await prisma.payment.findFirst({
    where: { userId, courseId, status: "paid" },
    orderBy: { createdAt: "asc" },
    select: { id: true, createdAt: true },
  });
  if (!legacyPayment) return null;

  try {
    return await prisma.courseEntitlement.create({
      data: { userId, courseId, status: "active", source: "legacy", paymentId: legacyPayment.id, startsAt: legacyPayment.createdAt, expiresAt: null },
    });
  } catch (error) {
    if (isUniqueViolation(error)) return prisma.courseEntitlement.findUnique({ where: { userId_courseId: { userId, courseId } } });
    throw error;
  }
}

export type CourseAccessResult = AccessDecision & { enrolled: boolean };

export async function getCourseAccess(user: { id: string; role: string } | null, course: CourseForAccess): Promise<CourseAccessResult> {
  if (!user) {
    const decision = evaluateAccess({ course, enrolled: false, entitlement: null });
    return { ...decision, enrolled: false };
  }
  const [enrollment, entitlement] = await Promise.all([
    prisma.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: course.id } }, select: { id: true } }),
    course.price > 0 ? getEntitlement(user.id, course.id) : Promise.resolve(null),
  ]);
  const decision = evaluateAccess({ course, enrolled: Boolean(enrollment), entitlement, isAdmin: user.role === "ADMIN" });
  return { ...decision, enrolled: Boolean(enrollment) };
}
