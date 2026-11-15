import { NextResponse } from "next/server";
import { otpVerifySchema } from "@/lib/validation";
import { checkVerificationCode } from "@/lib/verification";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = otpVerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { identifier, purpose, channel, code } = parsed.data;
  if (purpose === "login") {
    return NextResponse.json({ error: "Sign in with your password." }, { status: 400 });
  }
  const result = await checkVerificationCode(identifier, purpose, channel, code);
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 400 });
  }

  const where = channel === "phone" ? { phone: identifier } : { email: identifier };

  if (purpose === "signup") {
    await prisma.user.updateMany({
      where,
      data: channel === "phone" ? { phoneVerified: true } : { emailVerified: true },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
