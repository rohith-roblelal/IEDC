"use client";

import { useEffect, useState } from "react";
import { Users, Calendar, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RegistrationsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/v1/events");
        if (res.ok) {
          const data = await res.json();
          setEvents(data.items || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  const handleSelectEvent = async (event: any) => {
    setSelectedEvent(event);
    setIsLoadingParticipants(true);
    setParticipants([]);
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`/api/v1/events/${event.id}/participants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setParticipants(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingParticipants(false);
    }
  };

  const renderParticipantsTable = () => {
    if (isLoadingParticipants) {
      return <div className="text-center text-[#C4C4D4] py-8">Loading participants...</div>;
    }
    if (participants.length === 0) {
      return <div className="text-center text-[#C4C4D4] py-8">No registrations found for this event.</div>;
    }
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 text-[#C4C4D4]">
              <th className="pb-3 font-medium">Name</th>
              <th className="pb-3 font-medium">Email</th>
              <th className="pb-3 font-medium">Phone</th>
              <th className="pb-3 font-medium">Dept / Year</th>
              <th className="pb-3 font-medium">Date Registered</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((reg: any, idx) => (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={reg.id} 
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="py-4 font-medium">{reg.name || reg.full_name || 'N/A'}</td>
                <td className="py-4 text-[#C4C4D4]">{reg.email}</td>
                <td className="py-4 text-[#C4C4D4]">{reg.phone}</td>
                <td className="py-4 text-[#C4C4D4]">{reg.department} / {reg.year}</td>
                <td className="py-4 text-[#C4C4D4]">{new Date(reg.created_at).toLocaleDateString()}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!selectedEvent ? (
          <motion.div 
            key="event-list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Calendar className="text-blue-400" /> Event Registrations
              </h1>
              <p className="text-[#C4C4D4] mt-2">Select an event to view its details and participants.</p>
            </div>

            {isLoadingEvents ? (
              <div className="bg-[#111432] rounded-2xl border border-white/10 p-6 text-center text-[#C4C4D4]">
                Loading events...
              </div>
            ) : events.length === 0 ? (
              <div className="bg-[#111432] rounded-2xl border border-white/10 p-6 text-center text-[#C4C4D4]">
                No events found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((event) => (
                  <motion.div
                    key={event.id}
                    whileHover={{ y: -5 }}
                    onClick={() => handleSelectEvent(event)}
                    className="bg-[#111432] border border-white/10 rounded-2xl p-5 cursor-pointer hover:border-blue-500/50 transition-colors shadow-lg"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[0.7rem] font-bold uppercase px-2 py-1 rounded-md ${
                        event.status === "REGISTRATION_OPEN" ? "bg-green-500/15 text-green-400" :
                        event.status === "REGISTRATION_CLOSED" ? "bg-orange-500/15 text-orange-400" :
                        "bg-blue-500/15 text-blue-400"
                      }`}>
                        {event.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{event.title}</h3>
                    <p className="text-[#C4C4D4] text-sm line-clamp-2 mb-4">{event.description}</p>
                    <div className="flex justify-between items-center text-xs text-blue-300 font-medium pt-3 border-t border-white/10">
                      <span>Click to view participants</span>
                      <Users size={16} />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="event-details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="flex items-center gap-2 text-[#C4C4D4] hover:text-white transition-colors mb-4"
              >
                <ArrowLeft size={20} /> Back to Events
              </button>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Users className="text-blue-400" /> {selectedEvent.title}
              </h1>
              <p className="text-[#C4C4D4] mt-2 max-w-2xl">{selectedEvent.description}</p>
            </div>
            
            <div className="flex gap-4">
               <div className="bg-[#1A1D3D] rounded-xl border border-white/10 p-4 flex-1">
                 <div className="text-[#C4C4D4] text-sm font-medium mb-1">Total Registrations</div>
                 <div className="text-3xl font-bold">{isLoadingParticipants ? "..." : participants.length}</div>
               </div>
               <div className="bg-[#1A1D3D] rounded-xl border border-white/10 p-4 flex-1">
                 <div className="text-[#C4C4D4] text-sm font-medium mb-1">Status</div>
                 <div className="text-xl font-bold mt-1 text-blue-400">{selectedEvent.status.replace(/_/g, ' ')}</div>
               </div>
            </div>

            <div className="bg-[#111432] rounded-2xl border border-white/10 p-6">
              {renderParticipantsTable()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
