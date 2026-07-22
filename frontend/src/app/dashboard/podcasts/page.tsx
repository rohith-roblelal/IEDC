"use client";

import { useEffect, useState } from "react";
import { Mic, X, Trash2, Edit, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageUpload } from "@/components/ui/ImageUpload";

export default function PodcastsPage() {
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      const res = await fetch("/api/v1/podcasts");
      if (res.ok) {
        const data = await res.json();
        setPodcasts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const handleOpenModal = (podcast: any = null) => {
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
    const token = localStorage.getItem("access_token");
    
    try {
      const url = editingPodcast 
        ? `/api/v1/podcasts${editingPodcast.id}` 
        : "/api/v1/podcasts";
      
      const payload = {
        ...formData,
        video_url: formData.video_url || null,
        image_url: formData.image_url || null,
      };

      const res = await fetch(url, {
        method: editingPodcast ? "PUT" : "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        handleCloseModal();
        fetchPodcasts();
      } else {
        alert("Failed to save podcast");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this podcast?")) return;
    
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`/api/v1/podcasts${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        fetchPodcasts();
      } else {
        alert("Failed to delete podcast");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    }
  };

  const setAsActive = async (id: string, podcast: any) => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`/api/v1/podcasts${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ is_active: true })
      });
      
      if (res.ok) {
        fetchPodcasts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Mic className="text-indigo-400" /> Podcasts
          </h1>
          <p className="text-[#C4C4D4] mt-2">Manage podcasts displayed on the public home page.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Add Podcast
        </button>
      </div>

      <div className="bg-[#111432] rounded-2xl border border-white/10 p-6">
        {isLoading ? (
          <div className="text-center text-[#C4C4D4] py-8">Loading podcasts...</div>
        ) : podcasts.length === 0 ? (
          <div className="text-center text-[#C4C4D4] py-8">No podcasts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-[#C4C4D4]">
                  <th className="pb-3 font-medium">Title</th>
                  <th className="pb-3 font-medium">Date String</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {podcasts.map((pod: any, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={pod.id} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 font-medium">{pod.title}</td>
                    <td className="py-4 text-[#C4C4D4]">{pod.date_str}</td>
                    <td className="py-4">
                      {pod.is_active ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400 font-bold border border-green-500/30 flex items-center gap-1 w-max">
                          <Check size={12} /> Active
                        </span>
                      ) : (
                        <span className="text-[#C4C4D4] text-sm">Inactive</span>
                      )}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center justify-end gap-3">
                        {!pod.is_active && (
                          <button 
                            onClick={() => setAsActive(pod.id, pod)}
                            className="text-green-400 hover:text-green-300 text-sm font-medium mr-2"
                          >
                            Set Active
                          </button>
                        )}
                        <button 
                          onClick={() => handleOpenModal(pod)}
                          className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1"
                        >
                          <Edit size={16} /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(pod.id)}
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1A1D3D] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative my-8"
            >
              <button 
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-[#C4C4D4] hover:text-white"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                <Mic className="text-indigo-400" />
                {editingPodcast ? "Edit Podcast" : "Add Podcast"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Title *</label>
                  <input 
                    required
                    type="text" 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-[#111432] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="E.g., Women in tech"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Description *</label>
                  <input 
                    required
                    type="text" 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-[#111432] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="E.g., Breaking barriers and building future"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Date String *</label>
                  <input 
                    required
                    type="text" 
                    value={formData.date_str}
                    onChange={e => setFormData({...formData, date_str: e.target.value})}
                    className="w-full bg-[#111432] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="E.g., February 29, 2023"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Video / Audio URL</label>
                  <input 
                    type="url" 
                    value={formData.video_url}
                    onChange={e => setFormData({...formData, video_url: e.target.value})}
                    className="w-full bg-[#111432] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="https://youtube.com/..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#C4C4D4] mb-2">Background Image</label>
                  <ImageUpload 
                    value={formData.image_url} 
                    onChange={url => setFormData({...formData, image_url: url})} 
                    folder="podcasts"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="is_active"
                    checked={formData.is_active}
                    onChange={e => setFormData({...formData, is_active: e.target.checked})}
                    className="w-4 h-4 rounded bg-[#111432] border-white/10 text-indigo-500 focus:ring-indigo-500"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-[#C4C4D4]">
                    Set as active podcast on home page
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
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
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
