"use client";

import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ContentIcon } from "@/components/ui/ContentIcon";
import type { Column, Row } from "@/components/admin/DataTable";
import type { EntityConfig } from "@/components/admin/EntityManager";

const nfIN = new Intl.NumberFormat("en-IN");

function fmtDate(v: unknown) {
  if (!v) return "—";
  return new Date(String(v)).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const dateCell = (key: string) => (row: Row) => <span className="text-muted">{fmtDate(row[key])}</span>;

const rupeeCell = (key: string) => (row: Row) => (
  <span className="font-semibold tabular-nums">₹{nfIN.format(Number(row[key] ?? 0))}</span>
);

const boolCell = (key: string) => (row: Row) =>
  row[key] ? (
    <span className="rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">Yes</span>
  ) : (
    <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-muted">No</span>
  );

const statusCell = (key: string) => (row: Row) => <StatusBadge status={String(row[key] ?? "")} />;

const categoryCell = (key: string) => (row: Row) => {
  const name = String(row[key] ?? "");
  if (!name) return "—";
  return (
    <span className="inline-flex items-center gap-2">
      <ContentIcon keyword={name} className="h-6 w-6" />
      <span>{name}</span>
    </span>
  );
};

const progressCell = (key: string) => (row: Row) => {
  const value = Math.min(100, Math.max(0, Number(row[key] ?? 0)));
  return (
    <div className="flex min-w-24 items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full brand-gradient-bg transition-all duration-500" style={{ width: `${value}%` }} />
      </div>
      <span className="w-9 text-right text-xs tabular-nums text-muted">{value}%</span>
    </div>
  );
};

const LEVEL_OPTIONS = [
  { label: "Beginner", value: "Beginner" },
  { label: "Intermediate", value: "Intermediate" },
  { label: "Advanced", value: "Advanced" },
];

/* ── Configs ────────────────────────────────────────────────────────── */

export const courseConfig: EntityConfig = {
  entity: "courses",
  titleSingular: "Course",
  titlePlural: "Courses",
  description: "Create, update and retire courses. Prices and enrollments update live.",
  nameKey: "title",
  columns: [
    { key: "title", label: "Title", className: "font-medium" },
    { key: "category", label: "Category", render: categoryCell("category") },
    { key: "level", label: "Level", hideBelow: "md" },
    { key: "instructor", label: "Instructor", hideBelow: "lg" },
    { key: "price", label: "Price", align: "right", render: rupeeCell("price") },
    { key: "students", label: "Students", align: "right", hideBelow: "sm" },
    { key: "featured", label: "Featured", hideBelow: "xl", render: boolCell("featured") },
    { key: "createdAt", label: "Created", hideBelow: "lg", render: dateCell("createdAt") },
  ] as Column[],
  createFields: [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "instructor", label: "Instructor", type: "text", required: true },
    { name: "category", label: "Category", type: "category", required: true, hint: "Pick an existing category or type a new one — its animated icon is generated automatically." },
    { name: "level", label: "Level", type: "select", options: LEVEL_OPTIONS },
    { name: "durationWeeks", label: "Duration (weeks)", type: "number", min: 1, max: 52, required: true },
    { name: "price", label: "Price (₹)", type: "number", min: 0, required: true },
    { name: "originalPrice", label: "Original price (₹)", type: "number", min: 0 },
    { name: "featured", label: "Featured on home page", type: "checkbox" },
    { name: "description", label: "Description", type: "textarea", required: true, full: true },
  ],
  editFields: [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "instructor", label: "Instructor", type: "text", required: true },
    { name: "category", label: "Category", type: "category", required: true },
    { name: "level", label: "Level", type: "select", options: LEVEL_OPTIONS },
    { name: "durationWeeks", label: "Duration (weeks)", type: "number", min: 1, max: 52 },
    { name: "price", label: "Price (₹)", type: "number", min: 0 },
    { name: "originalPrice", label: "Original price (₹)", type: "number", min: 0 },
    { name: "featured", label: "Featured on home page", type: "checkbox" },
    { name: "description", label: "Description", type: "textarea", full: true },
  ],
  createDefaults: { level: "Beginner", durationWeeks: 6, price: 9999, featured: false },
  bulkFields: [{ name: "level", label: "Level", type: "select", options: LEVEL_OPTIONS }],
};

export const categoryConfig: EntityConfig = {
  entity: "categories",
  titleSingular: "Category",
  titlePlural: "Categories",
  description:
    "Categories are fully dynamic — one exists as long as a course uses it, and its animated icon is generated from the name. Renaming moves every course.",
  nameKey: "name",
  canDelete: false,
  columns: [
    {
      key: "name",
      label: "Category",
      render: (r) => (
        <span className="inline-flex items-center gap-2.5 font-medium">
          <ContentIcon keyword={String(r.name)} className="h-8 w-8" />
          {String(r.name)}
        </span>
      ),
    },
    { key: "courses", label: "Courses", align: "right" },
  ] as Column[],
  editFields: [
    { name: "name", label: "Category name", type: "text", required: true, hint: "Renaming updates every course in this category." },
  ],
};

export const userConfig: EntityConfig = {
  entity: "users",
  titleSingular: "User",
  titlePlural: "Users",
  description: "Every account on the platform — students, mentors and admins.",
  nameKey: "name",
  columns: [
    { key: "name", label: "Name", className: "font-medium" },
    { key: "email", label: "Email", className: "text-muted" },
    { key: "role", label: "Role", render: (r) => <StatusBadge status={String(r.role).toLowerCase()} /> },
    { key: "emailVerified", label: "Verified", hideBelow: "sm", render: boolCell("emailVerified") },
    { key: "points", label: "Points", align: "right", hideBelow: "md" },
    { key: "enrollments", label: "Enrollments", align: "right", hideBelow: "lg" },
    { key: "createdAt", label: "Joined", hideBelow: "lg", render: dateCell("createdAt") },
  ] as Column[],
  createFields: [
    { name: "name", label: "Full name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Phone", type: "text" },
    {
      name: "role",
      label: "Role",
      type: "select",
      options: [
        { label: "Student", value: "STUDENT" },
        { label: "Mentor", value: "MENTOR" },
        { label: "Admin", value: "ADMIN" },
      ],
    },
    { name: "password", label: "Password", type: "password", required: true, hint: "Minimum 8 characters." },
    { name: "emailVerified", label: "Mark email as verified", type: "checkbox" },
  ],
  editFields: [
    { name: "name", label: "Full name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Phone", type: "text" },
    {
      name: "role",
      label: "Role",
      type: "select",
      options: [
        { label: "Student", value: "STUDENT" },
        { label: "Mentor", value: "MENTOR" },
        { label: "Admin", value: "ADMIN" },
      ],
    },
    { name: "points", label: "Points", type: "number", min: 0 },
    { name: "emailVerified", label: "Email verified", type: "checkbox" },
  ],
  createDefaults: { role: "STUDENT", emailVerified: false },
  bulkFields: [
    {
      name: "role",
      label: "Role",
      type: "select",
      options: [
        { label: "Student", value: "STUDENT" },
        { label: "Mentor", value: "MENTOR" },
        { label: "Admin", value: "ADMIN" },
      ],
    },
  ],
};

export const mentorConfig: EntityConfig = {
  entity: "mentors",
  titleSingular: "Mentor",
  titlePlural: "Mentors",
  description: "Tutoring mentors shown across the site, with their live booking counts.",
  nameKey: "name",
  columns: [
    { key: "name", label: "Name", className: "font-medium" },
    { key: "subject", label: "Subject" },
    { key: "qualification", label: "Qualification", hideBelow: "md" },
    { key: "experienceYears", label: "Exp (yrs)", align: "right", hideBelow: "sm" },
    { key: "rating", label: "Rating", align: "right", hideBelow: "lg" },
    {
      key: "boards",
      label: "Boards",
      hideBelow: "xl",
      render: (r) => (
        <span className="flex flex-wrap gap-1">
          {String(r.boards ?? "")
            .split(", ")
            .filter(Boolean)
            .map((b) => (
              <span key={b} className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium">
                {b}
              </span>
            ))}
        </span>
      ),
    },
    { key: "bookings", label: "Bookings", align: "right" },
  ] as Column[],
  createFields: [
    { name: "name", label: "Full name", type: "text", required: true },
    { name: "subject", label: "Subject", type: "text", required: true },
    { name: "qualification", label: "Qualification", type: "text", required: true },
    { name: "experienceYears", label: "Experience (years)", type: "number", min: 0, max: 60, required: true },
    { name: "rating", label: "Rating", type: "number", min: 0, max: 5, step: "0.1" },
    { name: "boards", label: "Boards", type: "text", hint: "Comma separated, e.g. CBSE, State Board, ICSE" },
    { name: "bio", label: "Bio", type: "textarea", required: true, full: true },
  ],
  editFields: [
    { name: "name", label: "Full name", type: "text", required: true },
    { name: "subject", label: "Subject", type: "text", required: true },
    { name: "qualification", label: "Qualification", type: "text", required: true },
    { name: "experienceYears", label: "Experience (years)", type: "number", min: 0, max: 60 },
    { name: "rating", label: "Rating", type: "number", min: 0, max: 5, step: "0.1" },
    { name: "boards", label: "Boards", type: "text", hint: "Comma separated, e.g. CBSE, State Board, ICSE" },
    { name: "bio", label: "Bio", type: "textarea", full: true },
  ],
  createDefaults: { rating: 4.9, boards: "CBSE" },
};

export const enrollmentConfig: EntityConfig = {
  entity: "enrollments",
  titleSingular: "Enrollment",
  titlePlural: "Enrollments",
  description: "Who is learning what — progress and status stream in live.",
  nameKey: "user",
  columns: [
    { key: "user", label: "User", className: "font-medium" },
    { key: "email", label: "Email", hideBelow: "lg", className: "text-muted" },
    { key: "course", label: "Course" },
    { key: "category", label: "Category", hideBelow: "md", render: categoryCell("category") },
    { key: "progress", label: "Progress", render: progressCell("progress"), filterable: false },
    { key: "status", label: "Status", render: statusCell("status") },
    { key: "enrolledAt", label: "Enrolled", hideBelow: "lg", render: dateCell("enrolledAt") },
  ] as Column[],
  editFields: [
    { name: "progress", label: "Progress (%)", type: "number", min: 0, max: 100 },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Active", value: "active" },
        { label: "Completed", value: "completed" },
        { label: "Paused", value: "paused" },
      ],
    },
  ],
  bulkFields: [
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Active", value: "active" },
        { label: "Completed", value: "completed" },
        { label: "Paused", value: "paused" },
      ],
    },
  ],
};

export const internshipConfig: EntityConfig = {
  entity: "internships",
  titleSingular: "Internship",
  titlePlural: "Internships",
  description: "Openings students can apply to, with live application counts.",
  nameKey: "title",
  columns: [
    { key: "title", label: "Title", className: "font-medium" },
    { key: "company", label: "Company" },
    { key: "type", label: "Type", hideBelow: "md" },
    { key: "location", label: "Location", hideBelow: "lg" },
    { key: "stipend", label: "Stipend", align: "right", hideBelow: "md", render: (r) => (r.stipend ? `₹${nfIN.format(Number(r.stipend))}` : "Unpaid") },
    { key: "applications", label: "Applications", align: "right" },
    { key: "applyDeadline", label: "Deadline", hideBelow: "lg", render: dateCell("applyDeadline") },
  ] as Column[],
  createFields: [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "company", label: "Company", type: "text", required: true },
    { name: "type", label: "Type", type: "text", required: true, placeholder: "Remote / On-site / Hybrid" },
    { name: "location", label: "Location", type: "text", required: true },
    { name: "durationWeeks", label: "Duration (weeks)", type: "number", min: 1, max: 52, required: true },
    { name: "stipend", label: "Stipend (₹/month)", type: "number", min: 0 },
    { name: "applyDeadline", label: "Apply deadline", type: "date", required: true },
    { name: "paid", label: "Paid internship", type: "checkbox" },
    { name: "mentorName", label: "Mentor name", type: "text", required: true },
    { name: "mentorEmail", label: "Mentor email", type: "email", required: true },
    { name: "description", label: "Description", type: "textarea", required: true, full: true },
    { name: "requirements", label: "Requirements", type: "textarea", required: true, full: true },
    { name: "responsibilities", label: "Responsibilities", type: "textarea", required: true, full: true },
    { name: "featured", label: "Featured listing", type: "checkbox" },
  ],
  editFields: [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "company", label: "Company", type: "text", required: true },
    { name: "type", label: "Type", type: "text" },
    { name: "location", label: "Location", type: "text" },
    { name: "durationWeeks", label: "Duration (weeks)", type: "number", min: 1, max: 52 },
    { name: "stipend", label: "Stipend (₹/month)", type: "number", min: 0 },
    { name: "applyDeadline", label: "Apply deadline", type: "date" },
    { name: "paid", label: "Paid internship", type: "checkbox" },
    { name: "mentorName", label: "Mentor name", type: "text" },
    { name: "mentorEmail", label: "Mentor email", type: "email" },
    { name: "description", label: "Description", type: "textarea", full: true },
    { name: "requirements", label: "Requirements", type: "textarea", full: true },
    { name: "responsibilities", label: "Responsibilities", type: "textarea", full: true },
    { name: "featured", label: "Featured listing", type: "checkbox" },
  ],
  createDefaults: { paid: true, durationWeeks: 8, featured: false },
};

export const applicationConfig: EntityConfig = {
  entity: "applications",
  titleSingular: "Application",
  titlePlural: "Applications",
  description: "Internship applications — review, accept or reject with one click.",
  nameKey: "applicant",
  columns: [
    { key: "applicant", label: "Applicant", className: "font-medium" },
    { key: "email", label: "Email", hideBelow: "lg", className: "text-muted" },
    { key: "internship", label: "Internship" },
    { key: "company", label: "Company", hideBelow: "md" },
    { key: "status", label: "Status", render: statusCell("status") },
    { key: "appliedAt", label: "Applied", hideBelow: "md", render: dateCell("appliedAt") },
  ] as Column[],
  editFields: [
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Submitted", value: "submitted" },
        { label: "Under review", value: "under_review" },
        { label: "Accepted", value: "accepted" },
        { label: "Rejected", value: "rejected" },
      ],
    },
  ],
  bulkFields: [
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Submitted", value: "submitted" },
        { label: "Under review", value: "under_review" },
        { label: "Accepted", value: "accepted" },
        { label: "Rejected", value: "rejected" },
      ],
    },
  ],
};

export const projectConfig: EntityConfig = {
  entity: "projects",
  titleSingular: "Project",
  titlePlural: "Projects",
  description: "Student projects — update progress and leave mentor feedback.",
  nameKey: "title",
  columns: [
    { key: "title", label: "Title", className: "font-medium" },
    { key: "student", label: "Student" },
    { key: "mentor", label: "Mentor", hideBelow: "md" },
    { key: "progress", label: "Progress", render: progressCell("progress"), filterable: false },
    { key: "status", label: "Status", render: statusCell("status") },
    { key: "updatedAt", label: "Updated", hideBelow: "lg", render: dateCell("updatedAt") },
  ] as Column[],
  editFields: [
    { name: "title", label: "Title", type: "text", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "In progress", value: "in_progress" },
        { label: "Completed", value: "completed" },
        { label: "On hold", value: "on_hold" },
      ],
    },
    { name: "progress", label: "Progress (%)", type: "number", min: 0, max: 100 },
    { name: "feedback", label: "Mentor feedback", type: "textarea", full: true },
  ],
  bulkFields: [
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "In progress", value: "in_progress" },
        { label: "Completed", value: "completed" },
        { label: "On hold", value: "on_hold" },
      ],
    },
  ],
};

export const tutoringConfig: EntityConfig = {
  entity: "tutoring",
  titleSingular: "Booking",
  titlePlural: "Tutoring bookings",
  description: "Tutoring session requests — confirm, complete or cancel them.",
  nameKey: "student",
  columns: [
    { key: "student", label: "Student", className: "font-medium" },
    { key: "tutor", label: "Tutor" },
    { key: "subject", label: "Subject" },
    { key: "grade", label: "Grade", hideBelow: "md" },
    { key: "board", label: "Board", hideBelow: "lg" },
    { key: "slot", label: "Preferred slot", hideBelow: "xl" },
    { key: "status", label: "Status", render: statusCell("status") },
    { key: "createdAt", label: "Requested", hideBelow: "lg", render: dateCell("createdAt") },
  ] as Column[],
  editFields: [
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Confirmed", value: "confirmed" },
        { label: "Completed", value: "completed" },
        { label: "Cancelled", value: "cancelled" },
      ],
    },
    { name: "notes", label: "Notes", type: "textarea", full: true },
  ],
  bulkFields: [
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Confirmed", value: "confirmed" },
        { label: "Completed", value: "completed" },
        { label: "Cancelled", value: "cancelled" },
      ],
    },
  ],
};

export const leadConfig: EntityConfig = {
  entity: "leads",
  titleSingular: "Client request",
  titlePlural: "Client requests",
  description: "Service inquiries from the contact form — keep their status current.",
  nameKey: "name",
  columns: [
    { key: "name", label: "Name", className: "font-medium" },
    { key: "email", label: "Email", hideBelow: "md", className: "text-muted" },
    { key: "phone", label: "Phone", hideBelow: "lg" },
    { key: "service", label: "Service" },
    { key: "status", label: "Status", render: statusCell("status") },
    { key: "createdAt", label: "Received", hideBelow: "lg", render: dateCell("createdAt") },
  ] as Column[],
  editFields: [
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "New", value: "new" },
        { label: "Contacted", value: "contacted" },
        { label: "Closed", value: "closed" },
      ],
    },
  ],
  bulkFields: [
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "New", value: "new" },
        { label: "Contacted", value: "contacted" },
        { label: "Closed", value: "closed" },
      ],
    },
  ],
};

export const paymentConfig: EntityConfig = {
  entity: "payments",
  titleSingular: "Payment",
  titlePlural: "Payments",
  description: "Every Razorpay order with its live status. Records are never deleted.",
  nameKey: "user",
  canDelete: false,
  columns: [
    { key: "user", label: "User", className: "font-medium" },
    { key: "course", label: "Course" },
    { key: "amount", label: "Amount", align: "right", render: rupeeCell("amount") },
    { key: "status", label: "Status", render: statusCell("status") },
    { key: "orderId", label: "Order ID", hideBelow: "xl", className: "text-muted text-xs" },
    { key: "createdAt", label: "Date", hideBelow: "md", render: dateCell("createdAt") },
  ] as Column[],
  editFields: [
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Created", value: "created" },
        { label: "Paid", value: "paid" },
        { label: "Failed", value: "failed" },
        { label: "Refunded", value: "refunded" },
      ],
    },
  ],
  bulkFields: [
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Created", value: "created" },
        { label: "Paid", value: "paid" },
        { label: "Failed", value: "failed" },
        { label: "Refunded", value: "refunded" },
      ],
    },
  ],
};
