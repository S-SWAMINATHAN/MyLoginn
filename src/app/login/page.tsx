"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, LogIn, Mail, Smartphone } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validation";
import { formatPhoneDisplay } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";
import { Input } from "@/components/ui/Input";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthShell } from "@/components/auth/AuthShell";
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

function postLoginPath(role: string) {
  if (role === "ADMIN") return "/admin";
  const requested = new URLSearchParams(window.location.search).get("next");
  return requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/dashboard";
}

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
      router.push(postLoginPath(json.user.role));
      router.refresh();
    } catch {
      setServerError("We couldn't complete sign in. Please try again.");
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
      router.push(postLoginPath(json.user.role));
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
    <AuthShell mode="login">
          <div className="mb-6">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={mode} initial={{ scale: 0.6, rotate: -20, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ type: "spring", stiffness: 320, damping: 18 }} className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-story-mist text-story-royal">
                {mode === "password" ? <LogIn className="h-5 w-5" /> : <KeyRound className="h-5 w-5" />}
              </motion.span>
            </AnimatePresence>
            <span className="story-eyebrow">MyLoginn account</span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-story-navy dark:text-foreground">Welcome back</h1>
            <p className="mt-1.5 text-sm leading-6 text-muted">Sign in to continue your learning and pick up where you left off.</p>
          </div>

          <div className="flex gap-1 rounded-full bg-story-mist p-1">
            {(["password", "otp"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={cn(
                  "relative flex-1 cursor-pointer rounded-full px-3 py-2 text-sm font-semibold transition-colors duration-200",
                  mode === m ? "text-white" : "text-muted hover:text-foreground"
                )}
              >
                {mode === m && (
                  <motion.span
                    layoutId="login-mode-pill"
                    className="absolute inset-0 rounded-full bg-story-royal shadow-[0_8px_18px_-10px_rgba(31,86,214,0.8)]"
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
                  <form onSubmit={handleSubmit(onPasswordSubmit)} className="mt-4 flex flex-col gap-3">
                  <Input label="Email address" type="email" placeholder="you@example.com" {...register("email")} error={errors.email?.message} />
                  <PasswordInput label="Password" placeholder="••••••••" {...register("password")} error={errors.password?.message} />

                  {serverError && (
                    <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{serverError}</p>
                  )}

                  <AuthButton type="submit" disabled={submitting} className="mt-1">
                    {submitting ? "Logging in…" : "Log in"}
                  </AuthButton>
                  <a href="/reset-password" className="self-end text-sm font-semibold text-story-royal hover:underline">Forgot password?</a>
                </form>

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
                              "group flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-sm font-semibold transition-all duration-200",
                              channel === c
                                ? "border-story-royal bg-story-royal/10 text-story-royal"
                                : "border-border-soft text-muted hover:border-story-royal/50 hover:text-story-royal"
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

                      <AuthButton onClick={requestLoginCode} disabled={requesting}>
                        {requesting ? "Sending code…" : "Send code"}
                      </AuthButton>
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
                      <AuthButton onClick={() => verifyLoginCode(otp)} disabled={otp.length !== 6 || verifying}>
                        {verifying ? "Verifying…" : "Verify & log in"}
                      </AuthButton>
                      <div className="flex items-center justify-between text-sm">
                        <button type="button" onClick={() => setOtpStep("enter")} className="cursor-pointer font-semibold text-story-royal">
                          Change contact
                        </button>
                        <button
                          type="button"
                          onClick={requestLoginCode}
                          disabled={cooldown > 0 || requesting}
                          className="cursor-pointer font-semibold text-story-royal disabled:cursor-not-allowed disabled:opacity-50"
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

    </AuthShell>
  );
}
