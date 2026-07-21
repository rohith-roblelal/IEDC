"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

export default function Home() {
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
            Hi Everyone, Welcome To
            <span className="block text-[#8B7FE8]">IEDC-SNMIMT</span>
          </h1>
          <p className="mt-5 max-w-[640px] mx-auto text-[#C4C4D4] text-[0.98rem]">
            The Innovation and Entrepreneurship Development Cell at SNMIMT — workshops, hackathons, talks, and startup initiatives for students. Browse upcoming events below and register in a few clicks.
          </p>
          <div className="mt-7 flex justify-center gap-3.5 flex-wrap">
            <Link 
              href="/events" 
              className="inline-block bg-[#22D46B] text-[#1A1A2E] font-bold py-3.5 px-7 rounded-full hover:-translate-y-0.5 transition-transform"
            >
              View Events
            </Link>
            <Link 
              href="/about" 
              className="inline-block bg-[#3A2065] text-white font-bold py-3.5 px-7 rounded-full hover:-translate-y-0.5 transition-transform"
            >
              About the Club
            </Link>
          </div>
          
          <motion.img 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            src="/logo.png"
            alt="IEDC SNMIMT Logo"
            className="mt-11 mx-auto w-[min(260px,70%)] object-contain drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]" 
          />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-4 flex flex-col items-center justify-center"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-wider">IEDC</h2>
            <p className="text-[#A855F7] font-medium tracking-[0.2em] text-sm md:text-base mt-1">SNMIMT</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Podcast Section */}
      <section className="px-6 py-24">
        <h2 className="text-center text-[clamp(1.8rem,4vw,2.4rem)] font-bold mb-5">Our Podcast</h2>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => alert("Podcast playback would launch here.")}
          className="block w-full max-w-[900px] mx-auto rounded-[28px] overflow-hidden relative aspect-video md:aspect-[16/9] bg-gradient-to-br from-[#1a2f5c] to-[#0d1b3a] shadow-xl text-left"
          aria-label="Play Women in Tech podcast episode"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.35),transparent_60%)]"></div>
          <span className="absolute top-5 right-6 text-sm text-[#C4C4D4] z-10">February 29, 2023</span>
          <div className="absolute bottom-0 left-0 right-0 p-7 md:p-8 flex items-end justify-between gap-4 z-10 bg-gradient-to-t from-black/60 to-transparent">
            <div>
              <h3 className="text-[clamp(1.2rem,3vw,1.7rem)] font-bold text-white">Women in tech</h3>
              <p className="text-[#C4C4D4] text-sm mt-1.5">Breaking barriers and building future</p>
            </div>
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-white bg-white/10 text-white flex items-center justify-center shrink-0 backdrop-blur-sm">
              <Play fill="currentColor" size={20} className="ml-1" />
            </div>
          </div>
        </motion.button>
      </section>

      {/* Beta Section */}
      <section className="px-6 pb-24">
        <h2 className="text-center text-[clamp(1.8rem,4vw,2.4rem)] font-bold mb-5">About Beta</h2>
        <p className="max-w-[680px] mx-auto text-center text-[#C4C4D4] font-medium text-base">
          Beta is an initiative by IEDC SNMIMT designed to empower startups and foster innovation. We provide resources, mentorship, and funding opportunities to help early-stage businesses succeed in the competitive market.
        </p>
        <div className="text-center mt-7">
          <button className="inline-block bg-[#22D46B] text-[#1A1A2E] font-bold py-3.5 px-7 rounded-full hover:-translate-y-0.5 transition-transform">
            View Startups
          </button>
        </div>
      </section>

      {/* Partners Section */}
      <section id="partners" className="px-6 pb-12">
        <h2 className="text-center text-[clamp(2.2rem,8vw,3.4rem)] font-light text-white/90 my-10 uppercase tracking-widest">
          Collaborative
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[900px] mx-auto">
          {[
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
          ))}
        </div>
      </section>
    </div>
  );
}
