"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Check, Mail, ShieldCheck, Smartphone, UserPlus } from "lucide-react";
import { signupSchema, type SignupInput } from "@/lib/validation";
import { formatPhoneDisplay } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthShell } from "@/components/auth/AuthShell";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { OtpInput } from "@/components/ui/OtpInput";
import { PasswordInput } from "@/components/ui/PasswordInput";

type Channel = "phone" | "email";
const steps = [
  { title: "Your details", caption: "Contact information", icon: UserPlus },
  { title: "Your account", caption: "Password and role", icon: ShieldCheck },
  { title: "Verification", caption: "Confirm your contact", icon: BadgeCheck },
];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
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
    register, handleSubmit, control, setValue, trigger,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: "STUDENT", phone: "" },
  });

  const identifier = channel === "phone" ? phone : email;

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((current) => Math.max(0, current - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function requestCode(nextChannel: Channel, ident: string) {
    setOtpError(null);
    setDevCode(null);
    setRequesting(true);
    try {
      const response = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: ident, purpose: "signup", channel: nextChannel }),
      });
      const json = await response.json();
      if (!response.ok) {
        setOtpError(json.error ?? "Couldn't send the code. Please try again.");
        setCooldown(json.retryAfterSeconds ?? 0);
        return;
      }
      setDevCode(json.devCode ?? null);
      setCooldown(30);
    } catch {
      setOtpError("Couldn't send the code. Check your connection and try again.");
    } finally {
      setRequesting(false);
    }
  }

  async function goToAccountStep() {
    setServerError(null);
    const valid = await trigger(["name", "email", "phone"]);
    if (valid) setStep(2);
  }

  async function onDetailsSubmit(data: SignupInput) {
    setServerError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await response.json();
      if (!response.ok) {
        setServerError(json.error ?? "We couldn't create your account. Please try again.");
        return;
      }
      setEmail(data.email);
      setPhone(data.phone);
      setChannel("phone");
      setOtp("");
      setStep(3);
      await requestCode("phone", data.phone);
    } catch {
      setServerError("We couldn't reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyCode(code: string) {
    if (code.length !== 6 || verifying) return;
    setOtpError(null);
    setVerifying(true);
    try {
      const response = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, purpose: "signup", channel, code }),
      });
      const json = await response.json();
      if (!response.ok) {
        setOtpError(json.error ?? "That code didn't work. Check it and try again.");
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1300);
    } catch {
      setOtpError("Verification failed. Check your connection and try again.");
    } finally {
      setVerifying(false);
    }
  }

  function switchChannel() {
    const next: Channel = channel === "phone" ? "email" : "phone";
    setChannel(next);
    setOtp("");
    setOtpError(null);
    void requestCode(next, next === "phone" ? phone : email);
  }

  return (
    <AuthShell mode="signup">
          {!success && <div className="mb-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="story-eyebrow">Step {step} of 3</span>
              <p className="text-xs text-muted">{steps[step - 1].caption}</p>
            </div>
            <ol className="grid grid-cols-3 gap-2" aria-label={`Signup step ${step} of 3`}>
              {steps.map((item, index) => {
                const StepIcon = item.icon;
                const active = index + 1 === step;
                const complete = index + 1 < step;
                return <li key={item.title} className="min-w-0">
                  <div className="h-1.5 overflow-hidden rounded-full bg-story-mist">
                    <motion.div className="h-full rounded-full bg-story-royal" initial={false} animate={{ width: index + 1 <= step ? "100%" : "0%" }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} />
                  </div>
                  <div className={cn("mt-2 flex items-center gap-1.5 text-[11px] sm:text-xs", active ? "font-semibold text-foreground" : "text-muted")}>
                    {complete ? <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> : <StepIcon className="h-3.5 w-3.5 shrink-0" />}
                    <span className="truncate">{item.title}</span>
                  </div>
                </li>;
              })}
            </ol>
          </div>}

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div key="success" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-72 flex-col items-center justify-center text-center">
                <span className="relative grid h-20 w-20 place-items-center rounded-full bg-emerald-500/10">
                  <svg viewBox="0 0 52 52" className="h-12 w-12" fill="none" aria-hidden>
                    <motion.circle cx="26" cy="26" r="23" stroke="#059669" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
                    <motion.path d="M15 27l8 8 14-16" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.5 }} />
                  </svg>
                </span>
                <h1 className="mt-6 text-2xl font-bold text-story-navy sm:text-3xl dark:text-foreground">You&apos;re all set!</h1>
                <p className="mt-2 text-sm text-muted">Your account is ready. Taking you to your dashboard…</p>
              </motion.div>
            ) : step < 3 ? (
              <motion.div key={`step-${step}`} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.22 }}>
                <div className="mb-4">
                  <h1 className="text-3xl font-bold tracking-tight text-story-navy dark:text-foreground">{step === 1 ? "Create your account" : "Secure your account"}</h1>
                  <p className="mt-2 text-sm leading-6 text-muted">{step === 1 ? "Start with your name and the contact details you’ll use to sign in." : "Choose a strong password and tell us how you’ll use MyLoginn."}</p>
                </div>

                {step === 1 ? <div className="space-y-3">
                  <Input label="Full name" placeholder="Enter full name" autoComplete="name" {...register("name")} error={errors.name?.message} />
                  <Input label="Email address" type="email" placeholder="you@example.com" autoComplete="email" {...register("email")} error={errors.email?.message} />
                  <Controller control={control} name="phone" render={({ field }) => (
                    <PhoneInput label="Phone number" hint="We’ll send a one-time verification code by SMS." value={field.value} onChange={field.onChange} onBlur={field.onBlur} onCountryChange={(country) => setValue("country", country)} error={errors.phone?.message} />
                  )} />
                  <AuthButton onClick={goToAccountStep} className="mt-2">Continue</AuthButton>
                </div> : <form onSubmit={handleSubmit(onDetailsSubmit)} className="space-y-3">
                  <PasswordInput label="Password" placeholder="At least 8 characters" autoComplete="new-password" {...register("password")} error={errors.password?.message} />
                  <PasswordInput label="Confirm password" placeholder="Enter your password again" autoComplete="new-password" {...register("confirmPassword")} error={errors.confirmPassword?.message} />
                  <Select label="I am joining as" options={[{ label: "Student / Learner", value: "STUDENT" }, { label: "Mentor", value: "MENTOR" }]} {...register("role")} />
                  <p className="rounded-xl bg-surface-2 px-4 py-3 text-xs leading-5 text-muted">Use at least 8 characters, including one uppercase letter and one number.</p>
                  {serverError && <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{serverError}</p>}
                  <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">
                    <AuthButton variant="outline" back onClick={() => setStep(1)} className="w-full sm:w-auto">Back</AuthButton>
                    <AuthButton type="submit" disabled={submitting} className="flex-1">{submitting ? "Creating account…" : "Create account"}</AuthButton>
                  </div>
                </form>}

              </motion.div>
            ) : (
              <motion.div key="verify" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.22 }}>
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-story-mist text-story-royal">{channel === "phone" ? <Smartphone className="h-6 w-6" /> : <Mail className="h-6 w-6" />}</span>
                  <div><h1 className="text-2xl font-bold tracking-tight text-story-navy sm:text-3xl dark:text-foreground">Verify your {channel}</h1><p className="mt-1 text-sm text-muted">One last step to activate your account.</p></div>
                </div>
                <p className="mt-5 text-sm leading-6 text-muted">Enter the 6-digit code sent to <strong className="break-all text-foreground">{channel === "phone" ? formatPhoneDisplay(phone) : email}</strong>.</p>
                {requesting && <p className="mt-4 rounded-xl bg-surface-2 px-4 py-3 text-sm text-muted">Sending your verification code…</p>}
                {devCode && <p className="mt-4 rounded-xl bg-warning/10 px-4 py-3 text-sm text-warning">Development mode: use code <strong className="tracking-widest">{devCode}</strong>.</p>}
                {otpError && <p role="alert" className="mt-4 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{otpError}</p>}
                <div className="mt-7 space-y-5">
                  <OtpInput value={otp} onChange={setOtp} onComplete={verifyCode} error={otpError ?? undefined} disabled={verifying} />
                  <AuthButton onClick={() => verifyCode(otp)} disabled={otp.length !== 6 || verifying}>{verifying ? "Verifying…" : "Verify and finish"}</AuthButton>
                  <div className="flex flex-col gap-3 text-center text-sm sm:flex-row sm:justify-between sm:text-left">
                    <button type="button" onClick={switchChannel} className="font-semibold text-story-royal hover:underline">Verify by {channel === "phone" ? "email" : "phone"} instead</button>
                    <button type="button" onClick={() => void requestCode(channel, identifier)} disabled={cooldown > 0 || requesting} className="font-semibold text-story-royal disabled:cursor-not-allowed disabled:opacity-50">{cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
    </AuthShell>
  );
}
