"use client";

import { useEffect, useState } from "react";
import { MessageSquare, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
    fetchMessages();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MessageSquare className="text-orange-400" /> Contact Messages
        </h1>
        <p className="text-[#C4C4D4] mt-2">View messages submitted from the public contact form.</p>
      </div>

      <div className="bg-[#111432] rounded-2xl border border-white/10 p-6">
        {isLoading ? (
          <div className="text-center text-[#C4C4D4] py-8">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-[#C4C4D4] py-8">No messages found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-[#C4C4D4]">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Subject</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg: any, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={msg.id} 
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors ${!msg.is_read ? 'bg-orange-500/5' : ''}`}
                  >
                    <td className="py-4 font-medium">{msg.name}</td>
                    <td className="py-4 text-[#C4C4D4]">{msg.email}</td>
                    <td className="py-4 font-medium">{msg.subject}</td>
                    <td className="py-4">
                      {msg.is_read ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">Read</span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-orange-500/20 text-orange-400 font-medium">Unread</span>
                      )}
                    </td>
                    <td className="py-4">
                      {!msg.is_read && (
                        <button title="Mark as read" className="text-green-400 hover:text-green-300 transition-colors">
                          <CheckCircle size={20} />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
