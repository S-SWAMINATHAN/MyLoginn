import { prisma } from "./prisma";

const OTP_TTL_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 30;

export type CreateOtpResult =
  | { throttled: true; retryAfterSeconds: number }
  | { throttled: false; code: string; expiresAt: Date };

// Prototype-mode OTP: generates and stores a real code, "delivers" it via a
// simulated channel (returned to the caller) instead of a paid SMS/email API.
export async function createOtp(identifier: string, purpose: string): Promise<CreateOtpResult> {
  const lastSent = await prisma.otpCode.findFirst({
    where: { identifier, purpose },
    orderBy: { createdAt: "desc" },
  });
  if (lastSent) {
    const elapsedSeconds = (Date.now() - lastSent.createdAt.getTime()) / 1000;
    const retryAfterSeconds = Math.ceil(RESEND_COOLDOWN_SECONDS - elapsedSeconds);
    if (retryAfterSeconds > 0) {
      return { throttled: true, retryAfterSeconds };
    }
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await prisma.otpCode.updateMany({
    where: { identifier, purpose, consumed: false },
    data: { consumed: true },
  });

  await prisma.otpCode.create({
    data: { identifier, purpose, code, expiresAt },
  });

  return { throttled: false, code, expiresAt };
}

export async function verifyOtp(identifier: string, purpose: string, code: string) {
  const record = await prisma.otpCode.findFirst({
    where: { identifier, purpose, consumed: false },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return { ok: false, reason: "No verification code found. Request a new one." };
  if (record.expiresAt < new Date()) return { ok: false, reason: "Code expired. Request a new one." };
  if (record.code !== code) return { ok: false, reason: "Incorrect code." };

  await prisma.otpCode.update({ where: { id: record.id }, data: { consumed: true } });
  return { ok: true as const };
}
