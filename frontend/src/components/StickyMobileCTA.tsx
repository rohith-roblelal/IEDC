"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar } from "lucide-react";

export function StickyMobileCTA() {
  const pathname = usePathname();
  
  // Hide on dashboard, admin, auth pages, events (to avoid duplication), and thank-you
  const isHidden = 
    pathname.startsWith("/dashboard") || 
    pathname.startsWith("/login") || 
    pathname.startsWith("/events") ||
    pathname.startsWith("/thank-you");

  if (isHidden) return null;

  return (
    <>
      {/* Spacer div to ensure page content isn't permanently hidden behind the CTA on mobile */}
      <div className="h-[88px] md:hidden w-full" aria-hidden="true" />

      {/* Fixed CTA container */}
      <div 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 pointer-events-none bg-gradient-to-t from-[#0A0E27] via-[#0A0E27]/80 to-transparent"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="p-4 pointer-events-auto">
          <Link 
            href="/events" 
            className="flex items-center justify-center gap-2 w-full bg-[#22D46B] text-[#1A1A2E] text-center font-bold py-3.5 px-6 rounded-full shadow-[0_4px_14px_0_rgba(34,212,107,0.39)] hover:scale-[1.02] transition-transform"
            aria-label="Explore upcoming events"
          >
            <Calendar size={18} className="shrink-0" />
            <span>Explore Events</span>
          </Link>
        </div>
      </div>
    </>
  );
}
