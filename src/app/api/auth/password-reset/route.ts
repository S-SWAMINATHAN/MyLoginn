import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { passwordSchema } from "@/lib/validation";
import { checkVerificationCode } from "@/lib/verification";

const resetSchema = z.object({
  identifier: z.string().trim().min(3),
  channel: z.enum(["email", "phone"]),
  code: z.string().length(6),
  password: passwordSchema,
});

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const parsed = resetSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });

  const { identifier, channel, code, password } = parsed.data;
  const verified = await checkVerificationCode(identifier, "reset", channel, code);
  if (!verified.ok) return NextResponse.json({ error: verified.reason }, { status: 400 });

  const where = channel === "email" ? { email: identifier.toLowerCase() } : { phone: identifier };
  const user = await prisma.user.findFirst({ where, select: { id: true } });
  if (!user) return NextResponse.json({ error: "We could not reset this account. Request a new code and try again." }, { status: 400 });

  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(password) } });
  return NextResponse.json({ ok: true });
}
