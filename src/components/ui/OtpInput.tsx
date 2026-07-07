"use client";

import { cn } from "@/lib/cn";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type OtpInputProps = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: string;
  disabled?: boolean;
};

export function OtpInput({ length = 6, value, onChange, onComplete, error, disabled }: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  useEffect(() => {
    if (!error) inputsRef.current[Math.min(value.length, length - 1)]?.focus();
  }, [value, error, length]);

  function setDigit(index: number, char: string) {
    const next = digits.slice();
    next[index] = char;
    const joined = next.join("").slice(0, length);
    onChange(joined);
    if (joined.length === length && char) onComplete?.(joined);
  }

  function handleChange(index: number, raw: string) {
    const char = raw.replace(/\D/g, "").slice(-1);
    setDigit(index, char);
    if (char && index < length - 1) {
      setActiveIndex(index + 1);
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      setActiveIndex(index - 1);
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted);
    if (pasted.length === length) onComplete?.(pasted);
    const nextIndex = Math.min(pasted.length, length - 1);
    setActiveIndex(nextIndex);
    inputsRef.current[nextIndex]?.focus();
  }

  return (
    <motion.div
      animate={error ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-1.5"
    >
      <div className="flex justify-between gap-2 sm:gap-3">
        {digits.map((digit, i) => (
          <motion.input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={() => setActiveIndex(i)}
            initial={false}
            animate={{
              scale: digit ? [1.15, 1] : 1,
              borderColor: error
                ? "var(--danger)"
                : activeIndex === i
                ? "var(--brand-400)"
                : "var(--border-soft)",
            }}
            transition={{ duration: 0.18 }}
            className={cn(
              "h-12 w-full max-w-12 flex-1 rounded-xl border bg-surface text-center text-lg font-semibold text-foreground outline-none transition-shadow sm:h-14 sm:text-xl",
              activeIndex === i && !error && "ring-4 ring-brand-100 dark:ring-brand-900/30",
              disabled && "opacity-50"
            )}
          />
        ))}
      </div>
      {error && <span className="text-xs font-medium text-danger">{error}</span>}
    </motion.div>
  );
}
