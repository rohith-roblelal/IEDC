"use client";

import { useEffect, useState } from "react";
import { Users, X, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import { clientFetch, ApiError } from "@/lib/api/client";

interface TeamMember {
  id: string;
  name: string;
  role_title: string;
  category: string;
  department?: string | null;
  year?: string | null;
  linkedin_url?: string | null;
  instagram_url?: string | null;
  email?: string | null;
  photo_url?: string | null;
  display_order: number;
  is_published: boolean;
}

export default function TeamPage() {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({
    name: "",
    role_title: "",
    category: "Core Team (Execom)",
    department: "",
    year: "",
    linkedin_url: "",
    instagram_url: "",
    email: "",
    photo_url: "",
    display_order: 0,
    is_published: true,
  });

  const fetchTeam = async () => {
    setIsLoading(true);
    try {
      const data = await clientFetch(`/api/v1/team?_t=${Date.now()}`);
      setTeam(data.items || (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const openModal = (member: TeamMember | null = null) => {
    setFormError(null);
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name,
        role_title: member.role_title,
        category: member.category,
        department: member.department || "",
        year: member.year || "",
        linkedin_url: member.linkedin_url || "",
        instagram_url: member.instagram_url || "",
        email: member.email || "",
        photo_url: member.photo_url || "",
        display_order: member.display_order || 0,
        is_published: member.is_published ?? true,
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: "",
        role_title: "",
        category: "Core Team (Execom)",
        department: "",
        year: "",
        linkedin_url: "",
        instagram_url: "",
        email: "",
        photo_url: "",
        display_order: 0,
        is_published: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    const method = editingMember ? "PUT" : "POST";
    const url = editingMember 
      ? `/api/v1/team/${editingMember.id}` 
      : "/api/v1/team";

    const payload = {
      ...formData,
      email: formData.email.trim() === "" ? null : formData.email,
      linkedin_url: formData.linkedin_url.trim() === "" ? null : formData.linkedin_url,
      instagram_url: formData.instagram_url.trim() === "" ? null : formData.instagram_url,
      department: formData.department.trim() === "" ? null : formData.department,
      year: formData.year.trim() === "" ? null : formData.year,
      photo_url: formData.photo_url.trim() === "" ? null : formData.photo_url,
    };

    try {
      await clientFetch(url, {
        method,
        body: JSON.stringify(payload)
      });
      setIsModalOpen(false);
      fetchTeam();
    } catch (err) {
      console.error(err);
      if (err instanceof ApiError) {
        setFormError(err.message || "Failed to save member");
      } else {
        setFormError("A network error occurred while saving.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (processingIds.has(id)) return;
    if (!(await confirm("Are you sure you want to delete this team member?"))) return;
    setProcessingIds(prev => new Set(prev).add(id));
    try {
      await clientFetch(`/api/v1/team/${id}`, {
        method: "DELETE",
      });
      await fetchTeam();
      toast("Team member deleted", "success");
    } catch (err) {
      console.error(err);
      if (err instanceof ApiError) {
        toast(err.message || "Failed to delete", "error");
      } else {
        toast("Unexpected error occurred.", "error");
      }
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleUrlBlur = (field: 'linkedin_url' | 'instagram_url') => {
    let val = formData[field].trim();
    if (val && !/^https?:\/\//i.test(val)) {
      val = 'https://' + val;
      setFormData(prev => ({ ...prev, [field]: val }));
    }
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      {/* Header section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            Team
          </h1>
          <p className="text-[#C4C4D4] mt-2 text-lg">
            Manage Execom and Nodal Officers.
          </p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-5 py-2.5 rounded-lg font-bold text-sm transition-colors border border-purple-500/20 shrink-0"
        >
          <Plus size={18} /> Add Member
        </button>
      </header>

      {/* Main Content Area */}
      <div className="bg-[#111127] rounded-2xl border border-white/5 shadow-2xl">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : team.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-6">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Users className="text-[#C4C4D4]/50" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No team members found</h3>
            <p className="text-[#C4C4D4] max-w-md">Get started by adding your first team member.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#0A0E27]/50">
                  <th className="py-4 px-6 font-semibold text-[#C4C4D4] text-sm uppercase tracking-wider">Order</th>
                  <th className="py-4 px-6 font-semibold text-[#C4C4D4] text-sm uppercase tracking-wider">Name</th>
                  <th className="py-4 px-6 font-semibold text-[#C4C4D4] text-sm uppercase tracking-wider">Role</th>
                  <th className="py-4 px-6 font-semibold text-[#C4C4D4] text-sm uppercase tracking-wider">Category</th>
                  <th className="py-4 px-6 font-semibold text-[#C4C4D4] text-sm uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 font-semibold text-[#C4C4D4] text-sm uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {team.map((member, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={member.id} 
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="py-4 px-6 text-[#C4C4D4] font-medium">{member.display_order}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        {member.photo_url ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0 bg-[#0A0E27]">
                            <img src={member.photo_url} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold shrink-0">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-bold text-white whitespace-nowrap">{member.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-[#C4C4D4] whitespace-nowrap">{member.role_title}</td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs font-bold rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {member.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {member.is_published ? (
                        <span className="px-3 py-1 text-xs font-bold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Published
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-bold rounded-md bg-slate-500/10 text-slate-400 border border-slate-500/20">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openModal(member)} 
                          disabled={processingIds.has(member.id)}
                          className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Edit member"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(member.id)} 
                          disabled={processingIds.has(member.id)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          aria-label="Delete member"
                        >
                          {processingIds.has(member.id) ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
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

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8 bg-[#0A0E27]/80 backdrop-blur-sm overflow-y-auto custom-scrollbar">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0A0E27] border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-2xl relative shadow-2xl my-auto md:my-8"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="p-1.5 bg-purple-500/10 rounded-lg">
                    {editingMember ? <Pencil className="text-purple-400" size={24} /> : <Users className="text-purple-400" size={24} />}
                  </div>
                  {editingMember ? "Edit Member" : "Add Member"}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-2 text-[#C4C4D4] hover:text-white hover:bg-white/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[#C4C4D4] mb-2 uppercase tracking-wider">Profile Image</label>
                  <ImageUpload 
                    value={formData.photo_url}
                    onChange={(url) => setFormData({ ...formData, photo_url: url })}
                    folder="team"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[#C4C4D4] mb-2 uppercase tracking-wider">Name *</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-[#111127] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-sm"
                      placeholder="e.g. Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#C4C4D4] mb-2 uppercase tracking-wider">Role/Position *</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.role_title}
                      onChange={(e) => setFormData({...formData, role_title: e.target.value})}
                      className="w-full bg-[#111127] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-sm"
                      placeholder="e.g. CEO, Developer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[#C4C4D4] mb-2 uppercase tracking-wider">Category *</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-[#111127] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-sm appearance-none"
                    >
                      <option value="Nodal Officer">Nodal Officer</option>
                      <option value="Assistant Nodal Officer">Assistant Nodal Officer</option>
                      <option value="Student Leadership">Student Leadership</option>
                      <option value="Core Team (Execom)">Core Team (Execom)</option>
                      <option value="Assistant Leads">Assistant Leads</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#C4C4D4] mb-2 uppercase tracking-wider">Display Order</label>
                    <input 
                      type="number" 
                      value={formData.display_order}
                      onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                      className="w-full bg-[#111127] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[#C4C4D4] mb-2 uppercase tracking-wider">Department</label>
                    <input 
                      type="text" 
                      placeholder="e.g. CSE"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="w-full bg-[#111127] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#C4C4D4] mb-2 uppercase tracking-wider">Year / Semester</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 4th Year"
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: e.target.value})}
                      className="w-full bg-[#111127] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[#C4C4D4] mb-2 uppercase tracking-wider">Email</label>
                    <input 
                      type="email" 
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-[#111127] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#C4C4D4] mb-2 uppercase tracking-wider">LinkedIn URL</label>
                    <input 
                      type="text" 
                      placeholder="https://linkedin.com/in/..."
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                      onBlur={() => handleUrlBlur('linkedin_url')}
                      className="w-full bg-[#111127] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[#C4C4D4] mb-2 uppercase tracking-wider">Instagram URL</label>
                    <input 
                      type="text" 
                      placeholder="https://instagram.com/..."
                      value={formData.instagram_url}
                      onChange={(e) => setFormData({...formData, instagram_url: e.target.value})}
                      onBlur={() => handleUrlBlur('instagram_url')}
                      className="w-full bg-[#111127] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 py-4 bg-white/[0.02] border border-white/5 rounded-xl px-4">
                  <input 
                    type="checkbox" 
                    id="is_published"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                    className="w-5 h-5 rounded border-white/20 bg-[#111127] accent-purple-500 focus:ring-purple-500 focus:ring-offset-[#0A0E27]"
                  />
                  <div className="flex flex-col">
                    <label htmlFor="is_published" className="text-sm font-bold text-white cursor-pointer">Publish Profile</label>
                    <span className="text-xs text-[#C4C4D4]">Make this profile visible on the public team page</span>
                  </div>
                </div>

                {formError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-medium">
                    {typeof formError === 'string' ? formError : JSON.stringify(formError)}
                  </div>
                )}

                <div className="pt-6 flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50 flex justify-center items-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#0A0E27] text-sm"
                  >
                    {isSubmitting ? (
                      <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      editingMember ? "Update Member" : "Add Member"
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
