import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leadSchema } from "@/lib/validation";
import { toWhatsAppLink } from "@/lib/whatsapp";
import { WHATSAPP_PHONE } from "@/lib/contactInfo";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { name, email, phone, company, service, message } = parsed.data;

  const lead = await prisma.lead.create({
    data: {
      name,
      email,
      phone,
      company: company || null,
      service,
      message: message || null,
    },
  });

  const whatsappLink = toWhatsAppLink(
    WHATSAPP_PHONE,
    `Hi MyLoginn team, I’m ${name}. I’m interested in ${service}.`
  );

  return NextResponse.json({ lead, whatsappLink });
}
