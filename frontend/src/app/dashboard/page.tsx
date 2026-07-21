"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, MessageSquare } from "lucide-react";

interface DashboardStats {
  total_events: number;
  total_registrations: number;
  unread_messages: number;
  total_team_members: number;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const fetchStats = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/v1/dashboard/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch dashboard statistics");
        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#111432] p-6 rounded-2xl border border-white/10"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
              <Calendar size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats?.total_events || 0}</h3>
          <p className="text-[#C4C4D4] text-sm">Total Events</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#111432] p-6 rounded-2xl border border-white/10"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
              <Users size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats?.total_registrations || 0}</h3>
          <p className="text-[#C4C4D4] text-sm">Active Registrations</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#111432] p-6 rounded-2xl border border-white/10 relative overflow-hidden"
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#111432] p-6 rounded-2xl border border-white/10"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 text-green-400 rounded-xl">
              <Users size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">{stats?.total_team_members || 0}</h3>
          <p className="text-[#C4C4D4] text-sm">Team Members</p>
        </motion.div>
      </div>
    </div>
  );
}
