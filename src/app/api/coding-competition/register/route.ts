import { getCurrentUser, setSessionCookie } from "@/lib/auth";
import { currentCompetitionOr404 } from "@/lib/competition/server/context";
import { ApiError, assertSameOrigin, clientIp, handle, json, readJson } from "@/lib/competition/server/http";
import { limit } from "@/lib/competition/server/rateLimit";
import { registerExistingSchema, registerExistingUser, registerNewCandidate, registerSchema } from "@/lib/competition/server/registration";

/**
 * Self-registration, no OTP or email verification. A new visitor gets a student account and is signed in; a
 * signed-in student registers with their existing account.
 */
export const POST = handle(async (request: Request) => {
  assertSameOrigin(request);
  await limit(`cc:register:${clientIp(request)}`, 10, 600, "Too many registration attempts from this network. Try again in a few minutes.");
  const c = await currentCompetitionOr404();
  const body = await readJson(request, 8_000);
  const user = await getCurrentUser();
  if (user) {
    const parsed = registerExistingSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid input");
    const { registration } = (await registerExistingUser(c, user, parsed.data))!;
    return json({ candidateId: registration.candidateId, existingAccount: true }, 201);
  }
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new ApiError(400, issue?.message ?? "Invalid input", `FIELD:${String(issue?.path?.[0] ?? "")}`);
  }
  const { user: created, registration } = (await registerNewCandidate(c, parsed.data))!;
  await setSessionCookie({ userId: created.id, role: created.role });
  return json({ candidateId: registration.candidateId, existingAccount: false }, 201);
});
