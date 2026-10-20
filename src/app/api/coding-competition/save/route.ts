import { saveDraft } from "@/lib/competition/server/attempts";
import { requireAttempt } from "@/lib/competition/server/context";
import { assertSameOrigin, handle, json, readJson, str } from "@/lib/competition/server/http";

export const POST = handle(async (request: Request) => {
  assertSameOrigin(request);
  const { competition, attempt } = await requireAttempt();
  const body = await readJson<{ questionId?: unknown; language?: unknown; source?: unknown }>(request, 80_000);
  return json(await saveDraft(competition, attempt, str(body.questionId, 40), body.language, body.source));
});
