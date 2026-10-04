import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requestVerificationCode, checkVerificationCode } from "@/lib/verification";
import { emailSchema, phoneSchema } from "@/lib/validation";

type ContactField = "email" | "phone";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to update your account details." }, { status: 401 });

  const body = await request.json().catch(() => null) as { action?: unknown; field?: unknown; value?: unknown; code?: unknown } | null;
  if ((body?.field !== "email" && body?.field !== "phone") || typeof body.value !== "string") {
    return NextResponse.json({ error: "Provide an email address or phone number." }, { status: 400 });
  }
  const field: ContactField = body.field;
  const parsedValue = field === "email" ? emailSchema.safeParse(body.value) : phoneSchema.safeParse(body.value);
  if (!parsedValue.success) return NextResponse.json({ error: parsedValue.error.issues[0]?.message ?? "Enter a valid contact detail." }, { status: 400 });
  const value = parsedValue.data;
  const purpose = field === "email" ? "change-email" : "change-phone";
  const channel = field;

  if (body.action === "request") {
    if (field === "email") {
      const existing = await prisma.user.findUnique({ where: { email: value }, select: { id: true } });
      if (existing && existing.id !== user.id) return NextResponse.json({ error: "That email is already linked to another account." }, { status: 409 });
    } else {
      const existing = await prisma.user.findFirst({ where: { phone: value, id: { not: user.id } }, select: { id: true } });
      if (existing) return NextResponse.json({ error: "That phone number is already linked to another account." }, { status: 409 });
    }

    try {
      const result = await requestVerificationCode(value, purpose, channel);
      if (result.throttled) {
        return NextResponse.json({ error: `Please wait ${result.retryAfterSeconds}s before requesting another code.`, retryAfterSeconds: result.retryAfterSeconds }, { status: 429 });
      }
      if (result.devCode && process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: `The ${field} delivery provider isn't configured. Please contact support.` }, { status: 503 });
      }
      return NextResponse.json({ ok: true, devCode: result.devCode });
    } catch {
      return NextResponse.json({ error: `Couldn't send a verification code to that ${field}. Please try again.` }, { status: 502 });
    }
  }

  if (body.action === "verify" && typeof body.code === "string" && /^\d{6}$/.test(body.code)) {
    const result = await checkVerificationCode(value, purpose, channel, body.code);
    if (!result.ok) return NextResponse.json({ error: result.reason }, { status: 400 });

    try {
      if (field === "email") {
        const existing = await prisma.user.findUnique({ where: { email: value }, select: { id: true } });
        if (existing && existing.id !== user.id) return NextResponse.json({ error: "That email was linked to another account. Request a new code for another email." }, { status: 409 });
        await prisma.user.update({ where: { id: user.id }, data: { email: value, emailVerified: true } });
      } else {
        const existing = await prisma.user.findFirst({ where: { phone: value, id: { not: user.id } }, select: { id: true } });
        if (existing) return NextResponse.json({ error: "That phone number was linked to another account. Request a new code for another number." }, { status: 409 });
        await prisma.user.update({ where: { id: user.id }, data: { phone: value, phoneVerified: true } });
      }
    } catch {
      return NextResponse.json({ error: `Couldn't update your ${field}. Please try again.` }, { status: 500 });
    }
    return NextResponse.json({ ok: true, field, value });
  }

  return NextResponse.json({ error: "Choose whether to request or verify your code." }, { status: 400 });
}
