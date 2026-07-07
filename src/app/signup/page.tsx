"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Mail, Smartphone, UserPlus } from "lucide-react";
import { signupSchema, type SignupInput } from "@/lib/validation";
import { formatPhoneDisplay } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Card";
import { IconBadge } from "@/components/ui/IconBadge";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { OtpInput } from "@/components/ui/OtpInput";
import { PasswordInput } from "@/components/ui/PasswordInput";

type Step = "details" | "verify" | "success";
type Channel = "phone" | "email";

const stepVariants = {
  enter: { opacity: 0, x: 16 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
};

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState<Channel>("phone");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [devCode, setDevCode] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: "STUDENT", phone: "" },
  });

  const identifier = channel === "phone" ? phone : email;

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function requestCode(nextChannel: Channel, ident: string) {
    setOtpError(null);
    setDevCode(null);
    setRequesting(true);
    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: ident, purpose: "signup", channel: nextChannel }),
      });
      const json = await res.json();
      if (!res.ok) {
        setOtpError(json.error ?? "Couldn't send code");
        setCooldown(json.retryAfterSeconds ?? 0);
        return;
      }
      setDevCode(json.devCode ?? null);
      setCooldown(30);
    } finally {
      setRequesting(false);
    }
  }

  async function onDetailsSubmit(data: SignupInput) {
    setServerError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error ?? "Something went wrong");
        return;
      }
      setEmail(data.email);
      setPhone(data.phone);
      setChannel("phone");
      setOtp("");
      setStep("verify");
      await requestCode("phone", data.phone);
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyCode(code: string) {
    setOtpError(null);
    setVerifying(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, purpose: "signup", channel, code }),
      });
      const json = await res.json();
      if (!res.ok) {
        setOtpError(json.error ?? "Invalid code");
        return;
      }
      setStep("success");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1100);
    } finally {
      setVerifying(false);
    }
  }

  function switchChannel() {
    const next: Channel = channel === "phone" ? "email" : "phone";
    setChannel(next);
    setOtp("");
    setOtpError(null);
    requestCode(next, next === "phone" ? phone : email);
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-5 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_0%,var(--brand-100),transparent_70%)] dark:bg-[radial-gradient(50%_50%_at_50%_0%,rgba(108,77,255,0.14),transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <GlassCard className="p-6 sm:p-8">
          {step !== "success" && (
            <div className="mb-6 flex gap-2">
              {(["details", "verify"] as Step[]).map((s, i) => (
                <motion.div
                  key={s}
                  className={cn(
                    "h-1.5 flex-1 rounded-full",
                    (s === "details" && (step === "details" || step === "verify")) ||
                      (s === "verify" && step === "verify")
                      ? "brand-gradient-bg"
                      : "bg-surface-2"
                  )}
                  initial={false}
                  animate={{ opacity: i === 0 || step === "verify" ? 1 : 0.5 }}
                />
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === "details" && (
              <motion.div
                key="details"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-center gap-2">
                  <IconBadge size="sm" className="text-brand-500 dark:text-brand-400">
                    <UserPlus className="h-6.5 w-6.5" />
                  </IconBadge>
                  <h1 className="text-xl font-semibold">Create your account</h1>
                </div>
                <p className="mt-2 text-sm text-muted">
                  Join MyLoginn to start learning, tutoring or applying for internships.
                </p>

                <form onSubmit={handleSubmit(onDetailsSubmit)} className="mt-7 flex flex-col gap-4">
                  <Input label="Full name" placeholder="Aarav Sharma" {...register("name")} error={errors.name?.message} />
                  <Input label="Email address" type="email" placeholder="you@example.com" {...register("email")} error={errors.email?.message} />
                  <Controller
                    control={control}
                    name="phone"
                    render={({ field }) => (
                      <PhoneInput
                        label="Phone number"
                        hint="We'll text a verification code here — real-time via SMS."
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        onCountryChange={(iso2) => setValue("country", iso2)}
                        error={errors.phone?.message}
                      />
                    )}
                  />
                  <PasswordInput label="Password" placeholder="••••••••" {...register("password")} error={errors.password?.message} />
                  <PasswordInput
                    label="Confirm password"
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                    error={errors.confirmPassword?.message}
                  />
                  <Select
                    label="I am joining as"
                    options={[
                      { label: "Student / Learner", value: "STUDENT" },
                      { label: "Mentor", value: "MENTOR" },
                    ]}
                    {...register("role")}
                  />

                  {serverError && (
                    <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{serverError}</p>
                  )}

                  <Button type="submit" size="lg" className="mt-1 w-full" disabled={submitting} icon={<ArrowRight className="h-5.5 w-5.5" />}>
                    {submitting ? "Creating account…" : "Create account"}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted">
                  Already have an account?{" "}
                  <Link href="/login" className="font-medium text-brand-500">
                    Log in
                  </Link>
                </p>
              </motion.div>
            )}

            {step === "verify" && (
              <motion.div
                key="verify"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-center gap-2">
                  <IconBadge size="sm" className="text-brand-500 dark:text-brand-400">
                    <motion.span
                      animate={requesting ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                      transition={{ duration: 1, repeat: requesting ? Infinity : 0 }}
                      className="flex"
                    >
                      {channel === "phone" ? <Smartphone className="h-6.5 w-6.5" /> : <Mail className="h-6.5 w-6.5" />}
                    </motion.span>
                  </IconBadge>
                  <h1 className="text-xl font-semibold">
                    {channel === "phone" ? "Verify your phone" : "Verify your email"}
                  </h1>
                </div>
                <p className="mt-2 text-sm text-muted">
                  Enter the 6-digit code we sent to{" "}
                  <strong>{channel === "phone" ? formatPhoneDisplay(phone) : email}</strong>.
                </p>

                {devCode && (
                  <p className="mt-3 rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">
                    Dev mode — no {channel === "phone" ? "Twilio" : "Resend"} credentials configured yet, so nothing
                    was actually {channel === "phone" ? "texted" : "emailed"}. Your code is{" "}
                    <strong className="tracking-widest">{devCode}</strong>.
                  </p>
                )}

                <div className="mt-6 flex flex-col gap-4">
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    onComplete={verifyCode}
                    error={otpError ?? undefined}
                    disabled={verifying}
                  />
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => verifyCode(otp)}
                    disabled={otp.length !== 6 || verifying}
                  >
                    {verifying ? "Verifying…" : "Verify & continue"}
                  </Button>

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={switchChannel}
                      className="cursor-pointer font-medium text-brand-500"
                    >
                      Verify by {channel === "phone" ? "email" : "phone"} instead
                    </button>
                    <button
                      type="button"
                      onClick={() => requestCode(channel, identifier)}
                      disabled={cooldown > 0 || requesting}
                      className="cursor-pointer font-medium text-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center py-6 text-center"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
                >
                  <IconBadge size="lg" className="text-success">
                    <CheckCircle2 className="h-9 w-9" />
                  </IconBadge>
                </motion.div>
                <h1 className="mt-4 text-xl font-semibold">You&apos;re all set!</h1>
                <p className="mt-2 text-sm text-muted">Taking you to your dashboard…</p>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </motion.div>
    </div>
  );
}
