import { questionInputSchema, setQuestionActive, updateQuestion } from "@/lib/competition/server/bank";
import { requireAdminUser } from "@/lib/competition/server/context";
import { ApiError, assertSameOrigin, handle, json, readJson } from "@/lib/competition/server/http";
import { enqueueVerify, verifyResult } from "@/lib/competition/server/judge";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ qid: string }> };

/** Full question including tests and reference solution (admin only). `?verify=<jobId>` polls a verification run. */
export const GET = handle(async (request: Request, { params }: Ctx) => {
  await requireAdminUser();
  const { qid } = await params;
  const job = new URL(request.url).searchParams.get("verify");
  if (job) return json(await verifyResult(job));
  const q = await prisma.ccQuestion.findUnique({ where: { id: qid }, include: { tests: { orderBy: { position: "asc" } }, _count: { select: { assignments: true } } } });
  if (!q) throw new ApiError(404, "Question not found.");
  return json({ question: q });
});

/** Edit. A locked question becomes a new version; the response says which id to use from now on. */
export const PUT = handle(async (request: Request, { params }: Ctx) => {
  assertSameOrigin(request);
  const admin = await requireAdminUser();
  const { qid } = await params;
  const parsed = questionInputSchema.safeParse(await readJson(request, 4_000_000));
  if (!parsed.success) throw new ApiError(400, `${parsed.error.issues[0]?.path.join(".")}: ${parsed.error.issues[0]?.message}`);
  const q = await updateQuestion(qid, parsed.data, admin.id);
  return json({ id: q.id, versioned: q.id !== qid, version: q.version });
});

/** { active } toggles availability; { verify: true } runs the reference solution on the judge. */
export const POST = handle(async (request: Request, { params }: Ctx) => {
  assertSameOrigin(request);
  const admin = await requireAdminUser();
  const { qid } = await params;
  const body = await readJson<{ active?: unknown; verify?: unknown }>(request, 500);
  if (body.verify === true) return json(await enqueueVerify(qid), 202);
  if (typeof body.active !== "boolean") throw new ApiError(400, "Nothing to change.");
  await setQuestionActive(qid, body.active, admin.id);
  return json({ ok: true });
});
