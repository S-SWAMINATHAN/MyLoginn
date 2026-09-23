"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { User, Languages } from "lucide-react";
import { tamilSuggestions, hasLatin } from "@/lib/tamilTransliterate";

interface TamilNameInputProps {
  value: string;
  /**
   * `latin` is the Thanglish text the user actually typed, passed back when
   * they accept a Tamil suggestion. The form keeps it so the name can be
   * shown in English when the reader switches language — otherwise a name
   * entered as Tamil stayed Tamil in English mode, with no way back.
   */
  onChange: (value: string, latin?: string) => void;
  lang: "ta" | "en";
  placeholder?: string;
  required?: boolean;
  className?: string;
}

/**
 * Name input that, while the site is in Tamil, offers Tamil-script spellings
 * of whatever the user types in Thanglish ("guruprasath" -> குருபிரசாத்).
 *
 * - Suggestions are ONLY suggestions: the field keeps exactly what the user
 *   typed until they click one (or press Enter / arrow keys to pick one).
 * - In English mode it behaves as a plain text input — nothing changes.
 * - Transliteration is fully offline (lib/tamilTransliterate.ts); the name
 *   is never sent anywhere to produce these suggestions.
 */
export const TamilNameInput: React.FC<TamilNameInputProps> = ({
  value,
  onChange,
  lang,
  placeholder,
  required,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [debounced, setDebounced] = useState(value);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), 120);
    return () => clearTimeout(t);
  }, [value]);

  const suggestions = useMemo(
    () => (lang === "ta" && hasLatin(debounced) ? tamilSuggestions(debounced, 5) : []),
    [lang, debounced]
  );

  useEffect(() => {
    setActive(0);
  }, [suggestions]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pick = (s: string) => {
    // `debounced` is the Thanglish the suggestions were built from.
    onChange(s, debounced.trim());
    setOpen(false);
  };

  const showList = open && suggestions.length > 0;

  return (
    <div ref={wrapRef} className="relative">
      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-brand-fg/80 pointer-events-none" />
      <input
        type="text"
        required={required}
        value={value}
        autoComplete="off"
        onChange={(e) => {
          // Typing by hand clears any remembered Latin spelling: whatever is
          // in the box now IS what the user wants, in whichever script.
          onChange(e.target.value, undefined);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!showList) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, suggestions.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault(); // don't submit the form while choosing
            pick(suggestions[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className={className}
        placeholder={placeholder}
        aria-autocomplete="list"
        aria-expanded={showList}
      />

      {showList && (
        <div
          role="listbox"
          className="absolute z-40 top-full left-0 right-0 mt-1.5 bg-surface border-2 border-brand-600/40 rounded-xl shadow-xl overflow-hidden"
        >
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-fg bg-surface-2 flex items-center gap-1.5">
            <Languages className="w-3 h-3" />
            தமிழில் பெயர் பரிந்துரை — தேர்ந்தெடுக்கவும்
          </div>
          {suggestions.map((s, i) => (
            <button
              key={s}
              type="button"
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(i)}
              onClick={() => pick(s)}
              className={`w-full text-left px-3.5 py-2 text-sm transition-colors ${
                i === active ? "bg-brand-500/10 text-brand-fg font-semibold" : "text-foreground hover:bg-surface-2"
              }`}
            >
              {s}
            </button>
          ))}
          <div className="px-3 py-1.5 text-[10px] text-muted border-t border-border-soft">
            ஆங்கிலத்திலேயே வைக்க, பரிந்துரையைத் தேர்ந்தெடுக்காமல் தொடரவும்.
          </div>
        </div>
      )}
    </div>
  );
};
