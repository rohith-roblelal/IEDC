"use client";

import { motion } from "framer-motion";
import { EventResponse } from "@/lib/api/events";
import { EventCard } from "@/components/events/EventCard";

interface EventsClientProps {
  upcomingEvents: EventResponse[];
  pastEvents: EventResponse[];
}

export default function EventsClient({ upcomingEvents, pastEvents }: EventsClientProps) {

  return (
    <div className="py-24 px-6 relative">
      <div className="mb-20">
        <h2 className="text-center text-[clamp(1.8rem,4vw,2.4rem)] font-bold mb-5">Upcoming Events</h2>
        <p className="max-w-[680px] mx-auto text-center text-[#C4C4D4] font-medium text-base mb-10">
          Register for open events hosted by IEDC SNMIMT. Your spot is confirmed once you submit the form.
        </p>

        {upcomingEvents.length === 0 ? (
          <div className="text-center text-[#C4C4D4] max-w-[480px] mx-auto p-8 border border-dashed border-white/10 rounded-[18px]">
            No upcoming events right now. Check back soon or follow us on Instagram for updates.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1100px] mx-auto">
            {upcomingEvents.map(event => <EventCard key={event.id} event={event} />)}
          </div>
        )}
      </div>

      {pastEvents.length > 0 && (
        <div className="mb-20">
          <h2 className="text-center text-[clamp(1.8rem,4vw,2.4rem)] font-bold mb-10">Past Events</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1100px] mx-auto opacity-80 hover:opacity-100 transition-opacity">
            {pastEvents.map(event => <EventCard key={event.id} event={event} />)}
          </div>
        </div>
      )}
    </div>
  );
}
