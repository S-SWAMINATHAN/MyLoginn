import { createOtp, verifyOtp } from "./otp";
import { sendOtpEmail } from "./email";
import { sendOtpSms, checkOtpSms } from "./sms";

export type Channel = "phone" | "email";

export type RequestOtpResult =
  | { throttled: true; retryAfterSeconds: number }
  // devCode is only ever set when no real provider (Twilio/Resend) is configured —
  // it lets local/dev testing read the code straight from the UI instead of the
  // server console, and can never appear once real credentials are in place.
  | { throttled: false; devCode?: string };

export async function requestVerificationCode(
  identifier: string,
  purpose: string,
  channel: Channel
): Promise<RequestOtpResult> {
  if (channel === "phone") {
    return sendOtpSms(identifier, purpose);
  }

  const result = await createOtp(identifier, purpose);
  if (result.throttled) return result;

  const sentByRealProvider = await sendOtpEmail(identifier, result.code, purpose);
  return { throttled: false, devCode: sentByRealProvider ? undefined : result.code };
}

export async function checkVerificationCode(identifier: string, purpose: string, channel: Channel, code: string) {
  if (channel === "phone") {
    return checkOtpSms(identifier, purpose, code);
  }
  return verifyOtp(identifier, purpose, code);
}
