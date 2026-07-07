"use client";

import { cn } from "@/lib/cn";
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberWithError,
  type CountryCode,
} from "libphonenumber-js";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

function flagEmoji(iso2: string) {
  return iso2
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

const regionNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

function countryName(iso2: string) {
  return regionNames?.of(iso2) ?? iso2;
}

const ALL_COUNTRIES: { code: CountryCode; name: string; calling: string }[] = getCountries()
  .map((code) => ({ code, name: countryName(code), calling: getCountryCallingCode(code) }))
  .sort((a, b) => a.name.localeCompare(b.name));

const DEFAULT_COUNTRY: CountryCode = "IN";

/**
 * AsYouType's *display* formatting adds a national trunk prefix for some
 * countries (e.g. India renders 10 digits as "098765 43210"). Since the
 * input's value is controlled by that formatted string, naively stripping
 * non-digits from it on the next keystroke would bake that synthetic
 * leading 0 into the stored number permanently. Re-parsing through
 * AsYouType and reading back `nationalNumber` gives the trunk-prefix-free
 * digits libphonenumber actually considers significant.
 */
function toSignificantDigits(country: CountryCode, rawDigits: string): string {
  if (!rawDigits) return "";
  const typer = new AsYouType(country);
  typer.input(rawDigits);
  return typer.getNumber()?.nationalNumber ?? rawDigits;
}

type PhoneInputProps = {
  label?: string;
  hint?: string;
  error?: string;
  value: string;
  onChange: (e164: string) => void;
  onCountryChange?: (iso2: string) => void;
  onBlur?: () => void;
};

export function PhoneInput({ label, hint, error, value, onChange, onCountryChange, onBlur }: PhoneInputProps) {
  const [country, setCountryState] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [national, setNational] = useState("");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  function setCountry(next: CountryCode) {
    setCountryState(next);
    onCountryChange?.(next);
  }

  useEffect(() => {
    if (initialized.current || !value) return;
    initialized.current = true;

    try {
      const parsed = parsePhoneNumberWithError(value);
      if (parsed.country) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCountry(parsed.country);
        setNational(parsed.nationalNumber);
      }
    } catch {
      // keep the default country if the existing value can't be parsed
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return ALL_COUNTRIES;
    const q = query.trim().toLowerCase();
    return ALL_COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.calling.includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [query]);

  const formatted = useMemo(() => {
    const typer = new AsYouType(country);
    return typer.input(national);
  }, [country, national]);

  function emit(nextCountry: CountryCode, nextNational: string) {
    const digits = nextNational.replace(/\D/g, "");
    onChange(digits ? `+${getCountryCallingCode(nextCountry)}${digits}` : "");
  }

  return (
    <div className="flex flex-col gap-1.5" ref={rootRef}>
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <div
        className={cn(
          "flex items-stretch rounded-xl border border-border-soft bg-surface transition-all duration-200",
          "focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100 dark:focus-within:ring-brand-900/30",
          error && "border-danger focus-within:border-danger focus-within:ring-danger/10"
        )}
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-l-xl border-r border-border-soft px-3 py-2.5 text-sm transition-colors hover:bg-surface-2"
        >
          <span className="text-base leading-none">{flagEmoji(country)}</span>
          <span className="text-muted">+{getCountryCallingCode(country)}</span>
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronDown className="h-4 w-4 text-muted" />
          </motion.span>
        </button>
        <input
          inputMode="tel"
          placeholder="98765 43210"
          value={formatted}
          onChange={(e) => {
            const digits = toSignificantDigits(country, e.target.value.replace(/\D/g, ""));
            setNational(digits);
            emit(country, digits);
          }}
          onBlur={onBlur}
          className="w-full min-w-0 rounded-r-xl bg-transparent px-4 py-2.5 text-sm text-foreground placeholder:text-muted outline-none"
        />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-20"
          >
            <div className="absolute left-0 right-0 top-1 max-h-72 overflow-hidden rounded-xl border border-border-soft bg-surface shadow-[var(--shadow-lift)] sm:right-auto sm:w-80">
              <div className="flex items-center gap-2 border-b border-border-soft px-3 py-2">
                <Search className="h-4.5 w-4.5 shrink-0 text-muted" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search country or code"
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted outline-none"
                />
              </div>
              <div className="max-h-60 overflow-y-auto py-1">
                {filtered.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setCountry(c.code);
                      emit(c.code, national);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-surface-2",
                      c.code === country && "bg-brand-50 dark:bg-brand-900/20"
                    )}
                  >
                    <span className="text-base leading-none">{flagEmoji(c.code)}</span>
                    <span className="flex-1 truncate text-foreground">{c.name}</span>
                    <span className="text-muted">+{c.calling}</span>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="px-3 py-4 text-center text-sm text-muted">No countries match &ldquo;{query}&rdquo;</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error ? (
        <span className="text-xs font-medium text-danger">{error}</span>
      ) : hint ? (
        <span className="text-xs text-muted">{hint}</span>
      ) : null}
    </div>
  );
}
