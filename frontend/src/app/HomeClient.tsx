"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Megaphone, Settings, X, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/components/ui/ToastProvider";
import { useSettings } from "@/lib/settings-context";
import { FAQAccordion } from "@/components/ui/accordion";
import { FAQ_DATA } from "@/lib/faq-data";

interface Announcement {
  id: string;
  title: string;
  slug: string;
  content: string;
  is_pinned: boolean;
  is_published: boolean;
  expires_at: string | null;
  created_at: string;
}

interface Podcast {
  id: string;
  title: string;
  description?: string | null;
  audio_url?: string | null;
  video_url?: string | null;
  thumbnail_url?: string | null;
  image_url?: string | null;
  duration?: number | null;
  published_at?: string | null;
  date_str?: string | null;
  is_published: boolean;
}

interface Partner {
  id: string;
  name: string;
  image_url?: string | null;
  description?: string | null;
  website_url?: string | null;
}

interface HomeClientProps {
  announcements: Announcement[];
  podcasts: Podcast[];
  partners: Partner[];
}

export default function HomeClient({ announcements = [], podcasts = [], partners = [] }: HomeClientProps) {
  const { toast } = useToast();
  const settings = useSettings();
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedPartner(null);
      }
    };
    
    if (selectedPartner) {
      window.addEventListener("keydown", handleKeyDown);
    }
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPartner]);

  if (settings.maintenance_mode) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-24 h-24 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Settings size={48} className="animate-[spin_4s_linear_infinite]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Under Maintenance</h1>
          <p className="text-[#C4C4D4] text-lg max-w-[500px] mx-auto">
            We&apos;re currently updating our website to bring you a better experience.
            Please check back soon!
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <section className="px-6 pt-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-[1100px] mx-auto py-14 px-8 text-center"
        >
          <h1 className="text-[clamp(1.8rem,5vw,2.6rem)] font-bold leading-tight">
            {settings.hero_title?.includes('IEDC') ? (
              <>
                {settings.hero_title.split('IEDC')[0]}
                <span className="block text-[#8B7FE8]">IEDC{settings.hero_title.split('IEDC')[1]}</span>
              </>
            ) : (
              settings.hero_title
            )}
          </h1>
          {settings.hero_subtitle?.trim() && (
            <p className="mt-5 max-w-[640px] mx-auto text-[#C4C4D4] text-[0.98rem]">
              {settings.hero_subtitle}
            </p>
          )}
          {settings.hero_description?.trim() && (
            <p className="mt-5 max-w-[760px] mx-auto text-[#C4C4D4] text-[0.95rem] leading-relaxed">
              {settings.hero_description}
            </p>
          )}
          <div className="mt-8 flex justify-center gap-3.5 flex-wrap">
            <Link 
              href={settings.hero_cta_link || "/events"} 
              className="inline-block bg-[#22D46B] text-[#1A1A2E] font-bold py-3.5 px-7 rounded-full hover:-translate-y-0.5 transition-transform"
            >
              {settings.hero_cta_text || "View Events"}
            </Link>
            <Link 
              href="/about" 
              className="inline-block bg-[#3A2065] text-white font-bold py-3.5 px-7 rounded-full hover:-translate-y-0.5 transition-transform"
            >
              About the Club
            </Link>
          </div>
          
          {settings.hero_image_url ? (
            <motion.div 
               initial={{ scale: 0.95, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ delay: 0.3, duration: 0.8 }}
               className="mt-11 mx-auto w-[min(400px,100%)] flex items-center justify-center"
            >
              <Image 
                src={settings.hero_image_url || "/hero_banner.jpg"} 
                alt=""
                width={400}
                height={400}
                priority={true}
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-contain w-full max-w-[400px] h-auto mix-blend-screen" 
              />
            </motion.div>
          ) : (
            <motion.svg
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mt-11 mx-auto w-[min(220px,60%)]"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6"/>
                  <stop offset="50%" stopColor="#A855F7"/>
                  <stop offset="100%" stopColor="#F97316"/>
                </linearGradient>
              </defs>
              <circle cx="65" cy="70" r="42" fill="none" stroke="url(#logoGrad)" strokeWidth="14"/>
              <circle cx="135" cy="70" r="42" fill="none" stroke="url(#logoGrad)" strokeWidth="14"/>
              <path d="M105 40 L80 75 L100 75 L90 110 L125 65 L103 65 Z" fill="url(#logoGrad)"/>
              <text x="100" y="150" textAnchor="middle" fontFamily="var(--font-poppins)" fontWeight="800" fontSize="26" fill="#FFFFFF">IEDC</text>
              <text x="100" y="172" textAnchor="middle" fontFamily="var(--font-poppins)" fontWeight="500" fontSize="13" fill="#A855F7">SNMIMT</text>
            </motion.svg>
          )}
        </motion.div>
      </section>

      {/* AI GEO Summary Block */}
      <section className="sr-only" aria-label="Quick Summary">
        <p>What is this page? This is the homepage of IEDC SNMIMT, the Innovation and Entrepreneurship Development Cell at SNMIMT.</p>
        <p>Who is this page for? Students, educators, and industry professionals interested in campus innovation and startups.</p>
        <p>What will the visitor learn? Visitors will discover student startups, upcoming events, announcements, and resources available through the IEDC Beta initiative.</p>
      </section>

      {/* Announcements Section */}
      {announcements.length > 0 && (
        <section className="px-6 py-12 max-w-[900px] mx-auto">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <Megaphone className="text-pink-400" size={28} />
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-bold">Latest Announcements</h2>
          </div>
          <div className="grid gap-4">
            {announcements.map((ann, idx) => (
              <motion.div
                key={ann.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`p-6 rounded-2xl border ${ann.is_pinned ? 'bg-pink-900/20 border-pink-500/30' : 'bg-[#1A1D3D] border-white/10'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white">{ann.title}</h3>
                  {ann.is_pinned && (
                    <span className="bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Pinned
                    </span>
                  )}
                </div>
                <p className="text-[#C4C4D4] whitespace-pre-wrap">{ann.content}</p>
                <div className="mt-4 text-xs text-gray-500">
                  {new Date(ann.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
      {/* Podcast Section */}
      {podcasts.length > 0 && (
        <section className="px-6 py-24">
          <h2 className="text-center text-[clamp(1.8rem,4vw,2.4rem)] font-bold mb-10">Our Podcasts</h2>
          <div className="flex flex-wrap justify-center gap-8 max-w-[1200px] mx-auto">
            {podcasts.map(podcast => (
              <motion.button 
                key={podcast.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (podcast.video_url) {
                    window.open(podcast.video_url, "_blank");
                  } else {
                    toast("No URL provided for this podcast.", "error");
                  }
                }}
                className="block w-full md:w-[calc(50%-1rem)] rounded-[28px] overflow-hidden relative shadow-xl text-left bg-[#0d1b3a] aspect-[16/9]"
                aria-label={`Play ${podcast.title} podcast episode`}
              >
                {podcast.image_url ? (
                  <Image 
                    src={podcast.image_url} 
                    alt="" 
                    fill 
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover block" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1a2f5c] to-[#0d1b3a]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.35),transparent_60%)]"></div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30"></div>
                <span className="absolute top-5 right-6 text-sm text-white/90 z-10 font-medium drop-shadow-md">{podcast.date_str}</span>
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 flex items-end justify-between gap-4 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                  <div>
                    <h3 className="text-[clamp(1.1rem,2vw,1.4rem)] font-bold text-white line-clamp-2">{podcast.title}</h3>
                    <p className="text-[#C4C4D4] text-sm mt-1 line-clamp-2">{podcast.description}</p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white bg-white/10 text-white flex items-center justify-center shrink-0 backdrop-blur-sm">
                    <Play fill="currentColor" size={16} className="ml-1" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      {/* Beta Section */}
      <section className="px-6 pb-24">
        <h2 className="text-center text-[clamp(1.8rem,4vw,2.4rem)] font-bold mb-5">About Beta</h2>
        <p className="max-w-[680px] mx-auto text-center text-[#C4C4D4] font-medium text-base">
          Beta is an initiative by IEDC SNMIMT designed to empower startups and foster innovation. We provide resources, mentorship, and funding opportunities to help early-stage businesses succeed in the competitive market.
        </p>
        <div className="text-center mt-7">
          <Link href="/startups">
            <button className="inline-block bg-[#22D46B] text-[#1A1A2E] font-bold py-3.5 px-7 rounded-full hover:-translate-y-0.5 transition-transform">
              View Startups
            </button>
          </Link>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="px-6 pb-24 max-w-[800px] mx-auto">
        <h2 className="text-center text-[clamp(1.8rem,4vw,2.4rem)] font-bold mb-10">Frequently Asked Questions</h2>
        <FAQAccordion items={FAQ_DATA} />
      </section>

      {/* Partners Section */}
      {partners.length > 0 ? (
        <section id="partners" className="px-6 pb-12">
          <h2 className="text-center text-[clamp(2.2rem,8vw,3.4rem)] font-light text-white/90 my-10 uppercase tracking-widest">
            Collaborative
          </h2>
          <div className="flex flex-wrap justify-center gap-4 max-w-[900px] mx-auto">
            {partners.map((partner) => {
              return (
                <motion.button 
                  key={partner.id} 
                  onClick={() => setSelectedPartner(partner)}
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-[calc(50%-0.5rem)] md:w-[calc(25%-0.75rem)] bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl h-[140px] flex items-center justify-center text-white font-bold text-sm text-center p-4 transition-colors overflow-hidden cursor-pointer shadow-lg"
                >
                  {partner.image_url ? (
                    <div className="relative w-[70%] h-[70%]">
                      <Image 
                        src={partner.image_url} 
                        alt={partner.name} 
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <span className="break-words px-2">{partner.name}</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Partner Details Modal */}
      <AnimatePresence>
        {selectedPartner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPartner(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1A1D3D] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setSelectedPartner(null)}
                className="absolute top-4 right-4 text-[#C4C4D4] hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full p-2"
                aria-label="Close"
              >
                <X size={20} />
              </button>
              
              <div className="flex flex-col items-center mt-2">
                {selectedPartner.image_url ? (
                  <div className="w-40 h-40 relative mb-6 bg-white/5 rounded-2xl p-4 border border-white/10">
                    <Image 
                      src={selectedPartner.image_url} 
                      alt={selectedPartner.name} 
                      fill
                      sizes="160px"
                      className="object-contain p-2" 
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 relative mb-6 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-3xl font-bold text-white text-center">
                    {selectedPartner.name.charAt(0)}
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-white text-center mb-3">
                  {selectedPartner.name}
                </h3>
                
                {selectedPartner.description && (
                  <p className="text-[#C4C4D4] text-center mb-6 text-sm leading-relaxed max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {selectedPartner.description}
                  </p>
                )}
                
                {selectedPartner.website_url && (
                  <a 
                    href={selectedPartner.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-all hover:shadow-[0_0_15px_rgba(5,150,105,0.4)]"
                  >
                    Visit Website <ExternalLink size={18} />
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contact CTA Section */}
      <section className="px-6 py-12 text-center mt-8">
        <div className="max-w-[700px] mx-auto border-t border-b border-white/10 py-16">
          <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-bold mb-3 text-white">
            Have a question or an idea?
          </h2>
          <p className="text-[#C4C4D4] text-base mb-8 max-w-[400px] mx-auto">
            Connect with IEDC SNMIMT.
          </p>
          <Link 
            href="/contact" 
            className="inline-block bg-[#22D46B] text-[#1A1A2E] font-bold py-3.5 px-8 rounded-full hover:-translate-y-0.5 transition-transform shadow-[0_0_15px_rgba(34,212,107,0.3)]"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
