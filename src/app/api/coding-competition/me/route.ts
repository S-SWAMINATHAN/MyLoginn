import { requireCandidate } from "@/lib/competition/server/context";
import { handle, json } from "@/lib/competition/server/http";
import { maskEmail, maskPhone } from "@/lib/competition/server/registration";
import { prisma } from "@/lib/prisma";

export const GET = handle(async () => {
  const { competition, registration } = await requireCandidate();
  const [attempt, appeals] = await Promise.all([
    prisma.ccAttempt.findUnique({ where: { registrationId: registration.id }, select: { status: true, startedAt: true, deadlineAt: true, finalizedAt: true, finalReason: true } }),
    prisma.ccAppeal.findMany({ where: { registrationId: registration.id }, orderBy: { createdAt: "desc" }, select: { id: true, topic: true, status: true, message: true, response: true, createdAt: true } }),
  ]);
  return json({
    candidateId: registration.candidateId,
    name: registration.displayName,
    email: maskEmail(registration.emailNormalized),
    phone: maskPhone(registration.phoneNormalized),
    registeredAt: registration.createdAt.toISOString(),
    competitionId: competition.id,
    attempt,
    appeals,
  });
});
