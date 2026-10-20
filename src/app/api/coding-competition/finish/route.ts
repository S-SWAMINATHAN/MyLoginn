import { finalizeAttempt } from "@/lib/competition/server/attempts";
import { requireAttempt } from "@/lib/competition/server/context";
import { ApiError, assertSameOrigin, handle, json, readJson } from "@/lib/competition/server/http";

/** Final submission of the whole attempt. Idempotent: repeating it changes nothing. */
export const POST = handle(async (request: Request) => {
  assertSameOrigin(request);
  const { attempt } = await requireAttempt();
  const body = await readJson<{ confirm?: unknown }>(request, 500);
  if (body.confirm !== true) throw new ApiError(400, "Confirm the final submission.");
  const r = await finalizeAttempt(attempt.id, "SUBMITTED");
  return json({ finalized: true, alreadyFinalized: !r.finalized });
});
