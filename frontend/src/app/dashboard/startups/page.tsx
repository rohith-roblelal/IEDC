"use client";

import { useEffect, useState } from "react";
import { Rocket, Trash2, Edit, Plus, Check, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import Link from "next/link";
import { startupsApi } from "@/lib/api/startups";
import { StartupResponse } from "@/lib/validations/startup";

import { groupTeamByRole, sortGroupedRoles, formatRoleDisplay } from "@/lib/team";
import Image from "next/image";

export default function StartupsPage() {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [startups, setStartups] = useState<StartupResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);

  const fetchStartups = async () => {
    setIsLoading(true);
    try {
      const res = await startupsApi.getAdminStartups(1, 100);
      setStartups(res.data.items || []);
    } catch (err) {
      console.error(err);
      toast("Failed to load startups", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStartups();
  }, []);

  const handleDelete = async (id: string) => {
    if (processingIds.has(id)) return;
    if (!(await confirm("Are you sure you want to delete this startup?"))) return;
    
    setProcessingIds(prev => new Set(prev).add(id));
    try {
      await startupsApi.deleteStartup(id);
      await fetchStartups();
      toast("Startup deleted successfully", "success");
    } catch (err) {
      console.error(err);
      toast("Failed to delete startup", "error");
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (action: 'publish' | 'unpublish' | 'delete') => {
    if (selectedIds.length === 0 || isProcessingBulk) return;
    
    if (!(await confirm(`Are you sure you want to ${action} ${selectedIds.length} startups?`))) return;
    
    setIsProcessingBulk(true);
    setProcessingIds(prev => new Set([...prev, ...selectedIds]));
    
    try {
      if (action === 'delete') {
        await Promise.all(selectedIds.map(id => startupsApi.deleteStartup(id)));
        toast(`Successfully deleted ${selectedIds.length} startups`, 'success');
      } else {
        const isPublished = action === 'publish';
        await Promise.all(selectedIds.map(id => 
          startupsApi.updateStartup(id, { is_published: isPublished } as any)
        ));
        toast(`Successfully ${action}ed ${selectedIds.length} startups`, 'success');
      }
      setSelectedIds([]);
      await fetchStartups();
    } catch (err) {
      console.error(err);
      toast(`Failed to complete bulk ${action}`, 'error');
    } finally {
      setIsProcessingBulk(false);
      setProcessingIds(prev => {
        const next = new Set(prev);
        selectedIds.forEach(id => next.delete(id));
        return next;
      });
    }
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-24 relative">
      {/* Header section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            Startups
          </h1>
          <p className="text-[#C4C4D4] mt-2 text-lg">
            Manage incubated and alumni startups.
          </p>
        </div>
        <Link
          href="/dashboard/startups/new"
          className="flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-5 py-2.5 rounded-lg font-bold text-sm transition-colors border border-purple-500/20 shrink-0"
        >
          <Rocket size={18} />
          Add Startup
        </Link>
      </header>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#111127] rounded-xl border border-white/5 p-5 animate-pulse h-64 flex flex-col">
              <div className="flex gap-4 mb-4">
                <div className="w-12 h-12 bg-white/5 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-5 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2 mb-auto">
                <div className="h-3 bg-white/5 rounded w-full" />
                <div className="h-3 bg-white/5 rounded w-full" />
                <div className="h-3 bg-white/5 rounded w-4/5" />
              </div>
              <div className="h-10 bg-white/5 rounded w-full mt-4" />
            </div>
          ))}
        </div>
      ) : startups.length === 0 ? (
        <div className="bg-[#111127] rounded-xl border border-white/5 shadow-2xl flex flex-col items-center justify-center h-[400px] text-center px-6">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Rocket className="text-[#C4C4D4]/50" size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No startups found</h3>
          <p className="text-[#C4C4D4] mb-6 max-w-md">
            You haven't added any startups yet. Create your first startup profile to display it on the main site.
          </p>
          <Link
            href="/dashboard/startups/new"
            className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors border border-white/5"
          >
            <Plus size={18} />
            Add Startup
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {startups.map((startup, idx) => {
            const isSelected = selectedIds.includes(startup.id);
            return (
              <motion.div
                key={startup.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-[#111127] border ${
                  isSelected ? 'border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'border-white/5'
                } rounded-xl p-5 flex flex-col h-full shadow-2xl relative transition-all group hover:bg-white/[0.02] cursor-default`}
              >
                <div className="absolute top-4 left-4 z-10">
                  <div
                    onClick={() => {
                      if (!processingIds.has(startup.id)) {
                        toggleSelection(startup.id);
                      }
                    }}
                    className={`w-5 h-5 rounded flex items-center justify-center transition-colors border ${
                      processingIds.has(startup.id) ? 'cursor-not-allowed opacity-50 bg-[#0A0E27] border-white/20' : 'cursor-pointer'
                    } ${
                      isSelected && !processingIds.has(startup.id)
                        ? 'bg-purple-500 border-purple-500 text-white' 
                        : !processingIds.has(startup.id) ? 'bg-[#0A0E27] border-white/20 hover:border-purple-500/50 text-transparent' : 'text-transparent'
                    }`}
                  >
                    <Check size={14} className={isSelected ? "opacity-100" : "opacity-0"} strokeWidth={3} />
                  </div>
                </div>
                
                <div className="flex justify-between items-start mb-5 pl-8">
                  <div className="flex items-center space-x-4">
                    {startup.logo_url ? (
                      <div className="relative w-14 h-14 rounded-xl bg-white flex-shrink-0 overflow-hidden flex items-center justify-center shadow-sm p-1.5 border border-white/10">
                        <Image 
                          src={startup.logo_url} 
                          alt={startup.name} 
                          fill
                          sizes="56px"
                          className="object-contain p-1"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-[#C4C4D4] shadow-sm">
                        <Rocket size={24} />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-white leading-tight mb-1.5">{startup.name}</h3>
                      <div className="flex gap-2 flex-wrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-bold tracking-wider uppercase border ${
                          startup.status === 'ACTIVE' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' 
                            : startup.status === 'ALUMNI' 
                              ? 'bg-slate-500/10 text-slate-400 border-slate-500/25' 
                              : 'bg-white/5 text-[#C4C4D4] border-white/10'
                        }`}>
                          {startup.status}
                        </span>
                        {startup.is_published && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-bold tracking-wider uppercase border bg-purple-500/10 text-purple-400 border-purple-500/25">
                            PUBLISHED
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1 -mt-1 -mr-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <Link
                      href={processingIds.has(startup.id) ? "#" : `/dashboard/startups/${startup.id}/edit`}
                      className={`p-2 text-[#C4C4D4] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        processingIds.has(startup.id) ? 'cursor-not-allowed opacity-50' : 'hover:text-purple-400 hover:bg-purple-500/10'
                      }`}
                      aria-label={`Edit ${startup.name}`}
                      title="Edit Startup"
                    >
                      <Edit size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete(startup.id)}
                      disabled={processingIds.has(startup.id)}
                      className={`p-2 text-[#C4C4D4] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center justify-center ${
                        processingIds.has(startup.id) ? 'cursor-not-allowed opacity-50' : 'hover:text-red-400 hover:bg-red-500/10'
                      }`}
                      aria-label={`Delete ${startup.name}`}
                      title="Delete Startup"
                    >
                      {processingIds.has(startup.id) ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>
                
                <p className="text-[#C4C4D4] text-sm leading-relaxed line-clamp-3 mb-5 flex-grow">
                  {startup.short_description || "No description provided."}
                </p>
                
                <div className="text-xs text-[#C4C4D4]/70 mt-auto pt-4 border-t border-white/5 flex flex-col gap-2">
                  {(() => {
                    const allMembers = [...(startup.founders || []), ...(startup.team_members || [])];
                    if (allMembers.length === 0) return null;
                    
                    const grouped = groupTeamByRole(allMembers);
                    const sortedRoles = sortGroupedRoles(grouped);
                    
                    const topRoles = sortedRoles.slice(0, 3);
                    const remainingRoles = sortedRoles.length - topRoles.length;

                    return (
                      <>
                        {topRoles.map(role => (
                          <div key={role} className="flex items-start">
                            <span className="text-[#C4C4D4] font-medium w-24 shrink-0 uppercase tracking-wider text-[0.65rem] pt-0.5">{formatRoleDisplay(role, grouped[role].length)}</span> 
                            <span className="truncate flex-1 text-white">{grouped[role].map(m => m.name).join(', ')}</span>
                          </div>
                        ))}
                        {remainingRoles > 0 && (
                          <div className="flex items-center text-[#C4C4D4]/50 mt-1 font-medium">
                            <span>+{remainingRoles} more team role{remainingRoles > 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                  {startup.industry && (
                    <div className="flex items-start mt-1">
                      <span className="text-[#C4C4D4] font-medium w-24 shrink-0 uppercase tracking-wider text-[0.65rem] pt-0.5">Industry</span> 
                      <span className="truncate flex-1 text-white">{startup.industry}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Bulk Action Floating Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#111432]/95 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-4 z-50 min-w-max"
          >
            <div className="text-white font-bold text-sm bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 mr-2">
              {selectedIds.length} selected
            </div>
            
            <div className="flex items-center gap-2 border-r border-white/10 pr-4">
              <button
                onClick={() => handleBulkAction('publish')}
                disabled={isProcessingBulk}
                className="text-sm font-bold bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 px-4 py-2 rounded-lg transition-colors border border-purple-500/20 disabled:opacity-50"
              >
                Publish
              </button>
              <button
                onClick={() => handleBulkAction('unpublish')}
                disabled={isProcessingBulk}
                className="text-sm font-bold bg-white/5 text-[#C4C4D4] hover:bg-white/10 hover:text-white px-4 py-2 rounded-lg transition-colors border border-white/5 disabled:opacity-50"
              >
                Unpublish
              </button>
            </div>
            
            <button
              onClick={() => handleBulkAction('delete')}
              disabled={isProcessingBulk}
              className="text-sm font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 px-4 py-2 rounded-lg transition-colors border border-red-500/20 disabled:opacity-50 flex items-center gap-1.5"
            >
              <Trash2 size={16} /> Delete
            </button>
            
            <button
              onClick={() => setSelectedIds([])}
              disabled={isProcessingBulk}
              className="ml-2 p-2 text-[#C4C4D4] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Clear selection"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
