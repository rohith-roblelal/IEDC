"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  LogOut, LayoutDashboard, Calendar, Users, Megaphone, 
  Image as ImageIcon, MessageSquare, UsersRound, Menu, X, Mic, Handshake, Rocket 
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }
    // In a real app we'd decode the JWT to check role or let API reject, 
    // but having a token is our basic check for now.
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserRole(payload.role || "");
    } catch (e) {
      console.error(e);
    }
    setIsAuthorized(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  const menuItems = [
    { name: "Overview", icon: <LayoutDashboard size={20} />, href: "/dashboard" },
    { name: "Events", icon: <Calendar size={20} />, href: "/dashboard/events" },
    { name: "Registrations", icon: <Users size={20} />, href: "/dashboard/registrations" },
    { name: "Announcements", icon: <Megaphone size={20} />, href: "/dashboard/announcements" },
    { name: "Partners", icon: <Handshake size={20} />, href: "/dashboard/partners" },
    { name: "Startups", icon: <Rocket size={20} />, href: "/dashboard/startups" },
    { name: "Podcasts", icon: <Mic size={20} />, href: "/dashboard/podcasts" },
    { name: "Event Poster", icon: <ImageIcon size={20} />, href: "/dashboard/gallery" },
    { name: "Team", icon: <UsersRound size={20} />, href: "/dashboard/team" },
    { name: "Messages", icon: <MessageSquare size={20} />, href: "/dashboard/messages" },
  ];

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#05081A] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-wider bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
          {userRole.includes("SUPER_ADMIN") ? `${getGreeting()} Admin` : "Admin Panel"}
        </h2>
        {/* Mobile Close Button */}
        <button onClick={() => setIsMobileOpen(false)} className="md:hidden text-[#C4C4D4] hover:text-white">
          <X size={24} />
        </button>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard");
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                  : "text-[#C4C4D4] hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-[#C4C4D4] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#05081A] text-white flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-[#0A0E27]/80 backdrop-blur-md border-r border-white/10 hidden md:flex flex-col z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-[#0A0E27] border-r border-white/10 z-50 flex flex-col md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#0A0E27]/80 backdrop-blur-md z-10">
          <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
            {userRole.includes("SUPER_ADMIN") ? `${getGreeting()} Admin` : "Admin Panel"}
          </h2>
          <button onClick={() => setIsMobileOpen(true)} className="text-white p-2">
            <Menu size={24} />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {/* Subtle Ambient Background glow for entire dashboard */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
          {children}
        </main>
      </div>
    </div>
  );
}
