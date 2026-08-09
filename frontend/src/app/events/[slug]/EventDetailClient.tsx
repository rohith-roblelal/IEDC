"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { RegistrationForm } from "@/components/RegistrationForm";
import { EventResponse } from "@/lib/api/events";
import { getStatusDisplay } from "@/lib/event-utils";

interface EventDetailClientProps {
  event: EventResponse;
}

export default function EventDetailClient({ event }: EventDetailClientProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const isRegistrationOpen = event.status === "REGISTRATION_OPEN";

  return (
    <div className="py-24 px-6 relative max-w-4xl mx-auto">
      <nav aria-label="Breadcrumb" className="mb-8 text-sm font-medium">
        <ol className="flex items-center space-x-2 text-[#C4C4D4]">
          <li>
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-white/30">/</span>
            <Link href="/events" className="hover:text-white transition-colors">Events</Link>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-white/30">/</span>
            <span className="text-white line-clamp-1" aria-current="page">{event.title}</span>
          </li>
        </ol>
      </nav>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0A0E27] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
      >
        {event.banner_url && (
          <div className="w-full h-64 md:h-96 relative">
            <Image 
              src={event.banner_url} 
              alt={event.title || "Event Banner"} 
              fill
              sizes="100vw"
              className="object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E27] to-transparent"></div>
          </div>
        )}

        <div className="p-8 md:p-12 relative z-10 -mt-20 md:-mt-32">
          <div className="flex flex-wrap gap-3 mb-6">
            <span className={`text-sm font-bold uppercase tracking-widest px-4 py-2 rounded-full backdrop-blur-md ${getStatusDisplay(event.status || "").color}`}>
              {getStatusDisplay(event.status || "").text}
            </span>
            <span className="text-sm font-bold uppercase tracking-widest px-4 py-2 rounded-full bg-white/10 text-white backdrop-blur-md">
              {event.category}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">{event.title}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 p-6 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-sm text-[#C4C4D4]">Start Date</p>
                <p className="font-medium text-white">{new Date(event.start_datetime).toLocaleDateString()} {new Date(event.start_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              </div>
            </div>

            {event.venue && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-sm text-[#C4C4D4]">Venue</p>
                  <p className="font-medium text-white">{event.venue}</p>
                </div>
              </div>
            )}

            {event.registration_deadline && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-sm text-[#C4C4D4]">Registration Deadline</p>
                  <p className="font-medium text-white">{new Date(event.registration_deadline).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>

          <div className="prose prose-invert max-w-none mb-12 whitespace-pre-wrap text-lg text-[#C4C4D4] leading-relaxed">
            {event.description}
          </div>

          {isRegistrationOpen && (
            <div className="border-t border-white/10 pt-8 mt-8">
              {!isRegistering && !registrationSuccess && (
                <div className="text-center bg-[#111432] p-8 rounded-2xl border border-blue-500/30">
                  <h3 className="text-2xl font-bold mb-3">Join this Event</h3>
                  <p className="text-[#C4C4D4] mb-6">Spots are limited. Secure yours now.</p>
                  {event.registration_link ? (
                    <a 
                      href={event.registration_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-12 rounded-full transition-transform hover:-translate-y-1"
                    >
                      Register Externally
                    </a>
                  ) : (
                    <button 
                      onClick={() => setIsRegistering(true)}
                      className="inline-block bg-[#22D46B] hover:bg-[#1db95c] text-[#1A1A2E] font-bold py-4 px-12 rounded-full transition-transform hover:-translate-y-1"
                    >
                      Register Now
                    </button>
                  )}
                </div>
              )}

              {isRegistering && !registrationSuccess && (
                <div className="bg-[#111432] p-8 rounded-2xl border border-white/10">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">Registration Form</h3>
                    <button onClick={() => setIsRegistering(false)} className="text-[#C4C4D4] hover:text-white">
                      Cancel
                    </button>
                  </div>
                  <RegistrationForm 
                    event={event}
                    onSuccess={() => {
                      setIsRegistering(false);
                      setRegistrationSuccess(true);
                    }}
                    onCancel={() => setIsRegistering(false)}
                  />
                </div>
              )}

              {registrationSuccess && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-500/10 border border-green-500/30 p-10 rounded-2xl text-center"
                >
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-green-400 mb-4">Registration Successful!</h3>
                  <p className="text-white text-lg">We have received your registration for {event.title}. Keep an eye on your email for further instructions.</p>
                </motion.div>
              )}
            </div>
          )}

          {!isRegistrationOpen && event.status !== "COMPLETED" && event.status !== "PAST" && (
            <div className="text-center p-6 bg-orange-500/10 border border-orange-500/30 rounded-2xl mt-8">
              <p className="text-orange-400 font-medium">Registration is currently closed for this event.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
