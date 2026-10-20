import { requireUser } from "@/lib/competition/server/context";
import { ApiError, assertSameOrigin, handle, json, readJson, str } from "@/lib/competition/server/http";
import { respondToOffer } from "@/lib/competition/server/rewards";

export const POST = handle(async (request: Request) => {
  assertSameOrigin(request);
  const user = await requireUser();
  const body = await readJson<{ offerId?: unknown; accept?: unknown }>(request, 1_000);
  if (typeof body.accept !== "boolean") throw new ApiError(400, "Choose accept or decline.");
  await respondToOffer(str(body.offerId, 40), user.id, body.accept);
  return json({ ok: true });
});
