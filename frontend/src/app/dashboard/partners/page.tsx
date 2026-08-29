"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Handshake, X, Trash2, Edit, Plus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import { clientFetch, ApiError } from "@/lib/api/client";

interface Partner {
  id: string;
  name: string;
  description?: string | null;
  website_url?: string | null;
  image_url?: string | null;
  sort_order: number;
}

export default function PartnersPage() {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website_url: "",
    image_url: "",
    sort_order: 0,
  });

  const fetchPartners = async () => {
    setIsLoading(true);
    try {
      const data = await clientFetch(`api/v1/partners?_t=${Date.now()}`);
      setPartners(data.items || (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error(err);
      toast("Failed to fetch partners", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleOpenModal = (partner: Partner | null = null) => {
    if (partner) {
      setEditingPartner(partner);
      setFormData({
        name: partner.name,
        description: partner.description || "",
        website_url: partner.website_url || "",
        image_url: partner.image_url || "",
        sort_order: partner.sort_order,
      });
    } else {
      setEditingPartner(null);
      setFormData({
        name: "",
        description: "",
        website_url: "",
        image_url: "",
        sort_order: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPartner(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingPartner 
        ? `api/v1/partners/${editingPartner.id}` 
        : "api/v1/partners";
      
      const payload = {
        ...formData,
        image_url: formData.image_url || null,
      };

      await clientFetch(url, {
        method: editingPartner ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });
      
      handleCloseModal();
      await fetchPartners();
      toast(editingPartner ? "Partner updated successfully" : "Partner created successfully", "success");
    } catch (err) {
      console.error(err);
      if (err instanceof ApiError) {
        toast(err.message || "Failed to save partner", "error");
      } else {
        toast("An unexpected error occurred", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (processingIds.has(id)) return;
    if (!(await confirm("Are you sure you want to delete this partner?"))) return;

    setProcessingIds(prev => new Set(prev).add(id));
    try {
      await clientFetch(`api/v1/partners/${id}`, {
        method: "DELETE"
      });
      
      await fetchPartners();
      toast("Partner deleted successfully", "success");
    } catch (err) {
      console.error(err);
      if (err instanceof ApiError) {
        toast(err.message || "Failed to delete partner", "error");
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

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      {/* Header section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            Collaborative Partners
          </h1>
          <p className="text-[#C4C4D4] mt-2 text-lg">
            Manage the logos displayed in the collaborative section.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-5 py-2.5 rounded-lg font-bold text-sm transition-colors border border-purple-500/20 shrink-0"
        >
          <Plus size={18} />
          Add Partner
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
        ) : partners.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center px-6">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Handshake className="text-[#C4C4D4]/50" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No partners found</h3>
            <p className="text-[#C4C4D4] mb-6 max-w-md">
              You haven't added any partners yet. Create your first partner to display their logo on the main site.
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors border border-white/5"
            >
              <Plus size={18} />
              Add Partner
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-white/5">
                  {["Logo", "Name", "Sort Order", "Actions"].map((h) => (
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
                {partners.map((partner, idx) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={partner.id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      {partner.image_url ? (
                        <div className="relative w-16 h-12 rounded bg-white overflow-hidden flex items-center justify-center p-1.5 shadow-sm">
                          <Image src={partner.image_url} alt={partner.name} fill sizes="64px" className="object-contain" />
                        </div>
                      ) : (
                        <div className="w-16 h-12 rounded bg-white/10 flex items-center justify-center p-1 text-[#C4C4D4] text-xs font-bold text-center leading-tight shadow-sm border border-white/5">
                          {partner.name.substring(0, 3).toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-white text-base">
                      {partner.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-[#C4C4D4] border border-white/10">
                        {partner.sort_order}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenModal(partner)}
                          disabled={processingIds.has(partner.id)}
                          className="p-2 text-[#C4C4D4] hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Edit ${partner.name}`}
                          title="Edit Partner"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(partner.id)}
                          disabled={processingIds.has(partner.id)}
                          className="p-2 text-[#C4C4D4] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          aria-label={`Delete ${partner.name}`}
                          title="Delete Partner"
                        >
                          {processingIds.has(partner.id) ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
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
                  <Handshake className="text-purple-400" size={20} />
                </div>
                {editingPartner ? "Edit Partner" : "Add Partner"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label htmlFor="partner_name" className="block text-xs font-bold text-[#C4C4D4] mb-1.5 uppercase tracking-wider">
                    Name / Label <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="partner_name"
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#111127] border border-white/5 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-sm"
                    placeholder="E.g., TinkerHub"
                  />
                  <p className="text-[0.65rem] text-[#C4C4D4]/60 mt-1">This will be used as text if no logo is uploaded.</p>
                </div>

                <div>
                  <label htmlFor="partner_desc" className="block text-xs font-bold text-[#C4C4D4] mb-1.5 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    id="partner_desc"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#111127] border border-white/5 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors min-h-[60px] resize-y text-sm"
                    placeholder="Brief description about the partner..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="website_url" className="block text-xs font-bold text-[#C4C4D4] mb-1.5 uppercase tracking-wider">
                      Website URL
                    </label>
                    <input
                      id="website_url"
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                      className="w-full bg-[#111127] border border-white/5 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-sm"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="sort_order" className="block text-xs font-bold text-[#C4C4D4] mb-1.5 uppercase tracking-wider">
                      Sort Order
                    </label>
                    <input
                      id="sort_order"
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                      className="w-full bg-[#111127] border border-white/5 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#C4C4D4] mb-1.5 uppercase tracking-wider">
                    Partner Logo
                  </label>
                  <div className="p-3 bg-[#111127] rounded-lg border border-white/5">
                    <ImageUpload
                      value={formData.image_url}
                      onChange={(url) => setFormData({ ...formData, image_url: url })}
                      folder="partners"
                    />
                  </div>
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
                      editingPartner ? "Save Changes" : "Create Partner"
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
