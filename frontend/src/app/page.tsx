import { Metadata } from "next";
import HomeClient from "./HomeClient";
import { EventSection } from "@/components/events/EventSection";

// Route-level caching removed so that EventSection can determine its own caching strategy
export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  let title = "IEDC SNMIMT | Innovation and Entrepreneurship Development Cell";
  let description = "IEDC SNMIMT fosters innovation and entrepreneurship amongst young minds, providing resources, mentorship, and funding for student startups.";
  
  try {
    const settings = await fetch(`${baseUrl}/api/v1/settings`, { 
      next: { revalidate: 3600 } 
    }).then(r => r.ok ? r.json() : null);
    if (settings) {
      title = `${settings.site_name} | ${settings.site_tagline || "Home"}`;
      description = settings.about_description || description;
    }
  } catch (error) {
    console.error("Failed to fetch settings for homepage metadata", error);
  }

  return {
    title,
    description,
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      title,
      description,
      url: baseUrl,
    },
    twitter: {
      title,
      description,
    }
  };
}

export default function Page() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is IEDC SNMIMT?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "IEDC SNMIMT is the Innovation and Entrepreneurship Development Cell at SNMIMT. It is a student-run community that fosters innovation, provides mentorship, and helps incubate student startups."
        }
      },
      {
        "@type": "Question",
        "name": "Who can join the IEDC SNMIMT Beta initiative?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Any student with an innovative idea can join Beta to receive resources, mentorship, and potential funding opportunities for their early-stage startup."
        }
      },
      {
        "@type": "Question",
        "name": "What kind of events does IEDC SNMIMT organize?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We organize hackathons, ideathons, workshops, technical talks, and networking events connecting students with industry leaders and successful founders."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomeClient />
      {/* EventSection is a Server Component, so we render it here to prevent client-side layout shifts */}
      <EventSection />
    </>
  );
}
