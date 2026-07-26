"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { RegistrationForm } from "@/components/RegistrationForm";

export default function EventsPage() {
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/v1/events");
        if (res.ok) {
          const data = await res.json();
          const items = data.items || [];
          const upcoming = items.filter((e: any) => ["PUBLISHED", "REGISTRATION_OPEN", "REGISTRATION_CLOSED"].includes(e.status));
          const past = items.filter((e: any) => e.status === "COMPLETED");
          setUpcomingEvents(upcoming);
          setPastEvents(past);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const getStatusDisplay = (status: string) => {
    if (status === "REGISTRATION_OPEN") return { text: "Registration Open", color: "bg-[#22D46B]/15 text-[#22D46B]" };
    if (status === "REGISTRATION_CLOSED") return { text: "Registration Closed", color: "bg-orange-500/15 text-orange-400" };
    if (status === "COMPLETED") return { text: "Completed", color: "bg-purple-500/15 text-purple-400" };
    return { text: "Coming Soon", color: "bg-blue-500/15 text-blue-400" };
  };

  const renderEventCard = (event: any) => {
    const statusDisplay = getStatusDisplay(event.status || "");
    const isRegistrationOpen = event.status === "REGISTRATION_OPEN";
    
    return (
      <motion.article 
        key={event.id}
        whileHover={{ y: -5 }}
        className="bg-gradient-to-br from-[#3A2065]/55 to-[#0D1030]/90 border border-white/10 rounded-[18px] p-7 flex flex-col gap-3.5 shadow-xl cursor-pointer"
        onClick={() => setSelectedEvent(event)}
      >
        {event.banner_url && (
          <img src={event.banner_url} alt="" className="w-full h-40 object-cover rounded-xl mb-2 bg-black/20" />
        )}
        <span className={`self-start text-[0.72rem] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${statusDisplay.color}`}>
          {statusDisplay.text}
        </span>
        <h3 className="text-[1.35rem] font-bold leading-tight line-clamp-2">{event.title}</h3>
        
        {event.registration_deadline && (
          <div className="text-[#C4C4D4] text-[0.88rem] font-medium flex flex-col gap-1 mt-1">
            <span>Deadline: {new Date(event.registration_deadline).toLocaleDateString()}</span>
          </div>
        )}
        
        <p className="text-[#C4C4D4] text-[0.92rem] flex-1 mt-2 line-clamp-3">{event.description}</p>
        <button 
          className={`mt-2 w-full font-bold py-3 px-6 rounded-full transition-transform ${isRegistrationOpen ? 'bg-[#22D46B] text-[#1A1A2E] hover:-translate-y-0.5' : 'bg-[#3A2065] text-white'}`}
        >
          {isRegistrationOpen ? 'View & Register' : 'View Details'}
        </button>
      </motion.article>
    );
  };

  return (
    <div className="py-24 px-6 relative">
      <div className="mb-20">
        <h2 className="text-center text-[clamp(1.8rem,4vw,2.4rem)] font-bold mb-5">Upcoming Events</h2>
        <p className="max-w-[680px] mx-auto text-center text-[#C4C4D4] font-medium text-base mb-10">
          Register for open events hosted by IEDC SNMIMT. Your spot is confirmed once you submit the form.
        </p>

        {isLoading ? (
          <div className="text-center text-[#C4C4D4] max-w-[480px] mx-auto p-8 border border-dashed border-white/10 rounded-[18px]">
            Loading events...
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="text-center text-[#C4C4D4] max-w-[480px] mx-auto p-8 border border-dashed border-white/10 rounded-[18px]">
            No upcoming events right now. Check back soon or follow us on Instagram for updates.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1100px] mx-auto">
            {upcomingEvents.map(renderEventCard)}
          </div>
        )}
      </div>

      {!isLoading && pastEvents.length > 0 && (
        <div className="mb-20">
          <h2 className="text-center text-[clamp(1.8rem,4vw,2.4rem)] font-bold mb-10">Past Events</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1100px] mx-auto opacity-80 hover:opacity-100 transition-opacity">
            {pastEvents.map(renderEventCard)}
          </div>
        </div>
      )}

      {/* Registration Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={(e) => { 
              if(e.target === e.currentTarget) {
                setSelectedEvent(null);
                setIsRegistering(false);
                setRegistrationSuccess(false);
              }
            }}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[18px] p-8 w-full max-w-[440px] max-h-[90vh] overflow-y-auto relative shadow-2xl text-[#1A1A2E]"
            >
              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-[#1A1A2E] transition-colors"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
              
              {isRegistering ? (
                <>
                  <h3 className="text-[1.5rem] font-bold mb-4 leading-tight border-b pb-4">Register for {selectedEvent.title}</h3>
                  <RegistrationForm 
                    event={selectedEvent}
                    onSuccess={() => {
                      setIsRegistering(false);
                      setRegistrationSuccess(true);
                    }}
                    onCancel={() => setIsRegistering(false)}
                  />
                </>
              ) : registrationSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
                  className="text-center py-10 flex flex-col items-center justify-center min-h-[300px]"
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{ type: "spring", delay: 0.2, duration: 0.8 }}
                    className="w-20 h-20 bg-gradient-to-tr from-green-400 to-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 mb-6"
                  >
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <motion.h3 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-[1.7rem] font-extrabold text-gray-900 mb-2 tracking-tight"
                  >
                    Registration Successful!
                  </motion.h3>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-gray-500 font-medium mb-8 max-w-[280px]"
                  >
                    You have successfully registered for {selectedEvent.title}. We look forward to seeing you!
                  </motion.p>
                  <motion.button 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedEvent(null);
                      setRegistrationSuccess(false);
                    }}
                    className="bg-[#4F7DF9] hover:bg-[#3d65ce] text-white px-10 py-3.5 rounded-full font-bold shadow-lg shadow-blue-500/25 transition-colors w-full"
                  >
                    Close Window
                  </motion.button>
                </motion.div>
              ) : (
                <>
                  {selectedEvent.banner_url && (
                    <img src={selectedEvent.banner_url} alt="" className="w-full h-48 object-cover rounded-xl mb-6 bg-gray-100" />
                  )}
                  
                  <h3 className="text-[1.5rem] font-bold mb-2 leading-tight">{selectedEvent.title}</h3>
                  
                  <div className="flex gap-2 mb-6">
                    <span className={`text-[0.72rem] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${getStatusDisplay(selectedEvent.status).color}`}>
                      {getStatusDisplay(selectedEvent.status).text}
                    </span>
                    {selectedEvent.registration_deadline && (
                      <span className="text-[0.72rem] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
                        Deadline: {new Date(selectedEvent.registration_deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="prose prose-sm max-w-none text-gray-600 mb-8 whitespace-pre-wrap">
                    {selectedEvent.description}
                  </div>

                  {selectedEvent.status === "REGISTRATION_OPEN" ? (
                    <button 
                      onClick={() => setIsRegistering(true)}
                      className="block text-center w-full bg-[#4F7DF9] text-white font-bold py-3.5 rounded-[10px] mt-2 hover:-translate-y-0.5 transition-transform"
                    >
                      Register Now
                    </button>
                  ) : (
                    <div className="text-center p-4 bg-gray-50 rounded-[10px] text-gray-500 font-medium border border-gray-200">
                      Registration is not currently open.
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
