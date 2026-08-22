import type { Metadata } from "next";
import { Poppins, Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ConditionalWrapper } from "@/components/ConditionalWrapper";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { ConfirmProvider } from "@/components/ui/ConfirmProvider";
import { SettingsProvider } from "@/lib/settings-context";

import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { CookieDisclosure } from "@/components/CookieDisclosure";

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

import { clientFetch } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export async function generateMetadata(): Promise<Metadata> {
  let settings = null;
  try {
    settings = await clientFetch("api/v1/settings", { next: { revalidate: 60 } });
  } catch (error) {}

  const siteName = settings?.site_name || "IEDC SNMIMT";
  const tagline = settings?.site_tagline || "Innovation and Entrepreneurship Development Cell";
  const defaultOgImage = "/api/og";
  
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    title: {
      default: `${siteName} | ${tagline}`,
      template: `%s | ${siteName}`,
    },
    description: settings?.seo_description || settings?.about_description || "Fostering innovations combined with entrepreneurship amongst young minds.",
    icons: settings?.favicon_url
      ? {
          icon: settings.favicon_url,
          shortcut: settings.favicon_url,
          apple: settings.favicon_url,
        }
      : {
          icon: "/favicon.ico",
          apple: "/logo.png",
        },
    manifest: "/manifest.webmanifest",
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: siteName,
      images: settings?.og_image_url ? [settings.og_image_url] : [defaultOgImage],
    },
    twitter: {
      card: "summary_large_image",
      site: "@iedcsnmimt",
      images: settings?.og_image_url ? [settings.og_image_url] : [defaultOgImage],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let initialSettings = null;
  try {
    initialSettings = await clientFetch("api/v1/settings", { next: { revalidate: 60 } });
  } catch (error: unknown) {
    console.error("Failed to fetch initial settings:", error);
  }

  return (
    <html lang="en" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <head suppressHydrationWarning>
      </head>
      <body suppressHydrationWarning className={`${poppins.variable} font-sans bg-[radial-gradient(circle_at_75%_20%,#3D1A5C,#0D1030_70%)] bg-fixed bg-[#0D1030] text-white antialiased min-h-screen flex flex-col relative`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": initialSettings?.site_name || "IEDC SNMIMT",
              "url": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
              "logo": initialSettings?.logo_url,
              "description": initialSettings?.about_description || "Innovation and Entrepreneurship Development Cell at SNMIMT",
              "sameAs": [
                initialSettings?.facebook_url,
                initialSettings?.instagram_url,
                initialSettings?.linkedin_url,
                initialSettings?.twitter_url,
                initialSettings?.youtube_url,
                initialSettings?.github_url,
              ].filter(Boolean)
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": initialSettings?.site_name || "IEDC SNMIMT",
              "url": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
            })
          }}
        />
        {/* Skip navigation - WCAG 2.4.1 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-cyan-500 focus:text-[#0A0E27] focus:font-bold focus:rounded-lg focus:outline-none"
        >
          Skip to main content
        </a>
        <ToastProvider>
          <ConfirmProvider>
            <SettingsProvider initialSettings={initialSettings}>
              <ConditionalWrapper excludePaths={["/dashboard"]}>
                <Navbar />
              </ConditionalWrapper>
              <main id="main-content" className="flex-1 relative z-10">
                {children}
              </main>
              <ConditionalWrapper excludePaths={["/dashboard"]}>
                <Footer />
              </ConditionalWrapper>
              <StickyMobileCTA />
              <CookieDisclosure />
            </SettingsProvider>
          </ConfirmProvider>
        </ToastProvider>
        <Analytics />
      </body>
    </html>
  );
}
