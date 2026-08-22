"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Trash2, Mail, Archive, Inbox, ListFilter, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import { clientFetch, ApiError } from "@/lib/api/client";

function formatMessageDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  
  const isToday = 
    date.getDate() === now.getDate() && 
    date.getMonth() === now.getMonth() && 
    date.getFullYear() === now.getFullYear();
    
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = 
    date.getDate() === yesterday.getDate() && 
    date.getMonth() === yesterday.getMonth() && 
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) {
    return `Today, ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
  } else if (isYesterday) {
    return `Yesterday, ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

export default function MessagesPage() {
  const { toast } = useToast();
  const confirm = useConfirm();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<"inbox" | "archived">("inbox");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const fetchMessages = async (archived = false) => {
    setIsLoading(true);
    setExpandedId(null);
    try {
      const data = await clientFetch(`/api/v1/contact?is_archived=${archived}`, {
        cache: "no-store"
      });
      setMessages(data.items || (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(tab === "archived");
  }, [tab]);

  const handleMarkAsRead = async (id: string, notify = false) => {
    if (processingIds.has(id)) return;
    setProcessingIds(prev => new Set(prev).add(id));
    try {
      await clientFetch(`/api/v1/contact/${id}/read`, {
        method: "PATCH"
      });
      await fetchMessages(tab === "archived");
      if (notify) toast("Message marked as read", "success");
    } catch (err) {
      if (err instanceof ApiError) {
        toast(err.message || "Failed to mark as read", "error");
      } else {
        toast("Failed to mark as read", "error");
      }
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleArchive = async (id: string, currentlyArchived: boolean) => {
    if (processingIds.has(id)) return;
    setProcessingIds(prev => new Set(prev).add(id));
    try {
      await clientFetch(`/api/v1/contact/${id}/archive`, {
        method: "PATCH"
      });
      await fetchMessages(tab === "archived");
      toast(currentlyArchived ? "Moved to Inbox" : "Archived", "success");
    } catch (err) {
      if (err instanceof ApiError) {
        toast(err.message || "Failed to archive message", "error");
      } else {
        toast("Failed to archive message", "error");
      }
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (processingIds.has(id)) return;
    if (!(await confirm("Are you sure you want to delete this message?"))) return;
    setProcessingIds(prev => new Set(prev).add(id));
    try {
      await clientFetch(`/api/v1/contact/${id}`, {
        method: "DELETE"
      });
      await fetchMessages(tab === "archived");
      toast("Message deleted", "success");
    } catch (err) {
      if (err instanceof ApiError) {
        toast(err.message || "Failed to delete message", "error");
      } else {
        toast("Failed to delete message", "error");
      }
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const unreadCount = messages.filter(m => !m.is_read).length;
  const displayMessages = messages.filter(m => unreadOnly ? !m.is_read : true);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <header>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            Messages
          </h1>
          <p className="text-[#C4C4D4] mt-2 text-lg">
            Manage contact form submissions and inquiries.
          </p>
        </header>

        <div className="flex items-center gap-6 bg-[#111127] p-2 rounded-2xl border border-white/5">
          <label className="flex items-center gap-2 text-sm text-white font-bold cursor-pointer pl-2">
            <input 
              type="checkbox" 
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-white/5 border-white/10"
            />
            Unread Only
          </label>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D8B4FE] text-purple-950 hover:bg-[#E9D5FF] transition-colors text-sm font-bold">
            <ListFilter size={16} /> Filter
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-[#111127] rounded-3xl border border-white/5 shadow-2xl overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="flex items-center gap-2 px-6 pt-6 pb-4">
          <button
            onClick={() => setTab("inbox")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === "inbox" ? "bg-white/10 text-white" : "text-[#C4C4D4] hover:bg-white/5 hover:text-white"
            }`}
          >
            <Inbox size={16} /> Inbox
            {tab === "inbox" && unreadCount > 0 && (
              <span className="ml-1 bg-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </button>
          <button
            onClick={() => setTab("archived")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === "archived" ? "bg-white/10 text-white" : "text-[#C4C4D4] hover:bg-white/5 hover:text-white"
            }`}
          >
            <Archive size={16} /> Archived
          </button>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-white/5 text-[11px] font-bold text-[#C4C4D4] uppercase tracking-wider">
           <div className="col-span-4">SENDER</div>
           <div className="col-span-6">SUBJECT</div>
           <div className="col-span-2 text-right">DATE</div>
        </div>

        {/* List Body */}
        <div className="flex flex-col min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-1 justify-center items-center">
              <Loader2 className="animate-spin text-purple-500 w-8 h-8" />
            </div>
          ) : displayMessages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center p-12">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <MessageSquare className="text-[#C4C4D4]/50" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {tab === "archived" ? "No archived messages" : unreadOnly ? "No unread messages" : "Inbox is empty"}
              </h3>
              <p className="text-[#C4C4D4] max-w-md">
                {tab === "archived" ? "You haven't archived any messages yet." : "You're all caught up! No new messages right now."}
              </p>
            </div>
          ) : (
            displayMessages.map((msg) => (
              <div key={msg.id} className="flex flex-col border-b border-white/5 last:border-0 group">
                {/* Row */}
                <div 
                  onClick={() => {
                    const isOpening = expandedId !== msg.id;
                    setExpandedId(isOpening ? msg.id : null);
                    if (isOpening && !msg.is_read) handleMarkAsRead(msg.id);
                  }}
                  className={`grid grid-cols-12 gap-4 px-8 py-5 items-center cursor-pointer transition-colors ${
                    expandedId === msg.id ? 'bg-white/[0.02]' : 'hover:bg-white/[0.01]'
                  } ${!msg.is_read ? 'border-l-4 border-l-purple-500 bg-purple-500/[0.02]' : 'border-l-4 border-l-transparent'}`}
                >
                  <div className="col-span-4 flex flex-col min-w-0 pr-4">
                    <span className={`text-base truncate ${!msg.is_read ? 'text-white font-bold' : 'text-[#C4C4D4]'}`}>{msg.name}</span>
                    <span className={`text-sm truncate ${!msg.is_read ? 'text-gray-300' : 'text-gray-500'}`}>{msg.email}</span>
                  </div>
                  <div className={`col-span-6 text-base truncate pr-4 ${!msg.is_read ? 'text-white font-bold' : 'text-[#C4C4D4]'}`}>
                    {msg.subject || <span className="italic text-white/30">No Subject</span>}
                  </div>
                  <div className={`col-span-2 text-right text-sm font-medium whitespace-nowrap ${!msg.is_read ? 'text-[#D8B4FE]' : 'text-[#C4C4D4]'}`}>
                    {formatMessageDate(msg.created_at)}
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedId === msg.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-[#0A0E27]"
                    >
                      <div className="p-8 border-t border-white/5">
                        {/* Meta details if needed */}
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                          <Mail size={14} />
                          <span>From: <a href={`mailto:${msg.email}`} className="text-purple-400 hover:underline">{msg.email}</a></span>
                        </div>
                        
                        {/* Message Body */}
                        <div className="text-[#e2e2e8] text-sm leading-relaxed whitespace-pre-wrap mb-8 max-w-4xl">
                          {msg.message}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex space-x-3">
                            <button
                              onClick={() => handleArchive(msg.id, tab === "archived")}
                              disabled={processingIds.has(msg.id)}
                              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingIds.has(msg.id) ? <Loader2 size={16} className="animate-spin" /> : tab === "archived" ? <Inbox size={16} /> : <Archive size={16} />}
                              {tab === "archived" ? "Move to Inbox" : "Archive"}
                            </button>
                            <button
                              onClick={() => handleDelete(msg.id)}
                              disabled={processingIds.has(msg.id)}
                              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {processingIds.has(msg.id) ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                              Delete
                            </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
