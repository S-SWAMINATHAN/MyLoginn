import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { AiAgentWidget } from "@/components/layout/AiAgentWidget";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/layout/PageTransition";
import { getCurrentUser } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyLoginn — AI-Powered Learning, Tutoring & Growth",
  description:
    "Advanced digital marketing & AI/ML courses, CBSE/State Board tutoring, internships, and AI-driven digital marketing, app & web development services.",
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
            <Navbar user={navUser} />
            <main className="flex-1">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
            <MobileBottomNav loggedIn={Boolean(user)} />
            <AiAgentWidget />
          </ThemeProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
