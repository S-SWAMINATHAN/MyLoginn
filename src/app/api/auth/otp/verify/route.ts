import { NextResponse } from "next/server";
import { otpVerifySchema } from "@/lib/validation";
import { checkVerificationCode } from "@/lib/verification";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";
import { recordDailyActivity } from "@/lib/streak";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = otpVerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { identifier, purpose, channel, code } = parsed.data;
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

  if (purpose === "login") {
    const user = await prisma.user.findFirst({ where });
    if (!user) {
      return NextResponse.json({ error: "No account found for that contact." }, { status: 404 });
    }
    await setSessionCookie({ userId: user.id, role: user.role });
    await recordDailyActivity(user.id);
    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  }

  return NextResponse.json({ ok: true });
}
