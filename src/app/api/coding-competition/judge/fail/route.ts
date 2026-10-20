import { handle, json, readJson, str } from "@/lib/competition/server/http";
import { assertJudgeToken, failJob } from "@/lib/competition/server/judge";

export const POST = handle(async (request: Request) => {
  assertJudgeToken(request);
  const body = await readJson<{ workerId?: unknown; jobId?: unknown; error?: unknown }>(request, 8_000);
  return json(await failJob(str(body.workerId, 64), str(body.jobId, 40), str(body.error, 1000) || "Worker error"));
});
