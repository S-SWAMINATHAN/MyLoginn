import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initializeClientPortfolio } from "@/lib/clientProjectsData";
import { projectShape } from "./schema";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    await initializeClientPortfolio();
    const projects = await prisma.clientPortfolioProject.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("[admin client projects] load", error);
    return NextResponse.json({ error: "Unable to load client projects. Apply the latest Prisma schema, then refresh." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json().catch(() => null);
  const parsed = projectShape.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid project details" }, { status: 400 });
  try {
    const project = await prisma.clientPortfolioProject.create({ data: { ...parsed.data, sortOrder: parsed.data.sortOrder } });
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
    return NextResponse.json({ error: code === "P2002" ? "That project slug is already in use." : "Could not create this project." }, { status: code === "P2002" ? 409 : 400 });
  }
}
