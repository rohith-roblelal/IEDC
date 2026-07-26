"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { AnnouncementsAPI, AnnouncementCreate, AnnouncementUpdate, AnnouncementResponse } from "@/lib/api/announcements";

// Zod Schema for validation
const announcementSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255, "Title is too long"),
  slug: z.string().min(3, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format. Use lowercase letters, numbers, and hyphens."),
  content: z.string().min(10, "Content must be at least 10 characters"),
  is_pinned: z.boolean(),
  is_published: z.boolean(),
  expires_at: z.string().optional().or(z.literal("")),
});

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

interface AnnouncementFormProps {
  initialData?: AnnouncementResponse | null;
  onClose: () => void;
  onSaved: () => void;
  showToast: (msg: string, type: "success" | "error") => void;
}

export function AnnouncementForm({ initialData, onClose, onSaved, showToast }: AnnouncementFormProps) {
  const [isAutoSlug, setIsAutoSlug] = useState(!initialData);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize React Hook Form
  const { register, handleSubmit, watch, setValue, formState: { errors, isDirty } } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      slug: initialData.slug,
      content: initialData.content,
      is_pinned: initialData.is_pinned,
      is_published: initialData.is_published,
      expires_at: initialData.expires_at ? new Date(initialData.expires_at).toISOString().slice(0, 16) : "",
    } : {
      title: "",
      slug: "",
      content: "",
      is_pinned: false,
      is_published: false,
      expires_at: "",
    }
  });

  const title = watch("title");

  // Auto-generate slug
  useEffect(() => {
    if (isAutoSlug && title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setValue("slug", generatedSlug, { shouldValidate: true, shouldDirty: true });
    }
  }, [title, isAutoSlug, setValue]);

  // Handle manual unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const onSubmit = async (data: AnnouncementFormValues) => {
    setIsSaving(true);
    try {
      const payload = {
        ...data,
        expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null,
      };

      if (initialData) {
        await AnnouncementsAPI.updateAnnouncement(initialData.id, payload as AnnouncementUpdate);
        showToast("Announcement updated successfully!", "success");
      } else {
        await AnnouncementsAPI.createAnnouncement(payload as AnnouncementCreate);
        showToast("Announcement created successfully!", "success");
      }
      onSaved();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(err.message || "Failed to save announcement", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (isDirty && !window.confirm("You have unsaved changes. Are you sure you want to discard them?")) {
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={handleClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#0A0E27] border border-white/10 rounded-2xl p-6 w-full max-w-3xl relative z-10 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{initialData ? "Edit Announcement" : "Create Announcement"}</h2>
          <button onClick={handleClose} className="text-[#C4C4D4] hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Title *</label>
              <input 
                {...register("title")}
                placeholder="Announcement Title"
                className="w-full bg-[#111432] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Slug (URL) *</label>
              <div className="flex items-center bg-[#111432] border border-white/10 rounded-lg px-3 overflow-hidden">
                <span className="text-gray-500 text-sm">/announcements/</span>
                <input 
                  {...register("slug")}
                  onChange={(e) => {
                    setValue("slug", e.target.value, { shouldValidate: true, shouldDirty: true });
                    setIsAutoSlug(false);
                  }}
                  className="w-full bg-transparent py-2 text-white focus:outline-none"
                />
              </div>
              {errors.slug && <p className="text-red-400 text-xs mt-1">{errors.slug.message}</p>}
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Expiry Date (Optional)</label>
              <input 
                type="datetime-local" 
                {...register("expires_at")}
                className="w-full bg-[#111432] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Content (Markdown Supported) *</label>
              <textarea 
                rows={10}
                {...register("content")}
                placeholder="Write your announcement content here. You can use markdown for formatting."
                className="w-full bg-[#111432] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 resize-y font-mono text-sm"
              />
              {errors.content && <p className="text-red-400 text-xs mt-1">{errors.content.message}</p>}
            </div>
            
            <div className="md:col-span-1 flex flex-col gap-3">
              <div className="flex items-center gap-3 bg-[#111432] p-4 rounded-lg border border-white/10">
                <input
                  type="checkbox"
                  id="is_published"
                  {...register("is_published")}
                  className="w-5 h-5 rounded border-white/20 bg-transparent text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="is_published" className="text-white font-medium cursor-pointer">
                  Publish
                  <p className="text-sm text-[#C4C4D4] font-normal">Make visible to public.</p>
                </label>
              </div>
            </div>

            <div className="md:col-span-1 flex flex-col gap-3">
              <div className="flex items-center gap-3 bg-[#111432] p-4 rounded-lg border border-white/10">
                <input
                  type="checkbox"
                  id="is_pinned"
                  {...register("is_pinned")}
                  className="w-5 h-5 rounded border-white/20 bg-transparent text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="is_pinned" className="text-white font-medium cursor-pointer">
                  Pin Announcement
                  <p className="text-sm text-[#C4C4D4] font-normal">Show at top of the list.</p>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-white/10 mt-6">
            <button 
              type="button" 
              onClick={handleClose}
              disabled={isSaving}
              className="px-4 py-2 text-[#C4C4D4] hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <LoadingButton 
              type="submit"
              isLoading={isSaving}
              loadingText="Saving..."
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
            >
              {initialData ? "Update" : "Create"}
            </LoadingButton>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
