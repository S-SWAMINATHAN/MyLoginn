"use client";

import { useEffect, useRef } from "react";

/** Scrolls the surrounding topic list so the current lesson is visible (scrolls the list only, not the page). */
export function ScrollActiveIntoView() {
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const nav = marker.current?.parentElement;
    const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !active || nav.clientHeight === 0) return;
    const offset = active.getBoundingClientRect().top - nav.getBoundingClientRect().top;
    nav.scrollTop += offset - nav.clientHeight / 2 + active.offsetHeight / 2;
  }, []);
  return <span ref={marker} hidden />;
}
