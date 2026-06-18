import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { ThemeProvider } from "next-themes";

import { JsonLd } from "@/components/seo/json-ld";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@/services/clerk/components/clerk-provider";

const outfitSans = Outfit({
  variable: "--font-outfit-sans",
  subsets: ["latin"],
});

const BASE_URL = "https://prepforge-ten.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "PrepForge – AI-Powered Interview & Job Preparation",
    template: "%s | PrepForge",
  },
  description:
    "Ace your next interview with PrepForge. Practice with a real-time AI interviewer, optimize your resume for ATS, and master technical questions. Land offers 2x faster.",
  keywords: [
    "AI interview practice",
    "interview preparation",
    "resume optimization",
    "ATS resume",
    "coding interview prep",
    "job preparation",
    "mock interview",
    "technical interview",
    "PrepForge",
  ],
  authors: [{ name: "PrepForge" }],
  creator: "PrepForge",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "PrepForge",
    title: "PrepForge – AI-Powered Interview & Job Preparation",
    description:
      "Practice interviews with AI, optimize your resume, and master technical questions. Land your dream job faster.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PrepForge – AI-Powered Job Preparation Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PrepForge – AI-Powered Interview & Job Preparation",
    description:
      "Practice interviews with AI, optimize your resume, and master technical questions.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "PrepForge",
  url: BASE_URL,
  description:
    "AI-powered interview preparation platform. Practice with a real-time AI interviewer, optimize your resume, and master technical questions.",
  inLanguage: "en",
  publisher: {
    "@type": "Organization",
    name: "PrepForge",
  },
};

const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "PrepForge",
  url: BASE_URL,
  description:
    "AI-powered interview and job preparation platform. Practice mock interviews, optimize your resume for ATS, and master technical coding questions.",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  featureList: [
    "AI Mock Interview Practice",
    "Resume ATS Optimization",
    "Technical Question Practice",
    "Real-time AI Feedback",
    "Progress Tracking",
  ],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free tier available",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={cn("h-full", "antialiased", outfitSans.variable, "font-sans")}
      lang="en"
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-full">
        <JsonLd data={websiteJsonLd} />
        <JsonLd data={webAppJsonLd} />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableColorScheme
        >
          <ClerkProvider>
            {children}
            <Toaster />
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
