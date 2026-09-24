import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
<<<<<<< HEAD
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { AiAgentWidget } from "@/components/layout/AiAgentWidget";
import { ProjectRequestModal } from "@/components/services/ProjectRequestModal";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/layout/PageTransition";
import { HideOnAdmin } from "@/components/layout/HideOnAdmin";
import { getCurrentUser } from "@/lib/auth";
import { siteUrl } from "@/lib/site";
=======
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/layout/PageTransition";
import { getCurrentUser } from "@/lib/auth";
>>>>>>> 9a00051 (Initial commit)

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
<<<<<<< HEAD
  metadataBase: new URL(siteUrl),
  title: "MyLoginn — Web, Mobile, AI & Intelligent Digital Experiences",
  description:
    "MyLoginn Tech Private Limited builds web, mobile and custom software, AI and AI agents, and automation — plus hands-on courses and 1:1 tutoring in AI/ML, full-stack development, data and more.",
  alternates: { canonical: "/" },
=======
  title: "MyLoginn — AI-Powered Learning, Tutoring & Growth",
  description:
    "Advanced digital marketing & AI/ML courses, CBSE/State Board tutoring, internships, and AI-driven digital marketing, app & web development services.",
>>>>>>> 9a00051 (Initial commit)
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const navUser = user
    ? { name: user.name, role: user.role, avatarColor: user.avatarColor, avatarUrl: user.avatarUrl }
    : null;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <MotionConfig reducedMotion="user">
          <ThemeProvider>
<<<<<<< HEAD
            <HideOnAdmin>
              <Navbar user={navUser} />
            </HideOnAdmin>
            <main className="flex-1">
              <PageTransition>{children}</PageTransition>
            </main>
            <HideOnAdmin>
              <Footer />
              <MobileBottomNav loggedIn={Boolean(user)} />
              <AiAgentWidget />
              <ProjectRequestModal />
            </HideOnAdmin>
=======
            <Navbar user={navUser} />
            <main className="flex-1">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
>>>>>>> 9a00051 (Initial commit)
          </ThemeProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
