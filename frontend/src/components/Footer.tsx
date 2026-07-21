"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0F] rounded-t-[28px] px-6 pt-16 pb-10 mt-10">
      <div className="max-w-[700px] mx-auto text-center">
        <h3 className="text-2xl font-bold text-white">IEDC SNMIMT</h3>
        <p className="text-[#C4C4D4] font-medium mt-3.5 text-[0.95rem]">
          Maliankara P.O, Moothankunnam, Ernakulam Dt. Kerala-683516, India
        </p>

        <div className="w-px h-[60px] bg-white/15 mx-auto my-10"></div>

        <h3 className="text-2xl font-bold text-white">Contact</h3>
        
        <form 
          className="bg-white rounded-[18px] p-8 max-w-[420px] mx-auto mt-6 shadow-2xl text-left"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const name = (form.elements[0] as HTMLInputElement).value;
            const email = (form.elements[1] as HTMLInputElement).value;
            const message = (form.elements[2] as HTMLTextAreaElement).value;
            
            try {
              const res = await fetch("http://127.0.0.1:8000/api/v1/contact/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, message })
              });
              
              if (res.ok) {
                alert("Message sent - we'll get back to you soon!");
                form.reset();
              } else {
                alert("Failed to send message. Please try again.");
              }
            } catch (err) {
              console.error(err);
              alert("An error occurred. Please try again later.");
            }
          }}
        >
          <input 
            type="text" 
            placeholder="Your Name" 
            required 
            className="w-full border border-[#E0E0E8] bg-[#F4F4F8] rounded-[10px] p-3.5 text-[0.95rem] text-[#1A1A2E] mb-3.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <input 
            type="email" 
            placeholder="Your Email" 
            required 
            className="w-full border border-[#E0E0E8] bg-[#F4F4F8] rounded-[10px] p-3.5 text-[0.95rem] text-[#1A1A2E] mb-3.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <textarea 
            placeholder="Your Enquiry" 
            required 
            className="w-full border border-[#E0E0E8] bg-[#F4F4F8] rounded-[10px] p-3.5 text-[0.95rem] text-[#1A1A2E] mb-3.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[90px] resize-y"
          ></textarea>
          <button 
            type="submit" 
            className="w-full bg-[#4F7DF9] text-white font-bold py-3.5 rounded-full hover:-translate-y-0.5 transition-transform"
          >
            Send
          </button>
        </form>

        <div className="mt-10 flex justify-center gap-4">
          <Link href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          </Link>
          <Link href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          </Link>
          <Link href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
          </Link>
          <Link href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
          </Link>
        </div>

        <div className="mt-6 flex justify-center gap-6 text-[#C4C4D4] text-[0.85rem]">
          <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
        </div>

        <p className="mt-6 text-[#6B6B7C] text-[0.8rem]">
          © IEDC-SNMIMT {new Date().getFullYear()}-{new Date().getFullYear() + 1}. All rights reserved
        </p>
      </div>
    </footer>
  );
}
