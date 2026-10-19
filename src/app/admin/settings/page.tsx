import { CheckCircle2, CircleAlert, Download } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isMyBuddyConfigured } from "@/lib/mybuddy";
import { Avatar } from "@/components/ui/Avatar";

export const metadata = { title: "Settings — MyLoginn Admin" };
export const dynamic = "force-dynamic";

const has = (name: string) => Boolean(process.env[name]);

async function databaseOk() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

const EXPORTS = [
  { type: "users", label: "Users", desc: "Accounts, roles and verification status" },
  { type: "leads", label: "Enquiries", desc: "Contact and service leads" },
  { type: "internships", label: "Internships", desc: "Listings and deadlines" },
  { type: "courses", label: "Courses", desc: "Catalogue with pricing" },
];

/** Admin settings: your account, the status of connected services (configured or not; no secrets shown), and data exports. */
export default async function AdminSettingsPage() {
  const user = await getCurrentUser();
  const dbOk = await databaseOk();

  const services = [
    { name: "Database", ok: dbOk, note: dbOk ? "Connected" : "Cannot reach the database" },
    { name: "Sign-in sessions", ok: has("JWT_SECRET"), note: has("JWT_SECRET") ? "Signing key set" : "JWT_SECRET is missing" },
    { name: "SMS verification (Twilio)", ok: has("TWILIO_ACCOUNT_SID") && has("TWILIO_AUTH_TOKEN") && has("TWILIO_VERIFY_SERVICE_SID"), note: "Sends one-time codes by SMS" },
    { name: "Email (Resend)", ok: has("RESEND_API_KEY"), note: "Sends one-time codes and notices by email" },
    { name: "Payments (Razorpay)", ok: has("NEXT_PUBLIC_RAZORPAY_KEY_ID"), note: "Course checkout" },
    { name: "AI assistant", ok: isMyBuddyConfigured() || has("OPENROUTER_API_KEY"), note: "Chat widget replies" },
    { name: "Site URL", ok: has("NEXT_PUBLIC_SITE_URL"), note: has("NEXT_PUBLIC_SITE_URL") ? (process.env.NEXT_PUBLIC_SITE_URL as string) : "Used for links and the sitemap" },
  ];
  const healthy = services.filter((s) => s.ok).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <span className="story-eyebrow">System</span>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-story-navy sm:text-3xl dark:text-foreground">Settings</h2>
        <p className="mt-1 text-sm text-muted">Your account, connected services and data exports.</p>
      </div>

      {user && (
        <section className="flex flex-wrap items-center gap-4 rounded-3xl border border-border-soft bg-surface p-5 sm:p-6">
          <Avatar name={user.name} avatarColor={user.avatarColor} avatarUrl={user.avatarUrl} size={64} className="rounded-full text-xl" />
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold">{user.name}</p>
            <p className="truncate text-sm text-muted">{user.email}</p>
            <span className="mt-2 inline-block rounded-full bg-story-royal/10 px-3 py-1 text-xs font-semibold text-story-royal">Administrator</span>
          </div>
          <a href="/profile" className="rounded-full border border-border-soft px-4 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:border-story-royal hover:text-story-royal">Edit profile</a>
        </section>
      )}

      <section className="rounded-3xl border border-border-soft bg-surface p-5 sm:p-6" aria-label="Service status">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-base font-bold text-story-navy dark:text-foreground">Service status</h3>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${healthy === services.length ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>{healthy} of {services.length} ready</span>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {services.map((s) => (
            <li key={s.name} className="flex items-start gap-3 rounded-2xl border border-border-soft p-3.5">
              {s.ok ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" aria-hidden /> : <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" aria-hidden />}
              <div className="min-w-0">
                <p className="text-sm font-semibold">{s.name} <span className="sr-only">{s.ok ? "ready" : "not configured"}</span></p>
                <p className="truncate text-xs text-muted">{s.ok ? s.note : `Not configured. ${s.note}`}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-muted">Only whether each service is configured is shown. Keys and secrets are never displayed.</p>
      </section>

      <section className="rounded-3xl border border-border-soft bg-surface p-5 sm:p-6" aria-label="Data exports">
        <h3 className="mb-4 text-base font-bold text-story-navy dark:text-foreground">Export data</h3>
        <ul className="grid gap-3 sm:grid-cols-2">
          {EXPORTS.map((e) => (
            <li key={e.type}>
              <a href={`/api/admin/export?type=${e.type}`} className="group flex items-center gap-3 rounded-2xl border border-border-soft p-3.5 transition-all hover:-translate-y-1 hover:border-story-royal hover:shadow-[var(--shadow-soft)]">
                <span className="grid h-10 w-10 shrink-0 place-items-center text-story-royal transition-colors group-hover:bg-story-royal group-hover:text-white"><Download className="h-4 w-4" /></span>
                <span className="min-w-0"><span className="block text-sm font-semibold">{e.label} (CSV)</span><span className="block truncate text-xs text-muted">{e.desc}</span></span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-muted">Exports contain personal data. Download only what you need and store it securely.</p>
      </section>
    </div>
  );
}
