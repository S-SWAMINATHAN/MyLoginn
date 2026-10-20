import { requireAdminUser } from "@/lib/competition/server/context";
import { ApiError, assertSameOrigin, handle, json, readJson } from "@/lib/competition/server/http";
import { competitionSchema, createCompetition } from "@/lib/competition/server/lifecycle";
import { prisma } from "@/lib/prisma";

export const GET = handle(async () => {
  await requireAdminUser();
  const rows = await prisma.competition.findMany({
    orderBy: { startsAt: "desc" },
    select: { id: true, slug: true, title: true, status: true, startsAt: true, registrationCount: true, maxParticipants: true, timezone: true },
  });
  return json({ competitions: rows });
});

export const POST = handle(async (request: Request) => {
  assertSameOrigin(request);
  const admin = await requireAdminUser();
  const parsed = competitionSchema.safeParse(await readJson(request, 60_000));
  if (!parsed.success) throw new ApiError(400, `${parsed.error.issues[0]?.path.join(".")}: ${parsed.error.issues[0]?.message}`);
  const c = await createCompetition(parsed.data, admin.id);
  return json({ id: c.id }, 201);
});
