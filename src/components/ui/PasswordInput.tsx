"use client";

import { cn } from "@/lib/cn";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
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
      <div className="group flex flex-col gap-1.5">
        {label && <label htmlFor={id} className="field-label">{label}</label>}
        <div className="relative">
          <input ref={ref} id={id} type={visible ? "text" : "password"} aria-invalid={error ? true : undefined} className={cn("field-control pr-12", className)} {...rest} />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-muted transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {error
          ? <span role="alert" className="field-message font-medium text-danger"><AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />{error}</span>
          : hint ? <span className="field-message text-muted">{hint}</span> : null}
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";
