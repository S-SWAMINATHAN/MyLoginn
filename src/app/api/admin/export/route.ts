import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function toCsv(rows: Record<string, unknown>[]) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (val: unknown) => {
    const s = val === null || val === undefined ? "" : String(val);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(","));
  }
  return lines.join("\n");
}

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "users";

  let rows: Record<string, unknown>[] = [];

  if (type === "users") {
    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    rows = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone ?? "",
      role: u.role,
      emailVerified: u.emailVerified,
      createdAt: u.createdAt.toISOString(),
    }));
  } else if (type === "leads") {
    const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
    rows = leads.map((l) => ({
      id: l.id,
      name: l.name,
      email: l.email,
      phone: l.phone,
      company: l.company ?? "",
      service: l.service,
      status: l.status,
      createdAt: l.createdAt.toISOString(),
    }));
  } else if (type === "internships") {
    const applications = await prisma.internshipApplication.findMany({
      include: { user: true, internship: true },
      orderBy: { appliedAt: "desc" },
    });
    rows = applications.map((a) => ({
      applicant: a.user.name,
      email: a.user.email,
      internship: a.internship.title,
      status: a.status,
      appliedAt: a.appliedAt.toISOString(),
    }));
  } else if (type === "courses") {
    const courses = await prisma.course.findMany({ orderBy: { createdAt: "desc" } });
    rows = courses.map((c) => ({
      id: c.id,
      title: c.title,
      category: c.category,
      level: c.level,
      price: c.price,
      studentsCount: c.studentsCount,
    }));
  }

  const csv = toCsv(rows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${type}.csv"`,
    },
  });
}
