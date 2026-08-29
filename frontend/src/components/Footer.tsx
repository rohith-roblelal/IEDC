"use client";

import Link from "next/link";
import Image from "next/image";
import { useSettings } from "@/lib/settings-context";

export default function Footer() {
  const settings = useSettings();

  const socials = [
    { url: settings.facebook_url, label: "Facebook", icon: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/> },
    { url: settings.instagram_url, label: "Instagram", icon: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></> },
    { url: settings.twitter_url, label: "Twitter", icon: <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/> },
    { url: settings.linkedin_url, label: "LinkedIn", icon: <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></> },
    { url: settings.youtube_url, label: "YouTube", icon: <><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></> },
    { url: settings.github_url, label: "GitHub", icon: <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/> },
  ].filter(s => s.url);

  return (
    <footer className="bg-[#0A0A0F] border-t border-white/5 pt-12 pb-8 mt-10">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          
          {/* Identity & Address */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-3 mb-4">
              {settings.logo_url && (
                <div className="relative h-6 w-6">
                  <Image 
                    src={settings.logo_url} 
                    alt=""
                    fill
                    sizes="24px"
                    className="object-contain"
                  />
                </div>
              )}
              <span className="text-xl font-bold text-white">{settings.site_name}</span>
            </div>
            
            {settings.contact_address && (
              <p className="text-[#C4C4D4] text-sm max-w-[320px] leading-relaxed mb-3">
                {settings.contact_address}
              </p>
            )}

            {(settings.contact_email || settings.contact_phone) && (
              <div className="flex flex-col gap-1.5 mt-1 text-[#C4C4D4] text-sm">
                {settings.contact_email && (
                  <a href={`mailto:${settings.contact_email}`} className="hover:text-white transition-colors">
                    {settings.contact_email}
                  </a>
                )}
                {settings.contact_phone && (
                  <a href={`tel:${settings.contact_phone.replace(/[^0-9+]/g, '')}`} className="hover:text-white transition-colors">
                    {settings.contact_phone}
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Social & Navigation */}
          <div className="flex flex-col items-center md:items-end gap-6">
            {socials.length > 0 && (
              <div className="flex gap-3">
                {socials.map((s) => (
                  <Link 
                    key={s.label}
                    href={s.url!.startsWith('http') ? s.url! : `https://${s.url}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label={`${settings.site_name} on ${s.label}`}
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                      {s.icon}
                    </svg>
                  </Link>
                ))}
              </div>
            )}

            <div className="flex flex-wrap justify-center md:justify-end gap-5 text-sm font-medium text-[#C4C4D4]">
              <Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link>
              <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-white/10 mt-10 mb-6"></div>
        
        <div className="text-center text-[#6B6B7C] text-[0.8rem]">
          © {settings.site_name} {new Date().getFullYear()}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
