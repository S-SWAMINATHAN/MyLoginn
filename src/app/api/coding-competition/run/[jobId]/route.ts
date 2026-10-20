import { requireAttempt } from "@/lib/competition/server/context";
import { handle, json } from "@/lib/competition/server/http";
import { runResult } from "@/lib/competition/server/judge";

export const GET = handle(async (_request: Request, { params }: { params: Promise<{ jobId: string }> }) => {
  const { jobId } = await params;
  const { attempt } = await requireAttempt();
  return json(await runResult(attempt, jobId));
});
