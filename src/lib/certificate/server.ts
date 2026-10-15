import "server-only";
import { prisma } from "@/lib/prisma";
import { issueCertificateIfEligible } from "@/lib/lms/certificates";
import type { CourseStructure } from "@/lib/lms/state";
import type { IssuedCertificate } from "@/types/certificate";
import { normalizeOfficialName, validateOfficialName } from "./config";

type CertificateRow = { serial: string; learnerName: string; nameConfirmedAt: Date | null; issuedAt: Date; finalPercent: number };

export const toIssuedCertificate = (row: CertificateRow): IssuedCertificate => ({
  credentialId: row.serial,
  learnerName: row.learnerName,
  nameConfirmed: row.nameConfirmedAt !== null,
  issuedAt: row.issuedAt.toISOString(),
  finalPercent: row.finalPercent,
});

export type ConfirmNameResult = { ok: true; certificate: IssuedCertificate } | { ok: false; status: number; error: string };

/**
 * Issues the certificate if the learner is eligible (same server-side gate as the PDF route) and locks
 * the confirmed official name onto it. Confirming the same name again is a no-op; a different name
 * after confirmation is refused, because the credential has already been printed with the first one.
 */
export async function confirmCertificateName(user: { id: string; name: string }, structure: CourseStructure, rawName: string): Promise<ConfirmNameResult> {
  const name = normalizeOfficialName(rawName);
  const invalid = validateOfficialName(name);
  if (invalid) return { ok: false, status: 400, error: invalid };

  const issued = await issueCertificateIfEligible({ id: user.id, name }, structure);
  if (!issued.ok) return { ok: false, status: 403, error: issued.reason };

  const existing = await prisma.certificate.findUniqueOrThrow({ where: { serial: issued.certificate.serial } });
  if (existing.nameConfirmedAt) {
    if (existing.learnerName === name) return { ok: true, certificate: toIssuedCertificate(existing) };
    return { ok: false, status: 409, error: `Your certificate name is already confirmed as "${existing.learnerName}". Contact support to correct it.` };
  }
  // The conditional update makes two racing confirmations safe: only one can flip nameConfirmedAt.
  const { count } = await prisma.certificate.updateMany({ where: { id: existing.id, nameConfirmedAt: null }, data: { learnerName: name, nameConfirmedAt: new Date() } });
  const row = await prisma.certificate.findUniqueOrThrow({ where: { id: existing.id } });
  if (count === 0 && row.learnerName !== name) return { ok: false, status: 409, error: `Your certificate name is already confirmed as "${row.learnerName}".` };
  return { ok: true, certificate: toIssuedCertificate(row) };
}
