"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Settings, Palette, Home, Info, Mail, Share2, Search, Sliders,
  Save, Upload, Loader2, CheckCircle, Plus, Trash2, Image
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { revalidateSettings } from "./actions";
import { clientFetch } from "@/lib/api/client";

const TABS = [
  { id: "branding", label: "Branding", icon: <Palette size={18} /> },
  { id: "hero", label: "Hero / Home", icon: <Home size={18} /> },
  { id: "about", label: "About", icon: <Info size={18} /> },
  { id: "social", label: "Social Links", icon: <Share2 size={18} /> },
  { id: "seo", label: "SEO & OG", icon: <Search size={18} /> },
  { id: "advanced", label: "Advanced", icon: <Sliders size={18} /> },
];

const SaveButton = ({ keys, isSaving, onSave }: any) => (
  <button
    onClick={() => onSave(keys)}
    disabled={isSaving}
    className="mt-6 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors disabled:opacity-50"
  >
    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
    Save Changes
  </button>
);

const Field = ({ label, name, type = "text", placeholder = "", settings, onChange }: any) => (
  <div>
    <label className="block text-sm font-medium text-[#C4C4D4] mb-1.5">{label}</label>
    {type === "textarea" ? (
      <textarea
        value={settings?.[name] ?? ""}
        onChange={e => onChange(name, e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
      />
    ) : (
      <input
        type={type}
        value={settings?.[name] ?? ""}
        onChange={e => onChange(name, e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
    )}
  </div>
);

const ImageUploadField = ({ label, urlKey, inputRef, endpoint, settings, onUpload }: any) => (
  <div>
    <label className="block text-sm font-medium text-[#C4C4D4] mb-1.5">{label}</label>
    <div className="flex items-center gap-4">
      {settings?.[urlKey] ? (
        <img src={settings[urlKey]} alt={label} className="w-16 h-16 rounded-lg object-contain bg-white/10 p-1" />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
          <Image size={24} />
        </div>
      )}
      <div className="flex-1">
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={() => onUpload(endpoint, inputRef)} />
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm text-white transition-colors"
        >
          <Upload size={14} /> {settings?.[urlKey] ? "Replace" : "Upload"}
        </button>
        {settings?.[urlKey] && (
          <p className="text-xs text-white/40 mt-1 truncate max-w-[200px]">{settings[urlKey]}</p>
        )}
      </div>
    </div>
  </div>
);

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("branding");
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statsJson, setStatsJson] = useState<Array<{ label: string; value: string }>>([]);

  const logoRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);
  const heroImageRef = useRef<HTMLInputElement>(null);
  const ogImageRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await clientFetch("api/v1/settings");
        setSettings(data);
        setStatsJson(data.about_stats_json || []);
      } catch {
        toast("Failed to load settings", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (keys: string[]) => {
    setIsSaving(true);
    const payload: any = {};
    keys.forEach(k => {
      if (k === "about_stats_json") payload[k] = statsJson;
      else payload[k] = settings[k];
    });
    try {
      const data = await clientFetch("api/v1/settings", {
        method: "PATCH",
        headers: {},
        body: JSON.stringify(payload),
      });
      setSettings(data);
      window.dispatchEvent(new Event("settings-updated"));
      await revalidateSettings();
      toast("Settings saved!", "success");
    } catch {
      toast("Error saving settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (endpoint: string, ref: React.RefObject<HTMLInputElement | null>) => {
    const file = ref.current?.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const data = await clientFetch(`api/v1/settings/${endpoint}`, {
        method: "POST",
        headers: {},
        body: formData,
      });
      setSettings(data);
      window.dispatchEvent(new Event("settings-updated"));
      await revalidateSettings();
      toast("Image uploaded!", "success");
    } catch {
      toast("Upload error", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-purple-400" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings className="text-purple-400" /> Website Settings
        </h1>
        <p className="text-[#C4C4D4] mt-2">Manage all website-wide configuration from this panel.</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="hidden md:flex flex-col gap-1 w-48 shrink-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-all ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-[#C4C4D4] hover:bg-white/5 hover:text-white"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Mobile tabs */}
        <div className="md:hidden flex gap-2 overflow-x-auto pb-2 w-full">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id ? "bg-blue-600 text-white" : "text-[#C4C4D4] bg-white/5"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Panel */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 bg-[#111432] border border-white/10 rounded-2xl p-6 space-y-5"
        >
          {/* ─── BRANDING ─── */}
          {activeTab === "branding" && (
            <>
              <h2 className="text-lg font-bold">Branding</h2>
              <Field settings={settings} onChange={handleChange} label="Site Name" name="site_name" placeholder="IEDC SNMIMT" />
              <Field settings={settings} onChange={handleChange} label="Site Tagline" name="site_tagline" placeholder="Innovation and Entrepreneurship..." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <ImageUploadField settings={settings} onUpload={handleFileUpload} label="Logo" field="logo_url" urlKey="logo_url" inputRef={logoRef} endpoint="logo" />
                <ImageUploadField settings={settings} onUpload={handleFileUpload} label="Favicon" field="favicon_url" urlKey="favicon_url" inputRef={faviconRef} endpoint="favicon" />
              </div>
              <SaveButton isSaving={isSaving} onSave={handleSave} keys={["site_name", "site_tagline"]} />
            </>
          )}

          {/* ─── HERO ─── */}
          {activeTab === "hero" && (
            <>
              <h2 className="text-lg font-bold">Hero / Homepage</h2>
              <Field settings={settings} onChange={handleChange} label="Hero Title" name="hero_title" placeholder="Hi Everyone, Welcome To IEDC-SNMIMT" />
              <Field settings={settings} onChange={handleChange} label="Hero Subtitle" name="hero_subtitle" type="textarea" placeholder="The Innovation and Entrepreneurship Development Cell..." />
              <Field settings={settings} onChange={handleChange} label="Hero Description" name="hero_description" type="textarea" placeholder="The Innovation and Entrepreneurship Development Centre (IEDC) at SNMIMT is a vibrant student-run community..." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field settings={settings} onChange={handleChange} label="CTA Button Text" name="hero_cta_text" placeholder="View Events" />
                <Field settings={settings} onChange={handleChange} label="CTA Button Link" name="hero_cta_link" placeholder="/events" />
              </div>
              <ImageUploadField settings={settings} onUpload={handleFileUpload} label="Hero Banner Image (optional)" field="hero_image_url" urlKey="hero_image_url" inputRef={heroImageRef} endpoint="hero-image" />
              <SaveButton isSaving={isSaving} onSave={handleSave} keys={["hero_title", "hero_subtitle", "hero_description", "hero_cta_text", "hero_cta_link"]} />
            </>
          )}

          {/* ─── ABOUT ─── */}
          {activeTab === "about" && (
            <>
              <h2 className="text-lg font-bold">About Section</h2>
              <Field settings={settings} onChange={handleChange} label="About Description" name="about_description" type="textarea" />
              <Field settings={settings} onChange={handleChange} label="Vision Statement" name="about_vision" type="textarea" />
              <div>
                <label className="block text-sm font-medium text-[#C4C4D4] mb-2">Stats / Highlights</label>
                <div className="space-y-3">
                  {statsJson.map((stat, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <input
                        value={stat.value}
                        onChange={e => {
                          const next = [...statsJson];
                          next[i] = { ...next[i], value: e.target.value };
                          setStatsJson(next);
                        }}
                        placeholder="46+"
                        className="w-24 bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                      <input
                        value={stat.label}
                        onChange={e => {
                          const next = [...statsJson];
                          next[i] = { ...next[i], label: e.target.value };
                          setStatsJson(next);
                        }}
                        placeholder="Events This Year"
                        className="flex-1 bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                      <button onClick={() => setStatsJson(statsJson.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => setStatsJson([...statsJson, { value: "", label: "" }])} className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 mt-2">
                    <Plus size={16} /> Add Stat
                  </button>
                </div>
              </div>
              <SaveButton isSaving={isSaving} onSave={handleSave} keys={["about_description", "about_vision", "about_stats_json"]} />
            </>
          )}

          {/* ─── SOCIAL MEDIA ─── */}
          {activeTab === "social" && (
            <>
              <h2 className="text-lg font-bold">Social Media Links</h2>
              <Field settings={settings} onChange={handleChange} label="Facebook URL" name="facebook_url" placeholder="https://facebook.com/..." />
              <Field settings={settings} onChange={handleChange} label="Instagram URL" name="instagram_url" placeholder="https://instagram.com/..." />
              <Field settings={settings} onChange={handleChange} label="Twitter / X URL" name="twitter_url" placeholder="https://twitter.com/..." />
              <Field settings={settings} onChange={handleChange} label="LinkedIn URL" name="linkedin_url" placeholder="https://linkedin.com/..." />
              <Field settings={settings} onChange={handleChange} label="YouTube URL" name="youtube_url" placeholder="https://youtube.com/..." />
              <Field settings={settings} onChange={handleChange} label="GitHub URL" name="github_url" placeholder="https://github.com/..." />
              <Field settings={settings} onChange={handleChange} label="Footer Tagline" name="footer_tagline" placeholder="Building the future, one idea at a time." />
              <SaveButton isSaving={isSaving} onSave={handleSave} keys={["facebook_url", "instagram_url", "twitter_url", "linkedin_url", "youtube_url", "github_url", "footer_tagline"]} />
            </>
          )}

          {/* ─── SEO ─── */}
          {activeTab === "seo" && (
            <>
              <h2 className="text-lg font-bold">SEO & Open Graph</h2>
              <Field settings={settings} onChange={handleChange} label="SEO Title" name="seo_title" placeholder="IEDC SNMIMT" />
              <Field settings={settings} onChange={handleChange} label="SEO Description" name="seo_description" type="textarea" placeholder="Innovation and Entrepreneurship Development Cell..." />
              <ImageUploadField settings={settings} onUpload={handleFileUpload} label="Open Graph Image (1200×630 recommended)" field="og_image_url" urlKey="og_image_url" inputRef={ogImageRef} endpoint="og-image" />
              <SaveButton isSaving={isSaving} onSave={handleSave} keys={["seo_title", "seo_description"]} />
            </>
          )}

          {/* ─── ADVANCED ─── */}
          {activeTab === "advanced" && (
            <>
              <h2 className="text-lg font-bold">Advanced Settings</h2>
              <Field settings={settings} onChange={handleChange} label="Email From Name" name="email_from_name" placeholder="IEDC SNMIMT" />
              <Field settings={settings} onChange={handleChange} label="Email Reply-To" name="email_reply_to" placeholder="iedcsnmimt@gmail.com" />
              <Field settings={settings} onChange={handleChange} label="Google Analytics ID" name="google_analytics_id" placeholder="G-XXXXXXXXXX" />
              <div>
                <label className="block text-sm font-medium text-[#C4C4D4] mb-3">Maintenance Mode</label>
                <div className="flex items-center gap-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">Maintenance Mode</p>
                    <p className="text-[#C4C4D4] text-xs mt-0.5">When enabled, the site will show a maintenance notice to visitors.</p>
                  </div>
                  <button
                    onClick={() => handleChange("maintenance_mode", !settings?.maintenance_mode)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${settings?.maintenance_mode ? "bg-yellow-500" : "bg-white/20"}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings?.maintenance_mode ? "translate-x-6" : ""}`} />
                  </button>
                </div>
              </div>
              <SaveButton isSaving={isSaving} onSave={handleSave} keys={["email_from_name", "email_reply_to", "google_analytics_id", "maintenance_mode"]} />
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
