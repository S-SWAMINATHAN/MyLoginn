import { NextResponse } from "next/server";
import { otpRequestSchema } from "@/lib/validation";
import { requestVerificationCode } from "@/lib/verification";
import { prisma } from "@/lib/prisma";
import { createHash, randomBytes } from "node:crypto";
import { sendPasswordResetLink } from "@/lib/email";

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const parsed = otpRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { identifier, purpose, channel } = parsed.data;

  // Password recovery uses a one-time email link.
  if (purpose === "reset") {
    if (channel !== "email") return NextResponse.json({ error: "Password reset is available by email." }, { status: 400 });
    const email = identifier.trim().toLowerCase();
    const user = await prisma.user.findFirst({ where: { email }, select: { id: true } });
    if (!user) return NextResponse.json({ ok: true });
    const recent = await prisma.otpCode.findFirst({ where: { identifier: email, purpose: "reset-link", createdAt: { gt: new Date(Date.now() - 30_000) } }, orderBy: { createdAt: "desc" } });
    if (recent) return NextResponse.json({ error: "Please wait before requesting another reset link.", retryAfterSeconds: Math.max(1, Math.ceil((30_000 - (Date.now() - recent.createdAt.getTime())) / 1000)) }, { status: 429 });

    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await prisma.otpCode.updateMany({ where: { identifier: email, purpose: "reset-link", consumed: false }, data: { consumed: true } });
    const record = await prisma.otpCode.create({ data: { identifier: email, code: tokenHash, purpose: "reset-link", userId: user.id, expiresAt: new Date(Date.now() + 15 * 60_000) } });
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
    const link = `${siteUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
    try {
      const sent = await sendPasswordResetLink(email, link);
      if (!sent && process.env.NODE_ENV === "production") throw new Error("No email provider configured.");
      if (!sent) console.info(`[dev-password-reset] ${link}`);
    } catch (error) {
      await prisma.otpCode.update({ where: { id: record.id }, data: { consumed: true } });
      console.error("Password reset email delivery failed:", error);
      return NextResponse.json({ error: "Couldn't send the reset email. Please try again." }, { status: 502 });
    }
    return NextResponse.json({ ok: true, ...(process.env.NODE_ENV !== "production" && !process.env.BREVO_API_KEY && !process.env.RESEND_API_KEY ? { devLink: link } : {}) });
  }

  if (purpose === "login" && channel !== "email") {
    return NextResponse.json({ error: "Sign-in codes are available by email." }, { status: 400 });
  }

  if (purpose === "login") {
    const user = await prisma.user.findFirst({ where: { email: identifier.trim().toLowerCase() } });
    if (!user) {
      return NextResponse.json({ error: "No account found for that contact." }, { status: 404 });
    }
  }

  try {
    const result = await requestVerificationCode(identifier, purpose, channel);
    if (result.throttled) {
      return NextResponse.json(
        {
          error: `Please wait ${result.retryAfterSeconds}s before requesting another code.`,
          retryAfterSeconds: result.retryAfterSeconds,
        },
        { status: 429 }
      );
    }
    return NextResponse.json({ ok: true, devCode: result.devCode });
  } catch {
    const message =
      channel === "phone"
        ? "Couldn't send verification SMS. Please try again."
        : "Couldn't send verification email. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
