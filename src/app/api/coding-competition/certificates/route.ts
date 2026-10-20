import { requireCandidate } from "@/lib/competition/server/context";
import { handle, json } from "@/lib/competition/server/http";
import { prisma } from "@/lib/prisma";

export const GET = handle(async () => {
  const { registration, competition } = await requireCandidate();
  const certs = await prisma.ccCertificate.findMany({ where: { registrationId: registration.id, revokedAt: null }, orderBy: { issuedAt: "asc" } });
  return json({
    published: !!competition.resultsPublishedAt,
    certificates: certs.map((c) => ({ code: c.code, kind: c.kind, rank: c.rank, candidateName: c.candidateName, issuedAt: c.issuedAt.toISOString() })),
  });
});
