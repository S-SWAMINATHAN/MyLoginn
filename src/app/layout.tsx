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
import { CONTACT_EMAIL, CONTACT_PHONES } from "@/lib/contactInfo";
import companyLogo from "@/images/MyLoginn Logo Icon.png";

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
  title: {
    default: "MyLoginn | AI Digital Marketing, Software & Career Learning",
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
    "MyLoginn", "My Login", "MyLogin", "My Loginn", "MyLoginn Tech Private Limited", "software development company",
    "web development company", "mobile app development", "AI solutions",
    "digital marketing services", "AI digital marketing agency", "AI digital marketing services",
    "technology courses", "online tutoring", "technology internships",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "MyLoginn",
    title: "MyLoginn | AI Digital Marketing, Software & Career Learning",
    description:
      "Software development, AI, digital marketing, hands-on technology courses, tutoring, and internships from MyLoginn Tech Private Limited.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyLoginn | AI Digital Marketing, Software & Career Learning",
    description:
      "Software development, AI, digital marketing, hands-on technology courses, tutoring, and internships from MyLoginn Tech Private Limited.",
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

const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "MyLoginn",
      alternateName: ["My Login", "MyLogin", "My Loginn"],
      legalName: "MyLoginn Tech Private Limited",
      url: siteUrl,
      logo: `${siteUrl}${companyLogo.src}`,
      email: CONTACT_EMAIL,
      contactPoint: CONTACT_PHONES.map((phone) => ({
        "@type": "ContactPoint",
        telephone: phone.tel,
        contactType: "customer support",
        areaServed: "IN",
      })),
      knowsAbout: [
        "Web development", "Mobile app development", "Artificial intelligence",
        "Digital marketing", "Technology education", "Online tutoring", "Technology internships",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "MyLoginn",
      alternateName: ["My Login", "MyLogin", "My Loginn"],
      publisher: { "@id": `${siteUrl}/#organization` },
      inLanguage: "en-IN",
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c"),
          }}
        />
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
