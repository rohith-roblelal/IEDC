import { Metadata } from "next";
import TeamClient from "./TeamClient";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return {
    title: "Our Team | IEDC SNMIMT",
    description: "Meet the dedicated team behind IEDC SNMIMT, driving innovation and entrepreneurship on campus.",
    alternates: {
      canonical: `${baseUrl}/team`,
    },
    openGraph: {
      title: "Our Team | IEDC SNMIMT",
      description: "Meet the dedicated team behind IEDC SNMIMT, driving innovation and entrepreneurship on campus.",
      url: `${baseUrl}/team`,
    }
  };
}

export default function TeamPage() {
  // CollectionPage for the team directory
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "IEDC SNMIMT Team",
    "description": "Meet the dedicated team behind IEDC SNMIMT, driving innovation and entrepreneurship on campus.",
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/team`,
    "about": {
      "@type": "Organization",
      "name": "IEDC SNMIMT"
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
        <p>What is this page? A directory of the leadership and core team members of IEDC SNMIMT.</p>
        <p>Who will you find here? Nodal officers, student leaders, executive committee members, and assistant leads driving innovation at SNMIMT.</p>
      </section>
      <TeamClient />
    </>
  );
}
