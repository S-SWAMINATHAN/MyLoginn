import { createQuestion, questionInputSchema } from "@/lib/competition/server/bank";
import { requireAdminUser } from "@/lib/competition/server/context";
import { ApiError, assertSameOrigin, handle, json, readJson } from "@/lib/competition/server/http";
import { prisma } from "@/lib/prisma";

export const GET = handle(async (request: Request) => {
  await requireAdminUser();
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim().slice(0, 80);
  const rows = await prisma.ccQuestion.findMany({
    where: q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { family: { contains: q.toLowerCase() } }, { topic: { contains: q, mode: "insensitive" } }] } : {},
    orderBy: [{ family: "asc" }, { version: "desc" }],
    select: { id: true, family: true, version: true, title: true, difficulty: true, topic: true, expectedMinutes: true, active: true, lockedAt: true, languages: true, _count: { select: { tests: true, assignments: true } } },
  });
  return json({ questions: rows });
});

export const POST = handle(async (request: Request) => {
  assertSameOrigin(request);
  const admin = await requireAdminUser();
  const parsed = questionInputSchema.safeParse(await readJson(request, 4_000_000));
  if (!parsed.success) throw new ApiError(400, `${parsed.error.issues[0]?.path.join(".")}: ${parsed.error.issues[0]?.message}`);
  const q = await createQuestion(parsed.data, admin.id);
  return json({ id: q.id }, 201);
});
