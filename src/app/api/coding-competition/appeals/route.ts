import { requireCandidate } from "@/lib/competition/server/context";
import { assertSameOrigin, handle, json, readJson } from "@/lib/competition/server/http";
import { limit } from "@/lib/competition/server/rateLimit";
import { createAppeal } from "@/lib/competition/server/review";

export const POST = handle(async (request: Request) => {
  assertSameOrigin(request);
  const { registration } = await requireCandidate();
  await limit(`cc:appeal:${registration.id}`, 5, 3600);
  const body = await readJson<{ topic?: unknown; message?: unknown }>(request, 6_000);
  const a = await createAppeal(registration.id, body.topic, body.message);
  return json({ id: a.id, status: a.status }, 201);
});
