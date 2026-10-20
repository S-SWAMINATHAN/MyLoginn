import "server-only";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { getCurrentCompetition, type CompetitionWithReward } from "./competitions";
import { attemptFor } from "./attempts";
import { ApiError } from "./http";
import { getRegistration } from "./registration";

export async function currentCompetitionOr404(): Promise<CompetitionWithReward> {
  const c = await getCurrentCompetition();
  if (!c) throw new ApiError(404, "There is no competition right now.");
  return c;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new ApiError(401, "Log in to continue.", "UNAUTHENTICATED");
  return user;
}

/** Signed-in, registered candidate of the current competition. */
export async function requireCandidate() {
  const [user, competition] = await Promise.all([requireUser(), currentCompetitionOr404()]);
  const registration = await getRegistration(competition.id, user.id);
  if (!registration) throw new ApiError(403, "You are not registered for this competition.", "NOT_REGISTERED");
  return { user, competition, registration };
}

/** Registered candidate with a started attempt. */
export async function requireAttempt() {
  const ctx = await requireCandidate();
  const attempt = await attemptFor(ctx.competition.id, ctx.user.id);
  return { ...ctx, attempt };
}

export async function requireAdminUser() {
  const admin = await requireAdmin();
  if (!admin) throw new ApiError(403, "Administrators only.");
  return admin;
}
