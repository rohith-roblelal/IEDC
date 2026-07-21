"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
    { name: "About", href: "/about" },
    { name: "Team", href: "/team" },
    { name: "Poster", href: "/gallery" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#0A0E27]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-[1100px] mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-white tracking-wide">
          IEDC SNMIMT
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-8 text-[0.95rem] font-medium text-[#C4C4D4]">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`relative transition-colors hover:text-white ${
                  pathname === link.href ? "text-white" : ""
                }`}
              >
                {link.name}
                {pathname === link.href && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-2 left-0 right-0 h-0.5 bg-blue-500 rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Register Button & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden md:inline-flex text-blue-500 font-semibold hover:text-blue-400 transition"
          >
            Login
          </Link>
          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-[#0A0E27]/98 border-b border-white/10 p-6 flex flex-col gap-4 md:hidden shadow-2xl"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`text-lg font-medium ${
                  pathname === link.href ? "text-white" : "text-[#C4C4D4]"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="text-lg font-semibold text-blue-500 mt-2"
            >
              Login
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
