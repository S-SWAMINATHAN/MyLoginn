"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

/**
 * Light / dark switch for the site chrome. The initial value is applied by the
 * inline script in app/layout.tsx; this component only reads and flips it.
 * The handwritten Jathagam is deliberately NOT affected — it stays on paper.
 */
export const ThemeToggle: React.FC<{ lang: "ta" | "en"; className?: string }> = ({ lang, className = "" }) => {
  const [theme, setTheme] = useState<Theme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "dark" : "light");
    setReady(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("mla-theme", next);
    } catch {
      /* private mode — the choice simply isn't remembered */
    }
  };

  const label =
    theme === "dark"
      ? lang === "ta" ? "வெளிச்சப் பயன்முறை" : "Switch to light mode"
      : lang === "ta" ? "இருள் பயன்முறை" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-muted transition-all hover:border-brand-400 hover:text-brand-fg ${className}`}
    >
      {ready && theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
};

export default ThemeToggle;
