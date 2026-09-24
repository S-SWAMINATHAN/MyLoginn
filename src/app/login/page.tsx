"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, KeyRound, LogIn, Mail, Smartphone } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validation";
import { formatPhoneDisplay } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Card";
import { IconBadge } from "@/components/ui/IconBadge";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { OtpInput } from "@/components/ui/OtpInput";
import { PasswordInput } from "@/components/ui/PasswordInput";

type Mode = "password" | "otp";
type Channel = "phone" | "email";
type OtpStep = "enter" | "verify";

const panelVariants = {
  enter: { opacity: 0, x: 16 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
};

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [otpStep, setOtpStep] = useState<OtpStep>("enter");
  const [channel, setChannel] = useState<Channel>("phone");
  const [phone, setPhone] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [devCode, setDevCode] = useState<string | null>(null);

  const identifier = channel === "phone" ? phone : otpEmail;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function onPasswordSubmit(data: LoginInput) {
    setServerError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error ?? "Something went wrong");
        return;
      }
      router.push(json.user.role === "ADMIN" ? "/admin" : "/dashboard");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function requestLoginCode() {
    if (!identifier) {
      setOtpError(channel === "phone" ? "Enter your phone number" : "Enter your email address");
      return;
    }
    setOtpError(null);
    setDevCode(null);
    setRequesting(true);
    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, purpose: "login", channel }),
      });
      const json = await res.json();
      if (!res.ok) {
        setOtpError(json.error ?? "Couldn't send code");
        setCooldown(json.retryAfterSeconds ?? 0);
        return;
      }
      setOtp("");
      setOtpStep("verify");
      setDevCode(json.devCode ?? null);
      setCooldown(30);
    } finally {
      setRequesting(false);
    }
  }

  async function verifyLoginCode(code: string) {
    setOtpError(null);
    setVerifying(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, purpose: "login", channel, code }),
      });
      const json = await res.json();
      if (!res.ok) {
        setOtpError(json.error ?? "Invalid code");
        return;
      }
      router.push(json.user.role === "ADMIN" ? "/admin" : "/dashboard");
      router.refresh();
    } finally {
      setVerifying(false);
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
    setServerError(null);
    setOtpError(null);
    setOtpStep("enter");
    setOtp("");
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
          <div className="flex items-center gap-2">
            <IconBadge size="sm" className="text-brand-500 dark:text-brand-400">
              {mode === "password" ? <LogIn className="h-6.5 w-6.5" /> : <KeyRound className="h-6.5 w-6.5" />}
            </IconBadge>
            <h1 className="text-xl font-semibold">Welcome back</h1>
          </div>
          <p className="mt-2 text-sm text-muted">Log in to continue your progress.</p>

          <div className="mt-6 flex gap-1 rounded-full bg-surface-2 p-1">
            {(["password", "otp"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={cn(
                  "relative flex-1 cursor-pointer rounded-full px-3 py-2 text-sm font-medium transition-colors duration-200",
                  mode === m ? "text-white" : "text-muted hover:text-foreground"
                )}
              >
                {mode === m && (
                  <motion.span
                    layoutId="login-mode-pill"
                    className="brand-gradient-bg absolute inset-0 rounded-full"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                <span className="relative z-10">{m === "password" ? "Password" : "Log in with OTP"}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {mode === "password" ? (
              <motion.div
                key="password"
                variants={panelVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <form onSubmit={handleSubmit(onPasswordSubmit)} className="mt-6 flex flex-col gap-4">
                  <Input label="Email address" type="email" placeholder="you@example.com" {...register("email")} error={errors.email?.message} />
                  <PasswordInput label="Password" placeholder="••••••••" {...register("password")} error={errors.password?.message} />

                  {serverError && (
                    <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{serverError}</p>
                  )}

                  <Button type="submit" size="lg" className="mt-1 w-full" disabled={submitting} icon={<ArrowRight className="h-5.5 w-5.5" />}>
                    {submitting ? "Logging in…" : "Log in"}
                  </Button>
                </form>

                <p className="mt-4 text-center text-xs text-muted">
                  Demo admin: <strong>admin@myloginn.ai</strong> / <strong>Admin@123</strong>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                variants={panelVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="mt-6"
              >
                <AnimatePresence mode="wait">
                  {otpStep === "enter" ? (
                    <motion.div
                      key="enter"
                      variants={panelVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.25 }}
                      className="flex flex-col gap-4"
                    >
                      <div className="flex gap-2">
                        {(["phone", "email"] as Channel[]).map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              setChannel(c);
                              setOtpError(null);
                            }}
                            className={cn(
                              "group flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-200",
                              channel === c
                                ? "border-brand-400 bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-300"
                                : "border-border-soft text-muted hover:border-brand-300"
                            )}
                          >
                            {c === "phone" ? (
                              <Smartphone className="h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110" />
                            ) : (
                              <Mail className="h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110" />
                            )}
                            {c === "phone" ? "Phone" : "Email"}
                          </button>
                        ))}
                      </div>

                      {channel === "phone" ? (
                        <PhoneInput
                          label="Phone number"
                          value={phone}
                          onChange={setPhone}
                          error={otpError && channel === "phone" ? otpError : undefined}
                        />
                      ) : (
                        <Input
                          label="Email address"
                          type="email"
                          placeholder="you@example.com"
                          value={otpEmail}
                          onChange={(e) => setOtpEmail(e.target.value)}
                          error={otpError && channel === "email" ? otpError : undefined}
                        />
                      )}

                      <Button
                        size="lg"
                        className="w-full"
                        onClick={requestLoginCode}
                        disabled={requesting}
                        icon={<ArrowRight className="h-5.5 w-5.5" />}
                      >
                        {requesting ? "Sending code…" : "Send code"}
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="verify"
                      variants={panelVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.25 }}
                      className="flex flex-col gap-4"
                    >
                      <p className="text-sm text-muted">
                        Enter the 6-digit code we sent to{" "}
                        <strong>{channel === "phone" ? formatPhoneDisplay(phone) : otpEmail}</strong>.
                      </p>
                      {devCode && (
                        <p className="rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">
                          Dev mode — no {channel === "phone" ? "Twilio" : "Resend"} credentials configured yet, so
                          nothing was actually {channel === "phone" ? "texted" : "emailed"}. Your code is{" "}
                          <strong className="tracking-widest">{devCode}</strong>.
                        </p>
                      )}
                      <OtpInput
                        value={otp}
                        onChange={setOtp}
                        onComplete={verifyLoginCode}
                        error={otpError ?? undefined}
                        disabled={verifying}
                      />
                      <Button
                        size="lg"
                        className="w-full"
                        onClick={() => verifyLoginCode(otp)}
                        disabled={otp.length !== 6 || verifying}
                      >
                        {verifying ? "Verifying…" : "Verify & log in"}
                      </Button>
                      <div className="flex items-center justify-between text-sm">
                        <button type="button" onClick={() => setOtpStep("enter")} className="cursor-pointer font-medium text-brand-500">
                          Change contact
                        </button>
                        <button
                          type="button"
                          onClick={requestLoginCode}
                          disabled={cooldown > 0 || requesting}
                          className="cursor-pointer font-medium text-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-6 text-center text-sm text-muted">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-brand-500">
              Create one
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
