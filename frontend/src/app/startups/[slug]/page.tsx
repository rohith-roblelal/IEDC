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
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const description = startup.short_description || startup.description || `Discover ${startup.name}, a student startup incubated at IEDC SNMIMT.`;
    
    return {
      title: `${startup.name} | IEDC SNMIMT Startups`,
      description,
      alternates: {
        canonical: `${baseUrl}/startups/${slug}`,
      },
      openGraph: {
        title: `${startup.name} | IEDC SNMIMT Startups`,
        description,
        url: `${baseUrl}/startups/${slug}`,
        images: startup.logo_url ? [startup.logo_url] : [],
        type: "website",
      },
      twitter: {
        title: `${startup.name} | IEDC SNMIMT Startups`,
        description,
        images: startup.logo_url ? [startup.logo_url] : [],
      }
    };
  } catch (error) {
    return { title: "Startup Not Found | IEDC SNMIMT" };
  }
}

export default async function StartupDetailPage({ params }: Props) {
  const { slug } = await params;
  
  try {
    const { data: startup } = await startupsApi.getPublicStartup(slug);
    
    if (!startup) {
      notFound();
    }

    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": startup.name,
      "description": startup.full_description || startup.short_description || startup.description,
      "url": startup.website_url || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/startups/${slug}`,
      "logo": startup.logo_url,
      "foundingDate": startup.founded_date,
      "parentOrganization": {
        "@type": "Organization",
        "name": "IEDC SNMIMT"
      }
    };

    return (
      <main>
        <JsonLd type="Organization" data={schema} />
        {/* AI GEO Summary Block */}
        <section className="sr-only" aria-label="Quick Summary">
          <p>What is this page? The directory profile for {startup.name}, an innovative startup incubated at IEDC SNMIMT.</p>
          <p>Industry: {startup.industry || "General"}</p>
          <p>Stage: {startup.stage?.replace('_', ' ').toLowerCase() || startup.status}</p>
        </section>
        <StartupsClient initialStartupSlug={slug} />
      </main>
    );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error?.status === 404) {
      notFound();
    }
    return (
      <div className="min-h-screen pt-24 text-center">
        <h1 className="text-3xl font-bold text-white">Error</h1>
        <p className="text-red-400 mt-4">Failed to load startup details. Please try again later.</p>
      </div>
    );
  }
}
