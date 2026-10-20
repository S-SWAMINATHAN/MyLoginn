import { getCurrentUser } from "@/lib/auth";
import { competitionCertificatePdf } from "@/lib/competition/server/certificatePdf";
import { ApiError, handle } from "@/lib/competition/server/http";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site";
import type { CertificateKind } from "@/lib/competition/types";

/** PDF download for the certificate holder (or an admin). Anyone can verify a code on the public page instead. */
export const GET = handle(async (_request: Request, { params }: { params: Promise<{ code: string }> }) => {
  const { code } = await params;
  const user = await getCurrentUser();
  if (!user) throw new ApiError(401, "Log in to download your certificate.");
  const cert = await prisma.ccCertificate.findUnique({ where: { code }, include: { registration: true, competition: true } });
  if (!cert || cert.revokedAt || (cert.registration.userId !== user.id && user.role !== "ADMIN")) throw new ApiError(404, "Certificate not found.");
  const pdf = await competitionCertificatePdf({
    kind: cert.kind as CertificateKind,
    candidateName: cert.candidateName,
    candidateId: cert.registration.candidateId,
    competitionTitle: cert.competition.title,
    competitionDate: cert.competition.startsAt,
    timezone: cert.competition.timezone,
    issuedAt: cert.issuedAt,
    code: cert.code,
    rank: cert.rank,
    verifyUrl: `${siteUrl}/coding-competition/verify/${cert.code}`,
  });
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="MyLoginn-${cert.kind.toLowerCase()}-${cert.code}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
});
