import { useState } from "react";
import { Plus, X, Lock, Trash2, GripVertical, QrCode, Laptop } from "lucide-react";
import { motion, Reorder } from "framer-motion";
import { ImageUpload } from "@/components/ui/ImageUpload";

export type FieldType = "short_text" | "long_text" | "email" | "phone" | "number" | "radio" | "checkbox" | "dropdown" | "date" | "file_upload" | "iedc_member_check";

export interface CustomField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[]; // Used for radio, checkbox, dropdown
  qr_image_url?: string; // Used for iedc_member_check
}

interface CustomFormBuilderProps {
  fields: CustomField[];
  onChange: (fields: CustomField[]) => void;
}

const STANDARD_FIELDS = [
  { id: "std_name", label: "Name", type: "short_text", required: true },
  { id: "std_email", label: "Email Address", type: "email", required: true },
  { id: "std_phone", label: "Phone Number", type: "phone", required: true },
  { id: "std_gender", label: "Gender", type: "radio", required: true },
  { id: "std_year", label: "Year of Study", type: "dropdown", required: true },
  { id: "std_dept", label: "Department", type: "dropdown", required: true },
];

export function CustomFormBuilder({ fields, onChange }: CustomFormBuilderProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const addField = (type: FieldType | "laptop_requirement") => {
    const isIedcCheck = type === "iedc_member_check";
    const isLaptop = type === "laptop_requirement";
    const actualType = isLaptop ? "radio" : (type as FieldType);

    const newField: CustomField = {
      id: Math.random().toString(36).substring(7),
      label: isIedcCheck ? "Are you an IEDC member?" : isLaptop ? "Are you able to bring your laptop?" : "New Question",
      type: actualType,
      required: isIedcCheck || isLaptop,
      placeholder: ["short_text", "long_text", "number"].includes(actualType) ? "" : undefined,
      options: ["radio", "checkbox", "dropdown", "iedc_member_check"].includes(actualType)
        ? (isIedcCheck || isLaptop ? ["Yes", "No"] : ["Option 1"])
        : undefined,
    };
    onChange([...(fields || []), newField]);
    setEditingId(newField.id);
  };

  const updateField = (id: string, updates: Partial<CustomField>) => {
    onChange(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    onChange(fields.filter(f => f.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const renderFieldTypeIcon = (type: string) => {
    return <span className="text-xs text-[#C4C4D4] bg-white/10 px-2 py-0.5 rounded ml-2">{type.replace('_', ' ')}</span>;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-4">
      {/* Left Column: Add Fields */}
      <div className="md:col-span-3 space-y-2">
        <h4 className="text-xs font-semibold text-[#C4C4D4] uppercase tracking-wider mb-3">Add Fields</h4>
        
        <button type="button" onClick={() => addField("short_text")} className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-md text-sm border border-transparent hover:border-white/10 transition-colors flex items-center justify-between group">
          <span>Short Text</span> <Plus size={14} className="opacity-0 group-hover:opacity-100" />
        </button>
        <button type="button" onClick={() => addField("long_text")} className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-md text-sm border border-transparent hover:border-white/10 transition-colors flex items-center justify-between group">
          <span>Long Text</span> <Plus size={14} className="opacity-0 group-hover:opacity-100" />
        </button>
        <button type="button" onClick={() => addField("radio")} className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-md text-sm border border-transparent hover:border-white/10 transition-colors flex items-center justify-between group">
          <span>Radio Buttons</span> <Plus size={14} className="opacity-0 group-hover:opacity-100" />
        </button>
        <button type="button" onClick={() => addField("checkbox")} className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-md text-sm border border-transparent hover:border-white/10 transition-colors flex items-center justify-between group">
          <span>Checkboxes</span> <Plus size={14} className="opacity-0 group-hover:opacity-100" />
        </button>
        <button type="button" onClick={() => addField("dropdown")} className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-md text-sm border border-transparent hover:border-white/10 transition-colors flex items-center justify-between group">
          <span>Dropdown</span> <Plus size={14} className="opacity-0 group-hover:opacity-100" />
        </button>

        <button type="button" onClick={() => addField("file_upload")} className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-md text-sm border border-transparent hover:border-white/10 transition-colors flex items-center justify-between group">
          <span>File Upload</span> <Plus size={14} className="opacity-0 group-hover:opacity-100" />
        </button>
        
        <div className="pt-2 mt-2 border-t border-white/10">
          <h4 className="text-[10px] font-semibold text-[#4F7DF9] uppercase tracking-wider mb-2">Special Fields</h4>
          <button type="button" onClick={() => addField("iedc_member_check")} className="w-full text-left px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-md text-sm border border-transparent hover:border-blue-500/30 transition-colors flex items-center justify-between group mb-2">
            <span className="flex items-center gap-1.5"><QrCode size={14} /> IEDC Check & QR</span> <Plus size={14} className="opacity-0 group-hover:opacity-100" />
          </button>
          <button type="button" onClick={() => addField("laptop_requirement")} className="w-full text-left px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-md text-sm border border-transparent hover:border-blue-500/30 transition-colors flex items-center justify-between group">
            <span className="flex items-center gap-1.5"><Laptop size={14} /> Laptop Required</span> <Plus size={14} className="opacity-0 group-hover:opacity-100" />
          </button>
        </div>
      </div>

      {/* Right Column: Form Fields */}
      <div className="md:col-span-9 space-y-3">
        <h4 className="text-xs font-semibold text-[#C4C4D4] uppercase tracking-wider mb-3">Your Form Fields</h4>
        
        {/* Standard Fields (Locked) */}
        <div className="space-y-2 mb-6">
          {STANDARD_FIELDS.map((field) => (
            <div key={field.id} className="bg-black/20 border border-white/5 rounded-lg p-3 flex items-center justify-between opacity-70">
              <div className="flex items-center gap-3">
                <Lock size={14} className="text-[#C4C4D4]" />
                <span className="font-medium text-sm">{field.label}</span>
                <span className="text-red-400 text-xs">*</span>
                {renderFieldTypeIcon(field.type)}
              </div>
              <span className="text-xs text-[#C4C4D4] italic">Standard Field</span>
            </div>
          ))}
        </div>
        
        {/* Custom Fields */}
        <div className="space-y-3">
          {(fields || []).map((field, idx) => (
            <div key={field.id} className="bg-[#1A1D3D] border border-blue-500/20 rounded-xl overflow-hidden shadow-sm">
              <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setEditingId(editingId === field.id ? null : field.id)}>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>
                  <span className="font-medium">{field.label}</span>
                  {field.required && <span className="text-red-400 text-xs">*</span>}
                  {renderFieldTypeIcon(field.type)}
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeField(field.id); }} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-md transition-colors" title="Remove Field">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {editingId === field.id && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="p-4 border-t border-white/5 bg-black/20 space-y-4"
                >
                  <div>
                    <label className="block text-xs font-medium text-[#C4C4D4] mb-1">Question Label</label>
                    <input type="text" value={field.label} onChange={e => updateField(field.id, { label: e.target.value })} className="w-full bg-[#111432] border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none" />
                  </div>
                  
                  {["short_text", "long_text", "number"].includes(field.type) && (
                    <div>
                      <label className="block text-xs font-medium text-[#C4C4D4] mb-1">Placeholder Text (Optional)</label>
                      <input type="text" value={field.placeholder || ""} onChange={e => updateField(field.id, { placeholder: e.target.value })} className="w-full bg-[#111432] border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none" />
                    </div>
                  )}

                  {field.type === "file_upload" && (
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10 mt-2">
                      <label className="block text-xs font-medium text-[#C4C4D4] mb-2">
                        Accepted File Types (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. .pdf, .jpg, .png"
                        value={field.placeholder || ""}
                        onChange={e => updateField(field.id, { placeholder: e.target.value })}
                        className="w-full bg-[#111432] border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                      />
                      <p className="text-xs text-[#C4C4D4]/50 mt-2">
                        Leave empty to accept all file types. The registrant will see a file picker when filling the form.
                      </p>
                    </div>
                  )}

                  {field.type === "iedc_member_check" && (
                    <div className="bg-blue-500/5 p-4 rounded-lg border border-blue-500/20 mt-2">
                      <label className="block text-sm font-medium text-blue-400 mb-2">Non-Member Payment QR Code</label>
                      <p className="text-xs text-[#C4C4D4] mb-4">
                        If the user selects &quot;No&quot;, this QR code will be displayed for them to pay before proceeding.
                      </p>
                      <ImageUpload 
                        value={field.qr_image_url || ""}
                        onChange={(url) => updateField(field.id, { qr_image_url: url })}
                        folder="events/qr"
                      />
                    </div>
                  )}

                  {["radio", "checkbox", "dropdown"].includes(field.type) && (
                    <div>
                      <label className="block text-xs font-medium text-[#C4C4D4] mb-2">Options</label>
                      <div className="space-y-2">
                        {field.options?.map((opt, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input 
                              type="text" 
                              value={opt} 
                              onChange={e => {
                                const newOptions = [...(field.options || [])];
                                newOptions[i] = e.target.value;
                                updateField(field.id, { options: newOptions });
                              }} 
                              className="flex-1 bg-[#111432] border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:border-blue-500 outline-none" 
                            />
                            <button 
                              type="button"
                              onClick={() => {
                                const newOptions = [...(field.options || [])];
                                newOptions.splice(i, 1);
                                updateField(field.id, { options: newOptions });
                              }}
                              className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-md transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                        <button 
                          type="button" 
                          onClick={() => {
                            const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
                            updateField(field.id, { options: newOptions });
                          }}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 mt-2 bg-blue-500/10 px-3 py-1.5 rounded-md"
                        >
                          <Plus size={14} /> Add Option
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" checked={field.required} onChange={e => updateField(field.id, { required: e.target.checked })} id={`req-${field.id}`} className="accent-blue-500 w-4 h-4" />
                    <label htmlFor={`req-${field.id}`} className="text-sm text-white cursor-pointer">Required field</label>
                  </div>
                </motion.div>
              )}
            </div>
          ))}
          
          {(!fields || fields.length === 0) && (
            <div className="text-center py-8 border border-dashed border-white/10 rounded-xl text-[#C4C4D4] text-sm bg-white/5">
              No custom fields added yet. Choose a field type from the left to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
