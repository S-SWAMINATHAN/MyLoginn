import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const categorySchema = z.object({ name: z.string().trim().min(2).max(80), sortOrder: z.coerce.number().int().min(0).max(10000).default(0), active: z.boolean().default(true) });
const optionalLink = z.union([z.string().url().max(500).refine((value) => /^https?:\/\//i.test(value), "Use an HTTPS or HTTP link"), z.literal("")]).optional();
const memberSchema = z.object({ firstName: z.string().trim().min(1).max(80), lastName: z.string().trim().max(80).default(""), designation: z.string().trim().min(2).max(100), biography: z.string().trim().max(1000).default(""), imageUrl: z.string().max(500).nullable().optional(), profileUrl: optionalLink, facebookUrl: optionalLink, xUrl: optionalLink, youtubeUrl: optionalLink, instagramUrl: optionalLink, categoryId: z.string().min(1), sortOrder: z.coerce.number().int().min(0).max(10000).default(0), active: z.boolean().default(true) });
const reviewSchema = z.object({ name: z.string().trim().min(2).max(100), email: z.string().email().max(254), company: z.string().trim().max(120).nullable().optional(), content: z.string().trim().min(10).max(2000), rating: z.coerce.number().int().min(1).max(5), status: z.enum(["PENDING", "APPROVED", "REJECTED"]).default("PENDING"), published: z.boolean().default(false), featured: z.boolean().default(false), sortOrder: z.coerce.number().int().min(0).max(10000).default(0), submittedAt: z.coerce.date().optional() });
const profileSchema = z.object({ introduction: z.string().max(4000), mission: z.string().max(2000), vision: z.string().max(2000), approach: z.string().max(3000), expertise: z.string().max(3000) });

function companyWriteError(error: unknown, fallback: string) {
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  const detail = process.env.NODE_ENV === "development" && error instanceof Error ? ` (${error.message})` : "";
  if (code === "P2002") return { status: 409, error: `A record with these details already exists.${detail}` };
  if (code === "P2003") return { status: 400, error: `The selected team category is no longer available. Refresh the page and choose a category again.${detail}` };
  return { status: 400, error: `${fallback}${detail}` };
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    // Keep the admin load within the small PostgreSQL connection allowance used by this app.
    const categories = await prisma.teamCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
    const members = await prisma.teamMember.findMany({ include: { category: true }, orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }] });
    const reviews = await prisma.customerReview.findMany({ orderBy: [{ submittedAt: "desc" }] });
    const profile = await prisma.companyProfile.findUnique({ where: { id: "main" } });
    return NextResponse.json({ categories, members, reviews, profile });
  } catch (error) {
    console.error("[admin company] load", error);
    const detail = process.env.NODE_ENV === "development" && error instanceof Error ? ` ${error.message}` : "";
    return NextResponse.json({ error: `Unable to load company data.${detail}` }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json().catch(() => null);
  const kind = body?.kind;
  const parsed = kind === "category" ? categorySchema.safeParse(body?.data) : kind === "member" ? memberSchema.safeParse(body?.data) : kind === "review" ? reviewSchema.safeParse(body?.data) : kind === "profile" ? profileSchema.safeParse(body?.data) : null;
  if (!parsed) return NextResponse.json({ error: "Unknown record type" }, { status: 400 });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  try {
    if (kind === "member") {
      const candidate = parsed.data as z.infer<typeof memberSchema>;
      const categoryExists = await prisma.teamCategory.findUnique({ where: { id: candidate.categoryId }, select: { id: true } });
      if (!categoryExists) return NextResponse.json({ error: "Choose an existing team category, then try again." }, { status: 400 });
      const existing = await prisma.teamMember.findMany({ select: { firstName: true, lastName: true, designation: true } });
      const normalize = (value: string) => value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
      if (existing.some((item) => normalize(item.firstName) === normalize(candidate.firstName) && normalize(item.lastName) === normalize(candidate.lastName) && normalize(item.designation) === normalize(candidate.designation))) {
        return NextResponse.json({ error: "A team member with this name and designation already exists." }, { status: 409 });
      }
    }
    const row = kind === "category" ? await prisma.teamCategory.create({ data: parsed.data as z.infer<typeof categorySchema> })
      : kind === "member" ? await prisma.teamMember.create({ data: parsed.data as z.infer<typeof memberSchema> })
      : kind === "review" ? await prisma.customerReview.create({ data: parsed.data as z.infer<typeof reviewSchema> })
      : await prisma.companyProfile.upsert({ where: { id: "main" }, create: { id: "main", ...(parsed.data as z.infer<typeof profileSchema>) }, update: parsed.data as z.infer<typeof profileSchema> });
    return NextResponse.json({ row }, { status: 201 });
  } catch (error) { console.error("[admin company] create", error); const failure = companyWriteError(error, "Could not save this item."); return NextResponse.json({ error: failure.error }, { status: failure.status }); }
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json().catch(() => null);
  const { kind, id } = body ?? {};
  if (kind === "profile") {
    const parsed = profileSchema.safeParse(body?.data);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    return NextResponse.json({ row: await prisma.companyProfile.upsert({ where: { id: "main" }, create: { id: "main", ...parsed.data }, update: parsed.data }) });
  }
  const schema = kind === "category" ? categorySchema : kind === "member" ? memberSchema : kind === "review" ? reviewSchema : null;
  if (!schema || typeof id !== "string") return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const parsed = schema.safeParse(body?.data);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  try {
    if (kind === "member") {
      const candidate = parsed.data as z.infer<typeof memberSchema>;
      const normalize = (value: string) => value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
      const identity = (item: { firstName: string; lastName: string; designation: string }) => [item.firstName, item.lastName, item.designation].map(normalize).join("|");
      const categoryExists = await prisma.teamCategory.findUnique({ where: { id: candidate.categoryId }, select: { id: true } });
      if (!categoryExists) return NextResponse.json({ error: "Choose an existing team category, then try again." }, { status: 400 });
      const current = await prisma.teamMember.findUnique({ where: { id }, select: { firstName: true, lastName: true, designation: true } });
      const existing = await prisma.teamMember.findMany({ where: { id: { not: id } }, select: { firstName: true, lastName: true, designation: true } });
      if (current && identity(current) !== identity(candidate) && existing.some((item) => identity(item) === identity(candidate))) {
        return NextResponse.json({ error: "A team member with this name and designation already exists." }, { status: 409 });
      }
    }
    const row = kind === "category" ? await prisma.teamCategory.update({ where: { id }, data: parsed.data as z.infer<typeof categorySchema> })
      : kind === "member" ? await prisma.teamMember.update({ where: { id }, data: parsed.data as z.infer<typeof memberSchema> })
      : await prisma.customerReview.update({ where: { id }, data: parsed.data as z.infer<typeof reviewSchema> });
    return NextResponse.json({ row });
  } catch (error) { console.error("[admin company] update", error); const failure = companyWriteError(error, "Could not update this item."); return NextResponse.json({ error: failure.error }, { status: failure.status }); }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind"); const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    if (kind === "category") await prisma.teamCategory.delete({ where: { id } });
    else if (kind === "member") await prisma.teamMember.delete({ where: { id } });
    else if (kind === "review") await prisma.customerReview.delete({ where: { id } });
    else return NextResponse.json({ error: "Unknown record type" }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Could not delete this item. A category may still contain members." }, { status: 400 }); }
}
