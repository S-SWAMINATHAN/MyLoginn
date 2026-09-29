import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { AiAgentWidget } from "@/components/layout/AiAgentWidget";
import { ProjectRequestModal } from "@/components/services/ProjectRequestModal";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/layout/PageTransition";
import { HideOnAdmin } from "@/components/layout/HideOnAdmin";
import { getCurrentUser } from "@/lib/auth";
import { siteUrl } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon", sizes: "48x48" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
  title: {
    default: "MyLoginn | AI-Driven IT Company for Web, App & Digital Solutions",
    template: "%s | MyLoginn",
  },
  description:
    "MyLoginn Tech Private Limited builds web and mobile software, AI solutions, and digital marketing campaigns, and offers practical technology courses, tutoring, and internships.",
  applicationName: "MyLoginn",
  authors: [{ name: "MyLoginn Tech Private Limited" }],
  creator: "MyLoginn Tech Private Limited",
  publisher: "MyLoginn Tech Private Limited",
  category: "Technology and professional education",
  keywords: [
    "MyLoginn", "MyLoginn Tech", "MyLoginn Tech Private Limited",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "MyLoginn",
    title: "MyLoginn | AI-Driven IT Company for Web, App & Digital Solutions",
    description:
      "MyLoginn Tech Private Limited provides website and app development, digital marketing, custom software, AI solutions, courses and internships.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyLoginn | AI-Driven IT Company for Web, App & Digital Solutions",
    description:
      "MyLoginn Tech Private Limited provides website and app development, digital marketing, custom software, AI solutions, courses and internships.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
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
      className={`${geistSans.variable} ${geistMono.variable} min-h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        <MotionConfig reducedMotion="user">
          <ThemeProvider>
            <HideOnAdmin>
              <Navbar user={navUser} />
            </HideOnAdmin>
            <main className="flex-1">
              <PageTransition>{children}</PageTransition>
            </main>
            <HideOnAdmin>
              <Footer />
              <MobileBottomNav />
              <AiAgentWidget />
              <ProjectRequestModal />
            </HideOnAdmin>
          </ThemeProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
