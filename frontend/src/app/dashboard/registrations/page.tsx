"use client";

import { useEffect, useState, useMemo } from "react";
import { Calendar, Search, MapPin, Users, UserCheck } from "lucide-react";
import { motion } from "framer-motion";
import { clientFetch } from "@/lib/api/client";
import { EventResponse } from "@/lib/api/events";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Registration {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  year?: string;
  is_iedc_member?: boolean;
  created_at: string;
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  DRAFT:               { bg: "bg-white/5",          text: "text-[#C4C4D4]",   label: "DRAFT" },
  PUBLISHED:           { bg: "bg-blue-500/15",      text: "text-blue-400",    label: "UPCOMING" },
  REGISTRATION_OPEN:   { bg: "bg-[#A855F7]/15",     text: "text-[#A855F7]",   label: "LIVE" },
  REGISTRATION_CLOSED: { bg: "bg-white/5",          text: "text-[#C4C4D4]",   label: "CLOSED" },
  COMPLETED:           { bg: "bg-emerald-500/15",   text: "text-emerald-400", label: "COMPLETED" },
  CANCELLED:           { bg: "bg-red-500/15",       text: "text-red-400",     label: "CANCELLED" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.DRAFT;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[0.6rem] font-bold tracking-wider uppercase ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

// ─── Avatar initials ──────────────────────────────────────────────────────────
function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const hue = name.charCodeAt(0) * 37 % 360;
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-inner"
      style={{ background: `hsl(${hue}, 60%, 40%)` }}
    >
      {initials}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function RegistrationsPage() {
  // Events
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);

  // Registrations
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [regsLoading, setRegsLoading] = useState(false);
  const [regFilter, setRegFilter] = useState<"all" | "iedc" | "non-iedc">("all");

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const data = await clientFetch("/api/v1/events");
      const items: EventResponse[] = data.items || [];
      setEvents(items);
      if (items.length > 0 && !selectedEvent) setSelectedEvent(items[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRegistrations = async (eventId: string) => {
    setRegsLoading(true);
    setRegistrations([]);
    try {
      const data = await clientFetch(`/api/v1/events/${eventId}/participants`);
      setRegistrations(data.items || data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setRegsLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);
  useEffect(() => { if (selectedEvent) fetchRegistrations(selectedEvent.id); }, [selectedEvent?.id]);

  // ── Derived lists ─────────────────────────────────────────────────────────
  const filteredEvents = useMemo(
    () => events.filter((e) => e.title.toLowerCase().includes(search.toLowerCase())),
    [events, search]
  );

  const filteredRegs = useMemo(() => {
    if (regFilter === "iedc") return registrations.filter((r) => r.is_iedc_member);
    if (regFilter === "non-iedc") return registrations.filter((r) => !r.is_iedc_member);
    return registrations;
  }, [registrations, regFilter]);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-40px)] gap-8">
      
      {/* ── LEFT: Event list panel ─────────────────────────────────────────── */}
      <div className="w-[340px] flex-shrink-0 flex flex-col h-full">
        <h2 className="text-xl font-bold text-white mb-5">Select Event</h2>
        
        <div className="relative mb-5">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C4C4D4]/50" />
          <input
            type="text"
            placeholder="Filter events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1A1A2E] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-[#C4C4D4]/40 focus:outline-none focus:border-[#A855F7]/50 transition-colors"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />
            ))
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-10 text-sm text-[#C4C4D4]/50">No events found.</div>
          ) : (
            filteredEvents.map((event) => {
              const active = selectedEvent?.id === event.id;
              return (
                <motion.button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
                    active
                      ? "bg-[#111127] border-[#A855F7] shadow-[0_0_20px_rgba(168,85,247,0.1)]"
                      : "bg-[#111127] border-white/5 hover:bg-white/[0.03]"
                  }`}
                >
                  {/* Active Indicator Line */}
                  {active && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#A855F7]" />
                  )}
                  
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <StatusBadge status={event.status} />
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-[#C4C4D4]">
                      <Users size={12} />
                      {event.registrations_count || 0}/{event.max_participants || "∞"}
                    </span>
                  </div>
                  <h3 className={`text-base font-bold leading-tight mb-1.5 ${active ? "text-white" : "text-[#E2E2E2]"}`}>
                    {event.title}
                  </h3>
                  {event.description && (
                    <p className="text-xs text-[#C4C4D4]/60 line-clamp-1 leading-relaxed">
                      {event.description}
                    </p>
                  )}
                </motion.button>
              );
            })
          )}
        </div>
      </div>

      {/* ── RIGHT: Detail + registrations panel ───────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col h-full relative">
        {!selectedEvent ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#111127] border border-white/5 flex items-center justify-center">
              <Calendar size={32} className="text-[#C4C4D4]/30" />
            </div>
            <div>
              <p className="text-lg font-medium text-white mb-1">Select an event</p>
              <p className="text-sm text-[#C4C4D4]/50">Choose an event from the left panel to view its registrations.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header Area (Transparent background, just sits on main surface) */}
            <div className="flex justify-between items-start mb-6 flex-shrink-0 pt-2">
              <div>
                <h1 className="text-[2rem] font-bold text-white leading-tight mb-3">
                  {selectedEvent.title}
                </h1>
                <div className="flex items-center flex-wrap gap-5 text-sm font-medium text-[#C4C4D4]">
                  {selectedEvent.registration_deadline && (
                    <span className="flex items-center gap-2">
                      <Calendar size={15} className="text-[#C4C4D4]" />
                      {new Date(selectedEvent.registration_deadline).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </span>
                  )}
                  {(selectedEvent as any).venue && (
                    <span className="flex items-center gap-2">
                      <MapPin size={15} className="text-[#C4C4D4]" />
                      {(selectedEvent as any).venue}
                    </span>
                  )}
                </div>
              </div>

              {/* Filter tabs */}
              <div className="flex items-center bg-[#1A1A2E] rounded-xl p-1.5 border border-white/5">
                {(["all", "iedc", "non-iedc"] as const).map((tab) => (
                  <button key={tab} onClick={() => setRegFilter(tab)}
                    className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                      regFilter === tab
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-[#C4C4D4]/60 hover:text-white hover:bg-white/5"
                    }`}>
                    {tab === "all" ? "All" : tab === "iedc" ? "IEDC Members" : "Non-Members"}
                  </button>
                ))}
              </div>
            </div>

            {/* Registrations table card */}
            <div className="flex-1 overflow-hidden bg-[#111127] rounded-2xl border border-white/5 flex flex-col shadow-2xl">
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {regsLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 rounded-full border-2 border-[#A855F7] border-t-transparent animate-spin" />
                  </div>
                ) : filteredRegs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <UserCheck size={32} className="text-[#C4C4D4]/20" />
                    <p className="text-sm text-[#C4C4D4]/40">
                      {regFilter === "all" ? "No registrations found for this event." : "No registrations found for this filter."}
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-[#111127] z-10 before:content-[''] before:absolute before:inset-0 before:border-b before:border-white/5">
                      <tr>
                        {["Name", "Contact", "Department", "Year"].map((h) => (
                          <th key={h} className="px-8 py-5 text-sm font-bold text-white relative z-10">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegs.map((reg, idx) => (
                        <motion.tr key={reg.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <Avatar name={reg.name} />
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-white mb-0.5">{reg.name}</p>
                                {reg.is_iedc_member && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[0.6rem] font-bold bg-[#A855F7]/20 text-[#D8B4FE]">
                                    IEDC
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <p className="text-sm text-[#C4C4D4] mb-0.5">{reg.email}</p>
                            {reg.phone && <p className="text-sm text-[#C4C4D4]">+91 {reg.phone}</p>}
                          </td>
                          <td className="px-8 py-5 text-sm text-[#C4C4D4]">{reg.department || "—"}</td>
                          <td className="px-8 py-5 text-sm text-[#C4C4D4]">
                            {reg.year ? (reg.year.toLowerCase().includes("year") ? reg.year : `${reg.year} Year`) : "—"}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
