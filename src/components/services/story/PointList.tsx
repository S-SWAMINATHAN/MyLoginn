"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

const ACCENTS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#e11d48"];
const PITCH = 54; // vertical distance between nodes
const ITEM_H = 42; // pill height
const NODE_R = 15;
const SWAY = 7; // how far the track curves left and right
const TRACK_W = 46;
const CIRC = 2 * Math.PI * (NODE_R - 2);

/**
 * Feature points as a curved timeline: circle nodes sit on a wavy track, each beside a fully rounded pill.
 * A ring draws around the active node, the track fills down to it, and hovering a point selects it.
 */
export function PointList({ points }: { points: string[] }) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const n = points.length;

  useEffect(() => {
    if (reduced || hovering) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % n), 2400);
    return () => window.clearInterval(id);
  }, [reduced, hovering, n]);

  const cx = (i: number) => TRACK_W / 2 + (i % 2 === 0 ? -SWAY : SWAY);
  const cy = (i: number) => ITEM_H / 2 + i * PITCH;
  const path = points
    .map((_, i) => (i === 0 ? `M ${cx(0)} ${cy(0)}` : `C ${cx(i - 1)} ${cy(i - 1) + PITCH * 0.55}, ${cx(i)} ${cy(i) - PITCH * 0.55}, ${cx(i)} ${cy(i)}`))
    .join(" ");
  const height = (n - 1) * PITCH + ITEM_H;
  const progress = reduced || n < 2 ? 1 : active / (n - 1);

  return (
    <div className="relative mt-6" style={{ height }} onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
      <svg aria-hidden width={TRACK_W} height={height} viewBox={`0 0 ${TRACK_W} ${height}`} className="absolute left-0 top-0 overflow-visible" fill="none">
        <path d={path} stroke="var(--story-line)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 6" />
        <motion.path
          d={path}
          stroke="var(--story-royal)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: progress }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>

      <ul className="m-0 list-none p-0">
        {points.map((pt, i) => {
          const color = ACCENTS[i % ACCENTS.length];
          const on = i === active;
          const passed = i < active;
          return (
            <motion.li
              key={pt}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.13, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => setActive(i)}
              style={{ "--c": color, position: "absolute", left: 0, right: 0, top: i * PITCH, height: ITEM_H } as CSSProperties}
              className="group cursor-default"
            >
              {/* node */}
              <motion.span
                className="absolute grid place-items-center rounded-full"
                style={{ left: cx(i) - NODE_R, top: ITEM_H / 2 - NODE_R, width: NODE_R * 2, height: NODE_R * 2, background: on ? color : "var(--surface)", boxShadow: on ? `0 6px 14px -5px ${color}` : "0 0 0 2px " + (passed ? color : "var(--border-soft)") }}
                animate={{ scale: on ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
              >
                <svg width={NODE_R * 2} height={NODE_R * 2} viewBox={`0 0 ${NODE_R * 2} ${NODE_R * 2}`} className="absolute inset-0 -rotate-90" aria-hidden>
                  <circle cx={NODE_R} cy={NODE_R} r={NODE_R - 2} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={on && !reduced ? 0 : CIRC} style={{ transition: on ? "stroke-dashoffset 2.2s linear" : "none", opacity: on ? 0.35 : 0 }} />
                </svg>
                {on || passed ? (
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden className="relative">
                    <motion.path key={`${i}-${on}`} d="M3.5 8.4l3 3 6-6.4" stroke={on ? "#fff" : color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4 }} />
                  </svg>
                ) : (
                  <span className="relative font-mono text-[9px] font-bold" style={{ color }}>0{i + 1}</span>
                )}
                {on && !reduced && (
                  <motion.span aria-hidden className="absolute inset-0 rounded-full" style={{ border: `2px solid ${color}` }} initial={{ scale: 1, opacity: 0.55 }} animate={{ scale: 1.55, opacity: 0 }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }} />
                )}
              </motion.span>

              {/* pill */}
              <div
                className="absolute inset-y-0 flex items-center rounded-full border bg-surface pl-4 pr-4 text-[13px] font-medium leading-tight transition-all duration-300 group-hover:translate-x-1"
                style={{
                  left: TRACK_W + 4,
                  right: 0,
                  borderColor: on ? color : "var(--border-soft)",
                  background: on ? `color-mix(in srgb, ${color} 7%, var(--surface))` : undefined,
                  boxShadow: on ? `0 8px 18px -12px ${color}` : undefined,
                }}
              >
                <span className="line-clamp-2">{pt}</span>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
