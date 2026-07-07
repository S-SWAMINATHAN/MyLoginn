import twilio from "twilio";
import { createOtp, verifyOtp } from "./otp";
import type { RequestOtpResult } from "./verification";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

function isTwilioConfigured() {
  return Boolean(accountSid && authToken && verifyServiceSid);
}

function getVerifyService() {
  const client = twilio(accountSid, authToken);
  return client.verify.v2.services(verifyServiceSid!);
}

export async function sendOtpSms(phone: string, purpose: string): Promise<RequestOtpResult> {
  if (!isTwilioConfigured()) {
    // Local/dev fallback: no Twilio account configured yet. Log server-side,
    // and also hand the code back so the UI can surface it directly — this
    // only ever happens when no real provider is configured, so it can't leak
    // a real production code.
    const result = await createOtp(phone, purpose);
    if (result.throttled) return result;
    console.log(`[dev-otp] ${purpose} SMS code for ${phone}: ${result.code}`);
    return { throttled: false, devCode: result.code };
  }

  try {
    await getVerifyService().verifications.create({ to: phone, channel: "sms" });
    return { throttled: false };
  } catch (error) {
    const code = (error as { code?: number }).code;
    if (code === 60203) {
      return { throttled: true, retryAfterSeconds: 30 };
    }
    throw error;
  }
}

export async function checkOtpSms(phone: string, purpose: string, code: string) {
  if (!isTwilioConfigured()) {
    return verifyOtp(phone, purpose, code);
  }

  try {
    const check = await getVerifyService().verificationChecks.create({ to: phone, code });
    if (check.status === "approved") {
      return { ok: true as const };
    }
    return { ok: false as const, reason: "Incorrect code." };
  } catch {
    return { ok: false as const, reason: "Incorrect or expired code. Request a new one." };
  }
}
