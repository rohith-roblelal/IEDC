"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Megaphone } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { useSettings } from "@/lib/settings-context";

export default function Home() {
  const { toast } = useToast();
  const settings = useSettings();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [podcast, setPodcast] = useState<any | null>(null);
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
        const res = await fetch("/api/v1/podcasts");
        if (res.ok) {
          const data = await res.json();
          setPodcast(data.items || (Array.isArray(data) ? data : []));
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
          <p className="mt-5 max-w-[640px] mx-auto text-[#C4C4D4] text-[0.98rem]">
            {settings.hero_subtitle}
          </p>
          <p className="mt-5 max-w-[760px] mx-auto text-[#C4C4D4] text-[0.95rem] leading-relaxed">
            The Innovation and Entrepreneurship Development Centre (IEDC) at SNMIMT is a vibrant student-run community. We provide mentorship, funding opportunities, and hands-on workshops to help students transform their groundbreaking ideas into successful startups. Our mission is to cultivate a culture of innovation and empower the next generation of leaders.
          </p>


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
      {podcast && (
        <section className="px-6 py-24">
          <h2 className="text-center text-[clamp(1.8rem,4vw,2.4rem)] font-bold mb-5">Our Podcast</h2>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (podcast.video_url) {
                window.open(podcast.video_url, "_blank");
              } else {
                toast("No URL provided for this podcast.", "error");
              }
            }}
            className="block w-full max-w-[900px] mx-auto rounded-[28px] overflow-hidden relative shadow-xl text-left bg-[#0d1b3a]"
            aria-label={`Play ${podcast.title} podcast episode`}
          >
            {podcast.image_url ? (
              <img src={podcast.image_url} alt="Podcast Background" className="w-full h-auto block" />
            ) : (
              <div className="w-full aspect-video md:aspect-[16/9] bg-gradient-to-br from-[#1a2f5c] to-[#0d1b3a]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.35),transparent_60%)]"></div>
              </div>
            )}
            <div className="absolute inset-0 bg-black/30"></div>
            <span className="absolute top-5 right-6 text-sm text-white/90 z-10 font-medium drop-shadow-md">{podcast.date_str}</span>
            <div className="absolute bottom-0 left-0 right-0 p-7 md:p-8 flex items-end justify-between gap-4 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
              <div>
                <h3 className="text-[clamp(1.2rem,3vw,1.7rem)] font-bold text-white">{podcast.title}</h3>
                <p className="text-[#C4C4D4] text-sm mt-1.5">{podcast.description}</p>
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-white bg-white/10 text-white flex items-center justify-center shrink-0 backdrop-blur-sm">
                <Play fill="currentColor" size={20} className="ml-1" />
              </div>
            </div>
          </motion.button>
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

      {/* Partners Section */}
      <section id="partners" className="px-6 pb-12">
        <h2 className="text-center text-[clamp(2.2rem,8vw,3.4rem)] font-light text-white/90 my-10 uppercase tracking-widest">
          Collaborative
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[900px] mx-auto">
          {partners.length > 0 ? (
            partners.map((partner) => (
              <div key={partner.id} className="bg-white rounded-xl h-[90px] flex items-center justify-center text-[#1A1A2E] font-bold text-sm text-center p-2 shadow-lg overflow-hidden">
                {partner.image_url ? (
                  <img src={partner.image_url} alt={partner.name} className="max-w-full max-h-full object-contain p-2" />
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
              <div key={partner.name} className="bg-white rounded-xl h-[90px] flex items-center justify-center text-[#1A1A2E] font-bold text-sm text-center p-2 shadow-lg">
                {partner.content}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
