"use client";

import { useEffect, useState } from "react";
import { Users, Calendar, ArrowLeft, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RegistrationsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
  const [filterTab, setFilterTab] = useState<"ALL" | "IEDC_MEMBER" | "NON_MEMBER">("ALL");
  const [selectedParticipant, setSelectedParticipant] = useState<any | null>(null);

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
try {
      const res = await fetch(`/api/v1/events/${event.id}/participants`);
      if (res.ok) {
        const data = await res.json();
        setParticipants(data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingParticipants(false);
    }
  };

  const FilterTabs = () => (
    <div className="flex gap-2 bg-white/5 p-1 rounded-lg w-max mb-4">
      <button 
        onClick={() => setFilterTab("ALL")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterTab === "ALL" ? "bg-[#4F7DF9] text-white" : "text-[#C4C4D4] hover:text-white hover:bg-white/5"}`}
      >
        All Registrations
      </button>
      <button 
        onClick={() => setFilterTab("IEDC_MEMBER")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterTab === "IEDC_MEMBER" ? "bg-[#4F7DF9] text-white" : "text-[#C4C4D4] hover:text-white hover:bg-white/5"}`}
      >
        IEDC Members
      </button>
      <button 
        onClick={() => setFilterTab("NON_MEMBER")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterTab === "NON_MEMBER" ? "bg-[#4F7DF9] text-white" : "text-[#C4C4D4] hover:text-white hover:bg-white/5"}`}
      >
        Non-Members
      </button>
    </div>
  );

  const renderParticipantsTable = () => {
    if (isLoadingParticipants) {
      return <div className="text-center text-[#C4C4D4] py-8">Loading participants...</div>;
    }
    
    const iedcField = selectedEvent?.custom_fields?.find((f: any) => f.type === "iedc_member_check");
    const iedcFieldId = iedcField?.id;
    
    const filteredParticipants = participants.filter(reg => {
      if (filterTab === "ALL") return true;
      const isMember = iedcFieldId && reg.custom_answers?.[iedcFieldId] === "Yes";
      if (filterTab === "IEDC_MEMBER") return isMember;
      if (filterTab === "NON_MEMBER") return !isMember;
      return true;
    });

    if (filteredParticipants.length === 0) {
      return (
        <div>
          <FilterTabs />
          <div className="text-center text-[#C4C4D4] py-8">No registrations found in this category.</div>
        </div>
      );
    }
    
    return (
      <div>
        <FilterTabs />
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-[#C4C4D4]">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Phone</th>
                <th className="pb-3 font-medium">Dept / Year</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.map((reg: any, idx) => {
                const isMember = iedcFieldId && reg.custom_answers?.[iedcFieldId] === "Yes";
                return (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={reg.id} 
                    onClick={() => setSelectedParticipant(reg)}
                    className="border-b border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <td className="py-4 font-medium">{reg.name || reg.full_name || 'N/A'}</td>
                    <td className="py-4 text-[#C4C4D4]">{reg.email}</td>
                    <td className="py-4 text-[#C4C4D4]">{reg.phone}</td>
                    <td className="py-4 text-[#C4C4D4]">{reg.department} / {reg.year}</td>
                    <td className="py-4">
                      {iedcFieldId ? (
                        isMember ? (
                          <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs font-medium">Member</span>
                        ) : (
                          <span className="px-2 py-1 bg-orange-500/10 text-orange-400 rounded text-xs font-medium">Non-Member</span>
                        )
                      ) : (
                        <span className="text-[#C4C4D4]">-</span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      <span className="text-blue-400 hover:text-blue-300 text-sm font-medium">View</span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
      
      {selectedParticipant && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111432] border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Participant Details</h2>
              <button onClick={() => setSelectedParticipant(null)} className="text-[#C4C4D4] hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-8 bg-white/5 p-6 rounded-xl border border-white/5">
              <div>
                <p className="text-sm text-[#C4C4D4] mb-1">Name</p>
                <p className="font-medium text-lg">{selectedParticipant.name}</p>
              </div>
              <div>
                <p className="text-sm text-[#C4C4D4] mb-1">Email</p>
                <p className="font-medium text-lg break-all">{selectedParticipant.email}</p>
              </div>
              <div>
                <p className="text-sm text-[#C4C4D4] mb-1">Phone</p>
                <p className="font-medium text-lg">{selectedParticipant.phone}</p>
              </div>
              <div>
                <p className="text-sm text-[#C4C4D4] mb-1">Department / Year</p>
                <p className="font-medium text-lg">{selectedParticipant.department} - Year {selectedParticipant.year}</p>
              </div>
            </div>
            
            {selectedEvent?.custom_fields?.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm">
                    {selectedEvent.custom_fields.length}
                  </span>
                  Additional Information
                </h3>
                <div className="space-y-4">
                  {selectedEvent.custom_fields.map((field: any) => {
                    const answer = selectedParticipant.custom_answers?.[field.id];
                    const screenshot = selectedParticipant.custom_answers?.[`${field.id}_screenshot`];
                    
                    return (
                      <div key={field.id} className="bg-white/5 p-5 rounded-xl border border-white/5">
                        <p className="text-sm text-[#C4C4D4] mb-2">{field.label}</p>
                        <p className="font-medium text-lg">
                          {Array.isArray(answer) ? answer.join(", ") : answer || "Not provided"}
                        </p>
                        
                        {field.type === "iedc_member_check" && screenshot && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-sm text-[#C4C4D4] mb-3 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>
                              Payment Screenshot Provided
                            </p>
                            <a href={screenshot} target="_blank" rel="noreferrer" className="block relative group rounded-xl overflow-hidden border border-white/10 w-fit">
                              <img src={screenshot} alt="Payment Screenshot" className="max-w-[250px] object-cover" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white font-medium bg-blue-500 px-4 py-2 rounded-lg">View Full Image</span>
                              </div>
                            </a>
                          </div>
                        )}
                        {field.type === "file_upload" && answer && (
                           <div className="mt-3">
                             <a href={answer} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium bg-blue-500/10 px-4 py-2 rounded-lg transition-colors">
                               View Uploaded File
                             </a>
                           </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
