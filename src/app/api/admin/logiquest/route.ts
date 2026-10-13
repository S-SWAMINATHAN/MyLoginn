import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { err, readBody } from "@/lib/logiquest/api";

const STATUSES = ["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"] as const;
const ACCESS = ["FREE", "PREMIUM"] as const;
type Body = { kind?: string; id?: string; status?: string; access?: string; action?: string };

/** Admin-only content controls: change status/access, or duplicate a challenge as a draft. */
export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return err("Not allowed.", 403);
  const body = await readBody<Body>(request, 2000);
  if (!body || typeof body.id !== "string" || (body.kind !== "challenge" && body.kind !== "question")) return err("Invalid request.", 400);

  if (body.action === "duplicate") {
    if (body.kind !== "challenge") return err("Only challenges can be duplicated.", 400);
    const src = await prisma.lqChallenge.findUnique({ where: { id: body.id }, include: { testCases: true } });
    if (!src) return err("Not found.", 404);
    const { id: _id, createdAt: _c, updatedAt: _u, publishedAt: _p, testCases, attemptCount: _a, solvedCount: _s, slug, ...rest } = src;
    void _id; void _c; void _u; void _p; void _a; void _s;
    const copy = await prisma.lqChallenge.create({
      data: {
        ...rest, slug: `${slug}-copy-${Date.now().toString(36)}`, title: `${src.title} (copy)`, status: "DRAFT",
        examples: src.examples ?? [], starterCode: src.starterCode ?? {}, solution: src.solution ?? undefined,
        testCases: { create: testCases.map((t) => ({ position: t.position, input: t.input, expected: t.expected, isPublic: t.isPublic, isEdge: t.isEdge, label: t.label })) },
      },
    });
    return NextResponse.json({ id: copy.id });
  }

  const data: { status?: (typeof STATUSES)[number]; access?: (typeof ACCESS)[number]; publishedAt?: Date } = {};
  if (body.status) {
    if (!STATUSES.includes(body.status as never)) return err("Invalid status.", 400);
    data.status = body.status as (typeof STATUSES)[number];
    if (data.status === "PUBLISHED") data.publishedAt = new Date();
  }
  if (body.access) {
    if (!ACCESS.includes(body.access as never)) return err("Invalid access.", 400);
    data.access = body.access as (typeof ACCESS)[number];
  }
  if (!Object.keys(data).length) return err("Nothing to change.", 400);

  // Publishing a challenge requires test cases (public and hidden) and an official solution.
  if (body.kind === "challenge" && data.status === "PUBLISHED") {
    const c = await prisma.lqChallenge.findUnique({ where: { id: body.id }, select: { solution: true, hints: true, languages: true, testCases: { select: { isPublic: true } } } });
    if (!c) return err("Not found.", 404);
    const problems: string[] = [];
    if (c.testCases.filter((t) => t.isPublic).length < 3) problems.push("at least 3 public examples");
    if (!c.testCases.some((t) => !t.isPublic)) problems.push("hidden test cases");
    if (!c.solution) problems.push("an official solution");
    if (c.hints.length < 3) problems.push("3 hints");
    if (!c.languages.length) problems.push("a supported language");
    if (problems.length) return err(`Cannot publish: this challenge still needs ${problems.join(", ")}.`, 422);
  }

  if (body.kind === "challenge") await prisma.lqChallenge.update({ where: { id: body.id }, data });
  else await prisma.lqQuestion.update({ where: { id: body.id }, data: { ...(data.status ? { status: data.status } : {}), ...(data.access ? { access: data.access } : {}) } });
  return NextResponse.json({ ok: true });
}
