import { getBaseUrl } from "@/lib/utils";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import StartupsClient from "../StartupsClient";
import { startupsApi } from "@/lib/api/startups";
import JsonLd from "@/components/seo/JsonLd";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { data: startup } = await startupsApi.getPublicStartup(slug);
    if (!startup) {
      return { title: "Startup Not Found | IEDC SNMIMT" };
    }

    const baseUrl = getBaseUrl();
    const description = startup.short_description || startup.description || `Discover ${startup.name}, a student startup incubated at IEDC SNMIMT.`;

    return {
      title: `${startup.name} | IEDC SNMIMT Startups`,
      description,
      alternates: {
        canonical: `/startups/${slug}`,
      },
      openGraph: {
        title: `${startup.name} | IEDC SNMIMT Startups`,
        description,
        url: `/startups/${slug}`,
        images: startup.logo_url ? [{ url: startup.logo_url, alt: `${startup.name} logo` }] : [{ url: '/api/og', alt: 'IEDC SNMIMT — Innovation and Entrepreneurship Development Cell' }],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${startup.name} | IEDC SNMIMT Startups`,
        description,
        images: startup.logo_url ? [startup.logo_url] : ['/api/og'],
      }
    };
  } catch {
    return { title: "Startup Not Found | IEDC SNMIMT" };
  }
}

export default async function StartupDetailPage({ params }: Props) {
  const { slug } = await params;

  let startup: Awaited<ReturnType<typeof startupsApi.getPublicStartup>>["data"] | null = null;

  try {
    const result = await startupsApi.getPublicStartup(slug);
    startup = result.data;
  } catch (error: unknown) {
    const apiError = error as { status?: number };
    if (apiError?.status === 404) {
      notFound();
    }
    // For other errors, startup remains null and we show error state below
  }

  if (!startup) {
    return (
      <div className="min-h-screen pt-24 text-center">
        <h1 className="text-3xl font-bold text-white">Error</h1>
        <p className="text-red-400 mt-4">Failed to load startup details. Please try again later.</p>
      </div>
    );
  }

  const baseUrl = getBaseUrl();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": startup.name,
    "description": startup.full_description || startup.short_description || startup.description,
    "url": startup.website_url || `${baseUrl}/startups/${slug}`,
    "logo": startup.logo_url,
    "foundingDate": startup.founded_date,
    "parentOrganization": {
      "@type": "Organization",
      "name": "IEDC SNMIMT"
    }
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": "Startups", "item": `${baseUrl}/startups` },
      { "@type": "ListItem", "position": 3, "name": startup.name, "item": `${baseUrl}/startups/${slug}` },
    ]
  };

  return (
    <main>
      <JsonLd type="Organization" data={schema} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* AI GEO Summary Block */}
      <section className="sr-only" aria-label="Quick Summary">
        <p>What is this page? The directory profile for {startup.name}, an innovative startup incubated at IEDC SNMIMT.</p>
        <p>Industry: {startup.industry || "General"}</p>
        <p>Stage: {startup.stage?.replace('_', ' ').toLowerCase() || startup.status}</p>
      </section>
      <StartupsClient initialStartupSlug={slug} />
    </main>
  );
}
