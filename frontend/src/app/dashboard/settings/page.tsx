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
import { useRouter } from "next/navigation";

const TABS = [
  { id: "branding", label: "Branding", icon: <Palette size={18} /> },
  { id: "hero", label: "Hero / Home", icon: <Home size={18} /> },
  { id: "about", label: "About", icon: <Info size={18} /> },
  { id: "social", label: "Social Links", icon: <Share2 size={18} /> },
  { id: "seo", label: "SEO & OG", icon: <Search size={18} /> },
  { id: "advanced", label: "Advanced", icon: <Sliders size={18} /> },
];

const SaveButton = ({ tabId, keys, isSaving, onSave }: { tabId: string, keys: string[], isSaving: boolean, onSave: (tabId: string, keys: string[]) => void }) => (
  <button
    onClick={() => onSave(tabId, keys)}
    disabled={isSaving}
    className="mt-6 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
    Save Changes
  </button>
);

const Field = ({ label, name, type = "text", placeholder = "", settings, onChange }: { label: string, name: string, type?: string, placeholder?: string, settings: Record<string, any> | null, onChange: (name: string, value: string) => void }) => (
  <div>
    <label className="block text-sm font-medium text-[#C4C4D4] mb-1.5">{label}</label>
    {type === "textarea" ? (
      <textarea
        value={settings?.[name] ?? ""}
        onChange={e => onChange(name, e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full bg-[#0A0E27] border border-white/5 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-y transition-colors"
      />
    ) : (
      <input
        type={type}
        value={settings?.[name] ?? ""}
        onChange={e => onChange(name, e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0A0E27] border border-white/5 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
      />
    )}
  </div>
);

const ImageUploadField = ({ label, urlKey, inputRef, endpoint, settings, field, onUpload, isUploading }: { label: string, urlKey: string, inputRef: React.RefObject<HTMLInputElement | null>, endpoint: string, settings: Record<string, any> | null, field: string, onUpload: (endpoint: string, ref: React.RefObject<HTMLInputElement | null>, field: string) => void, isUploading: boolean }) => (
  <div>
    <label className="block text-sm font-medium text-[#C4C4D4] mb-1.5">{label}</label>
    <div className="flex items-center gap-4">
      {settings?.[urlKey] ? (
        <img src={settings[urlKey]} alt={label} className="w-16 h-16 rounded-lg object-contain bg-[#0A0E27] border border-white/5 p-1" />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
          <Image size={24} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={() => onUpload(endpoint, inputRef, field)} />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} {settings?.[urlKey] ? "Replace" : "Upload"}
        </button>
        {settings?.[urlKey] && (
          <p className="text-xs text-white/40 mt-1 truncate">{settings[urlKey]}</p>
        )}
      </div>
    </div>
  </div>
);

export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("branding");
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savingTabs, setSavingTabs] = useState<Set<string>>(new Set());
  const [uploadingFields, setUploadingFields] = useState<Set<string>>(new Set());
  const [statsJson, setStatsJson] = useState<Array<{ label: string; value: string }>>([]);

  const logoRef = useRef<HTMLInputElement>(null);
  const heroImageRef = useRef<HTMLInputElement>(null);
  const ogImageRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await clientFetch("/api/v1/settings");
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

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => prev ? { ...prev, [key]: value } : null);
  };

  const handleSave = async (tabId: string, keys: string[]) => {
    if (savingTabs.has(tabId)) return;
    setSavingTabs(prev => new Set(prev).add(tabId));
    const payload: Record<string, unknown> = {};
    keys.forEach(k => {
      if (k === "about_stats_json") payload[k] = statsJson;
      else payload[k] = settings?.[k];
    });
    try {
      const data = await clientFetch("/api/v1/settings", {
        method: "PATCH",
        headers: {},
        body: JSON.stringify(payload),
      });
      setSettings(data);
      window.dispatchEvent(new CustomEvent("settings-updated", { detail: data }));
      await revalidateSettings();
      router.refresh();
      toast("Settings saved!", "success");
    } catch {
      toast("Error saving settings", "error");
    } finally {
      setSavingTabs(prev => {
        const next = new Set(prev);
        next.delete(tabId);
        return next;
      });
    }
  };

  const handleFileUpload = async (endpoint: string, ref: React.RefObject<HTMLInputElement | null>, field: string) => {
    const file = ref.current?.files?.[0];
    if (!file || uploadingFields.has(field)) return;
    setUploadingFields(prev => new Set(prev).add(field));
    const formData = new FormData();
    formData.append("file", file);
    try {
      const data = await clientFetch(`api/v1/settings/${endpoint}`, {
        method: "POST",
        headers: {},
        body: formData,
      });
      setSettings(data);
      window.dispatchEvent(new CustomEvent("settings-updated", { detail: data }));
      await revalidateSettings();
      router.refresh();
      toast("Image uploaded!", "success");
    } catch {
      toast("Upload error", "error");
    } finally {
      setUploadingFields(prev => {
        const next = new Set(prev);
        next.delete(field);
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      {/* Header section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Settings className="text-purple-400" size={32} /> Settings
          </h1>
          <p className="text-[#C4C4D4] mt-2 text-lg">
            Manage all website-wide configuration from this panel.
          </p>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="hidden md:flex flex-col gap-1 w-56 shrink-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-left transition-all ${
                activeTab === tab.id
                  ? "bg-purple-600 text-white shadow-lg"
                  : "text-[#C4C4D4] hover:bg-white/5 hover:text-white"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Mobile tabs */}
        <div className="md:hidden flex gap-2 overflow-x-auto pb-2 w-full custom-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? "bg-purple-600 text-white shadow-lg" 
                  : "text-[#C4C4D4] bg-white/5 hover:bg-white/10"
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
          className="flex-1 bg-[#111127] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl"
        >
          {/* ─── BRANDING ─── */}
          {activeTab === "branding" && (
            <>
              <h2 className="text-xl font-bold text-white mb-2">Branding</h2>
              <Field settings={settings} onChange={handleChange} label="Site Name" name="site_name" placeholder="IEDC SNMIMT" />
              <Field settings={settings} onChange={handleChange} label="Site Tagline" name="site_tagline" placeholder="Innovation and Entrepreneurship..." />
              <div className="max-w-md">
                <ImageUploadField settings={settings} onUpload={handleFileUpload} label="Logo" field="logo_url" urlKey="logo_url" inputRef={logoRef} endpoint="logo" isUploading={uploadingFields.has("logo_url")} />
              </div>
              <SaveButton tabId="branding" isSaving={savingTabs.has("branding")} onSave={handleSave} keys={["site_name", "site_tagline"]} />
            </>
          )}

          {/* ─── HERO ─── */}
          {activeTab === "hero" && (
            <>
              <h2 className="text-xl font-bold text-white mb-2">Hero / Homepage</h2>
              <Field settings={settings} onChange={handleChange} label="Hero Title" name="hero_title" placeholder="Hi Everyone, Welcome To IEDC-SNMIMT" />
              <Field settings={settings} onChange={handleChange} label="Hero Subtitle" name="hero_subtitle" type="textarea" placeholder="The Innovation and Entrepreneurship Development Cell..." />
              <Field settings={settings} onChange={handleChange} label="Hero Description" name="hero_description" type="textarea" placeholder="The Innovation and Entrepreneurship Development Centre (IEDC) at SNMIMT is a vibrant student-run community..." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field settings={settings} onChange={handleChange} label="CTA Button Text" name="hero_cta_text" placeholder="View Events" />
                <Field settings={settings} onChange={handleChange} label="CTA Button Link" name="hero_cta_link" placeholder="/events" />
              </div>
              <ImageUploadField settings={settings} onUpload={handleFileUpload} label="Hero Banner Image (optional)" field="hero_image_url" urlKey="hero_image_url" inputRef={heroImageRef} endpoint="hero-image" isUploading={uploadingFields.has("hero_image_url")} />
              <SaveButton tabId="hero" isSaving={savingTabs.has("hero")} onSave={handleSave} keys={["hero_title", "hero_subtitle", "hero_description", "hero_cta_text", "hero_cta_link"]} />
            </>
          )}

          {/* ─── ABOUT ─── */}
          {activeTab === "about" && (
            <>
              <h2 className="text-xl font-bold text-white mb-2">About Section</h2>
              <Field settings={settings} onChange={handleChange} label="About Description" name="about_description" type="textarea" />
              <Field settings={settings} onChange={handleChange} label="Vision Statement" name="about_vision" type="textarea" />
              <div className="pt-2">
                <label className="block text-sm font-medium text-[#C4C4D4] mb-3">Stats / Highlights</label>
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
                        className="w-24 bg-[#0A0E27] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                      />
                      <input
                        value={stat.label}
                        onChange={e => {
                          const next = [...statsJson];
                          next[i] = { ...next[i], label: e.target.value };
                          setStatsJson(next);
                        }}
                        placeholder="Events This Year"
                        className="flex-1 bg-[#0A0E27] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                      />
                      <button 
                        onClick={() => setStatsJson(statsJson.filter((_, j) => j !== i))} 
                        className="text-red-400 hover:text-red-300 p-3 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20 transition-colors"
                        aria-label="Remove Stat"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => setStatsJson([...statsJson, { value: "", label: "" }])} 
                    className="flex items-center gap-2 text-sm font-bold text-purple-400 hover:text-purple-300 mt-4 transition-colors"
                  >
                    <Plus size={16} /> Add Stat
                  </button>
                </div>
              </div>
              <SaveButton tabId="about" isSaving={savingTabs.has("about")} onSave={handleSave} keys={["about_description", "about_vision", "about_stats_json"]} />
            </>
          )}

          {/* ─── SOCIAL MEDIA ─── */}
          {activeTab === "social" && (
            <>
              <h2 className="text-xl font-bold text-white mb-2">Social Media Links</h2>
              <Field settings={settings} onChange={handleChange} label="Facebook URL" name="facebook_url" placeholder="https://facebook.com/..." />
              <Field settings={settings} onChange={handleChange} label="Instagram URL" name="instagram_url" placeholder="https://instagram.com/..." />
              <Field settings={settings} onChange={handleChange} label="Twitter / X URL" name="twitter_url" placeholder="https://twitter.com/..." />
              <Field settings={settings} onChange={handleChange} label="LinkedIn URL" name="linkedin_url" placeholder="https://linkedin.com/..." />
              <Field settings={settings} onChange={handleChange} label="YouTube URL" name="youtube_url" placeholder="https://youtube.com/..." />
              <Field settings={settings} onChange={handleChange} label="GitHub URL" name="github_url" placeholder="https://github.com/..." />
              <Field settings={settings} onChange={handleChange} label="Footer Tagline" name="footer_tagline" placeholder="Building the future, one idea at a time." />
              <SaveButton tabId="social" isSaving={savingTabs.has("social")} onSave={handleSave} keys={["facebook_url", "instagram_url", "twitter_url", "linkedin_url", "youtube_url", "github_url", "footer_tagline"]} />
            </>
          )}

          {/* ─── SEO ─── */}
          {activeTab === "seo" && (
            <>
              <h2 className="text-xl font-bold text-white mb-2">SEO & Open Graph</h2>
              <Field settings={settings} onChange={handleChange} label="SEO Title" name="seo_title" placeholder="IEDC SNMIMT" />
              <Field settings={settings} onChange={handleChange} label="SEO Description" name="seo_description" type="textarea" placeholder="Innovation and Entrepreneurship Development Cell..." />
              <ImageUploadField settings={settings} onUpload={handleFileUpload} label="Open Graph Image (1200×630 recommended)" field="og_image_url" urlKey="og_image_url" inputRef={ogImageRef} endpoint="og-image" isUploading={uploadingFields.has("og_image_url")} />
              <SaveButton tabId="seo" isSaving={savingTabs.has("seo")} onSave={handleSave} keys={["seo_title", "seo_description"]} />
            </>
          )}

          {/* ─── ADVANCED ─── */}
          {activeTab === "advanced" && (
            <>
              <h2 className="text-xl font-bold text-white mb-2">Advanced Settings</h2>
              <Field settings={settings} onChange={handleChange} label="Email From Name" name="email_from_name" placeholder="IEDC SNMIMT" />
              <Field settings={settings} onChange={handleChange} label="Email Reply-To" name="email_reply_to" placeholder="iedcsnmimt@gmail.com" />
              <Field settings={settings} onChange={handleChange} label="Google Analytics ID" name="google_analytics_id" placeholder="G-XXXXXXXXXX" />
              <div className="pt-2">
                <label className="block text-sm font-medium text-[#C4C4D4] mb-3">Maintenance Mode</label>
                <div className="flex items-center gap-4 p-5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                  <div className="flex-1">
                    <p className="text-white text-sm font-bold">Maintenance Mode</p>
                    <p className="text-yellow-200/70 text-xs mt-1">When enabled, the site will show a maintenance notice to visitors.</p>
                  </div>
                  <button
                    onClick={() => handleChange("maintenance_mode", String(!settings?.maintenance_mode))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${settings?.maintenance_mode ? "bg-yellow-500" : "bg-white/10"}`}
                    aria-label="Toggle maintenance mode"
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings?.maintenance_mode ? "translate-x-6" : ""}`} />
                  </button>
                </div>
              </div>
              <SaveButton tabId="advanced" isSaving={savingTabs.has("advanced")} onSave={handleSave} keys={["email_from_name", "email_reply_to", "google_analytics_id", "maintenance_mode"]} />
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
