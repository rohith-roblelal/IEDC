"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Megaphone, Settings } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/components/ui/ToastProvider";
import { useSettings } from "@/lib/settings-context";

export default function HomeClient() {
  const { toast } = useToast();
  const settings = useSettings();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch("/api/v1/announcements");
        if (res.ok) {
          const data = await res.json();
          const items = data.items || (Array.isArray(data) ? data : []);
          setAnnouncements(items.slice(0, 3));
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    const fetchPodcast = async () => {
      try {
        const res = await fetch("/api/v1/podcasts/active");
        if (res.ok) {
          const data = await res.json();
          setPodcasts(Array.isArray(data) ? data : (data ? [data] : []));
        }
      } catch (err) {
        console.error(err);
      }
    };

    const fetchPartners = async () => {
      try {
        const res = await fetch("/api/v1/partners");
        if (res.ok) {
          const data = await res.json();
          setPartners(data.items || (Array.isArray(data) ? data : []));
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchAnnouncements();
    fetchPodcast();
    fetchPartners();
  }, []);

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
            We're currently updating our website to bring you a better experience. 
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
          
          <motion.svg 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-11 mx-auto w-[min(220px,60%)]" 
            viewBox="0 0 200 200" 
            xmlns="http://www.w3.org/2000/svg"
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
                    alt="Podcast Background" 
                    fill 
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

      {/* Frequently Asked Questions (AEO) */}
      <section className="px-6 pb-24 max-w-[800px] mx-auto">
        <h2 className="text-center text-[clamp(1.8rem,4vw,2.4rem)] font-bold mb-10">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-2">What is IEDC SNMIMT?</h3>
            <p className="text-[#C4C4D4]">IEDC SNMIMT is the Innovation and Entrepreneurship Development Cell at SNMIMT. It is a student-run community that fosters innovation, provides mentorship, and helps incubate student startups.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-2">Who can join the IEDC SNMIMT Beta initiative?</h3>
            <p className="text-[#C4C4D4]">Any student with an innovative idea can join Beta to receive resources, mentorship, and potential funding opportunities for their early-stage startup.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-2">What kind of events does IEDC SNMIMT organize?</h3>
            <p className="text-[#C4C4D4]">We organize hackathons, ideathons, workshops, technical talks, and networking events connecting students with industry leaders and successful founders.</p>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section id="partners" className="px-6 pb-12">
        <h2 className="text-center text-[clamp(2.2rem,8vw,3.4rem)] font-light text-white/90 my-10 uppercase tracking-widest">
          Collaborative
        </h2>
        <div className="flex flex-wrap justify-center gap-4 max-w-[900px] mx-auto">
          {partners.length > 0 ? (
            partners.map((partner) => (
              <div key={partner.id} className="w-[calc(50%-0.5rem)] md:w-[calc(25%-0.75rem)] bg-white rounded-xl h-[90px] flex items-center justify-center text-[#1A1A2E] font-bold text-sm text-center p-2 shadow-lg overflow-hidden">
                {partner.image_url ? (
                  <div className="relative w-full h-full p-2">
                    <Image 
                      src={partner.image_url} 
                      alt={partner.name} 
                      fill
                      className="object-contain p-2" 
                    />
                  </div>
                ) : (
                  <span>{partner.name}</span>
                )}
              </div>
            ))
          ) : (
            [
              { name: "Institution's Innovation Council", content: "Institution's Innovation Council" },
              { 
                name: "ed club", 
                content: (
                  <div className="bg-white rounded-[14px] shadow-[0_8px_30px_rgba(168,85,247,0.15)] w-[110px] h-[65px] flex flex-col items-center justify-center leading-[1.1] font-extrabold tracking-tight text-[#2D2D2D]">
                    <span className="text-[1.05rem]">ed</span>
                    <span className="text-[0.95rem]">club</span>
                  </div>
                )
              },
              { name: "TinkerHub", content: "TinkerHub" },
              { name: "y1p", content: "y1p" }
            ].map((partner) => (
              <div key={partner.name} className="w-[calc(50%-0.5rem)] md:w-[calc(25%-0.75rem)] bg-white rounded-xl h-[90px] flex items-center justify-center text-[#1A1A2E] font-bold text-sm text-center p-2 shadow-lg">
                {partner.content}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
