"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CheckCircle2, ChevronDown, Paperclip, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { projectRequestSchema, type ProjectRequestInput } from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PhoneInput } from "@/components/ui/PhoneInput";

type Service = ProjectRequestInput["service"];
const labels: Record<Service, string> = { web: "Web Development", mobile: "Mobile App Development", software: "Custom Software", marketing: "Digital Marketing" };
const typeOptions: Record<Service, string[]> = {
  web: ["Business website", "E-commerce", "Portfolio", "Landing page", "Booking website", "SaaS / web app", "Custom web application"],
  mobile: ["E-commerce", "Booking", "Delivery", "Education", "Finance", "Healthcare", "Marketplace", "Custom application"],
  software: ["Desktop application", "ERP", "CRM", "Inventory", "Billing", "Employee management", "Workflow automation", "Custom enterprise software"],
  marketing: ["Social media marketing", "Paid advertising", "SEO", "Lead generation", "Content strategy", "Analytics & reporting"],
};
const features: Record<Service, string[]> = {
  web: ["User login", "Admin dashboard", "Payment gateway", "Shopping cart", "Booking system", "WhatsApp integration", "API integration", "CMS"],
  mobile: ["Login / registration", "OTP", "Push notifications", "Payment gateway", "Location / GPS", "Chat", "Admin panel", "Subscription"],
  software: ["Multi-user access", "Database", "Reports", "Admin panel", "Offline mode", "API integration", "Role permissions", "Data import"],
  marketing: ["Instagram", "Google Ads", "Meta Ads", "SEO", "Content creation", "Video / reels", "WhatsApp campaigns", "Analytics"],
};
const budget = ["Not decided yet", "Under ₹25,000", "₹25,000–₹50,000", "₹50,000–₹1,00,000", "₹1,00,000–₹2,00,000", "₹2,00,000+"];
const timeline = ["Flexible", "ASAP", "Within 2 weeks", "Within 1 month", "1–3 months", "3+ months"];

export function openProjectRequest(service: Service) { window.dispatchEvent(new CustomEvent("myloginn:project-request", { detail: service })); }

export function ProjectRequestModal() {
  const [service, setService] = useState<Service | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [open, setOpen] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const { register, control, handleSubmit, reset, setValue, trigger, formState: { errors, isSubmitting } } = useForm<ProjectRequestInput>({ resolver: zodResolver(projectRequestSchema), mode: "onTouched" });

  useEffect(() => {
    const open = (event: Event) => { const nextService = (event as CustomEvent<Service>).detail; setService(nextService); setFiles([]); setServerError(null); setOpen(0); reset({ service: nextService, requirements: [] }); };
    window.addEventListener("myloginn:project-request", open);
    return () => window.removeEventListener("myloginn:project-request", open);
  }, [reset]);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 7000);
    return () => window.clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (!service) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setService(null);
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", close);
    };
  }, [service]);

  const selected = useWatch({ control, name: "requirements" }) ?? [];
  const phoneValue = useWatch({ control, name: "phone" }) ?? "";
  const whatsappValue = useWatch({ control, name: "whatsapp" }) ?? "";
  const nameValue = useWatch({ control, name: "name" }) ?? "";
  const emailValue = useWatch({ control, name: "email" }) ?? "";
  const descriptionValue = useWatch({ control, name: "description" }) ?? "";
  const typeValue = useWatch({ control, name: "projectType" }) ?? "";
  const phoneOk = phoneValue.replace(/\D/g, "").length >= 8;
  const nameOk = nameValue.trim().length >= 2;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailValue.trim());
  const descOk = descriptionValue.trim().length >= 20;
  const contactDone = nameOk && emailOk && phoneOk;
  const projectDone = descOk;
  const requiredDone = [nameOk, emailOk, phoneOk, descOk].filter(Boolean).length;
  const goNext = async (from: number) => { const fields = from === 0 ? (["name", "email", "phone"] as const) : (["description", "currentUrl"] as const); if (await trigger([...fields])) setOpen(from + 1); };
  const onInvalid = (errs: typeof errors) => { setOpen(errs.name || errs.email || errs.phone ? 0 : errs.description || errs.currentUrl ? 1 : 2); };
  if (!service) return toast ? <SubmittedToast reference={toast} onClose={() => setToast(null)} /> : null;
  const toggle = (value: string) => setValue("requirements", selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value], { shouldValidate: true });
  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const candidates = Array.from(list);
    if (candidates.some((file) => file.size > 5 * 1024 * 1024)) { setServerError("Each attachment must be 5 MB or smaller."); return; }
    if (files.length + candidates.length > 4) { setServerError("You can attach up to four files."); return; }
    setServerError(null); setFiles((current) => [...current, ...candidates]);
  };
  async function submit(data: ProjectRequestInput) {
    setServerError(null); const payload = new FormData(); payload.append("data", JSON.stringify({ ...data, service })); files.forEach((file) => payload.append("attachments", file));
    const response = await fetch("/api/project-requests", { method: "POST", body: payload }); const result = await response.json().catch(() => ({}));
    if (!response.ok) { setServerError(result.error ?? "Unable to submit your request."); return; } setService(null); setToast(result.request?.requestId ?? result.requestId);
  }

  return <div className="fixed inset-0 z-[100] flex items-end bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="project-request-title" onMouseDown={(e) => e.target === e.currentTarget && setService(null)}>
    <div className="relative flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-background shadow-2xl sm:rounded-3xl">
      <div className="flex items-start justify-between border-b border-border-soft px-5 py-4 sm:px-7"><div><p className="story-eyebrow">Project request</p><h2 id="project-request-title" className="mt-1 text-xl font-semibold">{labels[service]}</h2></div><button type="button" aria-label="Close request form" onClick={() => setService(null)} className="rounded-full p-2 text-danger transition hover:bg-danger/10"><X className="h-5 w-5" /></button></div>
              <form onSubmit={handleSubmit(submit, onInvalid)} className="flex min-h-0 flex-1 flex-col" noValidate>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
            <input type="hidden" {...register("service")} value={service} />

            <Section n={1} title="Your contact details" hint={contactDone ? `${nameValue.trim()} · ${emailValue.trim()}` : "Name, email and phone"} done={contactDone} open={open === 0} onToggle={() => setOpen(open === 0 ? -1 : 0)} problem={Boolean(errors.name || errors.email || errors.phone)}>
              <div className="grid gap-4 sm:grid-cols-2"><Input label="Full name *" {...register("name")} error={errors.name?.message} /><Input label="Business / company" {...register("company")} /><Input label="Email address *" type="email" {...register("email")} error={errors.email?.message} /><Controller control={control} name="phone" render={({ field }) => <PhoneInput label="Phone number *" hint="Include your country code. We only use it to discuss this request." value={field.value ?? ""} onChange={field.onChange} onBlur={field.onBlur} error={errors.phone?.message} />} /><div className="flex flex-col gap-1.5"><Controller control={control} name="whatsapp" render={({ field }) => <PhoneInput label="WhatsApp number" hint="Optional. Leave empty if it is the same as your phone." value={field.value ?? ""} onChange={field.onChange} onBlur={field.onBlur} />} />{phoneValue && whatsappValue !== phoneValue && <button type="button" onClick={() => setValue("whatsapp", phoneValue, { shouldValidate: true })} className="self-start rounded-full bg-story-mist px-3 py-1 text-xs font-semibold text-story-royal transition-colors hover:bg-story-royal hover:text-white active:scale-95">Same as phone number</button>}</div><Select label="Preferred contact" options={["Phone", "WhatsApp", "Email"].map(value => ({ value, label: value }))} placeholder="Choose one" {...register("preferredContact")} /></div>
              <div className="mt-4 flex justify-end"><Button type="button" size="sm" onClick={() => goNext(0)}>Continue</Button></div>
            </Section>

            <Section n={2} title="About your project" hint={projectDone ? (typeValue || "Description added") : "Describe what you want to build"} done={projectDone} open={open === 1} onToggle={() => setOpen(open === 1 ? -1 : 1)} problem={Boolean(errors.description || errors.currentUrl)}>
              <div className="grid gap-4 sm:grid-cols-2"><Input label="Project / campaign name" {...register("projectName")} /><Input label="Business / industry" {...register("industry")} /><Select label="Project type" options={typeOptions[service].map(value => ({ value, label: value }))} placeholder="Choose a type" {...register("projectType")} /><Select label={service === "mobile" ? "Platform" : "Timeline"} options={(service === "mobile" ? ["Android", "iOS", "Android + iOS", "Mobile web app"] : timeline).map(value => ({ value, label: value }))} placeholder="Choose one" {...(service === "mobile" ? register("platform") : register("timeline"))} /><div className="sm:col-span-2"><Textarea label="Project description *" rows={4} placeholder="Tell us what you want to build or achieve." {...register("description")} error={errors.description?.message} /></div><Input label="Main objective" {...register("objective")} /><Input label="Target audience" {...register("targetAudience")} /><Input label="Current website URL" placeholder="https://" {...register("currentUrl")} error={errors.currentUrl?.message} /><Select label="Budget range" options={budget.map(value => ({ value, label: value }))} placeholder="Optional" {...register("budget")} /></div>
              <div className="mt-4 flex justify-between gap-2"><Button type="button" size="sm" variant="ghost" onClick={() => setOpen(0)}>Back</Button><Button type="button" size="sm" onClick={() => goNext(1)}>Continue</Button></div>
            </Section>

            <Section n={3} title="Features and files" hint={selected.length || files.length ? `${selected.length} selected · ${files.length} file${files.length === 1 ? "" : "s"}` : "Optional: features, notes and attachments"} done={selected.length > 0} open={open === 2} onToggle={() => setOpen(open === 2 ? -1 : 2)} problem={Boolean(errors.additionalNotes)}>
              <fieldset><legend className="text-sm font-semibold">Features or services needed</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{features[service].map(item => <label key={item} className="flex cursor-pointer items-center gap-2.5 rounded-xl border-[1.5px] border-border-soft bg-surface-2 px-3.5 py-3 text-sm font-medium transition hover:border-brand-500 has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50 has-[:checked]:text-brand-700 dark:has-[:checked]:bg-brand-900/25"><input type="checkbox" checked={selected.includes(item)} onChange={() => toggle(item)} className="h-4 w-4 accent-brand-600" />{item}</label>)}</div></fieldset>
              <Textarea className="mt-5" label="Anything else we should know?" rows={3} {...register("additionalNotes")} error={errors.additionalNotes?.message} />
              <div className="mt-5 rounded-2xl border border-dashed border-brand-300 bg-brand-50/35 p-4 dark:bg-brand-900/10"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-medium">Supporting files</p><p className="text-xs text-muted">Briefs, wireframes, logos or references. Up to 4 files, 5 MB each.</p></div><Button type="button" size="sm" variant="secondary" icon={<Paperclip className="h-4 w-4" />} onClick={() => fileInput.current?.click()}>Attach files</Button></div><input ref={fileInput} type="file" className="sr-only" multiple accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp" onChange={(event) => { addFiles(event.target.files); event.target.value = ""; }} />{files.length > 0 && <ul className="mt-3 space-y-1.5">{files.map((file, index) => <li key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-xs"><span className="truncate pr-3">{file.name}</span><button type="button" onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))} className="font-medium text-danger">Remove</button></li>)}</ul>}</div>
              <div className="mt-4 flex justify-start"><Button type="button" size="sm" variant="ghost" onClick={() => setOpen(1)}>Back</Button></div>
            </Section>

            {serverError && <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">{serverError}</p>}
          </div>

          <div className="flex shrink-0 items-center gap-3 border-t border-border-soft bg-background px-4 py-3 sm:px-6" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
            <div className="min-w-0 flex-1" aria-live="polite">
              <p className="text-left text-xs font-semibold text-muted"><span className="text-danger">*</span> {requiredDone} of 4 required fields</p>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-border-soft"><motion.div className="h-full rounded-full bg-story-royal" initial={false} animate={{ width: `${(requiredDone / 4) * 100}%` }} transition={{ duration: 0.4 }} /></div>
            </div>
            <Button variant="cancel" onClick={() => setService(null)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Sending…" : "Submit request"}</Button>
          </div>
        </form>
    </div>
  </div>;
}

/** Shown after a request is sent: the form has already closed, and this goes away by itself. */
function SubmittedToast({ reference, onClose }: { reference: string; onClose: () => void }) {
  return (
    <div role="status" className="fixed inset-x-4 bottom-24 z-[110] mx-auto flex max-w-sm items-start gap-3 rounded-2xl border border-border-soft bg-surface p-4 shadow-[var(--shadow-lift)] lg:inset-x-auto lg:bottom-6 lg:right-6 lg:mx-0">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Request submitted</p>
        <p className="mt-0.5 text-xs text-muted">Our team will contact you soon. Reference <span className="font-mono font-semibold text-brand-600">{reference}</span></p>
      </div>
      <button type="button" onClick={onClose} aria-label="Dismiss" className="rounded-full p-1 text-muted transition hover:bg-surface-2"><X className="h-4 w-4" /></button>
    </div>
  );
}

/** One collapsible block of the request form: a numbered header that shows what is filled in, and a body that opens smoothly. */
function Section({ n, title, hint, done, open, onToggle, problem, children }: { n: number; title: string; hint: string; done: boolean; open: boolean; onToggle: () => void; problem: boolean; children: React.ReactNode }) {
  return (
    <section className={cn("rounded-2xl border bg-surface transition-colors duration-300", problem ? "border-danger/50" : open ? "border-story-royal/40" : "border-border-soft")}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-3 px-4 py-3 text-left">
        <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors duration-300", done ? "bg-emerald-500 text-white" : open ? "bg-story-royal text-white" : "bg-story-mist text-muted")}>
          {done ? <Check className="h-4 w-4" strokeWidth={3} /> : n}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">{title}</span>
          <span className="block truncate text-xs text-muted">{hint}</span>
        </span>
        {problem && <span className="shrink-0 rounded-full bg-danger/10 px-2 py-0.5 text-[11px] font-semibold text-danger">Needs attention</span>}
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted transition-transform duration-300", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
