import Link from "next/link";
import Image from "next/image";
import { EventResponse } from "@/lib/api/events";
import { getStatusDisplay } from "@/lib/event-utils";

interface EventCardProps {
  event: EventResponse;
}

export function EventCard({ event }: EventCardProps) {
  const statusDisplay = getStatusDisplay(event.status || "");
  const isRegistrationOpen = event.status === "REGISTRATION_OPEN";
  
  return (
    <Link href={`/events/${event.slug}`} key={event.id} className="block group">
      <article 
        className="bg-gradient-to-br from-[#3A2065]/55 to-[#0D1030]/90 border border-white/10 rounded-[18px] p-7 flex flex-col gap-3.5 shadow-xl h-full transition-transform duration-300 hover:-translate-y-1.5"
      >
        {event.banner_url ? (
          <div className="w-full aspect-[3/4] relative rounded-xl mb-2 bg-black/20 overflow-hidden">
            <Image 
              src={event.banner_url} 
              alt={event.title || ""} 
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover" 
            />
          </div>
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
      </article>
    </Link>
  );
}
