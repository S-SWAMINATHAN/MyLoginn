"use client";

import { cn } from "@/lib/cn";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { forwardRef, useState, type ChangeEvent, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";

type FieldProps = { label?: string; error?: string; hint?: ReactNode; valid?: boolean };

function FieldMessage({ error, hint, count, max }: FieldProps & { count?: number; max?: number }) {
  return <div className="flex items-start justify-between gap-3">
    {error
      ? <span role="alert" className="field-message font-medium text-danger"><AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />{error}</span>
      : hint ? <span className="field-message text-muted">{hint}</span> : <span />}
    {max ? <span aria-hidden="true" className={cn("field-message ml-auto shrink-0 tabular-nums", count && count >= max ? "font-semibold text-danger" : "text-muted")}>{count ?? 0}/{max}</span> : null}
  </div>;
}

function Status({ error, valid }: { error?: string; valid?: boolean }) {
  if (error) return <AlertCircle aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-danger" />;
  if (valid) return <CheckCircle2 aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-success" />;
  return null;
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & FieldProps & { icon?: ReactNode };

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, valid, className, id, icon, ...rest }, ref) => (
    <div className="group flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="field-label">{label}</label>}
      <div className="relative">
        {icon && <span aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted transition-colors group-focus-within:text-brand-600">{icon}</span>}
        <input ref={ref} id={id} aria-invalid={error ? true : undefined} data-valid={valid && !error ? true : undefined} className={cn("field-control", icon && "pl-11", (error || valid) && "pr-10", className)} {...rest} />
        <Status error={error} valid={valid} />
      </div>
      <FieldMessage error={error} hint={hint} />
    </div>
  )
);
Input.displayName = "Input";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, valid, className, id, onChange, maxLength, ...rest }, ref) => {
    const [count, setCount] = useState(String(rest.defaultValue ?? "").length);
    return <div className="group flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="field-label">{label}</label>}
      <textarea ref={ref} id={id} maxLength={maxLength} aria-invalid={error ? true : undefined} data-valid={valid && !error ? true : undefined} className={cn("field-control", className)} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => { setCount(event.target.value.length); onChange?.(event); }} {...rest} />
      <FieldMessage error={error} hint={hint} count={count} max={maxLength} />
    </div>;
  }
);
Textarea.displayName = "Textarea";
