import { handle, json, readJson, str } from "@/lib/competition/server/http";
import { assertJudgeToken, completeJob, type WorkerResult } from "@/lib/competition/server/judge";

export const maxDuration = 60;

export const POST = handle(async (request: Request) => {
  assertJudgeToken(request);
  const body = await readJson<{ workerId?: unknown; jobId?: unknown; result?: WorkerResult }>(request, 15_000_000);
  return json(await completeJob(str(body.workerId, 64), str(body.jobId, 40), body.result ?? {}));
});
