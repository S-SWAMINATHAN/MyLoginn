import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { passwordSchema } from "@/lib/validation";
import { checkVerificationCode } from "@/lib/verification";
import { createHash } from "node:crypto";

const resetSchema = z.object({
  identifier: z.string().trim().min(3).optional(),
  channel: z.enum(["email", "phone"]).optional(),
  code: z.string().length(6).optional(),
  token: z.string().min(40).max(100).optional(),
  password: passwordSchema,
}).refine((data) => Boolean(data.token) || Boolean(data.identifier && data.channel && data.code), { message: "Use a valid reset link." });

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const parsed = resetSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });

  const { identifier, channel, code, token, password } = parsed.data;
  if (token) {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const record = await prisma.otpCode.findFirst({ where: { code: tokenHash, purpose: "reset-link", consumed: false, expiresAt: { gt: new Date() } }, select: { id: true, userId: true } });
    if (!record?.userId) return NextResponse.json({ error: "This reset link is invalid or has expired. Request a new one." }, { status: 400 });
    const passwordHash = await hashPassword(password);
    const claimed = await prisma.otpCode.updateMany({ where: { id: record.id, consumed: false, expiresAt: { gt: new Date() } }, data: { consumed: true } });
    if (!claimed.count) return NextResponse.json({ error: "This reset link is invalid or has expired. Request a new one." }, { status: 400 });
    await prisma.user.update({ where: { id: record.userId }, data: { passwordHash } });
    return NextResponse.json({ ok: true });
  }

  // Retain the previous code-based API for clients still using the old reset form.
  if (!identifier || !channel || !code) return NextResponse.json({ error: "Use a valid reset link." }, { status: 400 });
  const verified = await checkVerificationCode(identifier, "reset", channel, code);
  if (!verified.ok) return NextResponse.json({ error: verified.reason }, { status: 400 });

  const where = channel === "email" ? { email: identifier.toLowerCase() } : { phone: identifier };
  const user = await prisma.user.findFirst({ where, select: { id: true } });
  if (!user) return NextResponse.json({ error: "We could not reset this account. Request a new code and try again." }, { status: 400 });

  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(password) } });
  return NextResponse.json({ ok: true });
}
