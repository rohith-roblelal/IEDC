import { getBaseUrl } from "@/lib/utils";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { EventsAPI, EventResponse } from "@/lib/api/events";
import EventDetailClient from "./EventDetailClient";
import JsonLd from "@/components/seo/JsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

const baseUrl = getBaseUrl();

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
        canonical: `/events/${slug}`,
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

  // Strip HTML for safe plain text description
  const safeDescription = event.short_description || 
    (event.description ? event.description.replace(/<[^>]*>?/gm, '').substring(0, 160).trim() : "");

  const eventJsonLd = {
    "@id": `${baseUrl}/events/${slug}#event`,
    url: `${baseUrl}/events/${slug}`,
    name: event.title,
    description: safeDescription,
    ...(event.banner_url ? { image: event.banner_url } : {}),
    startDate: event.start_datetime,
    ...(event.end_datetime ? { endDate: event.end_datetime } : {}),
    ...(event.status && statusMap[event.status] ? { eventStatus: statusMap[event.status] } : {}),
    ...(event.venue ? {
      location: {
        "@type": "Place",
        name: event.venue,
      }
    } : {}),
    organizer: {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
    }
  };

    return (
    <main>
      <JsonLd type="Event" data={eventJsonLd} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: baseUrl },
          { name: "Events", item: `${baseUrl}/events` },
          { name: event.title, item: `${baseUrl}/events/${slug}` },
        ]}
      />
      <EventDetailClient event={event} />
    </main>
  );
}
