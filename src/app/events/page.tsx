"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// Mock data
const EVENTS = [
  {
    id: 'astra-2025',
    title: 'Astra 2025',
    date: 'March 22, 2026',
    time: '9:00 AM – 5:00 PM',
    venue: 'SNMIMT Main Auditorium',
    description: 'Annual tech fest with hackathons, startup pitches, and innovation showcases open to all SNMIMT students.',
    registrationOpen: true
  },
  {
    id: 'startup-bootcamp',
    title: 'Startup Bootcamp',
    date: 'April 5, 2026',
    time: '10:00 AM – 4:00 PM',
    venue: 'IEDC Innovation Lab',
    description: 'A one-day intensive session on ideation, business models, and pitching — led by industry mentors.',
    registrationOpen: true
  },
  {
    id: 'ideathon-2026',
    title: 'Ideathon 2026',
    date: 'May 10, 2026',
    time: '9:30 AM – 6:00 PM',
    venue: 'Seminar Hall B',
    description: 'Team up and solve real-world problems. Top teams get mentorship and incubation support from IEDC.',
    registrationOpen: true
  }
];

export default function EventsPage() {
  const [registrations, setRegistrations] = useState<{eventId: string, registerNumber: string}[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<typeof EVENTS[0] | null>(null);
  const [formStatus, setFormStatus] = useState({ message: '', error: false });

  // Load registrations from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('iedc-snmimt-registrations');
      if (stored) setRegistrations(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const hasRegistered = (eventId: string) => {
    // A simplified check: we can use a session stored reg number just like the old MVP
    const savedReg = typeof window !== 'undefined' ? sessionStorage.getItem('iedc-last-register-number') : null;
    if (!savedReg) return false;
    return registrations.some(r => r.eventId === eventId && r.registerNumber.toLowerCase() === savedReg.toLowerCase());
  };

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEvent) return;

    const formData = new FormData(e.currentTarget);
    const registerNumber = formData.get('registerNumber') as string;

    // Check duplicate
    if (registrations.some(r => r.eventId === selectedEvent.id && r.registerNumber.toLowerCase() === registerNumber.toLowerCase())) {
      setFormStatus({ message: 'This register number is already signed up for this event.', error: true });
      return;
    }

    const newReg = {
      eventId: selectedEvent.id,
      eventTitle: selectedEvent.title,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      registerNumber,
      department: formData.get('department') as string,
      year: formData.get('year') as string,
      registeredAt: new Date().toISOString()
    };

    const newRegistrations = [...registrations, newReg];
    setRegistrations(newRegistrations);
    localStorage.setItem('iedc-snmimt-registrations', JSON.stringify(newRegistrations));
    sessionStorage.setItem('iedc-last-register-number', registerNumber);
    
    setFormStatus({ message: `Registration confirmed for ${selectedEvent.title}!`, error: false });
    setTimeout(() => {
      setSelectedEvent(null);
      setFormStatus({ message: '', error: false });
    }, 1800);
  };

  const openEvents = EVENTS.filter(e => e.registrationOpen);

  return (
    <div className="py-24 px-6 relative">
      <h2 className="text-center text-[clamp(1.8rem,4vw,2.4rem)] font-bold mb-5">Upcoming Events</h2>
      <p className="max-w-[680px] mx-auto text-center text-[#C4C4D4] font-medium text-base mb-10">
        Register for open events hosted by IEDC SNMIMT. Your spot is confirmed once you submit the form.
      </p>

      {openEvents.length === 0 ? (
        <div className="text-center text-[#C4C4D4] max-w-[480px] mx-auto p-8 border border-dashed border-white/10 rounded-[18px]">
          No events are open for registration right now. Check back soon or follow us on Instagram for updates.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1100px] mx-auto">
          {openEvents.map(event => {
            const registered = hasRegistered(event.id);
            return (
              <motion.article 
                key={event.id}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-[#3A2065]/55 to-[#0D1030]/90 border border-white/10 rounded-[18px] p-7 flex flex-col gap-3.5 shadow-xl"
              >
                <span className={`self-start text-[0.72rem] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${registered ? 'bg-[#4F7DF9]/20 text-[#4F7DF9]' : 'bg-[#22D46B]/15 text-[#22D46B]'}`}>
                  {registered ? 'Registered' : 'Registration Open'}
                </span>
                <h3 className="text-[1.35rem] font-bold leading-tight">{event.title}</h3>
                <div className="text-[#C4C4D4] text-[0.88rem] font-medium flex flex-col gap-1 mt-1">
                  <span>📅 {event.date}</span>
                  <span>🕐 {event.time}</span>
                  <span>📍 {event.venue}</span>
                </div>
                <p className="text-[#C4C4D4] text-[0.92rem] flex-1 mt-2">{event.description}</p>
                <button 
                  onClick={() => setSelectedEvent(event)}
                  disabled={registered}
                  className={`mt-2 w-full font-bold py-3 px-6 rounded-full transition-transform ${registered ? 'bg-[#3A2065] text-white cursor-not-allowed' : 'bg-[#22D46B] text-[#1A1A2E] hover:-translate-y-0.5'}`}
                >
                  {registered ? 'Already Registered' : 'Register Now'}
                </button>
              </motion.article>
            );
          })}
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
            onClick={(e) => { if(e.target === e.currentTarget) setSelectedEvent(null) }}
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
              <h3 className="text-[1.3rem] font-bold mb-1.5">Event Registration</h3>
              <p className="text-gray-500 font-medium text-[0.88rem] mb-5">{selectedEvent.title} · {selectedEvent.date}</p>
              
              <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
                <input type="text" name="name" placeholder="Full Name" required autoComplete="name" className="w-full border border-[#E0E0E8] bg-[#F4F4F8] rounded-[10px] p-3.5 text-[0.95rem] outline-none focus:ring-2 focus:ring-[#4F7DF9]" />
                <input type="email" name="email" placeholder="College Email" required autoComplete="email" className="w-full border border-[#E0E0E8] bg-[#F4F4F8] rounded-[10px] p-3.5 text-[0.95rem] outline-none focus:ring-2 focus:ring-[#4F7DF9]" />
                <input type="text" name="registerNumber" placeholder="Register Number" required pattern="[A-Za-z0-9\-\/]+" title="Enter your college register number" className="w-full border border-[#E0E0E8] bg-[#F4F4F8] rounded-[10px] p-3.5 text-[0.95rem] outline-none focus:ring-2 focus:ring-[#4F7DF9]" defaultValue={typeof window !== 'undefined' ? sessionStorage.getItem('iedc-last-register-number') || '' : ''} />
                <select name="department" required className="w-full border border-[#E0E0E8] bg-[#F4F4F8] rounded-[10px] p-3.5 text-[0.95rem] outline-none focus:ring-2 focus:ring-[#4F7DF9] appearance-none">
                  <option value="" disabled selected>Select Department</option>
                  <option value="CSE">Computer Science (CSE)</option>
                  <option value="ECE">Electronics (ECE)</option>
                  <option value="ME">Mechanical (ME)</option>
                  <option value="CE">Civil (CE)</option>
                  <option value="MBA">MBA</option>
                  <option value="Other">Other</option>
                </select>
                <select name="year" required className="w-full border border-[#E0E0E8] bg-[#F4F4F8] rounded-[10px] p-3.5 text-[0.95rem] outline-none focus:ring-2 focus:ring-[#4F7DF9] appearance-none">
                  <option value="" disabled selected>Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
                <button type="submit" className="w-full bg-[#4F7DF9] text-white font-bold py-3.5 rounded-[10px] mt-2 hover:-translate-y-0.5 transition-transform">
                  Confirm Registration
                </button>
                {formStatus.message && (
                  <div className={`text-center mt-2 text-sm font-medium ${formStatus.error ? 'text-red-500' : 'text-green-500'}`}>
                    {formStatus.message}
                  </div>
                )}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
