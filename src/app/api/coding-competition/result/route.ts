import { requireCandidate } from "@/lib/competition/server/context";
import { handle, json } from "@/lib/competition/server/http";
import { myResult } from "@/lib/competition/server/results";

/** The caller's own result only. There is no parameter to ask for anyone else's. */
export const GET = handle(async () => {
  const { competition, registration } = await requireCandidate();
  return json(await myResult(competition, registration));
});
