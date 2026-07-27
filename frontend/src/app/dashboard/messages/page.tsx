"use client";

import { useEffect, useState } from "react";
import { MessageSquare, CheckCircle, Trash2, Mail, User, Send, X, Loader2, Archive, Inbox } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/ToastProvider";

export default function MessagesPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<"inbox" | "archived">("inbox");



  const fetchMessages = async (archived = false) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/contact?is_archived=${archived}`, {
        cache: "no-store"
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.items || (Array.isArray(data) ? data : []));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(tab === "archived");
  }, [tab]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/contact/${id}/read`, {
        method: "PATCH"
      });
      if (res.ok) {
        setMessages(messages.map((m) => (m.id === id ? { ...m, is_read: true } : m)));
        toast("Message marked as read", "success");
      }
    } catch {
      toast("Failed to mark as read", "error");
    }
  };

  const handleArchive = async (id: string, currentlyArchived: boolean) => {
    try {
      const res = await fetch(`/api/v1/contact/${id}/archive`, {
        method: "PATCH"
      });
      if (res.ok) {
        setMessages(messages.filter((m) => m.id !== id));
        toast(currentlyArchived ? "Moved to Inbox" : "Archived", "success");
      }
    } catch {
      toast("Failed to archive message", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await fetch(`/api/v1/contact/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setMessages(messages.filter((m) => m.id !== id));
        toast("Message deleted", "success");
      }
    } catch {
      toast("Failed to delete message", "error");
    }
  };


  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MessageSquare className="text-orange-400" /> Contact Messages
        </h1>
        <p className="text-[#C4C4D4] mt-2">View messages submitted from the public contact form.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("inbox")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            tab === "inbox" ? "bg-orange-500 text-white shadow-lg" : "bg-white/5 text-[#C4C4D4] hover:bg-white/10"
          }`}
        >
          <Inbox size={16} /> Inbox
          {tab === "inbox" && unreadCount > 0 && (
            <span className="ml-1 bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
          )}
        </button>
        <button
          onClick={() => setTab("archived")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            tab === "archived" ? "bg-gray-600 text-white shadow-lg" : "bg-white/5 text-[#C4C4D4] hover:bg-white/10"
          }`}
        >
          <Archive size={16} /> Archived
        </button>
      </div>

      <div className="bg-[#111432] rounded-2xl border border-white/10 p-6 min-h-[60vh]">
        {isLoading ? (
          <div className="text-center text-[#C4C4D4] py-8 flex justify-center items-center">
            <Loader2 className="animate-spin mr-2" /> Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-[#C4C4D4] py-8 flex flex-col items-center">
            <MessageSquare size={48} className="opacity-20 mb-4" />
            <p>{tab === "archived" ? "No archived messages." : "No messages in your inbox."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {messages.map((msg: any, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  key={msg.id}
                  className={`border border-white/10 rounded-xl p-5 flex flex-col transition-colors ${
                    !msg.is_read ? "bg-orange-500/10 border-orange-500/30" : "bg-white/5"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-2 text-white font-medium mb-1">
                        <User size={16} className="text-gray-400" />
                        <span>{msg.name}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-[#C4C4D4]">
                        <Mail size={16} className="text-gray-400" />
                        <span className="text-gray-300">{msg.email}</span>
                      </div>
                      {msg.subject && (
                        <p className="text-xs text-white/50 mt-1 italic">Re: {msg.subject}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {!msg.is_read ? (
                        <span className="px-2 py-1 text-[10px] uppercase tracking-wider rounded-full bg-orange-500/20 text-orange-400 font-bold">New</span>
                      ) : (
                        <span className="px-2 py-1 text-[10px] uppercase tracking-wider rounded-full bg-white/10 text-gray-400 font-bold">Read</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-black/20 rounded-lg p-4 text-[#C4C4D4] text-sm whitespace-pre-wrap flex-grow mb-4 border border-white/5">
                    {msg.message}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-white/10 mt-auto">
                    <div className="text-xs text-gray-500">
                      {new Date(msg.created_at).toLocaleString()}
                    </div>
                    <div className="flex space-x-2">

                      {!msg.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(msg.id)}
                          title="Mark as read"
                          className="flex items-center text-sm text-green-400 hover:text-green-300 transition-colors bg-green-500/10 px-3 py-1.5 rounded-lg"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleArchive(msg.id, tab === "archived")}
                        title={tab === "archived" ? "Move to Inbox" : "Archive"}
                        className="flex items-center text-sm text-yellow-400 hover:text-yellow-300 transition-colors bg-yellow-500/10 px-3 py-1.5 rounded-lg"
                      >
                        <Archive size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(msg.id)}
                        title="Delete"
                        className="flex items-center text-sm text-red-400 hover:text-red-300 transition-colors hover:bg-red-500/10 px-3 py-1.5 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>


    </div>
  );
}
