"use client";

import { useEffect, useState } from "react";
import { Rocket, X, Trash2, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useToast } from "@/components/ui/ToastProvider";

export default function StartupsPage() {
  const { toast } = useToast();
  const [startups, setStartups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingStartup, setEditingStartup] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    founder: "",
    website: "",
    logo_url: "",
    industry: "",
    status: "ACTIVE",
  });

  const fetchStartups = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/startups");
      if (res.ok) {
        const data = await res.json();
        setStartups(data.items || (Array.isArray(data) ? data : []));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStartups();
  }, []);

  const handleOpenModal = (startup: any = null) => {
    if (startup) {
      setEditingStartup(startup);
      setFormData({
        name: startup.name,
        description: startup.description || "",
        founder: startup.founder || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        website: startup.website || "",
        logo_url: startup.logo_url || "",
        industry: startup.industry || "",
        status: startup.status || "ACTIVE",
      });
    } else {
      setEditingStartup(null);
      setFormData({
        name: "",
        description: "",
        founder: "",
        website: "",
        logo_url: "",
        industry: "",
        status: "ACTIVE",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStartup(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (url: string) => {
    setFormData({ ...formData, logo_url: url });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      const url = editingStartup ? `/api/v1/startups/${editingStartup.id}` : "/api/v1/startups";
      const method = editingStartup ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchStartups();
        handleCloseModal();
      } else {
        console.error("Failed to save startup");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this startup?")) return;
    
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`/api/v1/startups/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setStartups(startups.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Startups</h1>
          <p className="text-gray-400">Manage incubated and alumni startups.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Rocket className="mr-2" size={20} />
          Add Startup
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {startups.map((startup) => (
            <motion.div
              key={startup.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  {startup.logo_url ? (
                    <img src={startup.logo_url} alt={startup.name} className="w-12 h-12 rounded-lg object-cover bg-white" />
                  ) : (
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400">
                      <Rocket size={24} />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white">{startup.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                      {startup.status}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleOpenModal(startup)}
                    className="p-1.5 bg-white/5 hover:bg-white/10 rounded text-blue-400 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(startup.id)}
                    className="p-1.5 bg-white/5 hover:bg-red-500/20 rounded text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-grow">
                {startup.description}
              </p>
              <div className="text-xs text-gray-500 mt-auto pt-2 border-t border-white/10">
                {startup.founder && <div className="mb-1"><span className="text-gray-400">Founder:</span> {startup.founder}</div>}
                {startup.industry && <div><span className="text-gray-400">Industry:</span> {startup.industry}</div>}
              </div>
            </motion.div>
          ))}
          {startups.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400 bg-white/5 rounded-xl border border-white/10">
              No startups found. Add one to get started!
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0f1225] border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl"
            >
              <div className="sticky top-0 bg-[#0f1225] p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">
                  {editingStartup ? "Edit Startup" : "Add Startup"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Startup Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    placeholder="e.g. SpaceX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    placeholder="Short description of the startup"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Founder Name
                    </label>
                    <input
                      type="text"
                      name="founder"
                      value={formData.founder}
                      onChange={handleChange}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                      placeholder="e.g. Elon Musk"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Industry
                    </label>
                    <input
                      type="text"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                      placeholder="e.g. Aerospace"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Website URL
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="ALUMNI">ALUMNI</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Startup Logo
                  </label>
                  <ImageUpload
                    value={formData.logo_url}
                    onChange={handleImageChange}
                    folder="startups"
                  />
                  {formData.logo_url && (
                    <div className="mt-4 p-2 bg-black/30 rounded-lg inline-block border border-white/10">
                      <img src={formData.logo_url} alt="Preview" className="h-24 object-contain" />
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Startup'
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
