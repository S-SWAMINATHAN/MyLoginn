/**
 * Course access rules. Pure functions: no database, no clock except the injected `now`,
 * so the rules can be unit-tested and reused by pages, API routes and the dashboard.
 */

export type AccessCourse = {
  status: string; // draft | published | archived
  price: number; // whole rupees; 0 = free
};

export type AccessEntitlement = {
  status: string; // active | revoked
  startsAt: Date;
  expiresAt: Date | null; // null = lifetime
} | null;

export type AccessReason =
  | "ok_free"
  | "ok_paid"
  | "ok_admin"
  | "not_published"
  | "not_enrolled"
  | "needs_purchase"
  | "expired"
  | "revoked";

export type AccessDecision = {
  allowed: boolean;
  reason: AccessReason;
  /** Learner-facing explanation (also used as the lock reason in the UI). */
  message: string;
  expiresAt: Date | null;
  /** Whole days remaining for a timed entitlement, else null. */
  daysLeft: number | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export const isFreeCourse = (course: Pick<AccessCourse, "price">) => course.price === 0;

export function isEntitlementActive(entitlement: AccessEntitlement, now: Date): boolean {
  if (!entitlement || entitlement.status !== "active") return false;
  if (entitlement.startsAt.getTime() > now.getTime()) return false;
  return entitlement.expiresAt === null || entitlement.expiresAt.getTime() > now.getTime();
}

export function daysLeft(expiresAt: Date | null, now: Date): number | null {
  if (!expiresAt) return null;
  return Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / DAY_MS));
}

type Input = {
  course: AccessCourse;
  enrolled: boolean;
  entitlement: AccessEntitlement;
  isAdmin?: boolean;
  now?: Date;
};

export function evaluateAccess({ course, enrolled, entitlement, isAdmin = false, now = new Date() }: Input): AccessDecision {
  const deny = (reason: AccessReason, message: string): AccessDecision => ({
    allowed: false,
    reason,
    message,
    expiresAt: entitlement?.expiresAt ?? null,
    daysLeft: null,
  });

  // Administrators can preview any course in any state (never grants them a certificate or progress).
  if (isAdmin) {
    return { allowed: true, reason: "ok_admin", message: "Administrator preview.", expiresAt: null, daysLeft: null };
  }

  if (isFreeCourse(course)) {
    // Archived free courses stay open to people who already enrolled; drafts are never visible.
    if (course.status === "draft") return deny("not_published", "This course is not published yet.");
    if (course.status === "archived" && !enrolled) return deny("not_published", "This course is no longer available.");
    if (!enrolled) return deny("not_enrolled", "Enroll in this free course to start learning.");
    return { allowed: true, reason: "ok_free", message: "Free course.", expiresAt: null, daysLeft: null };
  }

  if (course.status === "draft") return deny("not_published", "This course is not published yet.");

  if (!entitlement) return deny("needs_purchase", "Purchase this Advanced course to unlock it.");
  if (entitlement.status !== "active") return deny("revoked", "Your access to this course was revoked. Contact support if this is unexpected.");
  if (!isEntitlementActive(entitlement, now)) return deny("expired", "Your course access has expired. Renew your course access to continue.");

  return {
    allowed: true,
    reason: "ok_paid",
    message: entitlement.expiresAt ? "Paid course - access active." : "Paid course - lifetime access.",
    expiresAt: entitlement.expiresAt,
    daysLeft: daysLeft(entitlement.expiresAt, now),
  };
}
