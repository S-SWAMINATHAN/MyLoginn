import { NextResponse } from "next/server";
import { otpRequestSchema } from "@/lib/validation";
import { requestVerificationCode } from "@/lib/verification";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = otpRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { identifier, purpose, channel } = parsed.data;

  if (purpose === "login") {
    const where = channel === "phone" ? { phone: identifier } : { email: identifier };
    const user = await prisma.user.findFirst({ where });
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
