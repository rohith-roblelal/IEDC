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
import { cn, getBaseUrl } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export async function generateMetadata(): Promise<Metadata> {
  let settings = null;
  try {
    settings = await clientFetch("api/v1/settings", { next: { revalidate: 60 } });
  } catch (error) {}

  const siteName = settings?.site_name || "IEDC SNMIMT";
  const tagline = settings?.site_tagline || "Innovation and Entrepreneurship Development Cell";
  const siteDescription = settings?.seo_description || settings?.about_description || "Fostering innovation and entrepreneurship amongst young minds at SNM Institute of Management and Technology, Kerala.";
  const ogImage = settings?.og_image_url || "/api/og";

  return {
    metadataBase: new URL(getBaseUrl()),
    title: {
      default: `${siteName} | ${tagline}`,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
    alternates: {
      canonical: '/',
    },
    icons: settings?.favicon_url
      ? {
          icon: settings.favicon_url,
          shortcut: settings.favicon_url,
          // Apple touch icon always uses the verified local asset.
          // The admin-uploaded favicon_url may not meet Apple's 180×180 requirement.
          apple: "/apple-icon.png",
        }
      : {
          icon: "/favicon.ico",
          apple: "/apple-icon.png",
        },
    manifest: "/manifest.webmanifest",
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName,
      title: `${siteName} | ${tagline}`,
      description: siteDescription,
      url: '/',
      images: [{
        url: ogImage,
        alt: `${siteName} — Innovation and Entrepreneurship Development Cell`,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteName} | ${tagline}`,
      description: siteDescription,
      images: [ogImage],
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
        {/* Organization JSON-LD — Step 06: Schema.org structured data for IEDC SNMIMT */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              // Organization (not EducationalOrganization): IEDC SNMIMT is the
              // innovation/entrepreneurship cell — not the host institution itself.
              "@type": "Organization",
              // Stable identifier — referenced by future Event and Breadcrumb schema.
              "@id": `${getBaseUrl()}/#organization`,
              "name": initialSettings?.site_name || "IEDC SNMIMT",
              "url": getBaseUrl(),
              "description": initialSettings?.about_description ||
                "IEDC has been developed to foster and nurture innovations combined with entrepreneurship amongst young minds.",
              // Logo: include only when a public URL is available from settings.
              // If settings.logo_url is null (default), the property is omitted via
              // JSON.stringify dropping undefined values.
              ...(initialSettings?.logo_url
                ? { "logo": initialSettings.logo_url }
                : {}),
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Maliankara P.O, Moothankunnam",
                "addressLocality": "Ernakulam",
                "addressRegion": "Kerala",
                "postalCode": "683516",
                "addressCountry": "IN",
              },
              // Only the three verified social profiles are included.
              // twitter_url, youtube_url, github_url are NOT included — they are
              // unverified in the authoritative application defaults.
              "sameAs": [
                initialSettings?.facebook_url ||
                  "https://www.facebook.com/people/Iedc-Snmimt/61555494891838/",
                initialSettings?.instagram_url ||
                  "https://www.instagram.com/iedc.snm",
                initialSettings?.linkedin_url ||
                  "https://www.linkedin.com/in/iedcsnmimt/",
              ],
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
              "url": getBaseUrl(),
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
