"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { loginSchema, type LoginInput } from "@/lib/validation";
import { Input } from "@/components/ui/Input";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordInput } from "@/components/ui/PasswordInput";

function postLoginPath(role: string) {
  if (role === "ADMIN") return "/admin";
  const requested = new URLSearchParams(window.location.search).get("next");
  return requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/dashboard";
}

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

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

  return (
    <AuthShell mode="login">
      <div className="mb-6">
        <h1 className="mt-0 text-3xl font-bold tracking-tight text-story-navy dark:text-foreground">Welcome back</h1>
        <p className="mt-1.5 text-sm leading-6 text-muted">Sign in with your email and password to continue learning.</p>
      </div>
      <form onSubmit={handleSubmit(onPasswordSubmit)} className="flex flex-col gap-3">
        <Input label="Email address" type="email" placeholder="you@example.com" autoComplete="email" {...register("email")} error={errors.email?.message} />
        <PasswordInput label="Password" placeholder="Enter your password" autoComplete="current-password" {...register("password")} error={errors.password?.message} />
        {serverError && <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{serverError}</p>}
        <AuthButton type="submit" disabled={submitting} className="mt-1">
          {submitting ? "Logging in…" : "Log in"}
        </AuthButton>
        <a href="/reset-password" className="self-end text-sm font-semibold text-story-royal hover:underline">Forgot password?</a>
      </form>
    </AuthShell>
  );
}
