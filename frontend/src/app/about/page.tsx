"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="py-24 px-6 relative">
      <section className="mb-24">
        <h2 className="text-center text-[clamp(1.8rem,4vw,2.4rem)] font-bold mb-5">About IEDC</h2>
        <p className="max-w-[680px] mx-auto text-center text-[#C4C4D4] font-medium text-base">
          IEDC has been developed to foster and nurture innovations combined with entrepreneurship amongst young minds, there is growth potential to be untapped and IEDC aims to fill this abyss.
        </p>
        <div className="text-center mt-7">
          <Link href="/events" className="inline-block bg-[#3A2065] text-white font-bold py-3.5 px-7 rounded-full hover:-translate-y-0.5 transition-transform">
            See Upcoming Events
          </Link>
        </div>
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white text-[#1A1A2E] rounded-[18px] py-7 px-10 max-w-[280px] mx-auto mt-11 text-center shadow-2xl"
        >
          <div className="text-[2.4rem] font-extrabold leading-tight">46+</div>
          <div className="text-[#555] font-medium mt-1 text-[0.95rem]">Events In The Last Year</div>
        </motion.div>
      </section>

      <section>
        <div className="max-w-[400px] mx-auto">
          {/* Using a standard img tag for simplicity, next/image can be optimized later */}
          <img 
            className="w-[min(260px,70%)] mx-auto rounded-[18px] grayscale object-cover" 
            src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80" 
            alt="Portrait" 
            onError={(e) => (e.currentTarget.style.display = 'none')}
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
        <p className="max-w-[680px] mx-auto text-center font-semibold text-white text-[1.05rem] italic">
          "To dive into the inner potential and to promote technological disruptions when proffering the nurturing mind to think laterally and divergently, IEDC is a body to develop entrepreneurial skills and to foster innovations to start up."
        </p>
      </section>
    </div>
  );
}
