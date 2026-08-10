import { Calendar } from "lucide-react";
import Link from "next/link";
import { EventCard } from "@/components/events/EventCard";
import { EventsAPI, EventResponse } from "@/lib/api/events";

interface EventSectionProps {
  title?: string;
  maxItems?: number;
  showViewAll?: boolean;
}

export async function EventSection({ 
  title = "Upcoming Events", 
  maxItems = 3, 
  showViewAll = true 
}: EventSectionProps) {
  let events: EventResponse[] = [];
  try {
    // We fetch one extra to see if we need the 'View All' link
    const res = await EventsAPI.getEvents({ 
      page: 1, 
      page_size: maxItems + 1, 
      sort: 'date_asc',
      scope: 'upcoming'
    }, true, { next: { revalidate: 60 } });
    events = Array.isArray(res) ? res : (res as any).items || [];
  } catch (error) {
    console.error("Failed to fetch upcoming events", error);
  }

  const hasMore = events.length > maxItems;
  const displayEvents = events.slice(0, maxItems);

  return (
    <section className="px-6 py-12 max-w-[1100px] mx-auto">
      <div className="flex items-center gap-3 mb-8 justify-center">
        <Calendar className="text-blue-400" size={28} />
        <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-bold">{title}</h2>
      </div>
      
      {displayEvents.length === 0 ? (
        <div className="text-center text-[#C4C4D4] max-w-[480px] mx-auto p-8 border border-dashed border-white/10 rounded-[18px]">
          No upcoming events at the moment. Explore all past events.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayEvents.map((event: EventResponse) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          {showViewAll && hasMore && (
            <div className="text-center mt-8">
              <Link 
                href="/events" 
                className="inline-block bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-8 rounded-full transition-colors border border-white/10"
              >
                View All Events →
              </Link>
            </div>
          )}
        </>
      )}
    </section>
  );
}
