import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export type RequestAttachment = { name: string; url: string };

/** One submitted form, normalised across the contact/enquiry and project-request forms. */
export type FormRequestRow = {
  id: string;
  kind: "lead" | "project";
  ref: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string | null;
  company: string | null;
  service: string;
  /** Which website form produced this request (drives the admin sections). */
  section: string;
  status: string;
  priority: string | null;
  assignedTo: string | null;
  internalNotes: string | null;
  summary: string;
  details: { label: string; value: string }[];
  attachments: RequestAttachment[];
  createdAt: string;
};

const PROJECT_SECTIONS: Record<string, string> = { web: "web", mobile: "mobile", software: "software", marketing: "marketing" };

function leadSection(service: string) {
  const s = service.toLowerCase();
  if (s.includes("payment")) return "payment";
  if (s.includes("feedback")) return "feedback";
  if (s.includes("general")) return "contact";
  return "service";
}

function clean(v: string | null | undefined) {
  return v && v.trim() ? v.trim() : null;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [leads, projects] = await Promise.all([
    prisma.lead.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.projectRequest.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const leadRows: FormRequestRow[] = leads.map((l) => ({
    id: l.id,
    kind: "lead",
    ref: `LD-${l.id.slice(-6).toUpperCase()}`,
    name: l.name,
    email: l.email,
    phone: l.phone,
    whatsapp: null,
    company: clean(l.company),
    service: l.service,
    section: leadSection(l.service),
    status: l.status,
    priority: null,
    assignedTo: null,
    internalNotes: null,
    summary: l.message ?? "",
    details: l.message ? [{ label: "Message", value: l.message }] : [],
    attachments: [],
    createdAt: l.createdAt.toISOString(),
  }));

  const projectRows: FormRequestRow[] = projects.map((p) => {
    const req = (p.requirements ?? {}) as {
      selected?: unknown;
      additionalNotes?: string | null;
      attachments?: { name?: string; url?: string }[];
    };
    const selected = Array.isArray(req.selected) ? req.selected.map(String).join(", ") : "";
    const fields: [string, string | null][] = [
      ["Project name", clean(p.projectName)],
      ["Project brief", clean(p.description)],
      ["Objective", clean(p.objective)],
      ["Target audience", clean(p.targetAudience)],
      ["Industry", clean(p.industry)],
      ["Current website", clean(p.currentUrl)],
      ["Project type", clean(p.projectType)],
      ["Platform", clean(p.platform)],
      ["Requirements", clean(selected)],
      ["Additional notes", clean(req.additionalNotes)],
      ["Budget", clean(p.budget)],
      ["Timeline", clean(p.timeline)],
      ["Preferred contact", clean(p.preferredContact)],
    ];
    return {
      id: p.id,
      kind: "project",
      ref: p.requestId,
      name: p.name,
      email: p.email,
      phone: p.phone,
      whatsapp: clean(p.whatsapp),
      company: clean(p.company),
      service: p.service,
      section: PROJECT_SECTIONS[p.service] ?? "other",
      status: p.status,
      priority: p.priority,
      assignedTo: p.assignedTo,
      internalNotes: p.internalNotes,
      summary: p.description,
      details: fields.filter((f): f is [string, string] => f[1] !== null).map(([label, value]) => ({ label, value })),
      attachments: (Array.isArray(req.attachments) ? req.attachments : [])
        .filter((a): a is { name?: string; url: string } => typeof a?.url === "string")
        .map((a) => ({ name: a.name || "Attachment", url: a.url })),
      createdAt: p.createdAt.toISOString(),
    };
  });

  const rows = [...leadRows, ...projectRows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return NextResponse.json({ rows, fetchedAt: new Date().toISOString() });
}
