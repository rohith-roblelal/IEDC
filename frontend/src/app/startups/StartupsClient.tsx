"use client";

import { motion } from "framer-motion";
import { Rocket, Globe, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function StartupsClient({ startups }: { startups: any[] }) {
  return (
    <div className="min-h-screen bg-[#05081A] text-white selection:bg-[#22D46B] selection:text-[#1A1A2E]">
      <Navbar />
      
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Startups</h1>
          <p className="text-[#C4C4D4] max-w-2xl mx-auto text-lg">
            Discover the innovative startups incubated and nurtured at IEDC SNMIMT.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {startups.map((startup, index) => (
            <motion.div
              key={startup.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  {startup.logo_url ? (
                    <div className="w-16 h-16 rounded-xl bg-white p-1 flex-shrink-0">
                      <img 
                        src={startup.logo_url} 
                        alt={startup.name} 
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-purple-500/20 text-purple-400 flex flex-col items-center justify-center flex-shrink-0">
                      <Rocket size={24} />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold">{startup.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-[#C4C4D4]">
                        {startup.industry || "General"}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#22D46B]/20 text-[#22D46B]">
                        {startup.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-[#C4C4D4] text-sm mb-6 line-clamp-4">
                  {startup.description}
                </p>
                
                <div className="pt-4 border-t border-white/10 flex flex-col space-y-2 text-sm text-[#C4C4D4]">
                  {startup.founder && (
                    <div className="flex items-center">
                      <User size={16} className="mr-2 opacity-70" />
                      <span>{startup.founder}</span>
                    </div>
                  )}
                  {startup.website && (
                    <div className="flex items-center">
                      <Globe size={16} className="mr-2 opacity-70" />
                      <a 
                        href={startup.website.startsWith('http') ? startup.website : `https://${startup.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-[#22D46B] transition-colors"
                      >
                        {startup.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {startups.length === 0 && (
            <div className="col-span-full text-center py-20 text-[#C4C4D4] bg-white/5 rounded-2xl border border-white/10">
              <Rocket size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">No startups have been added yet.</p>
              <p className="text-sm mt-2 opacity-70">Check back soon for updates!</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
