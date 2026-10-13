import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { awardOnce, isUniqueViolation } from "./points";
import { getRewardConfig } from "./settings";
import { rewardKey } from "./rewards";
import { loadLearnerState, type CourseStructure } from "./state";
import { awardEarnedBadges } from "./badges";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

export function newCertificateSerial(now = new Date()) {
  const bytes = crypto.randomBytes(8);
  let code = "";
  for (const b of bytes) code += ALPHABET[b % ALPHABET.length];
  return `MLG-${now.getUTCFullYear()}-${code}`;
}

export type IssueResult =
  | { ok: true; certificate: { id: string; serial: string; issuedAt: Date; finalPercent: number; learnerName: string }; created: boolean }
  | { ok: false; reason: string };

/**
 * Issues the certificate only when the server-side state says every requirement is met
 * (required lessons, required projects, final assessment >= course pass mark).
 * The (userId, courseId) unique index makes issuing idempotent.
 */
export async function issueCertificateIfEligible(user: { id: string; name: string }, structure: CourseStructure): Promise<IssueResult> {
  const courseId = structure.course.id;
  const existing = await prisma.certificate.findUnique({ where: { userId_courseId: { userId: user.id, courseId } } });
  if (existing) return { ok: true, certificate: existing, created: false };

  const state = await loadLearnerState(user.id, structure);
  if (!state.view.certificateEligible || state.finalBestPercent === null) {
    return { ok: false, reason: state.view.certificateLockReason || "Certificate requirements are not met yet." };
  }

  let certificate;
  let created = true;
  try {
    certificate = await prisma.certificate.create({
      data: { userId: user.id, courseId, serial: newCertificateSerial(), learnerName: user.name.trim().slice(0, 120) || "Learner", finalPercent: state.finalBestPercent },
    });
  } catch (error) {
    if (!isUniqueViolation(error)) throw error;
    certificate = await prisma.certificate.findUnique({ where: { userId_courseId: { userId: user.id, courseId } } });
    created = false;
    if (!certificate) return { ok: false, reason: "Could not issue the certificate. Please try again." };
  }

  if (created) {
    const rewards = await getRewardConfig();
    await awardOnce(user.id, rewardKey.course(user.id, courseId), rewards.course, "lms_course", `Completed ${structure.course.title}`);
    await prisma.enrollment.updateMany({ where: { userId: user.id, courseId }, data: { progress: 100, status: "completed", completedAt: new Date() } });
    await prisma.notification.create({ data: { userId: user.id, title: "Certificate earned", body: `You passed the final assessment for ${structure.course.title} with ${state.finalBestPercent}%.` } }).catch(() => undefined);
    await awardEarnedBadges(user.id).catch((e) => console.error("badge award failed", e));
  }
  return { ok: true, certificate, created };
}
