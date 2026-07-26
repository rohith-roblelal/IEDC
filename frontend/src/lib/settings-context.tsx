"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface SiteSettings {
  id: number;
  site_name: string;
  site_tagline: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_cta_text: string | null;
  hero_cta_link: string | null;
  hero_image_url: string | null;
  about_description: string | null;
  about_vision: string | null;
  about_stats_json: Array<{ label: string; value: string }> | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
  github_url: string | null;
  footer_tagline: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  email_from_name: string | null;
  email_reply_to: string | null;
  maintenance_mode: boolean;
  google_analytics_id: string | null;
  updated_at: string | null;
}

// Sensible defaults so the site works even before settings load
const DEFAULTS: SiteSettings = {
  id: 1,
  site_name: "IEDC SNMIMT",
  site_tagline: "Innovation and Entrepreneurship Development Cell",
  logo_url: null,
  favicon_url: null,
  hero_title: "Hi Everyone, Welcome To IEDC-SNMIMT",
  hero_subtitle:
    "The Innovation and Entrepreneurship Development Cell at SNMIMT — workshops, hackathons, talks, and startup initiatives for students.",
  hero_cta_text: "View Events",
  hero_cta_link: "/events",
  hero_image_url: null,
  about_description:
    "IEDC has been developed to foster and nurture innovations combined with entrepreneurship amongst young minds.",
  about_vision:
    "To dive into the inner potential and to promote technological disruptions when proffering the nurturing mind to think laterally and divergently.",
  about_stats_json: [{ label: "Events In The Last Year", value: "46+" }],
  contact_email: null,
  contact_phone: null,
  contact_address: "Maliankara P.O, Moothankunnam, Ernakulam Dt. Kerala-683516, India",
  facebook_url: "https://www.facebook.com/people/Iedc-Snmimt/61555494891838/",
  instagram_url: "https://www.instagram.com/iedc.snm",
  twitter_url: null,
  linkedin_url: "https://www.linkedin.com/in/iedcsnmimt/",
  youtube_url: null,
  github_url: null,
  footer_tagline: null,
  seo_title: "IEDC SNMIMT",
  seo_description: "Innovation and Entrepreneurship Development Cell at SNMIMT",
  og_image_url: null,
  email_from_name: null,
  email_reply_to: null,
  maintenance_mode: false,
  google_analytics_id: null,
  updated_at: null,
};

const SettingsContext = createContext<SiteSettings>(DEFAULTS);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/v1/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings({ ...DEFAULTS, ...data });
        }
      } catch {
        // Silently fall back to defaults
      }
    };
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SiteSettings {
  return useContext(SettingsContext);
}
