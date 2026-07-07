"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Settings, Camera, LogOut } from "lucide-react";
import { AnimatedUser } from "@/components/ui/icons/AnimatedUser";
import { AnimatedShield } from "@/components/ui/icons/AnimatedShield";
import { Avatar } from "@/components/ui/Avatar";
import { AvatarUploadModal } from "./AvatarUploadModal";

export type ProfileUser = {
  name: string;
  role: string;
  avatarColor: string;
  avatarUrl: string | null;
};

export function ProfileMenu({ user, onOpen }: { user: ProfileUser; onOpen?: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) onOpen?.();
        }}
        className="animate-breathe-ring flex items-center justify-center rounded-full ring-2 ring-transparent transition-all duration-200 hover:ring-brand-300 cursor-pointer"
        aria-label="Account menu"
      >
        <Avatar name={user.name} avatarColor={user.avatarColor} avatarUrl={user.avatarUrl} size={38} fallback="silhouette" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border-soft bg-surface p-1.5 shadow-[var(--shadow-lift)]"
          >
            <MenuLink href="/dashboard#profile" icon={<AnimatedUser className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />} label="My Profile" onClick={() => setOpen(false)} />
            <MenuLink href="/dashboard" icon={<LayoutDashboard className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />} label="Dashboard" onClick={() => setOpen(false)} />
            <MenuLink
              href="/dashboard#settings"
              icon={<Settings className="h-5 w-5 transition-transform duration-500 ease-out group-hover:rotate-180" />}
              label="Settings"
              onClick={() => setOpen(false)}
            />
            {user.role === "ADMIN" && (
              <MenuLink href="/admin" icon={<AnimatedShield className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />} label="Admin" onClick={() => setOpen(false)} />
            )}
            <div className="my-1 h-px bg-border-soft" />
            <button
              onClick={() => {
                setUploadOpen(true);
                setOpen(false);
              }}
              className="group flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-colors duration-150 hover:bg-surface-2"
            >
              <motion.span
                className="inline-flex transition-transform duration-300 group-hover:scale-110"
                animate={{ opacity: [1, 1, 0.15, 1, 1] }}
                transition={{ duration: 2.8, repeat: Infinity, times: [0, 0.75, 0.82, 0.89, 1], ease: "easeInOut" }}
              >
                <Camera className="h-5 w-5" />
              </motion.span>
              Update photo
            </button>
            <button
              onClick={handleLogout}
              className="group flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-danger transition-colors duration-150 hover:bg-danger/10"
            >
              <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:translate-x-0.5" /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AvatarUploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  );
}

function MenuLink({ href, icon, label, onClick }: { href: string; icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-150 hover:bg-surface-2"
    >
      {icon} {label}
    </Link>
  );
}
