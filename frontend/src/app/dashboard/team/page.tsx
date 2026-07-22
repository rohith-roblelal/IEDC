"use client";

import { useEffect, useState } from "react";
import { Users, X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageUpload } from "@/components/ui/ImageUpload";

export default function TeamPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    position: "",
    meta: "",
    email: "",
    image_url: "",
    is_lead: false,
    category: "Core Team",
  });

  const fetchTeam = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/team");
      if (res.ok) {
        const data = await res.json();
        setTeam(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const openModal = (member: any = null) => {
    setFormError(null);
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name,
        position: member.position,
        meta: member.meta || "",
        email: member.email || "",
        image_url: member.image_url || "",
        is_lead: member.is_lead,
        category: member.category || "Core Team",
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: "",
        position: "",
        meta: "",
        email: "",
        image_url: "",
        is_lead: false,
        category: "Core Team",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    const token = localStorage.getItem("access_token");
    const method = editingMember ? "PUT" : "POST";
    const url = editingMember 
      ? `/api/v1/team${editingMember.id}` 
      : "/api/v1/team";

    // If email is empty string, send null so Pydantic EmailStr doesn't crash on ""
    const payload = {
      ...formData,
      email: formData.email.trim() === "" ? null : formData.email
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchTeam();
      } else {
        const err = await res.json();
        setFormError(err.detail || "Failed to save member");
      }
    } catch (err) {
      console.error(err);
      setFormError("A network error occurred while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) return;
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`/api/v1/team${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchTeam();
      } else {
        alert("Failed to delete");
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
            <Users className="text-green-400" /> Team Members
          </h1>
          <p className="text-[#C4C4D4] mt-2">Manage Execom and Nodal Officers.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={20} /> Add Member
        </button>
      </div>

      <div className="bg-[#111432] rounded-2xl border border-white/10 p-6">
        {isLoading ? (
          <div className="text-center text-[#C4C4D4] py-8">Loading team members...</div>
        ) : team.length === 0 ? (
          <div className="text-center text-[#C4C4D4] py-8">No team members found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-[#C4C4D4]">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Is Lead</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {team.map((member: any, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={member.id} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 font-medium flex items-center gap-3">
                      {member.image_url ? (
                        <img src={member.image_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs">
                          {member.name.charAt(0)}
                        </div>
                      )}
                      {member.name}
                    </td>
                    <td className="py-4 text-[#C4C4D4]">{member.position}</td>
                    <td className="py-4 text-[#C4C4D4]">{member.category || "Core Team"}</td>
                    <td className="py-4">
                      {member.is_lead ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-orange-500/20 text-orange-400">Yes</span>
                      ) : (
                        <span className="text-[#C4C4D4]">-</span>
                      )}
                    </td>
                    <td className="py-4 flex items-center gap-3">
                      <button onClick={() => openModal(member)} className="text-purple-400 hover:text-purple-300 text-sm font-medium">Edit</button>
                      <button onClick={() => handleDelete(member.id)} className="text-red-400 hover:text-red-300 text-sm font-medium">Delete</button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0A0E27] border border-white/10 rounded-2xl p-6 w-full max-w-lg relative z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{editingMember ? "Edit Member" : "Add Member"}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-[#C4C4D4] hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Profile Image</label>
                  <ImageUpload 
                    value={formData.image_url}
                    onChange={(url) => setFormData({ ...formData, image_url: url })}
                    folder="team"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Name *</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-[#111432] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Role/Position *</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    className="w-full bg-[#111432] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Meta Info (e.g. 4th Year · ECE)</label>
                  <input 
                    type="text" 
                    value={formData.meta}
                    onChange={(e) => setFormData({...formData, meta: e.target.value})}
                    className="w-full bg-[#111432] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-[#111432] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Section / Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-[#111432] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Faculty & Nodal Officers">Faculty & Nodal Officers</option>
                    <option value="Student Leadership">Student Leadership</option>
                    <option value="Core Team">Core Team</option>
                    <option value="Assistant Leads">Assistant Leads</option>
                    <option value="Members">Members</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 py-2">
                  <input 
                    type="checkbox" 
                    id="is_lead"
                    checked={formData.is_lead}
                    onChange={(e) => setFormData({...formData, is_lead: e.target.checked})}
                    className="w-5 h-5 rounded border-white/20 bg-[#111432] text-purple-500 focus:ring-purple-500 focus:ring-offset-[#0A0E27]"
                  />
                  <label htmlFor="is_lead" className="text-sm font-medium text-white">Is Lead (Shows as featured)</label>
                </div>

                {formError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
                    {typeof formError === 'string' ? formError : JSON.stringify(formError)}
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-[#C4C4D4] hover:text-white transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : editingMember ? "Update" : "Create"}
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
