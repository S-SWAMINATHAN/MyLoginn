import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "MyLoginn <onboarding@resend.dev>";

const purposeCopy: Record<string, { subject: string; intro: string }> = {
  signup: { subject: "Verify your MyLoginn email", intro: "Use this code to finish creating your account." },
  login: { subject: "Your MyLoginn sign-in code", intro: "Use this code to sign in." },
  reset: { subject: "Reset your MyLoginn password", intro: "Use this code to reset your password." },
};

/** Returns true if the code was actually emailed via Resend, false if it only hit the dev-mode console fallback. */
export async function sendOtpEmail(to: string, code: string, purpose: string): Promise<boolean> {
  const copy = purposeCopy[purpose] ?? purposeCopy.signup;
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // Local/dev fallback: no email provider configured yet. Log server-side.
    console.log(`[dev-otp] ${purpose} code for ${to}: ${code}`);
    return false;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: copy.subject,
    html: `
      <div style="font-family:sans-serif;max-width:420px;margin:0 auto;padding:32px 24px;">
        <h2 style="color:#0b0d17;margin:0 0 8px;">MyLoginn</h2>
        <p style="color:#5b5f75;font-size:14px;margin:0 0 24px;">${copy.intro}</p>
        <div style="background:#f2f1ff;border-radius:12px;padding:20px;text-align:center;">
          <span style="font-size:28px;font-weight:700;letter-spacing:8px;color:#6c4dff;">${code}</span>
        </div>
        <p style="color:#9296b3;font-size:12px;margin:24px 0 0;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message ?? "Failed to send verification email");
  }
  return true;
}
