import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  status: z.enum(["in_progress", "completed"]).optional(),
  progress: z.coerce.number().int().min(0).max(100).optional(),
  feedback: z.string().trim().max(1000).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const project = await prisma.project.update({
    where: { id },
    data: { ...parsed.data, mentorId: admin.id },
  });

  return NextResponse.json({ project });
}
