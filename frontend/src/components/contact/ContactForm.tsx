"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";

export default function ContactForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value;
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message })
      });
      
      if (res.ok) {
        form.reset();
        router.push("/thank-you");
      } else {
        toast("Failed to send message. Please try again.", "error");
      }
    } catch (err) {
      console.error(err);
      toast("An error occurred. Please try again later.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-live="polite">
      <div className="space-y-2 mb-5">
        <label htmlFor="contact-name" className="block text-sm font-medium text-[#C4C4D4]">Your Name</label>
        <input
          id="contact-name"
          name="name"
          type="text"
          placeholder="John Doe"
          required
          disabled={isSubmitting}
          className="w-full border border-white/10 bg-white/5 rounded-xl p-4 text-[0.95rem] text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-[#4F7DF9] focus:border-transparent transition-all disabled:opacity-50"
        />
      </div>
      <div className="space-y-2 mb-5">
        <label htmlFor="contact-email" className="block text-sm font-medium text-[#C4C4D4]">Your Email</label>
        <input
          id="contact-email"
          name="email"
          type="email"
          placeholder="john@example.com"
          required
          disabled={isSubmitting}
          className="w-full border border-white/10 bg-white/5 rounded-xl p-4 text-[0.95rem] text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-[#4F7DF9] focus:border-transparent transition-all disabled:opacity-50"
        />
      </div>
      <div className="space-y-2 mb-6">
        <label htmlFor="contact-message" className="block text-sm font-medium text-[#C4C4D4]">Your Message</label>
        <textarea
          id="contact-message"
          name="message"
          placeholder="How can we help you?"
          required
          disabled={isSubmitting}
          className="w-full border border-white/10 bg-white/5 rounded-xl p-4 text-[0.95rem] text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-[#4F7DF9] focus:border-transparent transition-all min-h-[140px] resize-y disabled:opacity-50"
        ></textarea>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#4F7DF9] text-white font-bold py-4 rounded-xl hover:-translate-y-0.5 transition-transform disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
      >
        {isSubmitting ? (
          <>
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Sending...
          </>
        ) : "Send Message"}
      </button>
    </form>
  );
}
