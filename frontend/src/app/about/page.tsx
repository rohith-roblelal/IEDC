"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useSettings } from "@/lib/settings-context";

export default function AboutPage() {
  const settings = useSettings();
  const stats = settings.about_stats_json || [{ label: "Events In The Last Year", value: "46+" }];

  return (
    <div className="py-24 px-6 relative">
      <section className="mb-24">
        <h2 className="text-center text-[clamp(1.8rem,4vw,2.4rem)] font-bold mb-5">About IEDC</h2>
        <p className="max-w-[680px] mx-auto text-center text-[#C4C4D4] font-medium text-base mb-4">
          IEDC has been developed to foster and nurture innovations combined with entrepreneurship amongst young minds, there is growth potential to be untapped and IEDC aims to fill this abyss.
        </p>
        <p className="max-w-[680px] mx-auto text-center text-[#C4C4D4] font-medium text-base">
          {settings.about_description}
        </p>
        <div className="text-center mt-7">
          <Link href="/events" className="inline-block bg-[#3A2065] text-white font-bold py-3.5 px-7 rounded-full hover:-translate-y-0.5 transition-transform">
            See Upcoming Events
          </Link>
        </div>
        <div className="flex flex-wrap justify-center gap-6 mt-11">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="bg-white text-[#1A1A2E] rounded-[18px] py-7 px-10 max-w-[280px] text-center shadow-2xl"
            >
              <div className="text-[2.4rem] font-extrabold leading-tight">{stat.value}</div>
              <div className="text-[#555] font-medium mt-1 text-[0.95rem]">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <div className="max-w-[400px] mx-auto">
          <img 
            className="w-[min(260px,70%)] mx-auto rounded-[18px] grayscale object-cover" 
            src={"https://iedcsnmimt.vercel.app/static/media/steve.0ead07c00054eb156af5.png"}
            alt="Steve Jobs Portrait" 
          />
        </div>
        
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-white text-[#1A1A2E] rounded-[18px] p-8 max-w-[340px] mx-auto mt-7 mb-14 text-center font-semibold text-[1.15rem] shadow-2xl"
        >
          "Creativity is just connecting things"
          <cite className="block mt-3.5 not-italic font-medium text-[0.9rem] text-[#666]">Steve Jobs</cite>
        </motion.div>
        
        <h2 className="text-center text-[clamp(1.8rem,4vw,2.4rem)] font-bold mb-5">Our Vision</h2>
        <p className="max-w-[680px] mx-auto text-center font-semibold text-white text-[1.05rem] italic mb-4">
          "To dive into the inner potential and to promote technological disruptions when proffering the nurturing mind to think laterally and divergently, IEDC is a body to develop entrepreneurial skills and to foster innovations to start up."
        </p>
        <p className="max-w-[680px] mx-auto text-center font-semibold text-white text-[1.05rem] italic">
          {settings.about_vision ? `"${settings.about_vision}"` : ""}
        </p>
      </section>
    </div>
  );
}
