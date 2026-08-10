"use client";

import { useEffect, useState } from "react";
import { Rocket, Trash2, Edit } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import Link from "next/link";
import { startupsApi } from "@/lib/api/startups";
import { StartupResponse } from "@/lib/validations/startup";
import { Button } from "@/components/ui/button";

import { groupTeamByRole, sortGroupedRoles, formatRoleDisplay } from "@/lib/team";
import Image from "next/image";

export default function StartupsPage() {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [startups, setStartups] = useState<StartupResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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
    if (!(await confirm("Are you sure you want to delete this startup?"))) return;
    
    try {
      await startupsApi.deleteStartup(id);
      setStartups(startups.filter((s) => s.id !== id));
      toast("Startup deleted successfully", "success");
    } catch (err) {
      console.error(err);
      toast("Failed to delete startup", "error");
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (action: 'publish' | 'unpublish' | 'delete') => {
    if (selectedIds.length === 0) return;
    
    if (!(await confirm(`Are you sure you want to ${action} ${selectedIds.length} startups?`))) return;
    
    setIsProcessingBulk(true);
    try {
      if (action === 'delete') {
        await Promise.all(selectedIds.map(id => startupsApi.deleteStartup(id)));
        setStartups(startups.filter(s => !selectedIds.includes(s.id)));
        toast(`Successfully deleted ${selectedIds.length} startups`, 'success');
      } else {
        const isPublished = action === 'publish';
        await Promise.all(selectedIds.map(id => 
          startupsApi.updateStartup(id, { is_published: isPublished } as any)
        ));
        setStartups(startups.map(s => 
          selectedIds.includes(s.id) ? { ...s, is_published: isPublished } : s
        ));
        toast(`Successfully ${action}ed ${selectedIds.length} startups`, 'success');
      }
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
      toast(`Failed to complete bulk ${action}`, 'error');
    } finally {
      setIsProcessingBulk(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Startups</h1>
          <p className="text-gray-400">Manage incubated and alumni startups.</p>
        </div>
        <Link
          href="/dashboard/startups/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Rocket className="mr-2 w-5 h-5" />
          Add Startup
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {startups.map((startup) => (
            <motion.div
              key={startup.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-zinc-900 border ${selectedIds.includes(startup.id) ? 'border-indigo-500' : 'border-zinc-800'} rounded-xl p-5 flex flex-col h-full shadow-lg relative transition-colors`}
            >
              <div className="absolute top-4 left-4 z-10">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(startup.id)}
                  onChange={() => toggleSelection(startup.id)}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-indigo-500 focus:ring-indigo-500/50 cursor-pointer"
                />
              </div>
              <div className="flex justify-between items-start mb-4 pl-6">
                <div className="flex items-center space-x-4">
                  {startup.logo_url ? (
                    <div className="relative w-12 h-12 rounded-lg bg-white flex-shrink-0 overflow-hidden flex items-center justify-center">
                      <Image 
                        src={startup.logo_url} 
                        alt={startup.name} 
                        fill
                        sizes="48px"
                        className="object-contain p-1.5"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400">
                      <Rocket size={24} />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">{startup.name}</h3>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        startup.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        startup.status === 'ALUMNI' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}>
                        {startup.status}
                      </span>
                      {startup.is_published && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          Published
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-1 -mt-1 -mr-1">
                  <Link
                    href={`/dashboard/startups/${startup.id}/edit`}
                    className="p-2 hover:bg-zinc-800 rounded-md text-blue-400 transition-colors"
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(startup.id)}
                    className="p-2 hover:bg-red-500/10 rounded-md text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-zinc-400 text-sm line-clamp-3 mb-4 flex-grow">
                {startup.short_description || "No description provided."}
              </p>
              <div className="text-xs text-zinc-500 mt-auto pt-4 border-t border-zinc-800 flex flex-col gap-1.5">
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
                          <span className="text-zinc-400 w-24 shrink-0">{formatRoleDisplay(role, grouped[role].length)}:</span> 
                          <span className="truncate flex-1">{grouped[role].map(m => m.name).join(', ')}</span>
                        </div>
                      ))}
                      {remainingRoles > 0 && (
                        <div className="flex items-center text-zinc-500 mt-1">
                          <span>+{remainingRoles} more team role{remainingRoles > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </>
                  );
                })()}
                {startup.industry && (
                  <div className="flex items-center">
                    <span className="text-zinc-400 w-16">Industry:</span> 
                    <span className="truncate flex-1">{startup.industry}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {startups.length === 0 && (
            <div className="col-span-full text-center py-16 text-zinc-400 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
              <Rocket className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-zinc-300">No startups found</h3>
              <p className="text-sm mt-1">Add your first startup to get started.</p>
            </div>
          )}
        </div>
      )}

      {selectedIds.length > 0 && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 shadow-2xl rounded-full px-6 py-3 flex items-center space-x-4 z-50"
        >
          <span className="text-white font-medium mr-4">
            {selectedIds.length} selected
          </span>
          <button
            onClick={() => handleBulkAction('publish')}
            disabled={isProcessingBulk}
            className="text-sm bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
          >
            Publish
          </button>
          <button
            onClick={() => handleBulkAction('unpublish')}
            disabled={isProcessingBulk}
            className="text-sm bg-zinc-700 text-zinc-300 hover:bg-zinc-600 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
          >
            Unpublish
          </button>
          <button
            onClick={() => handleBulkAction('delete')}
            disabled={isProcessingBulk}
            className="text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
          >
            Delete
          </button>
          <button
            onClick={() => setSelectedIds([])}
            disabled={isProcessingBulk}
            className="ml-2 text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </motion.div>
      )}
    </div>
  );
}
