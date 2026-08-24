"use client";

import { motion } from "framer-motion";
import { useSettings } from "@/lib/settings-context";
import { MapPin, Mail, Phone } from "lucide-react";
import Link from "next/link";
import ContactForm from "@/components/contact/ContactForm";

export default function ContactClient() {
  const settings = useSettings();

  const socials = [
    { url: settings.facebook_url, label: "Facebook", icon: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/> },
    { url: settings.instagram_url, label: "Instagram", icon: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></> },
    { url: settings.twitter_url, label: "Twitter", icon: <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/> },
    { url: settings.linkedin_url, label: "LinkedIn", icon: <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></> },
    { url: settings.youtube_url, label: "YouTube", icon: <><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></> },
    { url: settings.github_url, label: "GitHub", icon: <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/> },
  ].filter(s => s.url);

  return (
    <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
      {/* Left Column - Contact Info */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
          Contact <span className="text-[#8B7FE8]">{settings.site_name || "IEDC"}</span>
        </h1>
        <p className="text-[#C4C4D4] text-lg mb-10 max-w-[480px] leading-relaxed">
          Have a question, idea, collaboration opportunity, or something you'd like to discuss? We're here to connect.
        </p>

        <div className="space-y-8">
          {settings.contact_address && (
            <div className="flex gap-4 items-start">
              <a 
                href="https://maps.app.goo.gl/cqLzYBXMyLqHQuEY6"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open IEDC SNMIMT location in Google Maps"
                className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-[#4F7DF9] hover:bg-white/10 hover:scale-105 hover:border-[#4F7DF9]/50 transition-all cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4F7DF9]"
              >
                <MapPin size={24} aria-hidden="true" />
              </a>
              <div>
                <h3 className="text-white font-bold text-lg mb-1">Office Address</h3>
                <p className="text-[#C4C4D4] leading-relaxed max-w-[300px]">
                  {settings.contact_address}
                </p>
              </div>
            </div>
          )}

          {settings.contact_email && (
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-[#4F7DF9]">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-1">Email Us</h3>
                <a href={`mailto:${settings.contact_email}`} className="text-[#C4C4D4] hover:text-white transition-colors">
                  {settings.contact_email}
                </a>
              </div>
            </div>
          )}

          {settings.contact_phone && (
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-[#4F7DF9]">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-1">Call Us</h3>
                <a href={`tel:${settings.contact_phone.replace(/[^0-9+]/g, '')}`} className="text-[#C4C4D4] hover:text-white transition-colors">
                  {settings.contact_phone}
                </a>
              </div>
            </div>
          )}
        </div>

        {socials.length > 0 && (
          <div className="mt-12 pt-8 border-t border-white/10">
            <h3 className="text-white font-bold mb-4">Connect with us</h3>
            <div className="flex flex-wrap gap-4">
              {socials.map((s) => (
                <Link 
                  key={s.label}
                  href={s.url!.startsWith('http') ? s.url! : `https://${s.url}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label={s.label}
                  className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                    {s.icon}
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Right Column - Contact Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white/5 border border-white/10 rounded-[28px] p-8 md:p-10 shadow-2xl backdrop-blur-sm"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Send a Message</h2>
        <ContactForm />
      </motion.div>
    </div>
  );
}
