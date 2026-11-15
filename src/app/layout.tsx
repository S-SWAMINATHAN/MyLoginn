import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
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
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { getCurrentUser } from "@/lib/auth";
import { siteUrl } from "@/lib/site";

// Google Fonts, self-hosted by next/font: Inter for reading and interface text, Plus Jakarta Sans for headings.
const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans-body",
  display: "swap",
});

const fontDisplay = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display-face",
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-code",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MyLoginn | Web, App & Digital Solutions for Businesses",
    template: "%s | MyLoginn",
  },
  description:
    "Your technology partner to build, automate and grow. MyLoginn creates websites, mobile apps, desktop software and AI agents, and grows them with digital marketing.",
  applicationName: "MyLoginn",
  authors: [{ name: "MyLoginn Tech" }],
  creator: "MyLoginn Tech",
  publisher: "MyLoginn Tech",
  category: "Technology",
  keywords: [
    "MyLoginn", "MyLoginn Tech",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "MyLoginn",
    title: "MyLoginn | Web, App & Digital Solutions for Businesses",
    description:
      "India-based IT company building websites, mobile apps, desktop software, AI agents and digital marketing for businesses worldwide.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyLoginn | Web, App & Digital Solutions for Businesses",
    description:
      "India-based IT company building websites, mobile apps, desktop software, AI agents and digital marketing for businesses worldwide.",
  },
  formatDetection: { telephone: false, email: false, address: false },
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
      data-theme="light"
      style={{ colorScheme: "light" }}
      data-scroll-behavior="smooth"
      className={`${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable} min-h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        <MotionConfig reducedMotion="user">
          <ThemeProvider>
            <HideOnAdmin>
              <Navbar user={navUser} />
            </HideOnAdmin>
            <HideOnAdmin>
              <Breadcrumbs />
            </HideOnAdmin>
            <main className="flex-1">
              <PageTransition>{children}</PageTransition>
            </main>
            <HideOnAdmin>
              <Footer />
              <MobileBottomNav user={navUser} />
              <AiAgentWidget />
              <ProjectRequestModal />
            </HideOnAdmin>
          </ThemeProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
