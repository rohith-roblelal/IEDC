import { Metadata } from "next";
import GalleryClient from "./GalleryClient";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return {
    title: "Event Gallery | IEDC SNMIMT",
    description: "View posters and highlights from our incredible events, hackathons, and workshops at IEDC SNMIMT.",
    alternates: {
      canonical: `${baseUrl}/gallery`,
    },
    openGraph: {
      title: "Event Gallery | IEDC SNMIMT",
      description: "View posters and highlights from our incredible events, hackathons, and workshops at IEDC SNMIMT.",
      url: `${baseUrl}/gallery`,
    }
  };
}

export default function GalleryPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "name": "IEDC SNMIMT Event Gallery",
    "description": "Posters and highlights from our incredible events.",
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/gallery`,
    "publisher": {
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
        <p>What is this page? A visual gallery containing event posters, highlights, and snapshots from IEDC SNMIMT activities.</p>
        <p>What kind of images are here? Photos and promotional material from hackathons, workshops, and startup networking events.</p>
      </section>
      <GalleryClient />
    </>
  );
}
