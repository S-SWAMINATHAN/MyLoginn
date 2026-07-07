"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { AnimatedMail } from "@/components/ui/icons/AnimatedMail";
import { AnimatedPhone } from "@/components/ui/icons/AnimatedPhone";
import type { SVGProps } from "react";
import logo from "@/images/Logos/Logo-trimmed.png";

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9h4v12H3zM9.5 9H13v1.7c.6-1 1.9-2 3.9-2 3 0 4.6 2 4.6 5.5V21h-4v-6.1c0-1.4-.5-2.4-1.9-2.4-1.1 0-1.7.7-2 1.4-.1.3-.1.6-.1 1V21h-4z" />
    </svg>
  );
}

function TwitterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.9 3H21l-6.7 7.66L22.2 21h-6.5l-4.8-6.3L5.3 21H3.2l7.1-8.13L2.4 3h6.66l4.3 5.77L18.9 3Zm-1.14 16.2h1.2L7.32 4.72H6.02L17.76 19.2Z" />
    </svg>
  );
}

const columns = [
  {
    title: "Learn",
    links: [
      { href: "/courses", label: "AI & Digital Marketing Courses" },
      { href: "/tutoring", label: "Online Tutoring (CBSE / State)" },
      { href: "/internships", label: "Internship Programs" },
    ],
  },
  {
    title: "Services",
    links: [
      { href: "/services/digital-marketing", label: "Digital Marketing" },
      { href: "/services/app-web-development", label: "App & Web Development" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/login", label: "Log in" },
      { href: "/signup", label: "Create account" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border-soft bg-surface-2/60">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center">
                <Image
                  src={logo}
                  alt="MyLoginn"
                  className="h-9 w-auto select-none object-contain"
                />
              </Link>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted">
              AI-powered learning, tutoring, internships and growth services &mdash;
              built for students, professionals and businesses.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {[InstagramIcon, LinkedinIcon, TwitterIcon].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border-soft transition-colors duration-200 hover:border-brand-400 hover:text-brand-500"
                  whileHover={{ y: -3, scale: 1.1, rotate: 6 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 320, damping: 16 }}
                >
                  <Icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold">{col.title}</p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors duration-200 hover:text-brand-500"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border-soft pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} MyLoginn. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-5 text-xs text-muted">
            <a href="mailto:mailloginn@gmail.com" className="group flex items-center gap-1.5 transition-colors duration-200 hover:text-brand-500">
              <AnimatedMail className="h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-125" /> mailloginn@gmail.com
            </a>
            <a href="tel:+919655560555" className="group flex items-center gap-1.5 transition-colors duration-200 hover:text-brand-500">
              <AnimatedPhone className="h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-125" /> +91 96555 60555
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
