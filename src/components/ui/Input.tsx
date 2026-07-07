import { cn } from "@/lib/cn";
import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-xl border border-border-soft bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted transition-all duration-200 outline-none",
            "focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/30",
            error && "border-danger focus:border-danger focus:ring-danger/10",
            className
          )}
          {...rest}
        />
        {error ? (
          <span className="text-xs font-medium text-danger">{error}</span>
        ) : hint ? (
          <span className="text-xs text-muted">{hint}</span>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-xl border border-border-soft bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted transition-all duration-200 outline-none resize-none",
            "focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/30",
            error && "border-danger focus:border-danger focus:ring-danger/10",
            className
          )}
          {...rest}
        />
        {error ? (
          <span className="text-xs font-medium text-danger">{error}</span>
        ) : hint ? (
          <span className="text-xs text-muted">{hint}</span>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
