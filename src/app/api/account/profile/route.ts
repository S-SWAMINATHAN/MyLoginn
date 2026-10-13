import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { personNameSchema } from "@/lib/validation";

export const runtime = "nodejs";

const profileSchema = z
  .object({
    name: personNameSchema,
    country: z.union([z.literal(""), z.string().trim().regex(/^[A-Za-z]{2}$/, "Choose a country from the list")]),
    grade: z.string().trim().max(40, "Grade is too long"),
    board: z.string().trim().max(60, "Board is too long"),
  })
  .partial();

/** Updates the signed-in user's own name, country, grade and board. Email and phone have their own OTP flow. */
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = profileSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { name, country, grade, board } = parsed.data;
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(country !== undefined ? { country: country ? country.toUpperCase() : null } : {}),
      ...(grade !== undefined ? { grade: grade || null } : {}),
      ...(board !== undefined ? { board: board || null } : {}),
    },
    select: { name: true, country: true, grade: true, board: true },
  });

  return NextResponse.json({ user: updated });
}
