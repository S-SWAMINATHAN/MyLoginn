"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function AiHeroIllustration({
  variant,
  className,
}: {
  variant: "projects" | "internships";
  className?: string;
}) {
  const id = useId().replaceAll(":", "");
  const reduceMotion = useReducedMotion();
  const float = (distance: number, duration: number, delay = 0) =>
    reduceMotion
      ? undefined
      : { y: [0, -distance, 0], transition: { duration, delay, repeat: Infinity, ease: "easeInOut" as const } };

  return (
    <svg
      viewBox="0 0 500 360"
      role="img"
      aria-label={variant === "projects" ? "Animated AI project workspace" : "Animated AI internship workspace"}
      className={`h-auto w-full select-none overflow-visible ${className ?? ""}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id={`${id}-aura`} cx="50%" cy="48%" r="55%">
          <stop stopColor={variant === "projects" ? "#6EE7D2" : "#8EE7C0"} stopOpacity=".35" />
          <stop offset="1" stopColor="#D8F5F4" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-core`} x1="170" y1="105" x2="325" y2="276" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#D9F4F3" />
        </linearGradient>
        <linearGradient id={`${id}-screen`} x1="202" y1="144" x2="299" y2="244" gradientUnits="userSpaceOnUse">
          <stop stopColor="#143D55" />
          <stop offset="1" stopColor="#176C71" />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-30%" y="-30%" width="160%" height="180%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>

      <ellipse cx="251" cy="183" rx="225" ry="170" fill={`url(#${id}-aura)`} />
      <ellipse cx="251" cy="308" rx="150" ry="19" fill="#21495B" opacity=".12" filter={`url(#${id}-shadow)`} />

      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        animate={reduceMotion ? undefined : { rotate: [0, 3, 0, -3, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      >
        <ellipse cx="252" cy="185" rx="183" ry="111" stroke="#49AFA7" strokeOpacity=".24" strokeWidth="1.5" strokeDasharray="4 8" />
        <ellipse cx="252" cy="185" rx="148" ry="90" stroke="#F4A261" strokeOpacity=".28" strokeWidth="1.5" strokeDasharray="2 8" />
      </motion.g>

      <motion.g animate={float(8, 4.2)}>
        <rect x="43" y="111" width="142" height="105" rx="15" fill="#FFFFFF" stroke="#D7E9E8" strokeWidth="1.5" />
        <path d="M43 128a17 17 0 0 1 17-17h108a17 17 0 0 1 17 17" fill="#F3F9F8" />
        <circle cx="59" cy="121" r="3" fill="#F4A261" />
        <circle cx="69" cy="121" r="3" fill="#72C9B4" />
        <circle cx="79" cy="121" r="3" fill="#A7C6D0" />
        {variant === "projects" ? (
          <>
            <rect x="59" y="143" width="73" height="5" rx="2.5" fill="#367C87" />
            <rect x="59" y="155" width="102" height="4" rx="2" fill="#D5E5E6" />
            <rect x="59" y="165" width="82" height="4" rx="2" fill="#D5E5E6" />
            <path d="m61 192 16-12 13 6 18-17 14 8 18-15" stroke="#36A997" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="140" cy="162" r="3" fill="#F4A261" />
          </>
        ) : (
          <>
            <circle cx="82" cy="157" r="15" fill="#F7D5B8" />
            <path d="M68 156c1-11 8-17 15-17 9 0 15 7 15 17-4-3-7-6-9-10-5 6-12 9-21 10Z" fill="#31556A" />
            <path d="M59 199c2-17 11-26 23-26s21 9 23 26" fill="#4E9F91" />
            <rect x="118" y="146" width="44" height="5" rx="2.5" fill="#367C87" />
            <rect x="118" y="159" width="34" height="4" rx="2" fill="#D5E5E6" />
            <rect x="118" y="170" width="39" height="4" rx="2" fill="#D5E5E6" />
            <rect x="118" y="184" width="34" height="13" rx="6.5" fill="#E2F5EF" />
            <circle cx="126" cy="190.5" r="2" fill="#36A997" />
            <rect x="131" y="189" width="14" height="3" rx="1.5" fill="#36A997" />
          </>
        )}
      </motion.g>

      <motion.g animate={float(10, 4.8, 0.5)}>
        <rect x="326" y="92" width="131" height="115" rx="15" fill="#FFFFFF" stroke="#D7E9E8" strokeWidth="1.5" />
        <rect x="344" y="109" width="54" height="5" rx="2.5" fill="#367C87" />
        <rect x="344" y="121" width="87" height="4" rx="2" fill="#E0EBEB" />
        {variant === "projects" ? (
          <>
            <path d="M347 180h88" stroke="#E3EEEE" strokeWidth="1.5" />
            <path d="M353 173v-16h12v16m7 0v-28h12v28m7 0v-21h12v21m7 0v-34h12v34" fill="#8BD1BE" />
            <path d="M353 173v-16h12v16m7 0v-28h12v28m7 0v-21h12v21m7 0v-34h12v34" stroke="#42A99A" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="431" cy="147" r="8" fill="#FDF0DF" />
            <path d="m427 147 3 3 5-6" stroke="#E89B52" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : (
          <>
            <rect x="347" y="143" width="88" height="46" rx="9" fill="#F2F9F7" />
            <path d="M373 158v-4a18 18 0 0 1 36 0v4" stroke="#367C87" strokeWidth="4" strokeLinecap="round" />
            <rect x="365" y="155" width="53" height="31" rx="7" fill="#6EBDAA" />
            <rect x="372" y="163" width="39" height="16" rx="4" fill="#E9F7F2" />
            <path d="M382 170h19" stroke="#43A18F" strokeWidth="3" strokeLinecap="round" />
          </>
        )}
      </motion.g>

      <motion.g animate={float(5, 3.4, 0.2)}>
        <circle cx="252" cy="78" r="20" fill="#FFFFFF" stroke="#D7E9E8" strokeWidth="1.5" />
        <path d="m252 66 3.5 8.5 8.5 3.5-8.5 3.5-3.5 8.5-3.5-8.5-8.5-3.5 8.5-3.5 3.5-8.5Z" fill="#F3A65E" />
      </motion.g>

      <motion.g animate={float(6, 3.8, 0.8)}>
        <circle cx="251" cy="193" r="75" fill="#183F52" opacity=".08" />
        <path d="m184 154 67-39 67 39v78l-67 39-67-39v-78Z" fill={`url(#${id}-core)`} stroke="#C9E2E1" strokeWidth="2" />
        <path d="m184 154 67 39v78l-67-39v-78Z" fill="#E7F5F2" />
        <path d="m318 154-67 39v78l67-39v-78Z" fill="#CBE9E3" />
        <rect x="204" y="150" width="96" height="78" rx="17" fill={`url(#${id}-screen)`} stroke="#FFFFFF" strokeWidth="4" />
        <circle cx="252" cy="189" r="23" fill="#D9FBF0" />
        <circle cx="252" cy="189" r="16" fill="#51B99F" />
        <path d="M247 184h10m-10 10h10m-5-15v20" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M234 218h36" stroke="#B5DDD7" strokeWidth="3" strokeLinecap="round" />
        <circle cx="199" cy="165" r="3" fill="#F4A261" />
        <circle cx="305" cy="165" r="3" fill="#F4A261" />
        <circle cx="199" cy="221" r="3" fill="#55B9A5" />
        <circle cx="305" cy="221" r="3" fill="#55B9A5" />
      </motion.g>

      <motion.circle cx="115" cy="78" r="5" fill="#F4A261" animate={reduceMotion ? undefined : { opacity: [.35, 1, .35], scale: [.8, 1.15, .8] }} transition={{ duration: 2.6, repeat: Infinity }} />
      <motion.circle cx="390" cy="247" r="5" fill="#47AA9A" animate={reduceMotion ? undefined : { opacity: [.35, 1, .35], scale: [.8, 1.15, .8] }} transition={{ duration: 3.1, repeat: Infinity, delay: .4 }} />
      <motion.circle cx="155" cy="269" r="3.5" fill="#70C9B5" animate={reduceMotion ? undefined : { opacity: [.3, 1, .3] }} transition={{ duration: 2.2, repeat: Infinity, delay: .7 }} />
    </svg>
  );
}