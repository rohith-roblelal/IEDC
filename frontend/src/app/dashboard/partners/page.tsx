"use client";

import { useEffect, useState } from "react";
import { Handshake, X, Trash2, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useToast } from "@/components/ui/ToastProvider";

export default function PartnersPage() {
  const { toast } = useToast();
  const [partners, setPartners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    image_url: "",
    sort_order: 0,
  });

  const fetchPartners = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/partners");
      if (res.ok) {
        const data = await res.json();
        setPartners(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleOpenModal = (partner: any = null) => {
    if (partner) {
      setEditingPartner(partner);
      setFormData({
        name: partner.name,
        image_url: partner.image_url || "",
        sort_order: partner.sort_order,
      });
    } else {
      setEditingPartner(null);
      setFormData({
        name: "",
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
    const token = localStorage.getItem("access_token");
    
    try {
      const url = editingPartner 
        ? `/api/v1/partners${editingPartner.id}` 
        : "/api/v1/partners";
      
      const payload = {
        ...formData,
        image_url: formData.image_url || null,
      };

      const res = await fetch(url, {
        method: editingPartner ? "PUT" : "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        handleCloseModal();
        fetchPartners();
      } else {
        toast("Failed to save partner", "error");
      }
    } catch (err) {
      console.error(err);
      toast("An error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this partner?")) return;
    
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`/api/v1/partners/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        fetchPartners();
      } else {
        toast("Failed to delete partner", "error");
      }
    } catch (err) {
      console.error(err);
      toast("An error occurred", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Handshake className="text-emerald-400" /> Collaborative Partners
          </h1>
          <p className="text-[#C4C4D4] mt-2">Manage the logos displayed in the collaborative section.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Add Partner
        </button>
      </div>

      <div className="bg-[#111432] rounded-2xl border border-white/10 p-6">
        {isLoading ? (
          <div className="text-center text-[#C4C4D4] py-8">Loading partners...</div>
        ) : partners.length === 0 ? (
          <div className="text-center text-[#C4C4D4] py-8">No partners found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-[#C4C4D4]">
                  <th className="pb-3 font-medium">Logo</th>
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Sort Order</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((partner: any, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={partner.id} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4">
                      {partner.image_url ? (
                        <div className="w-16 h-12 rounded bg-white overflow-hidden flex items-center justify-center p-1">
                          <img src={partner.image_url} alt={partner.name} className="max-w-full max-h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-16 h-12 rounded bg-white flex items-center justify-center p-1 text-black text-xs font-bold text-center leading-tight">
                          {partner.name}
                        </div>
                      )}
                    </td>
                    <td className="py-4 font-medium">{partner.name}</td>
                    <td className="py-4 text-[#C4C4D4]">{partner.sort_order}</td>
                    <td className="py-4">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleOpenModal(partner)}
                          className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-1"
                        >
                          <Edit size={16} /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(partner.id)}
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
                <Handshake className="text-emerald-400" />
                {editingPartner ? "Edit Partner" : "Add Partner"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Name / Label *</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-[#111432] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="E.g., TinkerHub"
                  />
                  <p className="text-xs text-[#C4C4D4] mt-1">This will be used as text if no logo is uploaded.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Sort Order</label>
                  <input 
                    type="number" 
                    value={formData.sort_order}
                    onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
                    className="w-full bg-[#111432] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#C4C4D4] mb-2">Partner Logo (Optional)</label>
                  <ImageUpload 
                    value={formData.image_url} 
                    onChange={url => setFormData({...formData, image_url: url})} 
                    folder="partners"
                  />
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
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
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
