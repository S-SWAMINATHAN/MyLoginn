"use client";

import { cn } from "@/lib/cn";
import { AlertCircle, ChevronDown } from "lucide-react";
import { forwardRef, type SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
  placeholder?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...rest }, ref) => (
    <div className="group flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="field-label">{label}</label>}
      <div className="relative">
        <select ref={ref} id={id} aria-invalid={error ? true : undefined} className={cn("field-control cursor-pointer appearance-none pr-11", className)} {...rest}>
          {placeholder && <option value="" disabled hidden>{placeholder}</option>}
          {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition-transform duration-300 group-focus-within:rotate-180 group-focus-within:text-brand-600" />
      </div>
      {error && <span role="alert" className="field-message font-medium text-danger"><AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />{error}</span>}
    </div>
  )
);
Select.displayName = "Select";
