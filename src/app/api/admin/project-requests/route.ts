import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const requests = await prisma.projectRequest.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ rows: requests, fetchedAt: new Date().toISOString() });
}
