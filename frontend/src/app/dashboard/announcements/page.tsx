"use client";

import { useEffect, useState } from "react";
import { Megaphone, X, Trash2, Edit, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import { clientFetch, ApiError } from "@/lib/api/client";

export default function AnnouncementsPage() {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    is_pinned: false,
  });

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const data = await clientFetch("/api/v1/announcements");
      setAnnouncements(data.items || (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenModal = (announcement: any = null) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setFormData({
        title: announcement.title,
        content: announcement.content,
        is_pinned: announcement.is_pinned,
      });
    } else {
      setEditingAnnouncement(null);
      setFormData({
        title: "",
        content: "",
        is_pinned: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAnnouncement(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingAnnouncement 
        ? `/api/v1/announcements/${editingAnnouncement.id}` 
        : "/api/v1/announcements";
      
      await clientFetch(url, {
        method: editingAnnouncement ? "PUT" : "POST",
        body: JSON.stringify(formData)
      });
      
      handleCloseModal();
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      if (err instanceof ApiError) {
        toast(err.message || "Failed to save announcement", "error");
      } else {
        toast("An unexpected error occurred", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!(await confirm("Are you sure you want to delete this announcement?"))) return;
    try {
      await clientFetch(`/api/v1/announcements/${id}`, {
        method: "DELETE",
      });
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      if (err instanceof ApiError) {
        toast(err.message || "Failed to delete announcement", "error");
      } else {
        toast("An unexpected error occurred", "error");
      }
    }
  };

  const handleShare = (announcementId: string) => {
    const url = `${window.location.origin}/announcements/${announcementId}`; 
    
    const fallbackCopyTextToClipboard = (text: string) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          toast("Announcement link copied!", "success");
        } else {
          toast("Failed to copy link", "error");
        }
      } catch (err) {
        toast("Failed to copy link", "error");
      }
      
      document.body.removeChild(textArea);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(() => {
        toast("Announcement link copied!", "success");
      }).catch(() => {
        fallbackCopyTextToClipboard(url);
      });
    } else {
      fallbackCopyTextToClipboard(url);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Megaphone className="text-pink-400" /> Announcements
          </h1>
          <p className="text-[#C4C4D4] mt-2">Manage alerts and news items.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Create Announcement
        </button>
      </div>

      <div className="bg-[#111432] rounded-2xl border border-white/10 p-6">
        {isLoading ? (
          <div className="text-center text-[#C4C4D4] py-8">Loading announcements...</div>
        ) : announcements.length === 0 ? (
          <div className="text-center text-[#C4C4D4] py-8">No announcements found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-[#C4C4D4]">
                  <th className="pb-3 font-medium">Title</th>
                  <th className="pb-3 font-medium">Content</th>
                  <th className="pb-3 font-medium">Pinned</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((ann: any, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={ann.id} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 font-medium">{ann.title}</td>
                    <td className="py-4 text-[#C4C4D4] truncate max-w-xs">{ann.content}</td>
                    <td className="py-4">
                      {ann.is_pinned ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-pink-500/20 text-pink-400">Pinned</span>
                      ) : (
                        <span className="text-[#C4C4D4]">-</span>
                      )}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleShare(ann.id)}
                          className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1"
                        >
                          <Share2 size={16} /> Share
                        </button>
                        <button 
                          onClick={() => handleOpenModal(ann)}
                          className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1"
                        >
                          <Edit size={16} /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(ann.id)}
                          className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-1"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1A1D3D] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative"
            >
              <button 
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-[#C4C4D4] hover:text-white"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-bold mb-6 text-white">
                {editingAnnouncement ? "Edit Announcement" : "Create Announcement"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Title *</label>
                  <input 
                    required
                    type="text" 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-[#111432] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500"
                    placeholder="E.g., Event Postponed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Content *</label>
                  <textarea 
                    required
                    value={formData.content}
                    onChange={e => setFormData({...formData, content: e.target.value})}
                    rows={4}
                    className="w-full bg-[#111432] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500 resize-none"
                    placeholder="Write your announcement here..."
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="is_pinned"
                    checked={formData.is_pinned}
                    onChange={e => setFormData({...formData, is_pinned: e.target.checked})}
                    className="w-4 h-4 rounded bg-[#111432] border-white/10 text-pink-500 focus:ring-pink-500"
                  />
                  <label htmlFor="is_pinned" className="text-sm font-medium text-[#C4C4D4]">
                    Pin this announcement to the top
                  </label>
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-pink-600 hover:bg-pink-500 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      editingAnnouncement ? "Save Changes" : "Create Announcement"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
