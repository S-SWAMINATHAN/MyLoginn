import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leadSchema } from "@/lib/validation";
import { toWhatsAppLink } from "@/lib/whatsapp";
import { WHATSAPP_PHONE } from "@/lib/contactInfo";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = leadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const { name, email, phone, company, goals, service, message } = parsed.data;
    const savedMessage = [
      goals ? `Goals:\n${goals}` : "",
      message ? `Project / enquiry:\n${message}` : "",
    ].filter(Boolean).join("\n\n") || null;

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        company: company || null,
        service,
        message: savedMessage,
      },
    });

    const whatsappLink = toWhatsAppLink(
    WHATSAPP_PHONE,
    `Hi MyLoginn team, I’m ${name}. I’m interested in ${service}.`
  );

    return NextResponse.json({ lead, whatsappLink });
  } catch (error) {
    console.error("Lead submission could not be saved:", error instanceof Error ? error.name : "unknown error");
    return NextResponse.json({ error: "We couldn't save your enquiry. Please try again in a moment." }, { status: 500 });
  }
}
