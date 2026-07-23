"use client";

import { useEffect, useState } from "react";
import { MessageSquare, CheckCircle, Trash2, Mail, User, Send, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/ToastProvider";

export default function MessagesPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Reply Modal State
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const fetchMessages = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch("/api/v1/contact", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`/api/v1/contact/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMessages(messages.map((m) => (m.id === id ? { ...m, is_read: true } : m)));
        toast("Message marked as read", "success");
      }
    } catch (err) {
      console.error(err);
      toast("Failed to mark as read", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`/api/v1/contact/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMessages(messages.filter((m) => m.id !== id));
        toast("Message deleted", "success");
      }
    } catch (err) {
      console.error(err);
      toast("Failed to delete message", "error");
    }
  };

  const openReplyModal = (msg: any) => {
    setSelectedMessage(msg);
    setReplyText("");
    setReplyModalOpen(true);
  };

  const closeReplyModal = () => {
    setReplyModalOpen(false);
    setSelectedMessage(null);
    setReplyText("");
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;

    setIsSending(true);
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`/api/v1/contact/${selectedMessage.id}/reply`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ reply_message: replyText })
      });
      
      if (res.ok) {
        toast("Reply sent successfully!", "success");
        // Update local state to mark as read automatically
        setMessages(messages.map((m) => (m.id === selectedMessage.id ? { ...m, is_read: true } : m)));
        closeReplyModal();
      } else {
        toast("Failed to send reply.", "error");
      }
    } catch (err) {
      console.error(err);
      toast("An error occurred while sending.", "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MessageSquare className="text-orange-400" /> Contact Messages
        </h1>
        <p className="text-[#C4C4D4] mt-2">View and reply to messages submitted from the public contact form.</p>
      </div>

      <div className="bg-[#111432] rounded-2xl border border-white/10 p-6 min-h-[60vh]">
        {isLoading ? (
          <div className="text-center text-[#C4C4D4] py-8 flex justify-center items-center">
            <Loader2 className="animate-spin mr-2" /> Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-[#C4C4D4] py-8 flex flex-col items-center">
            <MessageSquare size={48} className="opacity-20 mb-4" />
            <p>No messages found.</p>
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
                    !msg.is_read ? 'bg-orange-500/10 border-orange-500/30' : 'bg-white/5'
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
                      <button 
                        onClick={() => openReplyModal(msg)}
                        title="Reply to message" 
                        className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-lg"
                      >
                        <Send size={16} className="mr-1.5" /> Reply
                      </button>
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
                        onClick={() => handleDelete(msg.id)}
                        title="Delete message" 
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

      {/* Reply Modal */}
      <AnimatePresence>
        {replyModalOpen && selectedMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeReplyModal}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 shadow-2xl"
            >
              <button 
                onClick={closeReplyModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Send className="mr-2 text-blue-400" />
                Reply to {selectedMessage.name}
              </h2>
              
              <div className="bg-black/30 p-4 rounded-xl mb-4 text-sm text-[#C4C4D4] border border-white/5">
                <p className="font-semibold text-gray-300 mb-1">Original Message:</p>
                <p className="italic">"{selectedMessage.message}"</p>
              </div>

              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..."
                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[150px] resize-y mb-4"
              />

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeReplyModal}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendReply}
                  disabled={isSending || !replyText.trim()}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <><Loader2 size={16} className="mr-2 animate-spin" /> Sending...</>
                  ) : (
                    <><Send size={16} className="mr-2" /> Send Reply</>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
