"use client";

import { useState } from "react";
import { Controller, useForm, useWatch, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { AnimatedChat } from "@/components/ui/icons/AnimatedChat";
import { leadSchema, type LeadInput } from "@/lib/validation";
import { Input, Textarea } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Card";
import { AnimatedSuccess } from "@/components/ui/icons/AnimatedSuccess";
import { cn } from "@/lib/cn";
import { suggestEmail } from "@/lib/emailCheck";

function LeadPhoneField({
  control,
  label,
  hint,
  error,
  valid,
}: {
  control: Control<LeadInput>;
  label?: string;
  hint?: string;
  error?: string;
  valid?: boolean;
}) {
  return (
    <Controller
      control={control}
      name="phone"
      render={({ field }) => (
        <PhoneInput
          label={label}
          hint={hint}
          error={error}
          valid={valid}
          value={field.value ?? ""}
          onChange={field.onChange}
          onBlur={field.onBlur}
        />
      )}
    />
  );
}

function FieldRow({
  label,
  valid,
  children,
}: {
  label: string;
  valid: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="field-label">{label}</span>
        <AnimatePresence>
          {valid && (
            <motion.span
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="text-success"
            >
              <CheckCircle2 className="h-4 w-4" />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      {children}
    </div>
  );
}

export function LeadForm({
  service,
  variant = "default",
  contactMode = "enquiry",
}: {
  service: string;
  variant?: "default" | "dynamic" | "contact";
  contactMode?: "enquiry" | "payment" | "feedback";
}) {
  const [submitted, setSubmitted] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openedAt] = useState(() => Date.now());

  const isDynamic = variant === "dynamic";
  const isContact = variant === "contact";
  const contactTitle = contactMode === "feedback"
    ? "Share your feedback"
    : contactMode === "payment"
      ? "Ask about course payment options"
      : "Send Us a Message";
  const contactDescription = contactMode === "feedback"
    ? "Tell us about your experience with MyLoginn."
    : contactMode === "payment"
      ? "Share the course you are interested in and ask us about available payment options."
      : "Fill in the form and our team will get back to you shortly.";
  const contactPhoneHint = contactMode === "enquiry"
    ? "Add a WhatsApp number if you would like to continue the enquiry there."
    : "Add a phone number if you would like our team to follow up.";

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    mode: isDynamic ? "onChange" : "onTouched",
    defaultValues: { service },
  });

  const values = useWatch({ control });
  const ok = (key: "name" | "email" | "phone" | "company") => Boolean(values[key]) && !errors[key] && leadSchema.shape[key].safeParse(values[key]).success;
  const emailSuggestion = values.email && ok("email") ? suggestEmail(values.email) : null;
  const emailHint = emailSuggestion
    ? <>Did you mean <button type="button" onClick={() => setValue("email", emailSuggestion, { shouldValidate: true })} className="font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-600">{emailSuggestion}</button>?</>
    : undefined;
  const fieldValid = {
    name: Boolean(values.name) && !errors.name,
    email: Boolean(values.email) && !errors.email,
    phone: Boolean(values.phone) && !errors.phone,
  };
  async function onSubmit(data: LeadInput) {
    setLoading(true);
    setServerError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, startedAt: openedAt }),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error ?? "Something went wrong");
        return;
      }
      setWhatsappLink(json.whatsappLink);
      setSubmitted(true);
    } catch {
      setServerError("We couldn't send your enquiry. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard className={cn(
      "relative overflow-hidden p-7 sm:p-8",
      isContact && "!rounded-none !border-0 !bg-transparent !p-0 !shadow-none !backdrop-blur-none"
    )}>
      {isDynamic && (
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[radial-gradient(circle,var(--brand-300),transparent_70%)] opacity-25 blur-2xl" />
      )}
      {submitted ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3 py-6 text-center">
          <AnimatedSuccess once className="h-14.5 w-14.5" />
          <p className="text-lg font-semibold">Thanks — we&apos;ll be in touch!</p>
          <p className="max-w-xs text-sm text-muted">
            The MyLoginn team will review your enquiry and follow up using the contact details provided.
          </p>
          {whatsappLink && (
            <Button href={whatsappLink} target="_blank" rel="noopener noreferrer" variant="secondary" icon={<AnimatedChat className="h-5.5 w-5.5" />}>
              Continue on WhatsApp
            </Button>
          )}
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="relative flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <span aria-hidden="true" className="mb-2 flex h-1 w-16 gap-0.5 overflow-hidden rounded-full"><i className="flex-1 bg-[#2563eb]" /><i className="flex-1 bg-[#7c3aed]" /><i className="flex-1 bg-[#059669]" /><i className="flex-1 bg-[#d97706]" /><i className="flex-1 bg-[#e11d48]" /></span><h3 className="text-xl font-semibold tracking-tight sm:text-2xl">{isContact ? contactTitle : "Tell us about your project or enquiry"}</h3>
            {isContact && <p className="text-sm text-muted">{contactDescription}</p>}
          </div>

          <input type="hidden" {...register("service")} />
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Leave this field empty<input type="text" tabIndex={-1} autoComplete="off" {...register("website")} /></label></div>

          {isContact ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Full Name" placeholder="Your full name" autoComplete="name" maxLength={80} valid={ok("name")} {...register("name")} error={errors.name?.message} />
                <Input label="Work Email" type="email" placeholder="you@company.com" autoComplete="email" inputMode="email" valid={ok("email")} hint={emailHint} {...register("email")} error={errors.email?.message} />
              </div>
              <LeadPhoneField control={control} label="Phone (WhatsApp)" hint={contactPhoneHint} valid={ok("phone")} error={errors.phone?.message} />
              {contactMode === "enquiry" ? (
                <>
                  <Input label="Company (optional)" placeholder="Your company name" autoComplete="organization" maxLength={100} {...register("company")} error={errors.company?.message} />
                  <Textarea label="Tell us about your goals" rows={2} maxLength={1000} placeholder="What are you hoping to achieve?" {...register("goals")} error={errors.goals?.message} />
                  <Textarea label="Tell us about your project / enquiry" rows={3} maxLength={1000} placeholder="Share details about your project or enquiry..." {...register("message")} error={errors.message?.message} />
                </>
              ) : (
                <Textarea
                  label={contactMode === "feedback" ? "Your feedback" : "Course and payment question"}
                  rows={4}
                  maxLength={1000}
                  placeholder={contactMode === "feedback" ? "Share your feedback..." : "Which course are you interested in, and what would you like to know?"}
                  {...register("message")}
                  error={errors.message?.message}
                />
              )}
            </>
          ) : isDynamic ? (
            <>
              <FieldRow label="Full name" valid={fieldValid.name}>
                <Input placeholder="Your name" autoComplete="name" maxLength={80} {...register("name")} error={errors.name?.message} />
              </FieldRow>
              <FieldRow label="Work email" valid={fieldValid.email}>
                <Input type="email" placeholder="you@company.com" autoComplete="email" inputMode="email" hint={emailHint} {...register("email")} error={errors.email?.message} />
              </FieldRow>
              <FieldRow label="Phone (WhatsApp)" valid={fieldValid.phone}>
                <LeadPhoneField
                  hint="Add a WhatsApp number if you would like to continue the enquiry there."
                  control={control}
                  error={errors.phone?.message}
                />
              </FieldRow>
              <Input label="Company (optional)" placeholder="Company name" autoComplete="organization" maxLength={100} {...register("company")} error={errors.company?.message} />
              <Textarea label="Tell us about your goals (optional)" rows={3} maxLength={1000} placeholder="What are you hoping to achieve?" {...register("message")} error={errors.message?.message} />
            </>
          ) : (
            <>
              <Input label="Full name" placeholder="Your name" autoComplete="name" maxLength={80} valid={ok("name")} {...register("name")} error={errors.name?.message} />
              <Input label="Work email" type="email" placeholder="you@company.com" autoComplete="email" inputMode="email" valid={ok("email")} hint={emailHint} {...register("email")} error={errors.email?.message} />
              <LeadPhoneField
                control={control}
                label="Phone (WhatsApp)"
                hint="Add a WhatsApp number if you would like to continue the enquiry there."
                valid={ok("phone")}
                error={errors.phone?.message}
              />
              <Input label="Company (optional)" placeholder="Company name" autoComplete="organization" maxLength={100} {...register("company")} error={errors.company?.message} />
              <Textarea label="Tell us about your goals (optional)" rows={3} maxLength={1000} placeholder="What are you hoping to achieve?" {...register("message")} error={errors.message?.message} />
            </>
          )}

          {serverError && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{serverError}</p>}
          <Button
            type="submit"
            size="lg"
            className={cn("w-full", isDynamic && "bg-size-200")}
            disabled={loading}
          >
            {loading
              ? "Sending…"
              : isContact && contactMode === "feedback"
                ? "Send Feedback"
                : isContact && contactMode === "payment"
                  ? "Ask about payment options"
                  : isContact
                    ? "Send Message"
                    : "Request consultation"}
          </Button>
        </form>
      )}
    </GlassCard>
  );
}
