"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ChevronLeft, ChevronRight, Paperclip, X } from "lucide-react";
import { projectRequestSchema, type ProjectRequestInput } from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

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
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const { register, control, handleSubmit, reset, setValue, trigger, formState: { errors, isSubmitting } } = useForm<ProjectRequestInput>({ resolver: zodResolver(projectRequestSchema) });

  useEffect(() => {
    const open = (event: Event) => { const nextService = (event as CustomEvent<Service>).detail; setService(nextService); setStep(1); setFiles([]); setRequestId(null); setServerError(null); reset({ service: nextService, requirements: [] }); };
    window.addEventListener("myloginn:project-request", open);
    return () => window.removeEventListener("myloginn:project-request", open);
  }, [reset]);
  useEffect(() => {
    if (!service) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setService(null);
    document.body.style.overflow = "hidden"; window.addEventListener("keydown", close);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", close); };
  }, [service]);

  const selected = useWatch({ control, name: "requirements" }) ?? [];
  if (!service) return null;
  const toggle = (value: string) => setValue("requirements", selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value], { shouldValidate: true });
  const next = async () => { const fields = step === 1 ? ["name", "email", "phone"] as const : ["description"] as const; if (await trigger(fields)) setStep((current) => Math.min(3, current + 1)); };
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
    if (!response.ok) { setServerError(result.error ?? "Unable to submit your request."); return; } setRequestId(result.request?.requestId ?? result.requestId);
  }

  return <div className="fixed inset-0 z-[100] flex items-end bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="project-request-title" onMouseDown={(e) => e.target === e.currentTarget && setService(null)}>
    <div className="relative flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-background shadow-2xl sm:rounded-3xl">
      <div className="flex items-start justify-between border-b border-border-soft px-5 py-4 sm:px-7"><div><p className="story-eyebrow">Project request</p><h2 id="project-request-title" className="mt-1 text-xl font-semibold">{labels[service]}</h2></div><button type="button" aria-label="Close request form" onClick={() => setService(null)} className="rounded-full p-2 text-muted transition hover:bg-surface-2 hover:text-foreground"><X className="h-5 w-5" /></button></div>
      {requestId ? <div className="flex flex-col items-center gap-3 overflow-y-auto px-6 py-14 text-center"><CheckCircle2 className="h-14 w-14 text-success" /><h3 className="text-xl font-semibold">Your request is submitted.</h3><p className="max-w-md text-sm text-muted">Our team will review your {labels[service].toLowerCase()} requirements and contact you using your preferred method.</p><p className="rounded-xl bg-surface-2 px-4 py-3 font-mono text-sm font-semibold text-brand-600">{requestId}</p><Button onClick={() => setService(null)} variant="secondary">Close</Button></div> :
        <form onSubmit={handleSubmit(submit)} className="overflow-y-auto px-5 py-5 sm:px-7">
          <div className="mb-6 flex gap-2" aria-label={`Step ${step} of 3`}>{["Contact", "Project goals", "Requirements"].map((label, index) => <div key={label} className="min-w-0 flex-1"><div className={`h-1 rounded-full ${index < step ? "brand-gradient-bg" : "bg-surface-2"}`} /><p className={`mt-1.5 truncate text-xs ${index + 1 === step ? "font-semibold text-brand-600" : "text-muted"}`}>{index + 1}. {label}</p></div>)}</div>
          <input type="hidden" {...register("service")} value={service} />
          {step === 1 && <div className="grid gap-4 sm:grid-cols-2"><Input label="Full name *" {...register("name")} error={errors.name?.message} /><Input label="Business / company" {...register("company")} /><Input label="Email address *" type="email" {...register("email")} error={errors.email?.message} /><Input label="Phone number *" placeholder="+91 98765 43210" {...register("phone")} error={errors.phone?.message} /><Input label="WhatsApp number" {...register("whatsapp")} /><Select label="Preferred contact" options={["Phone", "WhatsApp", "Email"].map(value => ({ value, label: value }))} placeholder="Choose one" {...register("preferredContact")} /></div>}
          {step === 2 && <div className="grid gap-4 sm:grid-cols-2"><Input label="Project / campaign name" {...register("projectName")} /><Input label="Business / industry" {...register("industry")} /><Select label="Project type" options={typeOptions[service].map(value => ({ value, label: value }))} placeholder="Choose a type" {...register("projectType")} /><Select label={service === "mobile" ? "Platform" : "Timeline"} options={(service === "mobile" ? ["Android", "iOS", "Android + iOS", "Mobile web app"] : timeline).map(value => ({ value, label: value }))} placeholder="Choose one" {...(service === "mobile" ? register("platform") : register("timeline"))} /><div className="sm:col-span-2"><Textarea label="Project description *" rows={5} placeholder="Tell us what you want to build or achieve." {...register("description")} error={errors.description?.message} /></div><Input label="Main objective" {...register("objective")} /><Input label="Target audience" {...register("targetAudience")} /><Input label="Current website URL" placeholder="https://" {...register("currentUrl")} error={errors.currentUrl?.message} /><Select label="Budget range" options={budget.map(value => ({ value, label: value }))} placeholder="Optional" {...register("budget")} /></div>}
          {step === 3 && <><fieldset><legend className="font-semibold">Features or services needed</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{features[service].map(item => <label key={item} className="flex cursor-pointer items-center gap-2 rounded-xl border border-border-soft bg-surface px-3 py-2.5 text-sm transition hover:border-brand-300"><input type="checkbox" checked={selected.includes(item)} onChange={() => toggle(item)} className="h-4 w-4 accent-brand-500" />{item}</label>)}</div></fieldset><Textarea className="mt-5" label="Anything else we should know?" rows={4} {...register("additionalNotes")} error={errors.additionalNotes?.message} /><div className="mt-5 rounded-2xl border border-dashed border-brand-300 bg-brand-50/35 p-4 dark:bg-brand-900/10"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-medium">Supporting files</p><p className="text-xs text-muted">Briefs, wireframes, logos or references — up to 4 files, 5 MB each.</p></div><Button type="button" size="sm" variant="secondary" icon={<Paperclip className="h-4 w-4" />} onClick={() => fileInput.current?.click()}>Attach files</Button></div><input ref={fileInput} type="file" className="sr-only" multiple accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp" onChange={(event) => { addFiles(event.target.files); event.target.value = ""; }} />{files.length > 0 && <ul className="mt-3 space-y-1.5">{files.map((file, index) => <li key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-xs"><span className="truncate pr-3">{file.name}</span><button type="button" onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))} className="font-medium text-danger">Remove</button></li>)}</ul>}</div></>}
          {serverError && <p className="mt-4 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">{serverError}</p>}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><Button variant="ghost" onClick={() => step === 1 ? setService(null) : setStep((current) => current - 1)} icon={step > 1 ? <ChevronLeft className="h-4 w-4" /> : undefined}>{step > 1 ? "Back" : "Cancel"}</Button>{step < 3 ? <Button type="button" onClick={next} icon={<ChevronRight className="h-4 w-4" />}>Continue</Button> : <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting request…" : "Submit project request"}</Button>}</div>
        </form>}
    </div>
  </div>;
}
