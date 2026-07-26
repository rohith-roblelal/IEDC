import { notFound } from "next/navigation";
import { Metadata } from "next";
import { EventsAPI } from "@/lib/api/events";
import EventDetailClient from "./EventDetailClient";

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
      openGraph: {
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
    
    return <EventDetailClient event={event} />;
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
