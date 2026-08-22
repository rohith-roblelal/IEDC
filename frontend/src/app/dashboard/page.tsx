"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, MessageSquare, Rocket } from "lucide-react";
import { clientFetch } from "@/lib/api/client";
import Link from "next/link";

interface DashboardStats {
  total_events: number;
  total_registrations: number;
  unread_messages: number;
  total_team_members: number;
  total_startups: number;
}

interface ActivityItem {
  id: string;
  type: "event" | "registration";
  label: string;
  title: string;
  timestamp: string;
  author?: string;
}

function getRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}mo ago`;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const fetchStats = async () => {
      try {
        const data = await clientFetch("api/v1/dashboard");
        setStats(data);
      } catch (err: unknown) {
        console.error("Dashboard fetch error:", err);
        if (!stats) {
          const e = err as Error;
          setError(e.message === "Failed to fetch" 
            ? "Network error: Make sure the backend server is running." 
            : e.message);
        }
      } finally {
        setIsLoading(false);
      }

      // Fetch Recent Activity
      try {
        const [eventsRes, registrationsRes] = await Promise.allSettled([
          clientFetch("/api/v1/events?page=1&page_size=5"),
          clientFetch("/api/v1/registrations?page=1&page_size=5")
        ]);

        const newActivities: ActivityItem[] = [];

        if (eventsRes.status === "fulfilled" && eventsRes.value?.items) {
          eventsRes.value.items.forEach((ev: any) => {
            const isPublished = ev.is_published === true || ev.status === "PUBLISHED";
            newActivities.push({
              id: ev.id,
              type: "event",
              label: isPublished ? "Event Published" : "Event Created",
              title: ev.title,
              timestamp: ev.created_at,
            });
          });
        }

        if (registrationsRes.status === "fulfilled" && registrationsRes.value?.items) {
          registrationsRes.value.items.forEach((reg: any) => {
            newActivities.push({
              id: reg.id,
              type: "registration",
              label: "New Registration",
              title: "Registration", // Fallback to avoid making it empty
              timestamp: reg.created_at,
              author: reg.name
            });
          });
        }

        newActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setActivities(newActivities.slice(0, 5));
        
        if (eventsRes.status === "rejected" && registrationsRes.status === "rejected") {
          setActivitiesError(true);
        } else {
          setActivitiesError(false);
        }
      } catch (err) {
        console.error("Activity fetch error:", err);
        setActivitiesError(true);
      } finally {
        setIsActivitiesLoading(false);
      }
      
      // Schedule next poll only AFTER current one finishes (prevents overlapping requests)
      timeoutId = setTimeout(fetchStats, 30000);
    };

    // Fetch immediately on mount
    fetchStats();

    // Cleanup timeout on unmount
    return () => clearTimeout(timeoutId);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Dashboard Overview</h1>
          <p className="text-[#C4C4D4] mt-2 text-sm md:text-base">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-colors text-sm font-medium">
            Generate Report
          </button>
          <Link href="/dashboard/events">
            <button className="px-4 py-2 bg-[#A855F7] text-white rounded-lg hover:bg-[#9333EA] transition-colors text-sm font-medium">
              + New Event
            </button>
          </Link>
        </div>
      </div>

      {/* 4 Statistics Cards (Row 1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Events */}
        <Link href="/dashboard/events" className="block outline-none group focus-visible:ring-2 focus-visible:ring-[#A855F7] rounded-xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-[#111127] px-6 py-5 rounded-xl border border-white/5 h-[140px] flex flex-col justify-between group-hover:bg-[#111127]/80 group-hover:border-[#3B82F6]/30 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-[2.2rem] font-bold text-white leading-none mb-1">
                {stats?.total_events || 0}
              </h3>
              <p className="text-[0.7rem] font-medium tracking-wider uppercase text-[#C4C4D4]/60">
                TOTAL EVENTS
              </p>
            </div>
          </motion.div>
        </Link>

        {/* Card 2: Active Registrations */}
        <Link href="/dashboard/registrations" className="block outline-none group focus-visible:ring-2 focus-visible:ring-[#A855F7] rounded-xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-[#111127] px-6 py-5 rounded-xl border border-white/5 h-[140px] flex flex-col justify-between group-hover:bg-[#111127]/80 group-hover:border-[#A855F7]/30 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-[2.2rem] font-bold text-white leading-none mb-1">
                {stats?.total_registrations || 0}
              </h3>
              <p className="text-[0.7rem] font-medium tracking-wider uppercase text-[#C4C4D4]/60">
                ACTIVE REGISTRATIONS
              </p>
            </div>
          </motion.div>
        </Link>
        
        {/* Card 3: Startups */}
        <Link href="/dashboard/startups" className="block outline-none group focus-visible:ring-2 focus-visible:ring-[#A855F7] rounded-xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-[#111127] px-6 py-5 rounded-xl border border-white/5 h-[140px] flex flex-col justify-between group-hover:bg-[#111127]/80 group-hover:border-[#7C3AED]/30 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
              <Rocket size={20} />
            </div>
            <div>
              <h3 className="text-[2.2rem] font-bold text-white leading-none mb-1">
                {stats?.total_startups || 0}
              </h3>
              <p className="text-[0.7rem] font-medium tracking-wider uppercase text-[#C4C4D4]/60">
                STARTUPS
              </p>
            </div>
          </motion.div>
        </Link>

        {/* Card 4: Unread Messages */}
        <Link href="/dashboard/messages" className="block outline-none group focus-visible:ring-2 focus-visible:ring-[#A855F7] rounded-xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-[#111127] px-6 py-5 rounded-xl border border-white/5 h-[140px] flex flex-col justify-between group-hover:bg-[#111127]/80 group-hover:border-[#F59E0B]/30 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                <MessageSquare size={20} />
              </div>
              {stats && stats.unread_messages > 0 && (
                <span className="flex h-2.5 w-2.5 rounded-full bg-orange-500 animate-pulse mt-1 mr-1"></span>
              )}
            </div>
            <div>
              <h3 className="text-[2.2rem] font-bold text-white leading-none mb-1">
                {stats?.unread_messages || 0}
              </h3>
              <p className="text-[0.7rem] font-medium tracking-wider uppercase text-[#C4C4D4]/60">
                UNREAD MESSAGES
              </p>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Row 2: Team Members Card (Full Width) */}
      <Link href="/dashboard/team" className="block outline-none group focus-visible:ring-2 focus-visible:ring-[#A855F7] rounded-xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-[#111127] px-6 h-[80px] rounded-xl border border-white/5 flex items-center justify-between group-hover:bg-[#111127]/80 group-hover:border-[#10B981]/30 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-[44px] h-[44px] rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Users size={22} />
            </div>
            <div className="flex items-center gap-3">
              <h3 className="text-[1.8rem] font-bold text-white leading-none">
                {stats?.total_team_members || 0}
              </h3>
              <p className="text-[0.7rem] font-medium tracking-wider uppercase text-[#C4C4D4]/60 translate-y-0.5">
                TEAM MEMBERS
              </p>
            </div>
          </div>
          <div className="text-[#C4C4D4]/60 group-hover:text-emerald-400 transition-colors text-sm font-medium flex items-center gap-1">
            View Team <span>&rarr;</span>
          </div>
        </motion.div>
      </Link>

      {/* Row 3: Recent Activity (Full Width for now, or adapt as needed) */}
      <div className="w-full mt-4">
        {!activitiesError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-[#0A0E27] p-6 rounded-xl border border-white/5 shadow-sm h-full flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white tracking-tight">Recent Activity</h3>
              <Link href="/dashboard/events" className="text-[#A855F7] font-medium hover:underline hover:brightness-110 transition-all text-sm">
                View All
              </Link>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              {isActivitiesLoading && activities.length === 0 ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <div className="w-2 h-2 rounded-full bg-white/10 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-white/10 rounded w-1/4 animate-pulse" />
                        <div className="h-3 bg-white/5 rounded w-1/6 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities.length === 0 ? (
                <p className="text-[#C4C4D4]/60 text-center py-8 text-sm">No recent activity yet</p>
              ) : (
                <div className="space-y-5">
                  {activities.map((activity) => (
                    <div key={activity.id + activity.type} className="flex gap-4 items-start">
                      <div className="mt-1.5 text-[#A855F7] text-xl leading-none">&bull;</div>
                      <div>
                        <p className="text-white text-sm">
                          <span className="font-bold text-[#A855F7]">{activity.label}</span> {activity.title !== "Registration" ? activity.title : ""}
                        </p>
                        <p className="text-xs text-[#6b7280] mt-0.5">
                          {activity.author ? `${activity.author} • ` : ""}
                          {getRelativeTime(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
