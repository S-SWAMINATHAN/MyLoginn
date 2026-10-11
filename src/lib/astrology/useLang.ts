"use client";

// Language choice that survives page changes (bug 2): stored in localStorage
// and shared by every page through a window event.
import { useCallback, useEffect, useState } from "react";

export type Lang = "ta" | "en";
const KEY = "mylogin.lang";
const EVT = "mylogin-lang";

export function usePersistentLang(): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>("ta");

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(KEY);
      if (v === "ta" || v === "en") setLangState(v);
    } catch { /* storage blocked */ }
    const onChange = (e: Event) => {
      const v = (e as CustomEvent<Lang>).detail;
      if (v === "ta" || v === "en") setLangState(v);
    };
    window.addEventListener(EVT, onChange);
    return () => window.removeEventListener(EVT, onChange);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { window.localStorage.setItem(KEY, l); } catch { /* storage blocked */ }
    window.dispatchEvent(new CustomEvent<Lang>(EVT, { detail: l }));
  }, []);

  return [lang, setLang];
}
