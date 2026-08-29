import { getBaseUrl } from "@/lib/utils";
import { Metadata } from "next";
import TeamClient from "./TeamClient";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Team",
    description: "Meet the dedicated executive committee, nodal officers, and student leaders behind IEDC SNMIMT who are driving innovation and entrepreneurship on our campus.",
    alternates: {
      canonical: '/team',
    },
    openGraph: {
      title: "Our Team | IEDC SNMIMT",
      description: "Meet the dedicated executive committee, nodal officers, and student leaders behind IEDC SNMIMT who are driving innovation and entrepreneurship on our campus.",
      url: `${getBaseUrl()}/team`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Our Team | IEDC SNMIMT",
      description: "Meet the dedicated executive committee, nodal officers, and student leaders behind IEDC SNMIMT who are driving innovation and entrepreneurship on our campus.",
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
    "url": `${getBaseUrl()}/team`,
    "about": {
      "@id": `${getBaseUrl()}/#organization`
    }
  };

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: getBaseUrl() },
          { name: "Team", item: `${getBaseUrl()}/team` },
        ]}
      />

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
