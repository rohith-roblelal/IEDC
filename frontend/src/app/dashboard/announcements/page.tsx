"use client";

import { useEffect, useState } from "react";
import { Megaphone, X, Trash2, Pencil, Share2, Plus, Filter, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import { clientFetch, ApiError } from "@/lib/api/client";
import { AnnouncementResponse } from "@/lib/api/announcements";

// ─── Shared input className ──────────────────────────────────────────────────
const inputCls =
  "w-full bg-[#111127] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#C4C4D4]/40 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors";
const labelCls = "block text-xs font-semibold uppercase tracking-wider text-[#C4C4D4]/70 mb-1.5";

export default function AnnouncementsPage() {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    is_pinned: false,
    is_published: true, // Default to true so they are visible when created
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

  const handleOpenModal = (announcement: AnnouncementResponse | null = null) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setFormData({
        title: announcement.title,
        content: announcement.content,
        is_pinned: announcement.is_pinned,
        is_published: announcement.is_published,
      });
    } else {
      setEditingAnnouncement(null);
      setFormData({
        title: "",
        content: "",
        is_pinned: false,
        is_published: true,
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
      await fetchAnnouncements();
      toast(editingAnnouncement ? "Announcement updated successfully!" : "Announcement created successfully!", "success");
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
    if (processingIds.has(id)) return;
    if (!(await confirm("Are you sure you want to delete this announcement?"))) return;
    setProcessingIds(prev => new Set(prev).add(id));
    try {
      await clientFetch(`/api/v1/announcements/${id}`, {
        method: "DELETE",
      });
      await fetchAnnouncements();
      toast("Announcement deleted", "success");
    } catch (err) {
      console.error(err);
      if (err instanceof ApiError) {
        toast(err.message || "Failed to delete announcement", "error");
      } else {
        toast("An unexpected error occurred", "error");
      }
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
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

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Megaphone size={28} className="text-[#A855F7]" />
            Announcements
          </h1>
          <p className="text-sm text-[#C4C4D4] mt-1.5 font-medium">Manage alerts and news items.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#E9D5FF] hover:bg-[#D8B4FE] text-[#581C87] text-sm font-bold px-5 py-2.5 rounded-lg transition-colors shadow-lg"
        >
          <Plus size={16} strokeWidth={3} />
          New Announcement
        </button>
      </div>

      {/* ── Announcements table card ── */}
      <div className="bg-[#111127] rounded-xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">All Announcements</h2>
          <button className="p-2 bg-white/5 rounded-lg text-[#C4C4D4] hover:text-white transition-colors">
            <Filter size={16} />
          </button>
        </div>

        {/* Table states */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-16 text-[#C4C4D4]/50 text-sm font-medium">
            No announcements found. Create one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  {["Title", "Content", "Status", "Actions"].map((h) => (
                    <th
                      key={h}
                      className={`px-6 py-4 text-[0.7rem] font-bold uppercase tracking-wider text-[#C4C4D4] ${h === "Actions" ? "text-right" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {announcements.map((ann, idx) => (
                  <motion.tr
                    key={ann.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-white block max-w-[200px] truncate" title={ann.title}>
                        {ann.title}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <p className="text-sm text-[#C4C4D4] max-w-sm truncate" title={ann.content}>
                        {ann.content}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex gap-2 items-center">
                        {ann.is_pinned && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold tracking-wider uppercase border bg-purple-500/10 text-purple-400 border-purple-500/25">
                            PINNED
                          </span>
                        )}
                        {ann.is_published ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold tracking-wider uppercase border bg-emerald-500/10 text-emerald-400 border-emerald-500/25">
                            PUBLISHED
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold tracking-wider uppercase border bg-white/5 text-[#C4C4D4] border-white/10">
                            DRAFT
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleShare(ann.id)}
                          className="p-1.5 text-[#C4C4D4]/70 hover:text-blue-400 transition-colors"
                          title="Share announcement"
                        >
                          <Share2 size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenModal(ann)}
                          disabled={processingIds.has(ann.id)}
                          className="p-1.5 text-[#C4C4D4]/70 hover:text-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit announcement"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(ann.id)}
                          disabled={processingIds.has(ann.id)}
                          className="p-1.5 text-[#C4C4D4]/70 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          title="Delete announcement"
                        >
                          {processingIds.has(ann.id) ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
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

      {/* ══════════════════════════════════════════════════════════════════════
          Create / Edit Modal
      ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 8 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="bg-[#0A0E27] border border-white/10 rounded-2xl w-full max-w-lg relative z-10 shadow-2xl"
            >
              <div className="flex justify-between items-center px-6 py-5 border-b border-white/5">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {editingAnnouncement ? "Edit Announcement" : "Create Announcement"}
                  </h2>
                  <p className="text-xs text-[#C4C4D4]/60 mt-1">
                    {editingAnnouncement ? "Update announcement details below." : "Fill in the details for your new announcement."}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[#C4C4D4]/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
                <div>
                  <label className={labelCls}>Title *</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={inputCls}
                    placeholder="E.g., Tech Fest Registration Open!"
                  />
                </div>

                <div>
                  <label className={labelCls}>Content *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className={`${inputCls} resize-y`}
                    placeholder="Write your announcement here..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center gap-3 bg-white/5 p-4 rounded-lg border border-white/5">
                    <input
                      type="checkbox"
                      id="is_pinned"
                      checked={formData.is_pinned}
                      onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                      className="w-4 h-4 rounded bg-[#111127] border-white/10 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-[#0A0E27]"
                    />
                    <div>
                      <label htmlFor="is_pinned" className="text-sm font-bold text-white cursor-pointer select-none">
                        Pin to top
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-white/5 p-4 rounded-lg border border-white/5">
                    <input
                      type="checkbox"
                      id="is_published"
                      checked={formData.is_published}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      className="w-4 h-4 rounded bg-[#111127] border-white/10 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-[#0A0E27]"
                    />
                    <div>
                      <label htmlFor="is_published" className="text-sm font-bold text-white cursor-pointer select-none">
                        Publish now
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 text-sm font-medium text-[#C4C4D4]/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-indigo-900/30 disabled:opacity-70"
                  >
                    {isSubmitting && <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                    {editingAnnouncement ? "Save Changes" : "Create"}
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
