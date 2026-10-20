import { currentCompetitionOr404 } from "@/lib/competition/server/context";
import { handle, json } from "@/lib/competition/server/http";
import { publicLeaderboard } from "@/lib/competition/server/results";

/** Top 50 of the published snapshot; before publication only the scheduled time. */
export const GET = handle(async () => json(await publicLeaderboard(await currentCompetitionOr404())));
