import { handle, json } from "@/lib/competition/server/http";
import { assertJudgeToken } from "@/lib/competition/server/judge";
import { tick } from "@/lib/competition/server/lifecycle";

/**
 * Periodic lifecycle work: expiry sweep, state advancement, stale-job recovery. Called by the judge workers every
 * ~15 s (bearer COMPETITION_JUDGE_TOKEN) or by a cron (bearer CRON_SECRET).
 */
export const maxDuration = 300;

const run = handle(async (request: Request) => {
  assertJudgeToken(request);
  return json(await tick());
});
export const POST = run;
export const GET = run;
