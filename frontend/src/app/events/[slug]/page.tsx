import { notFound } from "next/navigation";
import { Metadata } from "next";
import { EventsAPI, EventResponse } from "@/lib/api/events";
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
      title: event.title,
      description: event.short_description || event.description.substring(0, 160),
      alternates: {
        canonical: `${baseUrl}/events/${slug}`,
      },
      openGraph: {
        title: `${event.title} | IEDC SNMIMT`,
        description: event.short_description || event.description.substring(0, 160),
        url: `${baseUrl}/events/${slug}`,
        type: "article",
        images: event.banner_url ? [{ url: event.banner_url }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: event.title,
        description: event.short_description || event.description.substring(0, 160),
        images: event.banner_url ? [event.banner_url] : [],
      }
    };
  } catch {
    return { title: "Event Not Found | IEDC SNMIMT" };
  }
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;

  let event: EventResponse | null = null;

  try {
    event = await EventsAPI.getEvent(slug, true, { next: { revalidate: 60 } });
  } catch (error: unknown) {
    const apiError = error as { status?: number };
    if (apiError?.status === 404) {
      notFound();
    }
    // For other errors, event remains null and we show error state below
  }

  if (!event || !event.is_published) {
    notFound();
  }

  // Map backend status to schema.org EventStatus
  const statusMap: Record<string, string> = {
    UPCOMING: "https://schema.org/EventScheduled",
    PUBLISHED: "https://schema.org/EventScheduled",
    REGISTRATION_OPEN: "https://schema.org/EventScheduled",
    REGISTRATION_CLOSED: "https://schema.org/EventScheduled",
    ONGOING: "https://schema.org/EventScheduled",
    COMPLETED: "https://schema.org/EventCompleted",
    PAST: "https://schema.org/EventCompleted",
    CANCELLED: "https://schema.org/EventCancelled",
  };

  const eventJsonLd = {
    name: event.title,
    description: event.short_description || event.description.substring(0, 160),
    image: event.banner_url,
    startDate: event.start_datetime,
    endDate: event.end_datetime || event.start_datetime,
    eventStatus: statusMap[event.status] || "https://schema.org/EventScheduled",
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

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": "Events", "item": `${baseUrl}/events` },
      { "@type": "ListItem", "position": 3, "name": event.title, "item": `${baseUrl}/events/${slug}` },
    ]
  };

  return (
    <main>
      <JsonLd type="Event" data={eventJsonLd} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <EventDetailClient event={event} />
    </main>
  );
}
