"use client";

import { useState, useEffect } from "react";
import { X, Cookie } from "lucide-react";
import Link from "next/link";

export function CookieDisclosure() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already acknowledged the disclosure
    const hasSeenDisclosure = localStorage.getItem("iedc_cookie_disclosure");
    if (!hasSeenDisclosure) {
      // Add a small delay before showing to ensure smooth initial page load
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("iedc_cookie_disclosure", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:w-[380px] z-[60] bg-[#1A1D3D] border border-white/10 p-5 rounded-2xl shadow-2xl flex flex-col gap-3 text-sm transition-all animate-in slide-in-from-bottom-8 fade-in duration-500"
      role="region"
      aria-label="Cookie Disclosure"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <Cookie size={18} className="text-[#22D46B]" />
          <span>Privacy First</span>
        </div>
        <button 
          onClick={handleDismiss} 
          className="text-[#C4C4D4] hover:text-white transition-colors p-1 -mr-1 -mt-1 bg-white/5 rounded-full hover:bg-white/10"
          aria-label="Dismiss cookie disclosure"
        >
          <X size={16} />
        </button>
      </div>
      
      <p className="text-[#C4C4D4] leading-relaxed">
        We respect your privacy. This website only uses strictly necessary cookies required for administrative authentication. We do <strong>not</strong> use any non-essential tracking or marketing cookies.
      </p>
      
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
        <Link 
          href="/privacy-policy" 
          onClick={handleDismiss} 
          className="text-[#4F7DF9] hover:text-white font-medium transition-colors"
        >
          Privacy Policy
        </Link>
        <button 
          onClick={handleDismiss}
          className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-lg font-medium transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
