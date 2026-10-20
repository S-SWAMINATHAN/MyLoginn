import { getCurrentUser } from "@/lib/auth";
import { getCurrentCompetition, publicView } from "@/lib/competition/server/competitions";
import { handle, json } from "@/lib/competition/server/http";
import { getRegistration } from "@/lib/competition/server/registration";
import { prisma } from "@/lib/prisma";

/** Public competition details, plus the visitor's own registration state when signed in. */
export const GET = handle(async () => {
  const c = await getCurrentCompetition();
  if (!c) return json({ competition: null });
  const user = await getCurrentUser();
  const reg = user ? await getRegistration(c.id, user.id) : null;
  const attempt = reg ? await prisma.ccAttempt.findUnique({ where: { registrationId: reg.id }, select: { status: true, deadlineAt: true } }) : null;
  return json({
    competition: publicView(c),
    me: user
      ? { signedIn: true, registered: !!reg, candidateId: reg?.candidateId ?? null, attempt: attempt && { status: attempt.status, deadlineAt: attempt.deadlineAt.toISOString() } }
      : { signedIn: false },
    serverNow: new Date().toISOString(),
  });
});
