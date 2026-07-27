const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/dashboard/settings/page.tsx', 'utf8');

// Remove definitions
const startRemove = code.indexOf('  const SaveButton =');
const endRemove = code.indexOf('  return (', startRemove);
if (startRemove > -1 && endRemove > -1) {
    code = code.substring(0, startRemove) + code.substring(endRemove);
}

// Add components before export default
const components = `
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
`;

code = code.replace('export default function SettingsPage() {', components + '\nexport default function SettingsPage() {');

// Replace usages safely
code = code.replace(/<Field /g, '<Field settings={settings} onChange={handleChange} ');
code = code.replace(/<ImageUploadField /g, '<ImageUploadField settings={settings} onUpload={handleFileUpload} ');
code = code.replace(/<SaveButton /g, '<SaveButton isSaving={isSaving} onSave={handleSave} ');

fs.writeFileSync('frontend/src/app/dashboard/settings/page.tsx', code);
console.log("Success");
