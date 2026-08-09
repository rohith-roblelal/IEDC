"use client";

import { useEffect, useState } from "react";
import { Calendar, Plus, X, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { CustomFormBuilder } from "@/components/CustomFormBuilder";
import { clientFetch, ApiError } from "@/lib/api/client";
import { getStatusDisplay } from "@/lib/event-utils";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

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
    field_mapping: null as any,
    custom_fields: [] as any[],
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetchEvents();
  }, []);

  const openModal = (event: any = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description,
        banner_url: event.banner_url || "",
        status: event.status || "DRAFT",
        registration_deadline: event.registration_deadline ? new Date(event.registration_deadline).toISOString().slice(0, 16) : "",
        max_participants: event.max_participants || "",
        registration_link: event.registration_link || "",
        google_form_enabled: event.google_form_enabled || false,
        google_form_url: event.google_form_url || "",
        field_mapping: event.field_mapping || null,
        custom_fields: event.custom_fields || [],
      });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setEditingEvent(null);
      setFormData({
        title: "",
        description: "",
        banner_url: "",
        status: "DRAFT",
        registration_deadline: "",
        max_participants: "",
        registration_link: "",
        google_form_enabled: false,
        google_form_url: "",
        field_mapping: null,
        custom_fields: [],
      });
    }
    setIsModalOpen(true);
  };
 // eslint-disable-next-line @typescript-eslint/no-explicit-any

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
const method = editingEvent ? "PUT" : "POST";
    const url = editingEvent 
      ? `/api/v1/events/${editingEvent.id}` 
      : "/api/v1/events";

    const payload = {
      ...formData,
      is_published: formData.status !== "DRAFT",
      max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
      registration_deadline: formData.registration_deadline ? new Date(formData.registration_deadline).toISOString() : null,
    };

    try {
      await clientFetch(url, {
        method,
        body: JSON.stringify(payload)
      });
      setIsModalOpen(false);
      fetchEvents();
      showToast("Event saved successfully!", "success");
    } catch (err) {
      console.error(err);
      if (err instanceof ApiError) {
        showToast("Failed to save: " + err.message, "error");
      } else {
        showToast("Error saving event", "error");
      }
    }
  };

  const handleConnectGoogleForm = async () => {
    if (!formData.google_form_url || !editingEvent) return showToast("Please save the event first before connecting a Google Form.", "error");
    try {
      const data = await clientFetch(`/api/v1/events/${editingEvent.id}/google-form/connect`, {
        method: "POST",
        body: JSON.stringify({ url: formData.google_form_url })
      });
      setFormData({ ...formData, google_form_enabled: true, field_mapping: data.data.mapping });
      showToast("Google Form connected successfully!", "success");
      fetchEvents(); // Refresh in background
    } catch (err) {
      if (err instanceof ApiError) {
        showToast(err.message || "Failed to connect Google Form", "error");
      } else {
        showToast("Network error connecting Google Form", "error");
      }
    }
  };

  const handleDelete = (id: string) => {
    setEventToDelete(id);
  };

  const confirmDelete = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!eventToDelete) return;
    try {
      console.log("Deleting event:", eventToDelete);
      await clientFetch(`/api/v1/events/${eventToDelete}`, {
        method: "DELETE",
      });
      fetchEvents();
      showToast("Event deleted", "success");
    } catch (err) {
      console.error(err);
      if (err instanceof ApiError) {
        showToast("Failed to delete: " + err.message, "error");
      } else {
        showToast("Network error", "error");
      }
    } finally {
      setEventToDelete(null);
    }
  };

  const handleShare = (eventId: string) => {
    // Generate the public event link
    const url = `${window.location.origin}/events/${eventId}`; 
    
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
          showToast("Public event link copied to clipboard!", "success");
        } else {
          showToast("Failed to copy link", "error");
        }
      } catch (err) {
        showToast("Failed to copy link", "error");
      }
      
      document.body.removeChild(textArea);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(() => {
        showToast("Public event link copied to clipboard!", "success");
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
            <Calendar className="text-blue-400" /> Events
          </h1>
          <p className="text-[#C4C4D4] mt-2">Create and manage upcoming IEDC events.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={20} /> Create Event
        </button>
      </div>

      <div className="bg-[#111432] rounded-2xl border border-white/10 p-6">
        {isLoading ? (
          <div className="text-center text-[#C4C4D4] py-8">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-center text-[#C4C4D4] py-8">No events found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-[#C4C4D4]">
                  <th className="pb-3 font-medium">Event Name</th>
                  <th className="pb-3 font-medium">Date Created</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Registrations</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={event.id} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 font-medium flex items-center gap-3">
                      {event.banner_url ? (
                        <img src={event.banner_url} alt="" className="w-10 h-10 rounded-md object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-white/5 flex items-center justify-center">
                          <Calendar size={18} className="text-[#C4C4D4]" />
                        </div>
                      )}
                      {event.title}
                    </td>
                    <td className="py-4 text-[#C4C4D4]">{new Date(event.created_at).toLocaleDateString()}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full border ${getStatusDisplay(event.status).color}`}>
                        {getStatusDisplay(event.status).text}
                      </span>
                    </td>
                    <td className="py-4 text-[#C4C4D4]">{event.registrations_count || 0} / {event.max_participants || "∞"}</td>
                    <td className="py-4 flex items-center gap-3">
                      <button onClick={() => handleShare(event.id)} className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Share
                      </button>
                      <button onClick={() => openModal(event)} className="text-purple-400 hover:text-purple-300 text-sm font-medium">Edit</button>
                      <button onClick={() => handleDelete(event.id)} className="text-red-400 hover:text-red-300 text-sm font-medium">Delete</button>
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
              className="bg-[#0A0E27] border border-white/10 rounded-2xl p-6 w-full max-w-2xl relative z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{editingEvent ? "Edit Event" : "Create Event"}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-[#C4C4D4] hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Event Poster / Banner</label>
                  <ImageUpload 
                    value={formData.banner_url}
                    onChange={(url) => setFormData({ ...formData, banner_url: url })}
                    folder="events"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Event Title *</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-[#111432] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Registration / Google Form Link</label>
                    <input 
                      type="url" 
                      placeholder="https://forms.gle/..."
                      value={formData.registration_link}
                      onChange={(e) => setFormData({...formData, registration_link: e.target.value})}
                      className="w-full bg-[#111432] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {editingEvent && (
                    <div className="md:col-span-2 bg-[#111432]/50 border border-[#3A2065]/50 p-4 rounded-xl mt-4">
                      <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#4F7DF9]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                        </svg>
                        Native Google Forms Integration
                      </h3>
                      <p className="text-sm text-[#C4C4D4] mb-4">
                        Connect a Google Form to allow students to register directly on this website while syncing their responses directly to your Google Sheet!
                      </p>
                      
                      <div className="flex gap-3 mb-4">
                        <input 
                          type="url" 
                          placeholder="Paste Google Form Link here..."
                          value={formData.google_form_url}
                          onChange={(e) => setFormData({...formData, google_form_url: e.target.value})}
                          className="flex-1 bg-[#1A1D3D] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                        <button 
                          type="button"
                          onClick={handleConnectGoogleForm}
                          className="bg-[#4F7DF9] hover:bg-[#3d65ce] text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
                        >
                          Connect Form
                        </button>
                      </div>

                      <AnimatePresence>
                        {formData.google_form_enabled && formData.field_mapping && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: "spring", bounce: 0.4 }}
                            className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg text-sm text-green-400 mb-2"
                          >
                            <div className="mb-3"><span className="font-bold">✓ Connected!</span> Review the field mappings below.</div>
                            
                            <div className="border-t border-green-500/30 pt-3">
                              <h4 className="font-bold text-white mb-1">Field Mapping</h4>
                              <p className="text-[#C4C4D4] mb-3 text-xs leading-tight">Map website fields to Google Form entry IDs (e.g. entry.12345678). Leave blank to skip sending.</p>
                              
                              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                {["name", "email", "phone", "gender", "year", "department", "has_laptop", "is_iedc_member", ...(formData.custom_fields || []).map((f: any) => f.id)].map((fieldKey: string) => {
                                  const label = ["name", "email", "phone", "gender", "year", "department", "has_laptop", "is_iedc_member"].includes(fieldKey) 
                                    ? fieldKey.replace(/_/g, ' ').toUpperCase()
                                    : formData.custom_fields?.find((f: any) => f.id === fieldKey)?.label || fieldKey;

                                  return (
                                    <div key={fieldKey} className="flex items-center gap-3">
                                      <div className="w-1/3 text-[#C4C4D4] font-medium truncate text-xs" title={label}>
                                         {label}
                                      </div>
                                      <input 
                                        type="text"
                                        placeholder="entry.xxxxx"
                                        value={formData.field_mapping[fieldKey] || ""}
                                        onChange={(e) => setFormData({
                                          ...formData,
                                          field_mapping: {
                                            ...formData.field_mapping,
                                            [fieldKey]: e.target.value
                                          }
                                        })}
                                        className="flex-1 bg-black/20 border border-green-500/30 rounded px-3 py-1.5 text-white text-xs focus:border-green-400 outline-none"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  <div className="md:col-span-2 bg-[#111432]/50 border border-white/10 p-5 rounded-xl mt-4">
                    <h3 className="text-white font-medium mb-1">Custom Registration Fields</h3>
                    <p className="text-sm text-[#C4C4D4] mb-4">Design the registration form shown to students. Standard fields (Name, Email, Phone, etc) are already included automatically.</p>
                    <CustomFormBuilder 
                      fields={formData.custom_fields} 
                      onChange={(fields) => setFormData({ ...formData, custom_fields: fields })} 
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Description *</label>
                    <textarea 
                      required 
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-[#111432] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 resize-y"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Status</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full bg-[#111432] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="REGISTRATION_OPEN">Registration Open</option>
                      <option value="REGISTRATION_CLOSED">Registration Closed</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Max Participants</label>
                    <input 
                      type="number" 
                      min="1"
                      placeholder="Leave empty for unlimited"
                      value={formData.max_participants}
                      onChange={(e) => setFormData({...formData, max_participants: e.target.value})}
                      className="w-full bg-[#111432] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Registration Deadline</label>
                    <input 
                      type="datetime-local" 
                      value={formData.registration_deadline}
                      onChange={(e) => setFormData({...formData, registration_deadline: e.target.value})}
                      className="w-full bg-[#111432] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-white/10 mt-6">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-[#C4C4D4] hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    {editingEvent ? "Update Event" : "Create Event"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {eventToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setEventToDelete(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0A0E27] border border-white/10 rounded-2xl p-6 w-full max-w-sm relative z-10 shadow-2xl"
            >
              <div className="mb-6">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4 text-red-400 mx-auto">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-center text-white mb-2">Delete Event?</h2>
                <p className="text-center text-[#C4C4D4] text-sm">Are you sure you want to delete this event? This action cannot be undone.</p>
              </div>
              <div className="flex justify-center gap-3 mt-6">
                <button 
                  onClick={() => setEventToDelete(null)}
                  className="px-6 py-2 flex-1 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={confirmDelete}
                  className="px-6 py-2 flex-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className={`fixed bottom-6 right-6 z-[100] px-6 py-4 rounded-xl shadow-2xl font-medium border flex items-center gap-3 ${
              toast.type === "success" ? "bg-[#1A1D3D] text-green-400 border-green-500/30" : 
              toast.type === "error" ? "bg-[#1A1D3D] text-red-400 border-red-500/30" :
              "bg-[#1A1D3D] text-blue-400 border-blue-500/30"
            }`}
          >
            {toast.type === "success" && (
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {toast.type === "error" && (
              <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
