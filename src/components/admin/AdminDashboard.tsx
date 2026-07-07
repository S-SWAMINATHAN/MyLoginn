"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  Briefcase,
  FolderKanban,
  MessagesSquare,
  Download,
  Trash2,
  Check,
  X,
  Plus,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ProgressBar } from "@/components/dashboard/DashboardShell";
import { IconBadge } from "@/components/ui/IconBadge";

const CATEGORY_SUGGESTIONS = [
  "AI & ML",
  "Digital Marketing",
  "Development",
  "Cybersecurity",
  "Testing",
  "Data Science",
  "Cloud Computing",
];

type Stats = {
  users: number;
  courses: number;
  internships: number;
  enrollments: number;
  applications: number;
  leads: number;
};

type AdminUser = { id: string; name: string; email: string; role: string; emailVerified: boolean; createdAt: string };
type AdminCourse = { id: string; title: string; category: string; level: string; price: number; studentsCount: number };
type AdminApplication = { id: string; applicantName: string; applicantEmail: string; internshipTitle: string; status: string; appliedAt: string };
type AdminProject = { id: string; userName: string; title: string; status: string; progress: number; feedback: string | null };
type AdminLead = { id: string; name: string; email: string; phone: string; service: string; status: string; createdAt: string };

const tabs = [
  { id: "overview", label: "Overview", icon: Users },
  { id: "users", label: "Users", icon: Users },
  { id: "courses", label: "Courses", icon: GraduationCap },
  { id: "internships", label: "Internships", icon: Briefcase },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "leads", label: "Leads", icon: MessagesSquare },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function AdminDashboard({
  stats,
  users,
  courses,
  applications,
  projects,
  leads,
}: {
  stats: Stats;
  users: AdminUser[];
  courses: AdminCourse[];
  applications: AdminApplication[];
  projects: AdminProject[];
  leads: AdminLead[];
}) {
  const [tab, setTab] = useState<TabId>("overview");

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-border-soft pb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`group flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
              tab === t.id ? "brand-gradient-bg text-white" : "bg-surface-2 text-foreground/80 hover:bg-surface-2/80"
            }`}
          >
            <t.icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "overview" && <OverviewTab stats={stats} />}
        {tab === "users" && <UsersTab users={users} />}
        {tab === "courses" && <CoursesTab courses={courses} />}
        {tab === "internships" && <InternshipsTab applications={applications} />}
        {tab === "projects" && <ProjectsTab projects={projects} />}
        {tab === "leads" && <LeadsTab leads={leads} />}
      </div>
    </div>
  );
}

function TabWrap({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      {children}
    </motion.div>
  );
}

function OverviewTab({ stats }: { stats: Stats }) {
  const cards = [
    { label: "Total users", value: stats.users, icon: Users },
    { label: "Courses", value: stats.courses, icon: GraduationCap },
    { label: "Enrollments", value: stats.enrollments, icon: GraduationCap },
    { label: "Internships", value: stats.internships, icon: Briefcase },
    { label: "Applications", value: stats.applications, icon: Briefcase },
    { label: "Leads", value: stats.leads, icon: MessagesSquare },
  ];
  return (
    <TabWrap>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <Card key={c.label} className="p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
            <IconBadge size="sm" className="text-brand-600 dark:text-brand-300">
              <c.icon className="h-6 w-6" strokeWidth={1.8} />
            </IconBadge>
            <p className="mt-3 text-2xl font-semibold">{c.value}</p>
            <p className="text-xs text-muted">{c.label}</p>
          </Card>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        {["users", "courses", "internships", "leads"].map((type) => (
          <a
            key={type}
            href={`/api/admin/export?type=${type}`}
            className="group inline-flex items-center gap-1.5 rounded-full border border-border-soft bg-surface px-4 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-[var(--shadow-soft)]"
          >
            <Download className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-y-0.5" /> Export {type}.csv
          </a>
        ))}
      </div>
    </TabWrap>
  );
}

function UsersTab({ users }: { users: AdminUser[] }) {
  return (
    <TabWrap>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border-soft text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-5 py-3.5">Name</th>
              <th className="px-5 py-3.5">Email</th>
              <th className="px-5 py-3.5">Role</th>
              <th className="px-5 py-3.5">Verified</th>
              <th className="px-5 py-3.5">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border-soft last:border-0">
                <td className="px-5 py-3.5 font-medium">{u.name}</td>
                <td className="px-5 py-3.5 text-muted">{u.email}</td>
                <td className="px-5 py-3.5">
                  <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium">{u.role}</span>
                </td>
                <td className="px-5 py-3.5">{u.emailVerified ? "Yes" : "No"}</td>
                <td className="px-5 py-3.5 text-muted">
                  {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </TabWrap>
  );
}

function CoursesTab({ courses }: { courses: AdminCourse[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "AI & ML",
    level: "Beginner",
    description: "",
    instructor: "",
    durationWeeks: "6",
    price: "9999",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not create course");
        return;
      }
      setShowForm(false);
      setForm({ title: "", category: "AI & ML", level: "Beginner", description: "", instructor: "", durationWeeks: "6", price: "9999" });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <TabWrap>
      <div className="mb-5 flex justify-end">
        <Button size="sm" icon={<Plus className="h-5 w-5" />} onClick={() => setShowForm((s) => !s)}>
          New course
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Input label="Instructor" value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} />
            <div>
              <Input
                label="Category"
                list="course-category-suggestions"
                placeholder="e.g. Cybersecurity"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                hint="Type any category — a matching icon is generated automatically."
              />
              <datalist id="course-category-suggestions">
                {CATEGORY_SUGGESTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <Select
              label="Level"
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              options={[
                { label: "Beginner", value: "Beginner" },
                { label: "Intermediate", value: "Intermediate" },
                { label: "Advanced", value: "Advanced" },
              ]}
            />
            <Input label="Duration (weeks)" type="number" value={form.durationWeeks} onChange={(e) => setForm({ ...form, durationWeeks: e.target.value })} />
            <Input label="Price (₹)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div className="mt-4">
            <Textarea label="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          {error && <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
          <div className="mt-5 flex gap-3">
            <Button size="sm" onClick={handleCreate} disabled={saving}>
              {saving ? "Saving…" : "Create course"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border-soft text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-5 py-3.5">Title</th>
              <th className="px-5 py-3.5">Category</th>
              <th className="px-5 py-3.5">Level</th>
              <th className="px-5 py-3.5">Price</th>
              <th className="px-5 py-3.5">Students</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id} className="border-b border-border-soft last:border-0">
                <td className="px-5 py-3.5 font-medium">{c.title}</td>
                <td className="px-5 py-3.5 text-muted">{c.category}</td>
                <td className="px-5 py-3.5 text-muted">{c.level}</td>
                <td className="px-5 py-3.5">₹{c.price.toLocaleString()}</td>
                <td className="px-5 py-3.5 text-muted">{c.studentsCount.toLocaleString()}</td>
                <td className="px-5 py-3.5">
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="cursor-pointer rounded-full p-1.5 text-danger transition-transform duration-200 hover:scale-110 hover:bg-danger/10 active:scale-90"
                    aria-label="Delete course"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </TabWrap>
  );
}

function InternshipsTab({ applications }: { applications: AdminApplication[] }) {
  const router = useRouter();

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/internships/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  return (
    <TabWrap>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border-soft text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-5 py-3.5">Applicant</th>
              <th className="px-5 py-3.5">Internship</th>
              <th className="px-5 py-3.5">Applied</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((a) => (
              <tr key={a.id} className="border-b border-border-soft last:border-0">
                <td className="px-5 py-3.5">
                  <p className="font-medium">{a.applicantName}</p>
                  <p className="text-xs text-muted">{a.applicantEmail}</p>
                </td>
                <td className="px-5 py-3.5 text-muted">{a.internshipTitle}</td>
                <td className="px-5 py-3.5 text-muted">
                  {new Date(a.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={a.status} />
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(a.id, "accepted")}
                      className="cursor-pointer rounded-full p-1.5 text-success transition-transform duration-200 hover:scale-110 hover:bg-success/10 active:scale-90"
                      aria-label="Accept"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => updateStatus(a.id, "rejected")}
                      className="cursor-pointer rounded-full p-1.5 text-danger transition-transform duration-200 hover:scale-110 hover:bg-danger/10 active:scale-90"
                      aria-label="Reject"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </TabWrap>
  );
}

function ProjectsTab({ projects }: { projects: AdminProject[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [progress, setProgress] = useState(0);

  function startEdit(p: AdminProject) {
    setEditing(p.id);
    setFeedback(p.feedback ?? "");
    setProgress(p.progress);
  }

  async function saveFeedback(id: string) {
    await fetch(`/api/admin/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback, progress, status: progress >= 100 ? "completed" : "in_progress" }),
    });
    setEditing(null);
    router.refresh();
  }

  return (
    <TabWrap>
      <div className="flex flex-col gap-4">
        {projects.map((p) => (
          <Card key={p.id} className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-xs text-muted">Student: {p.userName}</p>
              </div>
              <StatusBadge status={p.status} />
            </div>
            <div className="mt-3">
              <ProgressBar value={p.progress} />
            </div>

            {editing === p.id ? (
              <div className="mt-4 flex flex-col gap-3">
                <Input
                  label="Progress (%)"
                  type="number"
                  min={0}
                  max={100}
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                />
                <Textarea label="Mentor feedback" rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
                <div className="flex gap-3">
                  <Button size="sm" onClick={() => saveFeedback(p.id)}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex items-center justify-between gap-3">
                {p.feedback ? (
                  <p className="text-sm text-muted">&ldquo;{p.feedback}&rdquo;</p>
                ) : (
                  <p className="text-sm text-muted">No feedback yet.</p>
                )}
                <Button size="sm" variant="secondary" onClick={() => startEdit(p)}>
                  Update
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </TabWrap>
  );
}

function LeadsTab({ leads }: { leads: AdminLead[] }) {
  const router = useRouter();

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  return (
    <TabWrap>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border-soft text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-5 py-3.5">Name</th>
              <th className="px-5 py-3.5">Contact</th>
              <th className="px-5 py-3.5">Service</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b border-border-soft last:border-0">
                <td className="px-5 py-3.5 font-medium">{l.name}</td>
                <td className="px-5 py-3.5 text-muted">
                  <p>{l.email}</p>
                  <p className="text-xs">{l.phone}</p>
                </td>
                <td className="px-5 py-3.5 text-muted">{l.service}</td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={l.status} />
                </td>
                <td className="px-5 py-3.5">
                  <Select
                    value={l.status}
                    onChange={(e) => updateStatus(l.id, e.target.value)}
                    className="!py-1.5 text-xs"
                    options={[
                      { label: "New", value: "new" },
                      { label: "Contacted", value: "contacted" },
                      { label: "Closed", value: "closed" },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </TabWrap>
  );
}
