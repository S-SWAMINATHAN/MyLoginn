import { requireAttempt } from "@/lib/competition/server/context";
import { assertSameOrigin, handle, json, readJson } from "@/lib/competition/server/http";
import { enqueueRun } from "@/lib/competition/server/judge";

/** Queues a practice run (samples or custom input). Runs never award marks. */
export const POST = handle(async (request: Request) => {
  assertSameOrigin(request);
  const { competition, attempt } = await requireAttempt();
  const body = await readJson(request, 100_000);
  return json(await enqueueRun(competition, attempt, body), 202);
});
