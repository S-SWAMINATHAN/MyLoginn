import { arenaState, CUTOFF_GRACE_MS, finalizeAttempt } from "@/lib/competition/server/attempts";
import { requireAttempt } from "@/lib/competition/server/context";
import { handle, json } from "@/lib/competition/server/http";
import { prisma } from "@/lib/prisma";

/** Arena state: assigned questions (candidate-safe fields), drafts, deadline and server time. */
export const GET = handle(async () => {
  const { competition, attempt } = await requireAttempt();
  let a = attempt;
  if (a.status === "ACTIVE" && Date.now() > a.deadlineAt.getTime() + CUTOFF_GRACE_MS) {
    await finalizeAttempt(a.id, "TIME_EXPIRED");
    a = (await prisma.ccAttempt.findUnique({ where: { id: a.id } }))!;
  }
  return json(await arenaState(competition, a));
});
