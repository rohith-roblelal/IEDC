import { useState } from "react";
import { Plus, X, GripVertical, Trash2, Settings2 } from "lucide-react";
import { motion, Reorder } from "framer-motion";

export type FieldType = "short_text" | "long_text" | "email" | "phone" | "number" | "radio" | "checkbox" | "dropdown" | "date" | "file_upload";

export interface CustomField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[]; // Used for radio, checkbox, dropdown
}

interface CustomFormBuilderProps {
  fields: CustomField[];
  onChange: (fields: CustomField[]) => void;
}

export function CustomFormBuilder({ fields, onChange }: CustomFormBuilderProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const addField = (type: FieldType) => {
    const newField: CustomField = {
      id: Math.random().toString(36).substring(7),
      label: "New Question",
      type,
      required: false,
      options: ["radio", "checkbox", "dropdown"].includes(type) ? ["Option 1"] : [],
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

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button type="button" onClick={() => addField("short_text")} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-md text-xs whitespace-nowrap">+ Short Text</button>
        <button type="button" onClick={() => addField("long_text")} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-md text-xs whitespace-nowrap">+ Long Text</button>
        <button type="button" onClick={() => addField("radio")} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-md text-xs whitespace-nowrap">+ Radio</button>
        <button type="button" onClick={() => addField("checkbox")} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-md text-xs whitespace-nowrap">+ Checkbox</button>
        <button type="button" onClick={() => addField("dropdown")} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-md text-xs whitespace-nowrap">+ Dropdown</button>
        <button type="button" onClick={() => addField("date")} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-md text-xs whitespace-nowrap">+ Date</button>
        <button type="button" onClick={() => addField("file_upload")} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-md text-xs whitespace-nowrap">+ File Upload</button>
      </div>

      <div className="space-y-3">
        {(fields || []).map((field, idx) => (
          <div key={field.id} className="bg-[#1A1D3D] border border-white/10 rounded-xl overflow-hidden">
            <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/5" onClick={() => setEditingId(editingId === field.id ? null : field.id)}>
              <div className="flex items-center gap-3">
                <span className="text-[#C4C4D4] font-medium text-sm">{idx + 1}.</span>
                <span className="font-medium">{field.label}</span>
                {field.required && <span className="text-red-400 text-xs">*</span>}
                <span className="text-xs text-[#C4C4D4] bg-white/10 px-2 py-0.5 rounded">{field.type.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={(e) => { e.stopPropagation(); removeField(field.id); }} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-md">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {editingId === field.id && (
              <div className="p-4 border-t border-white/5 bg-black/20 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#C4C4D4] mb-1">Question Label</label>
                  <input type="text" value={field.label} onChange={e => updateField(field.id, { label: e.target.value })} className="w-full bg-[#111432] border border-white/10 rounded px-3 py-1.5 text-sm text-white" />
                </div>
                
                {["short_text", "long_text", "number"].includes(field.type) && (
                  <div>
                    <label className="block text-xs font-medium text-[#C4C4D4] mb-1">Placeholder</label>
                    <input type="text" value={field.placeholder || ""} onChange={e => updateField(field.id, { placeholder: e.target.value })} className="w-full bg-[#111432] border border-white/10 rounded px-3 py-1.5 text-sm text-white" />
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
                            className="flex-1 bg-[#111432] border border-white/10 rounded px-3 py-1.5 text-sm text-white" 
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              const newOptions = [...(field.options || [])];
                              newOptions.splice(i, 1);
                              updateField(field.id, { options: newOptions });
                            }}
                            className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-md"
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
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 mt-1"
                      >
                        <Plus size={14} /> Add Option
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={field.required} onChange={e => updateField(field.id, { required: e.target.checked })} id={`req-${field.id}`} />
                  <label htmlFor={`req-${field.id}`} className="text-sm text-[#C4C4D4]">Required field</label>
                </div>
              </div>
            )}
          </div>
        ))}
        {(!fields || fields.length === 0) && (
          <div className="text-center py-6 border border-dashed border-white/10 rounded-xl text-[#C4C4D4] text-sm">
            No custom fields added yet. Choose a field type above to get started.
          </div>
        )}
      </div>
    </div>
  );
}
