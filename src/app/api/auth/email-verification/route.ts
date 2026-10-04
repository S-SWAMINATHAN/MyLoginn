import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requestVerificationCode, checkVerificationCode } from "@/lib/verification";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to verify your email." }, { status: 401 });
  if (user.emailVerified) return NextResponse.json({ error: "Your email is already verified." }, { status: 409 });

  const body = await request.json().catch(() => null) as { action?: unknown; code?: unknown } | null;
  if (body?.action === "request") {
    try {
      const result = await requestVerificationCode(user.email, "signup", "email");
      if (result.throttled) {
        return NextResponse.json({ error: `Please wait ${result.retryAfterSeconds}s before requesting another code.`, retryAfterSeconds: result.retryAfterSeconds }, { status: 429 });
      }
      if (result.devCode && process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Email delivery isn't configured. Please contact support to verify your account." }, { status: 503 });
      }
      return NextResponse.json({ ok: true, devCode: result.devCode });
    } catch {
      return NextResponse.json({ error: "Couldn't send a verification email. Please try again." }, { status: 502 });
    }
  }

  if (body?.action === "verify" && typeof body.code === "string" && /^\d{6}$/.test(body.code)) {
    const result = await checkVerificationCode(user.email, "signup", "email", body.code);
    if (!result.ok) return NextResponse.json({ error: result.reason }, { status: 400 });
    await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Choose whether to request or verify your email code." }, { status: 400 });
}
