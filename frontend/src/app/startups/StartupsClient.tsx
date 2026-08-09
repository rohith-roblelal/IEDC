"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Globe, User, Users, ChevronRight, X, Play } from "lucide-react";
import Image from "next/image";
import { groupTeamByRole, sortGroupedRoles, formatRoleDisplay } from "@/lib/team";

interface StartupsClientProps {
  initialStartupSlug?: string;
}

export default function StartupsClient({ initialStartupSlug }: StartupsClientProps = {}) {
  const [startups, setStartups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStartup, setSelectedStartup] = useState<any | null>(null);

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        const res = await fetch("/api/v1/startups");
        if (res.ok) {
          const data = await res.json();
          const items = data.items || (Array.isArray(data) ? data : []);
          setStartups(items);
          
          if (initialStartupSlug) {
            const found = items.find((s: any) => s.slug === initialStartupSlug || s.id === initialStartupSlug);
            if (found) {
              setSelectedStartup(found);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStartups();
  }, []);

  const detailTeamGrouped = useMemo(() => {
    if (!selectedStartup) return { sortedRoles: [], grouped: {} };
    const allMembers = [...(selectedStartup.founders || []), ...(selectedStartup.team_members || [])];
    const grouped = groupTeamByRole(allMembers);
    const sortedRoles = sortGroupedRoles(grouped);
    return { sortedRoles, grouped };
  }, [selectedStartup]);

  return (
    <div className="min-h-screen text-white selection:bg-[#22D46B] selection:text-[#1A1A2E]">
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

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-[#22D46B]/30 border-t-[#22D46B] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {startups.map((startup, index) => (
              <motion.div
                key={startup.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedStartup(startup)}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-300 cursor-pointer flex flex-col"
              >
                <div className="p-6 flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    {startup.logo_url ? (
                      <div className="w-16 h-16 rounded-xl bg-white p-1 flex-shrink-0 relative overflow-hidden">
                        <Image 
                          src={startup.logo_url} 
                          alt={startup.name} 
                          fill
                          sizes="64px"
                          className="object-contain rounded-lg p-1"
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
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#22D46B]/20 text-[#22D46B] capitalize">
                          {startup.stage?.replace('_', ' ').toLowerCase() || startup.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-[#C4C4D4] text-sm mb-6 line-clamp-4">
                    {startup.short_description || startup.description}
                  </p>
                  
                  <div className="pt-4 border-t border-white/10 flex flex-col space-y-2 text-sm text-[#C4C4D4]">
                    {(() => {
                      const allMembers = [...(startup.founders || []), ...(startup.team_members || [])];
                      if (allMembers.length === 0) return null;
                      
                      const grouped = groupTeamByRole(allMembers);
                      const sortedRoles = sortGroupedRoles(grouped);
                      
                      const topRoles = sortedRoles.slice(0, 3);
                      const topMembersCount = topRoles.reduce((sum, role) => sum + grouped[role].length, 0);
                      const remainingCount = allMembers.length - topMembersCount;

                      return (
                        <>
                          {topRoles.map(role => (
                            <div key={role} className="flex items-start">
                              <User size={16} className="mr-2 mt-0.5 opacity-70 shrink-0" />
                              <span className="truncate">
                                <span className="font-medium text-white/80">{formatRoleDisplay(role, grouped[role].length)}:</span>{' '}
                                {grouped[role].map((m: any) => m.name).join(', ')}
                              </span>
                            </div>
                          ))}
                          {remainingCount > 0 && (
                            <div className="flex items-center">
                              <Users size={16} className="mr-2 opacity-70 shrink-0" />
                              <span>+{remainingCount} more team role{remainingCount > 1 ? 's' : ''}</span>
                            </div>
                          )}
                        </>
                      );
                    })()}
                    {startup.website_url && (
                      <div className="flex items-center text-[#22D46B]">
                        <Globe size={16} className="mr-2" />
                        <span className="truncate">{startup.website_url.replace(/^https?:\/\//, '')}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex justify-between items-center group">
                  <span className="text-sm font-medium text-white">View Details</span>
                  <ChevronRight size={18} className="text-[#C4C4D4] group-hover:text-white transition-colors transform group-hover:translate-x-1" />
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
        )}
      </main>

      <AnimatePresence>
        {selectedStartup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedStartup(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0D1030] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 sm:p-8 flex items-start justify-between border-b border-white/10 bg-[#0A0E27]">
                <div className="flex items-center space-x-4">
                  {selectedStartup.logo_url ? (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-2 flex-shrink-0 shadow-lg relative overflow-hidden">
                      <Image 
                        src={selectedStartup.logo_url} 
                        alt={selectedStartup.name} 
                        fill
                        sizes="(max-width: 640px) 64px, 80px"
                        className="object-contain rounded-xl p-1"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400 flex flex-col items-center justify-center flex-shrink-0 border border-blue-500/30">
                      <Rocket size={32} />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">{selectedStartup.name}</h2>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {selectedStartup.industry || "General"}
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-[#22D46B]/10 text-[#22D46B] border border-[#22D46B]/20 capitalize">
                        {selectedStartup.stage?.replace('_', ' ').toLowerCase() || selectedStartup.status}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedStartup(null)}
                  className="p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-8">
                    <section>
                      <h3 className="text-lg font-bold text-white mb-3">About</h3>
                      <p className="text-[#C4C4D4] leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                        {selectedStartup.full_description || selectedStartup.short_description || selectedStartup.description}
                      </p>
                    </section>

                    {selectedStartup.demo_video_url && (
                      <section>
                        <h3 className="text-lg font-bold text-white mb-3">Demo Video</h3>
                        <a href={selectedStartup.demo_video_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group text-[#C4C4D4]">
                           <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                             <Play size={18} className="ml-1" />
                           </div>
                           <div>
                             <p className="text-white font-medium">Watch Demo</p>
                             <p className="text-xs opacity-70">Opens in a new tab</p>
                           </div>
                        </a>
                      </section>
                    )}
                  </div>
                  
                  <div className="space-y-6">
                    <section className="bg-white/5 border border-white/10 rounded-xl p-5">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 opacity-80">Details</h3>
                      <div className="space-y-4 text-sm">
                        {selectedStartup.website_url && (
                          <div>
                            <p className="text-white/50 mb-1 text-xs">Website</p>
                            <a href={selectedStartup.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 break-all transition-colors flex items-center gap-1.5">
                              <Globe size={14} /> {selectedStartup.website_url.replace(/^https?:\/\//, '')}
                            </a>
                          </div>
                        )}
                        {selectedStartup.linkedin_url && (
                          <div>
                            <p className="text-white/50 mb-1 text-xs">LinkedIn</p>
                            <a href={selectedStartup.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 break-all transition-colors">
                              Company Profile
                            </a>
                          </div>
                        )}
                        {selectedStartup.github_url && (
                          <div>
                            <p className="text-white/50 mb-1 text-xs">GitHub</p>
                            <a href={selectedStartup.github_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 break-all transition-colors">
                              Repository
                            </a>
                          </div>
                        )}
                      </div>
                    </section>
                    
                    {detailTeamGrouped.sortedRoles.length > 0 && (
                      <section className="bg-white/5 border border-white/10 rounded-xl p-5">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 opacity-80">Team</h3>
                        
                        <div className="space-y-5">
                          {detailTeamGrouped.sortedRoles.map(role => (
                            <div key={role}>
                              <p className="text-white/50 mb-2 text-xs border-b border-white/5 pb-1 uppercase tracking-widest">{role}</p>
                              <ul className="space-y-2">
                                {detailTeamGrouped.grouped[role].map((member: any, i: number) => (
                                  <li key={i} className="text-[#C4C4D4] text-sm flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                                    <span className="font-medium text-white">{member.name}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
