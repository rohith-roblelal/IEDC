import { getBaseUrl } from "@/lib/utils";
import { Metadata } from "next";
import StartupsClient from "./StartupsClient";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { clientFetch } from "@/lib/api/client";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Startups",
    description: "Explore the innovative student startups incubated at IEDC SNMIMT. Learn about our campus founders, their companies, industries, and technological disruptions.",
    alternates: {
      canonical: '/startups',
    },
    openGraph: {
      title: "Our Startups | IEDC SNMIMT",
      description: "Explore the innovative student startups incubated at IEDC SNMIMT. Learn about our campus founders, their companies, industries, and technological disruptions.",
      url: `${getBaseUrl()}/startups`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Our Startups | IEDC SNMIMT",
      description: "Explore the innovative student startups incubated at IEDC SNMIMT. Learn about our campus founders, their companies, industries, and technological disruptions.",
    }
  };
}

export default async function StartupsPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "IEDC SNMIMT Startups",
    "description": "Discover the innovative startups incubated and nurtured at IEDC SNMIMT.",
    "url": `${getBaseUrl()}/startups`
  };

  let startups = [];
  try {
    const data = await clientFetch("api/v1/startups", { next: { revalidate: 60 } });
    startups = data.items || (Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Failed to fetch startups:", err);
  }

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: getBaseUrl() },
          { name: "Startups", item: `${getBaseUrl()}/startups` },
        ]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {/* AI GEO Summary Block */}
      <section className="sr-only" aria-label="Quick Summary">
        <p>What is this page? A directory of student startups incubated at IEDC SNMIMT.</p>
        <p>What will you find here? Information about various campus startups, their founders, industries, and current development stages.</p>
      </section>
      <StartupsClient initialStartups={startups} />
    </>
  );
}
