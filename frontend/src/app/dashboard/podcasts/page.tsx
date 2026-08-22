"use client";

import { useEffect, useState } from "react";
import { Mic, X, Trash2, Edit, Check, Plus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import { clientFetch, ApiError } from "@/lib/api/client";

interface Podcast {
  id: string;
  title: string;
  description: string;
  date_str: string;
  video_url?: string | null;
  image_url?: string | null;
  is_active: boolean;
}

export default function PodcastsPage() {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState<Podcast | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date_str: "",
    video_url: "",
    image_url: "",
    is_active: false,
  });

  const fetchPodcasts = async () => {
    setIsLoading(true);
    try {
      const data = await clientFetch("/api/v1/podcasts");
      setPodcasts(data.items || (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const handleOpenModal = (podcast: Podcast | null = null) => {
    if (podcast) {
      setEditingPodcast(podcast);
      setFormData({
        title: podcast.title,
        description: podcast.description,
        date_str: podcast.date_str,
        video_url: podcast.video_url || "",
        image_url: podcast.image_url || "",
        is_active: podcast.is_active,
      });
    } else {
      setEditingPodcast(null);
      setFormData({
        title: "",
        description: "",
        date_str: "",
        video_url: "",
        image_url: "",
        is_active: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPodcast(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingPodcast 
        ? `/api/v1/podcasts/${editingPodcast.id}` 
        : "/api/v1/podcasts";
      
      const payload = {
        ...formData,
        video_url: formData.video_url || null,
        image_url: formData.image_url || null,
      };

      await clientFetch(url, {
        method: editingPodcast ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });
      
      handleCloseModal();
      await fetchPodcasts();
    } catch (err) {
      console.error(err);
      if (err instanceof ApiError) {
        toast(err.message || "Failed to save podcast", "error");
      } else {
        toast("An error occurred", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (processingIds.has(id)) return;
    if (!(await confirm("Are you sure you want to delete this podcast?"))) return;
    setProcessingIds(prev => new Set(prev).add(id));
    try {
      await clientFetch(`/api/v1/podcasts/${id}`, {
        method: "DELETE",
      });
      
      await fetchPodcasts();
    } catch (err) {
      console.error(err);
      if (err instanceof ApiError) {
        toast(err.message || "Failed to delete podcast", "error");
      } else {
        toast("An error occurred", "error");
      }
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const setAsActive = async (id: string, podcast: Podcast) => {
    if (processingIds.has(id)) return;
    setProcessingIds(prev => new Set(prev).add(id));
    try {
      await clientFetch(`/api/v1/podcasts/${id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: true })
      });
      
      await fetchPodcasts();
    } catch (err) {
      console.error(err);
      if (err instanceof ApiError) {
        toast(err.message || "Failed to set as active", "error");
      }
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      {/* Header section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            Podcasts
          </h1>
          <p className="text-[#C4C4D4] mt-2 text-lg">
            Manage podcasts displayed on the public home page.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-5 py-2.5 rounded-lg font-bold text-sm transition-colors border border-purple-500/20 shrink-0"
        >
          <Plus size={18} />
          Add Podcast
        </button>
      </header>

      {/* Main Content Area */}
      <div className="bg-[#111127] rounded-xl border border-white/5 shadow-2xl overflow-hidden relative min-h-[400px]">
        {isLoading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-white/5 rounded-lg w-full mb-8" />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-white/5 rounded-lg w-full" />
              ))}
            </div>
          </div>
        ) : podcasts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center px-6">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Mic className="text-[#C4C4D4]/50" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No podcasts found</h3>
            <p className="text-[#C4C4D4] mb-6 max-w-md">
              You haven't added any podcasts yet. Create your first podcast to display it on the main site.
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors border border-white/5"
            >
              <Plus size={18} />
              Add Podcast
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-white/5">
                  {["Title", "Date String", "Status", "Actions"].map((h) => (
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
                {podcasts.map((pod, idx) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={pod.id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4 font-bold text-white text-base">
                      {pod.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-[#C4C4D4] border border-white/10">
                        {pod.date_str}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {pod.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold tracking-wider uppercase border bg-emerald-500/10 text-emerald-400 border-emerald-500/25 gap-1">
                          <Check size={12} strokeWidth={3} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold tracking-wider uppercase border bg-slate-500/10 text-slate-400 border-slate-500/25">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        {!pod.is_active && (
                          <button
                            onClick={() => setAsActive(pod.id, pod)}
                            disabled={processingIds.has(pod.id)}
                            className="mr-2 px-3 py-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors border border-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
                          >
                            {processingIds.has(pod.id) ? <Loader2 size={14} className="animate-spin" /> : "Set Active"}
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenModal(pod)}
                          disabled={processingIds.has(pod.id)}
                          className="p-2 text-[#C4C4D4] hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Edit ${pod.title}`}
                          title="Edit Podcast"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(pod.id)}
                          disabled={processingIds.has(pod.id)}
                          className="p-2 text-[#C4C4D4] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          aria-label={`Delete ${pod.title}`}
                          title="Delete Podcast"
                        >
                          {processingIds.has(pod.id) ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
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
          <div className="fixed inset-0 bg-[#0A0E27]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0A0E27] border border-white/10 rounded-2xl p-5 md:p-6 w-full max-w-lg shadow-2xl relative my-4 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={handleCloseModal}
                className="absolute top-6 right-6 p-2 text-[#C4C4D4] hover:text-white hover:bg-white/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-3">
                <div className="p-1.5 bg-purple-500/10 rounded-lg">
                  <Mic className="text-purple-400" size={20} />
                </div>
                {editingPodcast ? "Edit Podcast" : "Add Podcast"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="podcast_title" className="block text-xs font-bold text-[#C4C4D4] mb-1.5 uppercase tracking-wider">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="podcast_title"
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#111127] border border-white/5 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-sm"
                    placeholder="E.g., Women in tech"
                  />
                </div>

                <div>
                  <label htmlFor="podcast_desc" className="block text-xs font-bold text-[#C4C4D4] mb-1.5 uppercase tracking-wider">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="podcast_desc"
                    required
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#111127] border border-white/5 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-sm"
                    placeholder="E.g., Breaking barriers and building future"
                  />
                </div>

                <div>
                  <label htmlFor="podcast_date" className="block text-xs font-bold text-[#C4C4D4] mb-1.5 uppercase tracking-wider">
                    Date String <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="podcast_date"
                    required
                    type="text"
                    value={formData.date_str}
                    onChange={(e) => setFormData({ ...formData, date_str: e.target.value })}
                    className="w-full bg-[#111127] border border-white/5 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-sm"
                    placeholder="E.g., February 29, 2023"
                  />
                </div>

                <div>
                  <label htmlFor="podcast_url" className="block text-xs font-bold text-[#C4C4D4] mb-1.5 uppercase tracking-wider">
                    Video / Audio URL
                  </label>
                  <input
                    id="podcast_url"
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    className="w-full bg-[#111127] border border-white/5 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-sm"
                    placeholder="https://youtube.com/..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#C4C4D4] mb-1.5 uppercase tracking-wider">
                    Background Image
                  </label>
                  <div className="p-3 bg-[#111127] rounded-lg border border-white/5">
                    <ImageUpload
                      value={formData.image_url}
                      onChange={(url) => setFormData({ ...formData, image_url: url })}
                      folder="podcasts"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded bg-[#111127] border-white/10 text-purple-500 focus:ring-purple-500 focus:ring-offset-[#0A0E27]"
                  />
                  <label htmlFor="is_active" className="text-sm font-bold text-[#C4C4D4] cursor-pointer hover:text-white transition-colors">
                    Set as active podcast on home page
                  </label>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg font-bold transition-colors disabled:opacity-70 flex justify-center items-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#0A0E27] text-sm"
                  >
                    {isSubmitting ? (
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      editingPodcast ? "Save Changes" : "Create Podcast"
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
