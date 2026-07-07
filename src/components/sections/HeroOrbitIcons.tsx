"use client";

import { motion } from "framer-motion";
import { Brain, Cpu, ShieldCheck, Bot, Code2, Megaphone, GraduationCap, Cloud, type LucideIcon } from "lucide-react";
import { HERO_ORBIT_CENTER as ORBIT_CENTER } from "@/lib/heroOrbit";

type ShellIcon = { Icon: LucideIcon; color: string; angle: number; name: string };

type Shell = {
  rx: number;
  ry: number;
  tilt: number;
  duration: number;
  reverse?: boolean;
  icons: ShellIcon[];
};

const shells: Shell[] = [
  {
    rx: 13,
    ry: 19.5,
    tilt: 0,
    duration: 22,
    icons: [
      { Icon: Brain, color: "#8874ff", angle: 20, name: "AI & ML" },
      { Icon: Code2, color: "#22d3ee", angle: 200, name: "Web Dev" },
    ],
  },
  {
    rx: 17,
    ry: 25.5,
    tilt: 10,
    duration: 32,
    reverse: true,
    icons: [
      { Icon: ShieldCheck, color: "#22c55e", angle: 60, name: "Cyber Security" },
      { Icon: Megaphone, color: "#fb7185", angle: 180, name: "Marketing" },
      { Icon: GraduationCap, color: "#f59e0b", angle: 300, name: "Tutoring" },
    ],
  },
  {
    rx: 20.5,
    ry: 30.5,
    tilt: -12,
    duration: 27,
    icons: [
      { Icon: Cpu, color: "#38bdf8", angle: 0, name: "Tech Skills" },
      { Icon: Bot, color: "#6c4dff", angle: 120, name: "AI Agent" },
      { Icon: Cloud, color: "#818cf8", angle: 240, name: "Cloud" },
    ],
  },
];

function OrbitRingPath({ rx, ry, tilt }: { rx: number; ry: number; tilt: number }) {
  return (
    <div
      className="pointer-events-none absolute rounded-full border border-dashed border-accent-300/40 dark:border-accent-300/25"
      style={{
        left: `${ORBIT_CENTER.left}%`,
        top: `${ORBIT_CENTER.top}%`,
        width: `${rx * 2}%`,
        height: `${ry * 2}%`,
        transform: `translate(-50%, -50%) rotate(${tilt}deg)`,
      }}
    />
  );
}

function ShellIcons({ rx, ry, tilt, duration, reverse, icons }: Shell) {
  return (
    <div
      className="orbit-shell absolute inset-0"
      style={{
        transformOrigin: `${ORBIT_CENTER.left}% ${ORBIT_CENTER.top}%`,
        animationDuration: `${duration}s`,
        animationDirection: reverse ? "reverse" : "normal",
      }}
    >
      {icons.map(({ Icon, color, angle, name }, i) => {
        const rad = (angle * Math.PI) / 180;
        // Tilt the whole shell by rotating the point around the orbit centre.
        const tiltRad = (tilt * Math.PI) / 180;
        const ex = rx * Math.cos(rad);
        const ey = ry * Math.sin(rad);
        // Rounded to a fixed precision: raw trig output can differ by a few
        // ULPs between the server and browser JS engines, which otherwise
        // shows up as a React hydration mismatch on these inline percentages.
        const x = Math.round((ex * Math.cos(tiltRad) - ey * Math.sin(tiltRad)) * 1000) / 1000;
        const y = Math.round((ex * Math.sin(tiltRad) + ey * Math.cos(tiltRad)) * 1000) / 1000;
        return (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${ORBIT_CENTER.left + x}%`, top: `${ORBIT_CENTER.top + y}%` }}
          >
            <div
              className="orbit-counter"
              style={{
                animationDuration: `${duration}s`,
                animationDirection: reverse ? "normal" : "reverse",
              }}
            >
              <div
                className="orbit-pulse"
                style={{ animationDuration: "2.4s", animationDelay: `${i * 0.3}s` }}
              >
                <div
                  className="orbit-icon group glass relative flex h-8 w-8 items-center justify-center rounded-full pointer-events-auto cursor-default sm:h-9 sm:w-9 lg:h-10 lg:w-10"
                  style={{
                    color,
                    borderColor: `${color}55`,
                    background: `color-mix(in srgb, ${color} 18%, var(--glass-bg))`,
                    filter: `drop-shadow(0 0 6px ${color})`,
                  }}
                >
                  <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5 lg:h-5.5 lg:w-5.5" strokeWidth={2} />
                  <span className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full border border-border-soft bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-foreground opacity-0 shadow-soft transition-opacity duration-150 group-hover:opacity-100">
                    {name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function HeroOrbitIcons() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 1 }}
    >
      {shells.map((shell, i) => (
        <OrbitRingPath key={i} rx={shell.rx} ry={shell.ry} tilt={shell.tilt} />
      ))}
      {shells.map((shell, i) => (
        <ShellIcons key={i} {...shell} />
      ))}
    </motion.div>
  );
}
