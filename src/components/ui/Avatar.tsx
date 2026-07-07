"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export function Avatar({
  name,
  avatarColor,
  avatarUrl,
  size = 36,
  className,
  fallback = "initials",
}: {
  name: string;
  avatarColor: string;
  avatarUrl?: string | null;
  size?: number;
  className?: string;
  fallback?: "initials" | "silhouette";
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- user-uploaded local file, no remote-image config needed
      <img
        src={avatarUrl}
        alt={name}
        className={cn("shrink-0 rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  if (fallback === "silhouette") {
    return (
      <motion.div
        className={cn("relative flex shrink-0 items-center justify-center rounded-full text-white", className)}
        style={{ width: size, height: size, background: avatarColor }}
        animate={{ boxShadow: ["0 0 0 0 rgba(255,255,255,0.25)", "0 0 0 4px rgba(255,255,255,0)", "0 0 0 0 rgba(255,255,255,0.25)"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.svg
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ width: size * 0.58, height: size * 0.58 }}
          animate={{ y: [0, -1, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7v1H4v-1Z" />
        </motion.svg>
      </motion.div>
    );
  }

  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-full font-semibold text-white", className)}
      style={{ width: size, height: size, background: avatarColor, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}
