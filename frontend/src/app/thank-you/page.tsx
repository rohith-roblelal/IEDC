import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thank You",
  robots: {
    index: false,
    follow: true,
  },
};

export default function ThankYouPage() {
  return (
    <div className="py-24 px-6 relative max-w-[800px] mx-auto min-h-[60vh] flex flex-col items-center justify-center text-center">
      {/* Success Icon */}
      <div className="w-24 h-24 bg-[#22D46B]/10 text-[#22D46B] rounded-full flex items-center justify-center mb-8 mx-auto shadow-[0_0_30px_rgba(34,212,107,0.15)]">
        <CheckCircle size={48} strokeWidth={2.5} />
      </div>
      
      {/* Content */}
      <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold text-white mb-6 leading-tight">
        Thank You!
      </h1>
      
      <p className="text-[#C4C4D4] text-[1.05rem] md:text-[1.15rem] mb-12 max-w-[600px] leading-relaxed mx-auto">
        Your message has been successfully sent. We appreciate you reaching out to IEDC SNMIMT and our team will get back to you shortly if a response is required.
      </p>
      
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
        <Link 
          href="/" 
          className="inline-block bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-4 px-8 rounded-full transition-all hover:-translate-y-0.5"
        >
          Return Home
        </Link>
        <Link 
          href="/events" 
          className="inline-block bg-[#22D46B] hover:bg-[#1db95c] text-[#1A1A2E] font-bold py-4 px-8 rounded-full transition-all hover:-translate-y-0.5 shadow-[0_4px_14px_0_rgba(34,212,107,0.39)]"
        >
          Explore Events
        </Link>
      </div>
    </div>
  );
}
