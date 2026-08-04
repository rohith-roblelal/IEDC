import { notFound } from "next/navigation";
import { Metadata } from "next";
import { EventsAPI } from "@/lib/api/events";
import EventDetailClient from "./EventDetailClient";
import JsonLd from "@/components/seo/JsonLd";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://iedcsnmimt.com';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const event = await EventsAPI.getEvent(slug, true, { next: { revalidate: 60 } });
    if (!event || !event.is_published) {
      return { title: "Event Not Found | IEDC SNMIMT" };
    }
    
    return {
      title: `${event.title} | IEDC SNMIMT`,
      description: event.short_description || event.description.substring(0, 160),
      alternates: {
        canonical: `${baseUrl}/events/${slug}`,
      },
      openGraph: {
        title: `${event.title} | IEDC SNMIMT`,
        description: event.short_description || event.description.substring(0, 160),
        url: `${baseUrl}/events/${slug}`,
        type: "article",
        images: event.banner_image_url ? [{ url: event.banner_image_url }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: event.title,
        description: event.short_description || event.description.substring(0, 160),
        images: event.banner_image_url ? [event.banner_image_url] : [],
      }
    };
  } catch (error) {
    return { title: "Event Not Found | IEDC SNMIMT" };
  }
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  
  try {
    const event = await EventsAPI.getEvent(slug, true, { next: { revalidate: 60 } });
    
    if (!event || !event.is_published) {
      notFound();
    }
    
    const eventJsonLd = {
      name: event.title,
      description: event.short_description || event.description.substring(0, 160),
      image: event.banner_image_url,
      startDate: event.start_date,
      endDate: event.end_date || event.start_date,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: {
        "@type": "Place",
        name: event.venue || "IEDC SNMIMT",
      },
      organizer: {
        "@type": "Organization",
        name: "IEDC SNMIMT",
        url: baseUrl,
      }
    };
    
    return (
      <main>
        <JsonLd type="Event" data={eventJsonLd} />
        <EventDetailClient event={event} />
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
        <p className="text-red-400 mt-4">Failed to load event details. Please try again later.</p>
      </div>
    );
  }
}
