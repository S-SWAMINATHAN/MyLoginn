"use client";

/**
 * Popup anchored to a field, positioned with `position: fixed` so it is never
 * clipped by scroll containers and always stays inside the viewport: it opens
 * below the anchor when there is room, above otherwise, and is clamped to the
 * screen edges on phones. It is portalled into `.astro-root` so the theme
 * variables (scoped to that element) still apply.
 */
import React, { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  anchorRef: React.RefObject<HTMLElement | null>;
  /** Preferred width in px; shrinks to fit narrow screens. */
  width: number;
  /** Make the panel as wide as the anchor (never narrower than 300px, never wider than `width`). */
  matchAnchor?: boolean;
  onClose: () => void;
  className?: string;
  label?: string;
  children: React.ReactNode;
};

const GAP = 8;

export const FloatingPanel: React.FC<Props> = ({ anchorRef, width, matchAnchor, onClose, className = "", label, children }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);
  const [host, setHost] = useState<Element | null>(null);

  useLayoutEffect(() => {
    setHost(anchorRef.current?.closest(".astro-root") ?? document.body);
  }, [anchorRef]);

  useLayoutEffect(() => {
    if (!host) return;
    const place = () => {
      const a = anchorRef.current?.getBoundingClientRect();
      const p = panelRef.current;
      if (!a || !p) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const w = Math.min(matchAnchor ? Math.max(a.width, 300) : width, vw - GAP * 2);
      const left = Math.min(Math.max(a.left, GAP), vw - w - GAP);
      const h = p.scrollHeight;
      const roomBelow = vh - a.bottom - GAP * 2;
      const roomAbove = a.top - GAP * 2;
      let top: number;
      let maxHeight = vh - GAP * 2;
      if (h <= roomBelow) top = a.bottom + GAP;
      else if (h <= roomAbove) top = a.top - GAP - h;
      else if (roomBelow >= roomAbove) {
        top = a.bottom + GAP;
        maxHeight = Math.max(roomBelow, 200);
      } else {
        maxHeight = Math.max(roomAbove, 200);
        top = Math.max(GAP, a.top - GAP - Math.min(h, maxHeight));
      }
      setPos({ top, left, width: w, maxHeight });
    };
    place();
    const ro = typeof ResizeObserver !== "undefined" && panelRef.current ? new ResizeObserver(place) : null;
    if (ro && panelRef.current) ro.observe(panelRef.current);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [host, anchorRef, width, matchAnchor]);

  // Click / tap outside (the anchor itself is handled by its own toggle).
  useLayoutEffect(() => {
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || anchorRef.current?.contains(t)) return;
      onClose();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [anchorRef, onClose]);

  if (!host) return null;
  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-label={label}
      className={`fixed z-[1000] overflow-y-auto rounded-2xl border border-line bg-surface shadow-lift ${className}`}
      style={{
        top: pos?.top ?? 0,
        left: pos?.left ?? 0,
        width: pos?.width ?? width,
        maxHeight: pos?.maxHeight,
        visibility: pos ? "visible" : "hidden",
      }}
    >
      {children}
    </div>,
    host,
  );
};
