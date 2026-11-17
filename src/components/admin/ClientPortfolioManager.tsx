"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";

type Project = {
  id: string; slug: string; name: string; url: string; category: string; artKey: string; cardMetric: string | null;
  description: string; longDescription: string; highlights: string[]; audience: string | null;
  features: { title: string; text: string }[] | null; deliverables: string[] | null;
  platform: string | null; status: string; fallbackPreview: boolean; sortOrder: number;
};
type FormState = Omit<Project, "id" | "highlights" | "features" | "deliverables"> & { id?: string; highlights: string; features: string; deliverables: string };

const blank: FormState = { slug: "", name: "", url: "", category: "", artKey: "webdev", cardMetric: "", description: "", longDescription: "", highlights: "", audience: "", features: "", deliverables: "", platform: "web", status: "live", fallbackPreview: false, sortOrder: 0 };
const artOptions = ["ml", "cyber", "testing", "marketing", "cloud", "webdev", "mobile", "ecommerce", "travel", "platform", "network", "jadhagam", "shop-leads", "crm"];

function formFrom(project: Project): FormState {
  return { ...project, cardMetric: project.cardMetric ?? "", audience: project.audience ?? "", platform: project.platform ?? "web", highlights: project.highlights.join("\n"), features: (project.features ?? []).map((f) => `${f.title} | ${f.text}`).join("\n"), deliverables: (project.deliverables ?? []).join("\n") };
}

function lines(value: string) { return value.split("\n").map((line) => line.trim()).filter(Boolean); }

export function ClientPortfolioManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const response = await fetch("/api/admin/client-projects", { cache: "no-store" });
    const result = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) { setMessage(result.error ?? "Unable to load client projects."); return; }
    setProjects(result.projects as Project[]);
    setMessage("");
  }

  useEffect(() => { void load(); }, []);

  function makePayload(value: FormState) {
    const features = lines(value.features).map((line) => {
      const divider = line.indexOf("|");
      return divider < 0 ? { title: line, text: line } : { title: line.slice(0, divider).trim(), text: line.slice(divider + 1).trim() };
    });
    return { ...value, cardMetric: value.cardMetric || null, audience: value.audience || null, highlights: lines(value.highlights), features, deliverables: lines(value.deliverables), sortOrder: Number(value.sortOrder) };
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    setBusy(true);
    const { id, ...payload } = makePayload(form);
    const response = await fetch(id ? `/api/admin/client-projects/${id}` : "/api/admin/client-projects", { method: id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) { setMessage(result.error ?? "Could not save the project."); return; }
    setForm(null);
    setMessage(id ? "Project updated." : "Project added.");
    await load();
  }

  async function remove(project: Project) {
    if (!window.confirm(`Delete ${project.name} from the public portfolio?`)) return;
    const response = await fetch(`/api/admin/client-projects/${project.id}`, { method: "DELETE" });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setMessage(result.error ?? "Could not delete the project."); return; }
    setProjects((current) => current.filter((item) => item.id !== project.id));
    setMessage("Project deleted.");
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => current ? { ...current, [key]: value } : current);
  const inputClass = "field-control";

  return (
    <section className="mx-auto w-full max-w-7xl space-y-5" aria-labelledby="client-projects-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[.16em] text-brand-600">Public website portfolio</p><h2 id="client-projects-title" className="mt-2 text-2xl font-bold sm:text-3xl">Client projects <span className="text-muted">({projects.length})</span></h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Add, edit, or remove the projects shown on the public website. Student assignments are managed separately below.</p></div>
        {!form && <button type="button" onClick={() => { setMessage(""); setForm({ ...blank, sortOrder: projects.length }); }} className="inline-flex items-center gap-2 rounded-xl bg-story-royal px-4 py-2.5 text-sm font-semibold text-white"><Plus className="h-4 w-4" />Add client project</button>}
      </div>
      {message && <p role="status" className="rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">{message}</p>}
      {form && <form onSubmit={save} className="space-y-4 rounded-2xl border border-border-soft bg-surface p-5 sm:p-6">
        <div className="flex items-center justify-between"><h3 className="text-lg font-bold">{form.id ? "Edit client project" : "Add client project"}</h3><button type="button" aria-label="Close form" onClick={() => setForm(null)} className="rounded-lg p-2 text-muted hover:bg-surface-2"><X className="h-4 w-4" /></button></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-semibold">Project name<input className={`${inputClass} mt-1.5`} required maxLength={120} value={form.name} onChange={(e) => set("name", e.target.value)} /></label>
          <label className="text-sm font-semibold">URL slug<input className={`${inputClass} mt-1.5`} required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={form.slug} onChange={(e) => set("slug", e.target.value.toLowerCase())} placeholder="project-name" /></label>
          <label className="text-sm font-semibold">Category<input className={`${inputClass} mt-1.5`} required maxLength={100} value={form.category} onChange={(e) => set("category", e.target.value)} /></label>
          <label className="text-sm font-semibold">Website URL<input className={`${inputClass} mt-1.5`} type="url" value={form.url} onChange={(e) => set("url", e.target.value)} placeholder="https://example.com" /></label>
          <label className="text-sm font-semibold">Status<select className={`${inputClass} mt-1.5`} value={form.status} onChange={(e) => set("status", e.target.value)}><option value="live">Live</option><option value="in-development">In development</option></select></label>
          <label className="text-sm font-semibold">Card artwork<select className={`${inputClass} mt-1.5`} value={form.artKey} onChange={(e) => set("artKey", e.target.value)}>{artOptions.map((key) => <option key={key} value={key}>{key}</option>)}</select></label>
          <label className="text-sm font-semibold">Card metric<input className={`${inputClass} mt-1.5`} maxLength={100} value={form.cardMetric ?? ""} onChange={(e) => set("cardMetric", e.target.value)} placeholder="100+ leads generated" /></label>
          <label className="text-sm font-semibold">Platform<select className={`${inputClass} mt-1.5`} value={form.platform ?? "web"} onChange={(e) => set("platform", e.target.value)}><option value="web">Web</option><option value="mobile">Mobile</option><option value="desktop">Desktop</option></select></label>
          <label className="text-sm font-semibold">Display order<input className={`${inputClass} mt-1.5`} type="number" min="0" value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} /></label>
          <label className="text-sm font-semibold sm:col-span-2 lg:col-span-3">Card description<textarea className={`${inputClass} mt-1.5`} required maxLength={300} rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} /></label>
          <label className="text-sm font-semibold sm:col-span-2 lg:col-span-3">Project details<textarea className={`${inputClass} mt-1.5`} required maxLength={3000} rows={3} value={form.longDescription} onChange={(e) => set("longDescription", e.target.value)} /></label>
          <label className="text-sm font-semibold">Audience<input className={`${inputClass} mt-1.5`} value={form.audience ?? ""} onChange={(e) => set("audience", e.target.value)} /></label>
          <label className="text-sm font-semibold">Highlights <span className="font-normal text-muted">one per line</span><textarea className={`${inputClass} mt-1.5`} rows={3} value={form.highlights} onChange={(e) => set("highlights", e.target.value)} /></label>
          <label className="text-sm font-semibold">Deliverables <span className="font-normal text-muted">one per line</span><textarea className={`${inputClass} mt-1.5`} rows={3} value={form.deliverables} onChange={(e) => set("deliverables", e.target.value)} /></label>
          <label className="text-sm font-semibold sm:col-span-2 lg:col-span-3">Features <span className="font-normal text-muted">one per line, title | description</span><textarea className={`${inputClass} mt-1.5`} rows={3} value={form.features} onChange={(e) => set("features", e.target.value)} placeholder="Online booking | Customers can reserve a service online" /></label>
          <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2 lg:col-span-3"><input type="checkbox" checked={form.fallbackPreview} onChange={(e) => set("fallbackPreview", e.target.checked)} />Use the built-in fallback preview</label>
        </div>
        <div className="flex flex-wrap justify-end gap-3"><button type="button" onClick={() => setForm(null)} className="rounded-xl border border-border-soft px-4 py-2.5 text-sm font-semibold">Cancel</button><button disabled={busy} className="rounded-xl bg-story-royal px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : form.id ? "Save changes" : "Add project"}</button></div>
      </form>}
      <div className="overflow-hidden rounded-2xl border border-border-soft bg-surface">
        <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto_auto] gap-4 border-b border-border-soft bg-surface-2 px-5 py-3 text-[10px] font-bold uppercase tracking-[.12em] text-muted sm:grid"><span>Project</span><span>Category</span><span>Status</span><span>Actions</span></div>
        {loading ? <p className="p-8 text-center text-sm text-muted">Loading client projects…</p> : projects.length ? <ul className="divide-y divide-border-soft">{projects.map((project) => <li key={project.id} className="grid gap-2 px-4 py-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto_auto] sm:items-center sm:gap-4 sm:px-5"><div className="min-w-0"><p className="truncate text-sm font-semibold">{project.name}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{project.description}</p></div><span className="text-xs text-muted">{project.category}</span><span className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold ${project.status === "live" ? "bg-emerald-500/10 text-emerald-700" : "bg-amber-500/10 text-amber-700"}`}>{project.status === "live" ? "Live" : "In development"}</span><span className="flex gap-1"><button type="button" aria-label={`Edit ${project.name}`} onClick={() => { setMessage(""); setForm(formFrom(project)); }} className="rounded-lg p-2 text-muted hover:text-brand-600"><Pencil className="h-4 w-4" /></button><button type="button" aria-label={`Delete ${project.name}`} onClick={() => void remove(project)} className="rounded-lg p-2 text-muted hover:text-rose-600"><Trash2 className="h-4 w-4" /></button></span></li>)}</ul> : <p className="p-8 text-center text-sm text-muted">No client projects yet. Add the first one above.</p>}
      </div>
    </section>
  );
}
