"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { AnimatedChat } from "@/components/ui/icons/AnimatedChat";
import { leadSchema, type LeadInput } from "@/lib/validation";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Card";
import { AnimatedSuccess } from "@/components/ui/icons/AnimatedSuccess";
import { cn } from "@/lib/cn";

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
}: {
  service: string;
  variant?: "default" | "dynamic";
}) {
  const [submitted, setSubmitted] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isDynamic = variant === "dynamic";

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
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard className="relative overflow-hidden p-7 sm:p-8">
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
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Tell us about your project or enquiry</h3>
          </div>

          <input type="hidden" {...register("service")} />

          {isDynamic ? (
            <>
              <FieldRow label="Full name" valid={fieldValid.name}>
                <Input placeholder="Your name" {...register("name")} error={errors.name?.message} />
              </FieldRow>
              <FieldRow label="Work email" valid={fieldValid.email}>
                <Input type="email" placeholder="you@company.com" {...register("email")} error={errors.email?.message} />
              </FieldRow>
              <FieldRow label="Phone (WhatsApp)" valid={fieldValid.phone}>
                <Input
                  placeholder="+91 98765 43210"
                  hint="Add a WhatsApp number if you would like to continue the enquiry there."
                  {...register("phone")}
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
              <Input
                label="Phone (WhatsApp)"
                placeholder="+91 98765 43210"
                hint="Add a WhatsApp number if you would like to continue the enquiry there."
                {...register("phone")}
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
            {loading ? "Sending…" : "Request consultation"}
          </Button>
        </form>
      )}
    </GlassCard>
  );
}
