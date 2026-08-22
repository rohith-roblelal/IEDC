"use client";

import { useEffect, useState } from "react";
import { Plus, X, Pencil, Trash2, Filter, Share2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
const ImageUpload = dynamic(() => import("@/components/ui/ImageUpload").then(mod => mod.ImageUpload), {
  loading: () => <div className="p-4 bg-white/5 animate-pulse rounded-2xl h-32 border border-white/10" />
});
const CustomFormBuilder = dynamic(() => import("@/components/CustomFormBuilder").then(mod => mod.CustomFormBuilder), {
  loading: () => <div className="p-4 bg-white/5 animate-pulse rounded-2xl h-32 border border-white/10" />
});
import { clientFetch, ApiError } from "@/lib/api/client";
import { EventResponse } from "@/lib/api/events";

// ─── Status badge helper ────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  DRAFT:               { bg: "bg-white/5",         text: "text-[#C4C4D4]",  border: "border-white/10"       },
  PUBLISHED:           { bg: "bg-indigo-500/10",   text: "text-indigo-400", border: "border-indigo-500/25"    },
  REGISTRATION_OPEN:   { bg: "bg-emerald-500/10",  text: "text-emerald-400",border: "border-emerald-500/25" },
  REGISTRATION_CLOSED: { bg: "bg-amber-500/10",    text: "text-amber-400",  border: "border-amber-500/25"   },
  COMPLETED:           { bg: "bg-purple-500/10",   text: "text-purple-400", border: "border-purple-500/25"  },
  CANCELLED:           { bg: "bg-red-500/10",      text: "text-red-400",    border: "border-red-500/25"     },
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.DRAFT;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold tracking-wider uppercase border
        ${style.bg} ${style.text} ${style.border}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

// ─── Shared input className ──────────────────────────────────────────────────
const inputCls =
  "w-full bg-[#111127] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#C4C4D4]/40 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors";
const labelCls = "block text-xs font-semibold uppercase tracking-wider text-[#C4C4D4]/70 mb-1.5";

export default function EventsPage() {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventResponse | null>(null);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    banner_url: "",
    status: "DRAFT",
    registration_deadline: "",
    max_participants: "",
    registration_link: "",
    google_form_enabled: false,
    google_form_url: "",
    field_mapping: null as Record<string, string> | null,
    custom_fields: [] as { id: string; label: string; type: any; required: boolean; options?: string[] }[],
  });

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const data = await clientFetch("/api/v1/events");
      setEvents(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openModal = (event: EventResponse | null = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description,
        banner_url: event.banner_url || "",
        status: event.status || "DRAFT",
        registration_deadline: event.registration_deadline
          ? new Date(event.registration_deadline).toISOString().slice(0, 16)
          : "",
        max_participants: event.max_participants ? String(event.max_participants) : "",
        registration_link: event.registration_link || "",
        google_form_enabled: event.google_form_enabled || false,
        google_form_url: event.google_form_url || "",
        field_mapping: event.field_mapping || null,
        custom_fields: event.custom_fields || [],
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: "", description: "", banner_url: "", status: "DRAFT", registration_deadline: "", max_participants: "", registration_link: "", google_form_enabled: false, google_form_url: "", field_mapping: null, custom_fields: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    const payload = {
      ...formData,
      max_participants: formData.max_participants ? parseInt(formData.max_participants as string) : null,
      is_published: formData.status !== "DRAFT",
      registration_deadline: formData.registration_deadline
        ? new Date(formData.registration_deadline).toISOString()
        : null,
    };
    try {
      if (editingEvent) {
        await clientFetch(`/api/v1/events/${editingEvent.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await clientFetch("/api/v1/events", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setIsModalOpen(false);
      await fetchEvents();
      showToast("Event saved successfully!", "success");
    } catch (err) {
      if (err instanceof ApiError) showToast("Failed to save: " + err.message, "error");
      else showToast("Error saving event", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConnectGoogleForm = async () => {
    if (!formData.google_form_url || !editingEvent || isSubmitting)
      return showToast("Please save the event first before connecting a Google Form.", "error");
    
    setIsSubmitting(true);
    try {
      await clientFetch(`/api/v1/events/${editingEvent.id}/google-form/connect`, {
        method: "POST", body: JSON.stringify({ url: formData.google_form_url }),
      });
      await fetchEvents();
      
      // Need to update local form data so the UI shows it connected immediately in the modal
      // We refetch above to ensure authoritative state, but the modal is still open
      // The ideal approach is to close modal or update local state from fetched authoritative data.
      // We will just update the form data here for simplicity since the modal is open.
      setFormData(prev => ({ ...prev, google_form_enabled: true }));
      showToast("Google Form connected successfully!", "success");
    } catch (err) {
      if (err instanceof ApiError) showToast(err.message || "Failed to connect Google Form", "error");
      else showToast("Network error connecting Google Form", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!eventToDelete || isDeleting) return;
    
    setIsDeleting(true);
    try {
      await clientFetch(`/api/v1/events/${eventToDelete}`, { method: "DELETE" });
      await fetchEvents();
      showToast("Event deleted", "success");
    } catch (err) {
      if (err instanceof ApiError) showToast("Failed to delete: " + err.message, "error");
      else showToast("Network error", "error");
    } finally {
      setIsDeleting(false);
      setEventToDelete(null);
    }
  };

  const handleShare = (eventId: string) => {
    const url = `${window.location.origin}/events/${eventId}`;
    const fallback = (text: string) => {
      const ta = document.createElement("textarea");
      ta.value = text;
      Object.assign(ta.style, { top: "0", left: "0", position: "fixed" });
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      try { document.execCommand("copy") ? showToast("Link copied!", "success") : showToast("Failed to copy", "error"); }
      catch { showToast("Failed to copy", "error"); }
      document.body.removeChild(ta);
    };
    if (navigator.clipboard && window.isSecureContext)
      navigator.clipboard.writeText(url).then(() => showToast("Link copied!", "success")).catch(() => fallback(url));
    else fallback(url);
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Events Management</h1>
          <p className="text-sm text-[#C4C4D4] mt-1.5 font-medium">Manage and organize all upcoming and past events.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-[#E9D5FF] hover:bg-[#D8B4FE] text-[#581C87] text-sm font-bold px-5 py-2.5 rounded-lg transition-colors shadow-lg"
        >
          <Plus size={16} strokeWidth={3} />
          Add Event
        </button>
      </div>

      {/* ── Events table card ── */}
      <div className="bg-[#111127] rounded-xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">All Events</h2>
          <button className="p-2 bg-white/5 rounded-lg text-[#C4C4D4] hover:text-white transition-colors">
            <Filter size={16} />
          </button>
        </div>

        {/* Table states */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-[#C4C4D4]/50 text-sm font-medium">
            No events found. Create one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  {["Title", "Status", "Date", "Participants", "Actions"].map((h) => (
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
                {events.map((event, idx) => {
                  const regs = event.registrations_count || 0;
                  const max = event.max_participants || 1; // avoid division by zero
                  const isUnlimited = !event.max_participants;
                  const percentage = isUnlimited ? 100 : Math.min(100, Math.round((regs / max) * 100));
                  
                  return (
                    <motion.tr
                      key={event.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-5">
                        <span className="text-sm font-bold text-white">{event.title}</span>
                      </td>

                      <td className="px-6 py-5">
                        <StatusBadge status={event.status} />
                      </td>

                      <td className="px-6 py-5 text-sm font-medium text-[#C4C4D4]">
                        {new Date(event.created_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden flex-shrink-0">
                            <div
                              className={`h-full rounded-full ${
                                percentage >= 100 && !isUnlimited ? "bg-emerald-400" : percentage > 75 ? "bg-amber-400" : "bg-indigo-400"
                              }`}
                              style={{ width: isUnlimited && regs === 0 ? "0%" : isUnlimited ? "100%" : `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-[#C4C4D4]">
                            {regs}/{isUnlimited ? "∞" : max}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleShare(event.id)}
                            className="p-1.5 text-[#C4C4D4]/70 hover:text-blue-400 transition-colors"
                            title="Share event"
                          >
                            <Share2 size={16} />
                          </button>
                          <button
                            onClick={() => openModal(event)}
                            className="p-1.5 text-[#C4C4D4]/70 hover:text-indigo-400 transition-colors"
                            title="Edit event"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setEventToDelete(event.id)}
                            className="p-1.5 text-[#C4C4D4]/70 hover:text-red-400 transition-colors"
                            title="Delete event"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
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
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 8 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="bg-[#0A0E27] border border-white/10 rounded-2xl w-full max-w-2xl relative z-10 max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar"
            >
              <div className="flex justify-between items-center px-6 py-5 border-b border-white/5 sticky top-0 bg-[#0A0E27] z-20">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {editingEvent ? "Edit Event" : "Create Event"}
                  </h2>
                  <p className="text-xs text-[#C4C4D4]/60 mt-1">
                    {editingEvent ? "Update event details below." : "Fill in the details for your new event."}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[#C4C4D4]/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
                <div>
                  <label className={labelCls}>Event Poster / Banner</label>
                  <ImageUpload
                    value={formData.banner_url}
                    onChange={(url) => setFormData({ ...formData, banner_url: url })}
                    folder="events"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className={labelCls}>Event Title *</label>
                    <input required type="text" value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={inputCls} />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelCls}>Registration / Google Form Link</label>
                    <input type="url" placeholder="https://forms.gle/…" value={formData.registration_link}
                      onChange={(e) => setFormData({ ...formData, registration_link: e.target.value })} className={inputCls} />
                  </div>

                  <div className="md:col-span-2 rounded-xl border border-indigo-500/30 bg-[#111127] p-5">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Native Google Forms Integration</h3>
                        <p className="text-xs text-[#C4C4D4]/60 mt-1 leading-relaxed">
                          Connect a Google Form so students register on this site while responses sync directly to your Google Sheet.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <input type="url" placeholder="Paste Google Form link here…" value={formData.google_form_url}
                        onChange={(e) => setFormData({ ...formData, google_form_url: e.target.value })}
                        className={`${inputCls} focus:ring-indigo-500 focus:border-indigo-500`} />
                      <button type="button" onClick={handleConnectGoogleForm} disabled={isSubmitting}
                        className="shrink-0 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50">
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Connect Form"}
                      </button>
                    </div>

                    <AnimatePresence>
                      {formData.google_form_enabled && formData.field_mapping && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="mt-4 bg-emerald-500/10 border border-emerald-500/25 p-4 rounded-xl">
                          <p className="text-sm font-bold text-emerald-400 mb-2">✓ Connected Successfully</p>
                          <p className="text-xs text-[#C4C4D4]/60 mb-4">
                            Map each field to its Google Form entry ID below. Enter IDs in the format <code className="text-emerald-400/80">entry.12345678</code>.
                          </p>
                          <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {["name", "email", "phone", "gender", "year", "department", "has_laptop", "is_iedc_member", ...(formData.custom_fields || []).map((f) => f.id)].map((fieldKey) => {
                              const label = ["name", "email", "phone", "gender", "year", "department", "has_laptop", "is_iedc_member"].includes(fieldKey) ? fieldKey.replace(/_/g, " ").toUpperCase() : formData.custom_fields?.find((f) => f.id === fieldKey)?.label || fieldKey;
                              return (
                                <div key={fieldKey} className="flex items-center gap-4">
                                  <span className="w-1/3 text-xs font-semibold text-[#C4C4D4] truncate">{label}</span>
                                  <input type="text" placeholder="entry.xxxxx" value={formData.field_mapping?.[fieldKey] || ""}
                                    onChange={(e) => setFormData({ ...formData, field_mapping: { ...formData.field_mapping, [fieldKey]: e.target.value } })}
                                    className="flex-1 bg-[#0A0E27] border border-emerald-500/30 rounded-md px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none" />
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="md:col-span-2 rounded-xl border border-white/5 bg-[#111127] p-5">
                    <h3 className="text-sm font-bold text-white mb-1">Custom Registration Fields</h3>
                    <p className="text-xs text-[#C4C4D4]/60 mb-5 leading-relaxed">
                      Design the registration form shown to students. Standard fields are included automatically.
                    </p>
                    <CustomFormBuilder fields={formData.custom_fields} onChange={(fields) => setFormData({ ...formData, custom_fields: fields })} />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelCls}>Description *</label>
                    <textarea required rows={4} value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={`${inputCls} resize-y`} />
                  </div>

                  <div>
                    <label className={labelCls}>Status</label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputCls}>
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="REGISTRATION_OPEN">Registration Open</option>
                      <option value="REGISTRATION_CLOSED">Registration Closed</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>Max Participants</label>
                    <input type="number" min="1" placeholder="Leave empty for unlimited" value={formData.max_participants}
                      onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })} className={inputCls} />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelCls}>Registration Deadline</label>
                    <input type="datetime-local" value={formData.registration_deadline}
                      onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })} className={inputCls} />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                  <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}
                    className="px-5 py-2.5 text-sm font-medium text-[#C4C4D4]/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting}
                    className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-indigo-900/30 disabled:opacity-50 flex items-center justify-center min-w-[120px]">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingEvent ? "Update Event" : "Create Event"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════════
          Delete Confirmation Modal
      ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {eventToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEventToDelete(null)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="bg-[#0A0E27] border border-white/10 rounded-2xl p-6 w-full max-w-sm relative z-10 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
                <Trash2 size={20} className="text-red-400" />
              </div>
              <h2 className="text-lg font-bold text-white text-center mb-2">Delete Event?</h2>
              <p className="text-sm text-[#C4C4D4]/70 text-center leading-relaxed">
                This will permanently remove the event and all its registration data. This cannot be undone.
              </p>

              <div className="flex gap-3 mt-7">
                <button onClick={() => setEventToDelete(null)} disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-sm text-white font-semibold rounded-lg transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button type="button" onClick={confirmDelete} disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-sm text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center">
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════════
          Toast Notification
      ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 340, damping: 26 }}
            className={`fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl border shadow-2xl text-sm font-bold ${
              toast.type === "success" ? "bg-[#111127] border-emerald-500/30 text-emerald-400" :
              toast.type === "error" ? "bg-[#111127] border-red-500/30 text-red-400" : "bg-[#111127] border-blue-500/30 text-blue-400"
            }`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
              toast.type === "success" ? "bg-emerald-500/20" : toast.type === "error" ? "bg-red-500/20" : "bg-blue-500/20"
            }`}>
              {toast.type === "success" && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
              {toast.type === "error" && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>}
              {toast.type === "info" && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01"/></svg>}
            </span>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}