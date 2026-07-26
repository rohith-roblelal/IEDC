"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { EventResponse } from "@/lib/api/events";

interface EventsClientProps {
  upcomingEvents: EventResponse[];
  pastEvents: EventResponse[];
}

export default function EventsClient({ upcomingEvents, pastEvents }: EventsClientProps) {

  const getStatusDisplay = (status: string) => {
    if (status === "REGISTRATION_OPEN") return { text: "Registration Open", color: "bg-[#22D46B]/15 text-[#22D46B]" };
    if (status === "REGISTRATION_CLOSED") return { text: "Registration Closed", color: "bg-orange-500/15 text-orange-400" };
    if (status === "COMPLETED") return { text: "Completed", color: "bg-purple-500/15 text-purple-400" };
    return { text: "Coming Soon", color: "bg-blue-500/15 text-blue-400" };
  };

  const renderEventCard = (event: EventResponse) => {
    const statusDisplay = getStatusDisplay(event.status || "");
    const isRegistrationOpen = event.status === "REGISTRATION_OPEN";
    
    return (
      <Link href={`/events/${event.slug}`} key={event.id} className="block group">
        <motion.article 
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-[#3A2065]/55 to-[#0D1030]/90 border border-white/10 rounded-[18px] p-7 flex flex-col gap-3.5 shadow-xl h-full"
        >
          {event.banner_image_url ? (
            <img src={event.banner_image_url} alt="" className="w-full h-40 object-cover rounded-xl mb-2 bg-black/20" />
          ) : (
            <div className="w-full h-40 rounded-xl mb-2 bg-white/5 flex items-center justify-center">
              <span className="text-white/20 font-bold text-xl">IEDC SNMIMT</span>
            </div>
          )}
          <span className={`self-start text-[0.72rem] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${statusDisplay.color}`}>
            {statusDisplay.text}
          </span>
          <h3 className="text-[1.35rem] font-bold leading-tight line-clamp-2 group-hover:text-blue-400 transition-colors">{event.title}</h3>
          
          {event.registration_deadline && (
            <div className="text-[#C4C4D4] text-[0.88rem] font-medium flex flex-col gap-1 mt-1">
              <span>Deadline: {new Date(event.registration_deadline).toLocaleDateString()}</span>
            </div>
          )}
          
          <p className="text-[#C4C4D4] text-[0.92rem] flex-1 mt-2 line-clamp-3">{event.short_description || event.description}</p>
          <div 
            className={`mt-2 w-full text-center font-bold py-3 px-6 rounded-full transition-transform ${isRegistrationOpen ? 'bg-[#22D46B] text-[#1A1A2E] group-hover:-translate-y-0.5' : 'bg-[#3A2065] text-white group-hover:bg-[#48297b]'}`}
          >
            {isRegistrationOpen ? 'View & Register' : 'View Details'}
          </div>
        </motion.article>
      </Link>
    );
  };

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
            {upcomingEvents.map(renderEventCard)}
          </div>
        )}
      </div>

      {pastEvents.length > 0 && (
        <div className="mb-20">
          <h2 className="text-center text-[clamp(1.8rem,4vw,2.4rem)] font-bold mb-10">Past Events</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1100px] mx-auto opacity-80 hover:opacity-100 transition-opacity">
            {pastEvents.map(renderEventCard)}
          </div>
        </div>
      )}
    </div>
  );
}
