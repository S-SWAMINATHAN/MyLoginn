import "server-only";
import { randomBytes } from "node:crypto";
import type { CcCertificateKind } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AWARD_FOR_RANK, type LeaderboardEntry } from "../types";
import { audit } from "./audit";
import { ApiError, isUniqueViolation } from "./http";

/** 20 characters from a 31-symbol alphabet (no 0/O/1/I/L): ~99 bits, unguessable and easy to read aloud. */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export function certificateCode() {
  const bytes = randomBytes(20);
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return `MLC-${out.slice(0, 5)}-${out.slice(5, 10)}-${out.slice(10, 15)}-${out.slice(15, 20)}`;
}

/**
 * Makes issued certificates match the published results exactly. Idempotent: running it twice issues nothing new.
 *  - Participation: finalized attempt, not disqualified, at least one answer, final score ≥ the published minimum %.
 *  - Award (Top 3): rank 1, 2 or 3 in the published snapshot.
 * Certificates whose basis no longer holds (after an authorised correction) are revoked with a reason.
 */
export async function syncCertificates(competitionId: string) {
  const c = await prisma.competition.findUniqueOrThrow({ where: { id: competitionId } });
  if (!c.resultsPublishedAt) return { issued: 0, revoked: 0 };
  const snapshot = await prisma.ccLeaderboardSnapshot.findFirst({ where: { competitionId, publishedAt: { not: null } }, orderBy: { version: "desc" } });
  const rankOf = new Map(((snapshot?.entries ?? []) as unknown as LeaderboardEntry[]).map((e) => [e.candidateId, e.rank]));
  const results = await prisma.ccResult.findMany({ where: { competitionId }, include: { attempt: { include: { registration: true } } } });

  const want = new Map<string, { registrationId: string; kind: CcCertificateKind; name: string; rank: number | null }>();
  for (const r of results) {
    const reg = r.attempt.registration;
    if (r.reviewStatus === "DISQUALIFIED") continue;
    const rank = rankOf.get(reg.candidateId) ?? null;
    if (r.questionsAttempted > 0 && r.maxScore > 0 && (r.finalScore / r.maxScore) * 100 >= c.certificateMinPercent)
      want.set(`${reg.id}:PARTICIPATION`, { registrationId: reg.id, kind: "PARTICIPATION", name: reg.displayName, rank });
    const award = rank ? AWARD_FOR_RANK[rank] : undefined;
    if (award) want.set(`${reg.id}:${award}`, { registrationId: reg.id, kind: award, name: reg.displayName, rank });
  }

  const active = await prisma.ccCertificate.findMany({ where: { competitionId, revokedAt: null } });
  let revoked = 0;
  for (const cert of active) {
    const key = `${cert.registrationId}:${cert.kind}`;
    if (!want.has(key)) {
      await prisma.ccCertificate.update({ where: { id: cert.id }, data: { revokedAt: new Date(), revokeReason: "Results were corrected; this certificate no longer applies." } });
      revoked++;
    } else if (cert.rank !== want.get(key)!.rank) {
      await prisma.ccCertificate.update({ where: { id: cert.id }, data: { rank: want.get(key)!.rank } });
    }
  }
  const have = new Set(active.filter((x) => want.has(`${x.registrationId}:${x.kind}`)).map((x) => `${x.registrationId}:${x.kind}`));
  let issued = 0;
  for (const [key, w] of want) {
    if (have.has(key)) continue;
    const last = await prisma.ccCertificate.findFirst({ where: { registrationId: w.registrationId, kind: w.kind }, orderBy: { revision: "desc" } });
    try {
      await prisma.ccCertificate.create({ data: { code: certificateCode(), competitionId, registrationId: w.registrationId, kind: w.kind, revision: (last?.revision ?? 0) + 1, candidateName: w.name, rank: w.rank } });
      issued++;
    } catch (e) {
      if (!isUniqueViolation(e)) throw e; // a concurrent sync issued it
    }
  }
  return { issued, revoked };
}

export async function revokeCertificate(id: string, reason: string, actorId: string) {
  if (reason.trim().length < 10) throw new ApiError(400, "Give a reason for revoking.");
  return prisma.$transaction(async (tx) => {
    const cert = await tx.ccCertificate.findUnique({ where: { id } });
    if (!cert || cert.revokedAt) throw new ApiError(404, "Active certificate not found.");
    await tx.ccCertificate.update({ where: { id }, data: { revokedAt: new Date(), revokeReason: reason.trim() } });
    await audit(tx, { competitionId: cert.competitionId, actorId, action: "certificate.revoke", entity: "CcCertificate", entityId: id, meta: { reason } });
  });
}

/** Revokes and issues a replacement (new code, next revision), e.g. for a name correction. */
export async function reissueCertificate(id: string, reason: string, candidateName: string | undefined, actorId: string) {
  if (reason.trim().length < 10) throw new ApiError(400, "Give a reason for reissuing.");
  return prisma.$transaction(async (tx) => {
    const cert = await tx.ccCertificate.findUnique({ where: { id } });
    if (!cert || cert.revokedAt) throw new ApiError(404, "Active certificate not found.");
    await tx.ccCertificate.update({ where: { id }, data: { revokedAt: new Date(), revokeReason: `Reissued: ${reason.trim()}` } });
    const name = candidateName?.trim() || cert.candidateName;
    if (candidateName?.trim()) await tx.ccRegistration.update({ where: { id: cert.registrationId }, data: { displayName: name } });
    const next = await tx.ccCertificate.create({ data: { code: certificateCode(), competitionId: cert.competitionId, registrationId: cert.registrationId, kind: cert.kind, revision: cert.revision + 1, candidateName: name, rank: cert.rank } });
    await audit(tx, { competitionId: cert.competitionId, actorId, action: "certificate.reissue", entity: "CcCertificate", entityId: next.id, meta: { from: id, reason } });
    return next;
  });
}

/** Public verification. Shows only the display name, award and dates; never contact details. */
export async function verifyCertificate(code: string, ipHash?: string) {
  if (!/^MLC-[2-9A-Z]{5}-[2-9A-Z]{5}-[2-9A-Z]{5}-[2-9A-Z]{5}$/.test(code)) return null;
  const cert = await prisma.ccCertificate.findUnique({ where: { code }, include: { competition: { select: { title: true, startsAt: true, timezone: true } }, registration: { select: { candidateId: true } } } });
  if (!cert) return null;
  await prisma.ccCertificateVerification.create({ data: { certificateId: cert.id, ipHash } }).catch(() => undefined);
  const replacement = cert.revokedAt ? await prisma.ccCertificate.findFirst({ where: { registrationId: cert.registrationId, kind: cert.kind, revokedAt: null }, select: { code: true } }) : null;
  return {
    code: cert.code,
    valid: !cert.revokedAt,
    revokedAt: cert.revokedAt?.toISOString() ?? null,
    revokeReason: cert.revokeReason,
    replacementCode: replacement?.code ?? null,
    kind: cert.kind,
    rank: cert.rank,
    candidateName: cert.candidateName,
    candidateId: cert.registration.candidateId,
    competitionTitle: cert.competition.title,
    competitionDate: cert.competition.startsAt.toISOString(),
    timezone: cert.competition.timezone,
    issuedAt: cert.issuedAt.toISOString(),
  };
}
export type VerifiedCertificate = NonNullable<Awaited<ReturnType<typeof verifyCertificate>>>;
