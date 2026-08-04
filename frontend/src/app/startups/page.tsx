import { Metadata } from "next";
import StartupsClient from "./StartupsClient";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return {
    title: "Our Startups | IEDC SNMIMT",
    description: "Discover the innovative startups incubated and nurtured at IEDC SNMIMT.",
    alternates: {
      canonical: `${baseUrl}/startups`,
    },
    openGraph: {
      title: "Our Startups | IEDC SNMIMT",
      description: "Discover the innovative startups incubated and nurtured at IEDC SNMIMT.",
      url: `${baseUrl}/startups`,
    }
  };
}

export default function StartupsPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "IEDC SNMIMT Startups",
    "description": "Discover the innovative startups incubated and nurtured at IEDC SNMIMT.",
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/startups`
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {/* AI GEO Summary Block */}
      <section className="sr-only" aria-label="Quick Summary">
        <p>What is this page? A directory of student startups incubated at IEDC SNMIMT.</p>
        <p>What will you find here? Information about various campus startups, their founders, industries, and current development stages.</p>
      </section>
      <StartupsClient />
    </>
  );
}
