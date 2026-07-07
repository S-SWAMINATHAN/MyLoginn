"use client";

import { cn } from "@/lib/cn";
import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState, type InputHTMLAttributes } from "react";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, hint, className, id, ...rest }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={visible ? "text" : "password"}
            className={cn(
              "w-full rounded-xl border border-border-soft bg-surface px-4 py-2.5 pr-11 text-sm text-foreground placeholder:text-muted transition-all duration-200 outline-none",
              "focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/30",
              error && "border-danger focus:border-danger focus:ring-danger/10",
              className
            )}
            {...rest}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer text-muted transition-colors duration-200 hover:text-foreground"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {error ? (
          <span className="text-xs font-medium text-danger">{error}</span>
        ) : hint ? (
          <span className="text-xs text-muted">{hint}</span>
        ) : null}
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";
