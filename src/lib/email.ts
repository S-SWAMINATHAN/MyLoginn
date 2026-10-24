import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "MyLoginn <onboarding@resend.dev>";

const purposeCopy: Record<string, { subject: string; intro: string }> = {
  signup: { subject: "Verify your MyLoginn email", intro: "Use this code to finish creating your account." },
  "change-email": { subject: "Verify your new MyLoginn email", intro: "Use this code to verify the email address for your MyLoginn account." },
  login: { subject: "Your MyLoginn sign-in code", intro: "Use this code to sign in." },
  reset: { subject: "Reset your MyLoginn password", intro: "Use this code to reset your password." },
};

/** Returns true if the code was delivered through Brevo or Resend. */
export async function sendOtpEmail(to: string, code: string, purpose: string): Promise<boolean> {
  const copy = purposeCopy[purpose] ?? purposeCopy.signup;
  const html = `
      <div style="font-family:sans-serif;max-width:420px;margin:0 auto;padding:32px 24px;">
        <h2 style="color:#0b0d17;margin:0 0 8px;">MyLoginn</h2>
        <p style="color:#5b5f75;font-size:14px;margin:0 0 24px;">${copy.intro}</p>
        <div style="background:#f2f1ff;border-radius:12px;padding:20px;text-align:center;">
          <span style="font-size:28px;font-weight:700;letter-spacing:8px;color:#6c4dff;">${code}</span>
        </div>
        <p style="color:#9296b3;font-size:12px;margin:24px 0 0;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
      </div>
    `;
  const sent = await sendEmail(to, copy.subject, html);
  if (!sent) {
    // Local/dev fallback: no email provider configured yet. Log server-side.
    console.log(`[dev-otp] ${purpose} code for ${to}: ${code}`);
    return false;
  }

  return true;
}

export async function sendPasswordResetLink(to: string, link: string): Promise<boolean> {
  const html = `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#20243a"><h2>MyLoginn</h2><p>Use the secure link below to choose a new password. It expires in 15 minutes and can only be used once.</p><p style="margin:28px 0"><a href="${link}" style="display:inline-block;background:#315fdb;color:#fff;text-decoration:none;padding:13px 20px;border-radius:9px;font-weight:600">Reset password</a></p><p style="font-size:12px;color:#777">If you did not request this, you can ignore this email.</p></div>`;
  return sendEmail(to, "Reset your MyLoginn password", html);
}

async function sendEmail(to: string, subject: string, htmlContent: string): Promise<boolean> {
  const brevoKey = process.env.BREVO_API_KEY;
  if (brevoKey) {
    const from = parseFrom(FROM);
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": brevoKey, "Content-Type": "application/json", accept: "application/json" },
      body: JSON.stringify({ sender: from, to: [{ email: to }], subject, htmlContent }),
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Brevo email delivery failed (${response.status}): ${detail}`);
    }
    return true;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({ from: FROM, to, subject, html: htmlContent });
  if (error) throw new Error(error.message ?? "Failed to send email");
  return true;
}

function parseFrom(value: string): { name: string; email: string } {
  const match = value.match(/^\s*(.*?)\s*<([^<>]+)>\s*$/);
  if (match) return { name: match[1] || "MyLoginn", email: match[2] };
  if (value.includes("@")) return { name: "MyLoginn", email: value.trim() };
  throw new Error("Set EMAIL_FROM to a verified sender address for Brevo email delivery.");
}
