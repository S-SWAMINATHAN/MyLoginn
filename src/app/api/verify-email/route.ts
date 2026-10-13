import { NextResponse } from "next/server";
import { contactEmailSchema } from "@/lib/validation";
import { emailDomainAcceptsMail } from "@/lib/emailDomain";

export const runtime = "nodejs";

/** Live check used by forms: is the address well-formed, non-disposable, and does its domain accept mail? */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = contactEmailSchema.safeParse(typeof body?.email === "string" ? body.email.slice(0, 254) : "");
  if (!parsed.success) {
    return NextResponse.json({ valid: false, reason: parsed.error.issues[0]?.message ?? "Enter a valid email address" });
  }
  const domain = parsed.data.split("@")[1];
  if (!(await emailDomainAcceptsMail(domain))) {
    return NextResponse.json({ valid: false, reason: `We couldn't find a mail server for ${domain}. Check the address for typos.` });
  }
  return NextResponse.json({ valid: true });
}
