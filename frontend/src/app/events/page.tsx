import { Metadata } from "next";
import EventsClient from "./EventsClient";
import { EventsAPI } from "@/lib/api/events";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return {
    title: "Events | IEDC SNMIMT",
    description: "Register for open events, hackathons, and workshops hosted by IEDC SNMIMT.",
    alternates: {
      canonical: `${baseUrl}/events`,
    },
    openGraph: {
      title: "Events | IEDC SNMIMT",
      description: "Register for open events, hackathons, and workshops hosted by IEDC SNMIMT.",
      url: `${baseUrl}/events`,
    }
  };
}

export default async function EventsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  let upcomingEvents = [];
  let pastEvents = [];

  try {
    const res = await EventsAPI.getEvents({ page: 1, page_size: 100 }, true);
    const items = Array.isArray(res) ? res : (res as any).items || [];
    upcomingEvents = items.filter((e: any) => ["UPCOMING", "ONGOING", "PUBLISHED", "REGISTRATION_OPEN", "REGISTRATION_CLOSED"].includes(e.status));
    pastEvents = items.filter((e: any) => e.status === "COMPLETED" || e.status === "PAST");
  } catch (error) {
    console.error("Failed to fetch events", error);
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "IEDC SNMIMT Events",
    "description": "Register for open events hosted by IEDC SNMIMT.",
    "url": `${baseUrl}/events`,
    "hasPart": [...upcomingEvents, ...pastEvents].map((event: any) => ({
      "@type": "Event",
      "name": event.title,
      "url": `${baseUrl}/events/${event.slug || event.id}`
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {/* AI GEO Summary Block */}
      <section className="sr-only" aria-label="Quick Summary">
        <p>What is this page? A listing of all upcoming and past events hosted by IEDC SNMIMT.</p>
        <p>What can you do here? Browse events, check registration deadlines, and sign up for workshops and hackathons.</p>
      </section>
      
      {/* Hidden H1 for SEO, since EventsClient uses H2 for sections */}
      <h1 className="sr-only">IEDC SNMIMT Events</h1>

      <EventsClient upcomingEvents={upcomingEvents} pastEvents={pastEvents} />
    </>
  );
}
