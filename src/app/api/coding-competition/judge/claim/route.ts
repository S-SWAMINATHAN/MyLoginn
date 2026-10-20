import { handle, json, readJson, str } from "@/lib/competition/server/http";
import { assertJudgeToken, claimJobs } from "@/lib/competition/server/judge";

/** Judge workers pull work here (bearer COMPETITION_JUDGE_TOKEN). */
export const POST = handle(async (request: Request) => {
  assertJudgeToken(request);
  const body = await readJson<{ workerId?: unknown; version?: unknown; languages?: unknown; max?: unknown }>(request, 4_000);
  const workerId = str(body.workerId, 64).replace(/[^A-Za-z0-9._-]/g, "") || "worker";
  const jobs = await claimJobs(workerId, str(body.version, 32), Array.isArray(body.languages) ? body.languages.map(String) : [], Number(body.max) || 4);
  return json({ jobs });
});
