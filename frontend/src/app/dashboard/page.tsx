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

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await clientFetch("api/v1/dashboard");
        setStats(data);
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        // Only set error if we don't have existing stats to fall back on
        if (!stats) {
          setError(err.message === "Failed to fetch" 
            ? "Network error: Make sure the backend server is running." 
            : err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch immediately on mount
    fetchStats();

    // Poll for live updates every 5 seconds
    const interval = setInterval(fetchStats, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-[#C4C4D4] mt-2">Welcome back to the IEDC Admin Panel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <Link href="/dashboard/events" className="block outline-none group">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#111432] p-6 rounded-2xl border border-white/10 group-hover:bg-white/5 transition-colors h-full"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
                <Calendar size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-1">{stats?.total_events || 0}</h3>
            <p className="text-[#C4C4D4] text-sm">Total Events</p>
          </motion.div>
        </Link>

        <Link href="/dashboard/registrations" className="block outline-none group">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#111432] p-6 rounded-2xl border border-white/10 group-hover:bg-white/5 transition-colors h-full"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
                <Users size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-1">{stats?.total_registrations || 0}</h3>
            <p className="text-[#C4C4D4] text-sm">Active Registrations</p>
          </motion.div>
        </Link>
        
        <Link href="/dashboard/startups" className="block outline-none group">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-[#111432] p-6 rounded-2xl border border-white/10 group-hover:bg-white/5 transition-colors h-full"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
                <Rocket size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-1">{stats?.total_startups || 0}</h3>
            <p className="text-[#C4C4D4] text-sm">Startups</p>
          </motion.div>
        </Link>

        <Link href="/dashboard/messages" className="block outline-none group">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#111432] p-6 rounded-2xl border border-white/10 relative overflow-hidden group-hover:bg-white/5 transition-colors h-full"
          >
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="p-3 bg-orange-500/20 text-orange-400 rounded-xl">
                <MessageSquare size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-1 relative z-10">{stats?.unread_messages || 0}</h3>
            <p className="text-[#C4C4D4] text-sm relative z-10">Unread Messages</p>
            {stats && stats.unread_messages > 0 && (
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-xl transform translate-x-1/2 -translate-y-1/2" />
            )}
          </motion.div>
        </Link>

        <Link href="/dashboard/team" className="block outline-none group">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#111432] p-6 rounded-2xl border border-white/10 group-hover:bg-white/5 transition-colors h-full"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 text-green-400 rounded-xl">
                <Users size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-1">{stats?.total_team_members || 0}</h3>
            <p className="text-[#C4C4D4] text-sm">Team Members</p>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}
