import { startOrResume } from "@/lib/competition/server/attempts";
import { requireCandidate } from "@/lib/competition/server/context";
import { assertSameOrigin, handle, ipHash, json, readJson } from "@/lib/competition/server/http";
import { advance } from "@/lib/competition/server/lifecycle";

/** Starts or resumes the candidate's attempt. The deadline is set here, on the server, once. */
export const POST = handle(async (request: Request) => {
  assertSameOrigin(request);
  const { competition, registration } = await requireCandidate();
  const body = await readJson<{ consent?: unknown; screenSurface?: unknown }>(request, 2_000);
  const c = (await advance(competition.id)) ?? competition;
  const { attempt, resumed } = await startOrResume(c, registration.id, {
    consent: body.consent === true,
    screenSurface: typeof body.screenSurface === "string" ? body.screenSurface : undefined,
    userAgent: request.headers.get("user-agent") ?? undefined,
    ipHash: ipHash(request),
  });
  return json({ status: attempt.status, deadlineAt: attempt.deadlineAt.toISOString(), resumed, serverNow: new Date().toISOString() });
});
