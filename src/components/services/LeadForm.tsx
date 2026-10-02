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

function LeadPhoneField({
  control,
  label,
  hint,
  error,
}: {
  control: Control<LeadInput>;
  label?: string;
  hint?: string;
  error?: string;
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
        <span className="text-sm font-medium text-foreground">{label}</span>
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
    formState: { errors },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    mode: isDynamic ? "onChange" : "onSubmit",
    defaultValues: { service },
  });

  const values = useWatch({ control });
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
        body: JSON.stringify(data),
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
        <form onSubmit={handleSubmit(onSubmit)} className="relative flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-semibold tracking-tight">{isContact ? contactTitle : "Tell us about your project or enquiry"}</h3>
            {isContact && <p className="text-sm text-muted">{contactDescription}</p>}
          </div>

          <input type="hidden" {...register("service")} />

          {isContact ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Full Name" placeholder="Your full name" {...register("name")} error={errors.name?.message} />
                <Input label="Work Email" type="email" placeholder="you@company.com" {...register("email")} error={errors.email?.message} />
              </div>
              <LeadPhoneField control={control} label="Phone (WhatsApp)" hint={contactPhoneHint} error={errors.phone?.message} />
              {contactMode === "enquiry" ? (
                <>
                  <Input label="Company (optional)" placeholder="Your company name" {...register("company")} />
                  <Textarea label="Tell us about your goals" rows={2} placeholder="What are you hoping to achieve?" {...register("goals")} />
                  <Textarea label="Tell us about your project / enquiry" rows={3} placeholder="Share details about your project or enquiry..." {...register("message")} />
                </>
              ) : (
                <Textarea
                  label={contactMode === "feedback" ? "Your feedback" : "Course and payment question"}
                  rows={4}
                  placeholder={contactMode === "feedback" ? "Share your feedback..." : "Which course are you interested in, and what would you like to know?"}
                  {...register("message")}
                />
              )}
            </>
          ) : isDynamic ? (
            <>
              <FieldRow label="Full name" valid={fieldValid.name}>
                <Input placeholder="Your name" {...register("name")} error={errors.name?.message} />
              </FieldRow>
              <FieldRow label="Work email" valid={fieldValid.email}>
                <Input type="email" placeholder="you@company.com" {...register("email")} error={errors.email?.message} />
              </FieldRow>
              <FieldRow label="Phone (WhatsApp)" valid={fieldValid.phone}>
                <LeadPhoneField
                  hint="Add a WhatsApp number if you would like to continue the enquiry there."
                  control={control}
                  error={errors.phone?.message}
                />
              </FieldRow>
              <Input label="Company (optional)" placeholder="Company name" {...register("company")} />
              <Textarea label="Tell us about your goals (optional)" rows={3} placeholder="What are you hoping to achieve?" {...register("message")} />
            </>
          ) : (
            <>
              <Input label="Full name" placeholder="Your name" {...register("name")} error={errors.name?.message} />
              <Input label="Work email" type="email" placeholder="you@company.com" {...register("email")} error={errors.email?.message} />
              <LeadPhoneField
                control={control}
                label="Phone (WhatsApp)"
                hint="Add a WhatsApp number if you would like to continue the enquiry there."
                error={errors.phone?.message}
              />
              <Input label="Company (optional)" placeholder="Company name" {...register("company")} />
              <Textarea label="Tell us about your goals (optional)" rows={3} placeholder="What are you hoping to achieve?" {...register("message")} />
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
