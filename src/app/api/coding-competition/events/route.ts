import { requireAttempt } from "@/lib/competition/server/context";
import { assertSameOrigin, handle, json, readJson } from "@/lib/competition/server/http";
import { recordEvents } from "@/lib/competition/server/integrity";

/** Monitoring events from the arena (also sent with navigator.sendBeacon on unload). */
export const POST = handle(async (request: Request) => {
  assertSameOrigin(request);
  const { competition, attempt } = await requireAttempt();
  const body = await readJson<{ events?: unknown }>(request, 12_000);
  return json(await recordEvents(competition, attempt, body.events));
});
