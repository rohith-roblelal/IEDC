import { getBaseUrl } from "@/lib/utils";
import { Metadata } from "next";
import GalleryClient from "./GalleryClient";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

export async function generateMetadata(): Promise<Metadata> {
  
  return {
    title: "Gallery",
    description: "Explore the IEDC SNMIMT event gallery. View highlights, photos, and posters from our recent hackathons, technical workshops, and entrepreneurship programs.",
    alternates: {
      canonical: '/gallery',
    },
    openGraph: {
      title: "Event Gallery | IEDC SNMIMT",
      description: "Explore the IEDC SNMIMT event gallery. View highlights, photos, and posters from our recent hackathons, technical workshops, and entrepreneurship programs.",
      url: `${getBaseUrl()}/gallery`,
    },
    twitter: {
      card: "summary_large_image",
      title: "Event Gallery | IEDC SNMIMT",
      description: "Explore the IEDC SNMIMT event gallery. View highlights, photos, and posters from our recent hackathons, technical workshops, and entrepreneurship programs.",
    }
  };
}

export default function GalleryPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "name": "IEDC SNMIMT Event Gallery",
    "description": "Posters and highlights from our incredible events.",
    "url": `${getBaseUrl()}/gallery`,
    "publisher": {
      "@type": "Organization",
      "name": "IEDC SNMIMT"
    }
  };

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: getBaseUrl() },
          { name: "Gallery", item: `${getBaseUrl()}/gallery` },
        ]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {/* AI GEO Summary Block */}
      <section className="sr-only" aria-label="Quick Summary">
        <p>What is this page? A visual gallery containing event posters, highlights, and snapshots from IEDC SNMIMT activities.</p>
        <p>What kind of images are here? Photos and promotional material from hackathons, workshops, and startup networking events.</p>
      </section>
      <GalleryClient />
    </>
  );
}
