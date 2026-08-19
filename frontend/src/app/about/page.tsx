import { Metadata } from "next";
import AboutClient from "./AboutClient";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const title = "About IEDC";
  let description = "Learn about IEDC SNMIMT's mission to foster student innovation and entrepreneurship. Discover our initiatives, leadership team, and campus opportunities.";
  
  try {
    const settings = await fetch(`${baseUrl}/api/v1/settings`, { next: { revalidate: 60 } }).then(r => r.json());
    if (settings && settings.about_description) {
      description = settings.about_description;
    }
  } catch (error) {
    console.error("Failed to fetch settings for about page metadata", error);
  }

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/about`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/about`,
    },
    twitter: {
      card: "summary",
      title,
      description,
    }
  };
}

export default function AboutPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About IEDC SNMIMT",
    "description": "Fostering and nurturing innovations combined with entrepreneurship.",
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/about`,
    "mainEntity": {
      "@type": "Organization",
      "name": "IEDC SNMIMT",
      "url": process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {/* AI GEO Summary Block */}
      <section className="sr-only" aria-label="Quick Summary">
        <p>What is this page? The About page for IEDC SNMIMT.</p>
        <p>What is the mission? To dive into the inner potential and to promote technological disruptions when proffering the nurturing mind to think laterally and divergently.</p>
      </section>
      <AboutClient />
    </>
  );
}
