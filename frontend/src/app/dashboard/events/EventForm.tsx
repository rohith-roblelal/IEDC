"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import { EventsAPI, EventCreate, EventUpdate, EventResponse } from "@/lib/api/events";

// Zod Schema for validation
const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title is too long"),
  slug: z.string().min(3, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format. Use lowercase letters, numbers, and hyphens."),
  short_description: z.string().max(250, "Short description must be max 250 characters").optional().or(z.literal("")),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum(["WORKSHOP", "HACKATHON", "SEMINAR", "COMPETITION", "EXHIBITION", "OTHER"]),
  venue: z.string().optional().or(z.literal("")),
  start_datetime: z.string().min(1, "Start date is required"),
  end_datetime: z.string().min(1, "End date is required"),
  is_published: z.boolean(),
  banner_image_url: z.string().optional().or(z.literal("")),
  registration_deadline: z.string().optional().or(z.literal("")),
  max_participants: z.coerce.number().min(1).optional().or(z.literal("").transform(() => undefined)),
  registration_link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
}).refine((data) => {
  const start = new Date(data.start_datetime);
  const end = new Date(data.end_datetime);
  return end > start;
}, {
  message: "End date must be after start date",
  path: ["end_datetime"],
});

type EventFormValues = z.infer<typeof eventSchema>;

interface EventFormProps {
  initialData?: EventResponse | null;
  onClose: () => void;
  onSaved: () => void;
  showToast: (msg: string, type: "success" | "error") => void;
}

export function EventForm({ initialData, onClose, onSaved, showToast }: EventFormProps) {
  const confirm = useConfirm();
  const [isAutoSlug, setIsAutoSlug] = useState(!initialData);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize React Hook Form
  const { register, handleSubmit, watch, setValue, formState: { errors, isDirty } } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema as any),
    defaultValues: initialData ? {
      title: initialData.title,
      slug: initialData.slug,
      short_description: initialData.short_description || "",
      description: initialData.description,
      category: initialData.category,
      venue: initialData.venue || "",
      start_datetime: new Date(initialData.start_datetime).toISOString().slice(0, 16),
      end_datetime: new Date(initialData.end_datetime).toISOString().slice(0, 16),
      is_published: initialData.is_published,
      banner_image_url: initialData.banner_image_url || "",
      registration_deadline: initialData.registration_deadline ? new Date(initialData.registration_deadline).toISOString().slice(0, 16) : "",
      max_participants: initialData.max_participants || undefined,
      registration_link: initialData.registration_link || "",
    } : {
      title: "",
      slug: "",
      short_description: "",
      description: "",
      category: "WORKSHOP",
      venue: "",
      start_datetime: "",
      end_datetime: "",
      is_published: false,
      banner_image_url: "",
      registration_deadline: "",
      max_participants: undefined,
      registration_link: "",
    }
  });

  const title = watch("title");
  const banner_image_url = watch("banner_image_url");

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

  const onSubmit = async (data: EventFormValues) => {
    setIsSaving(true);
    try {
      const payload = {
        ...data,
        start_datetime: new Date(data.start_datetime).toISOString(),
        end_datetime: new Date(data.end_datetime).toISOString(),
        registration_deadline: data.registration_deadline ? new Date(data.registration_deadline).toISOString() : undefined,
      };

      if (initialData) {
        await EventsAPI.updateEvent(initialData.id, payload as EventUpdate);
        showToast("Event updated successfully!", "success");
      } else {
        await EventsAPI.createEvent(payload as EventCreate);
        showToast("Event created successfully!", "success");
      }
      onSaved();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(err.message || "Failed to save event", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = async () => {
    if (isDirty && !(await confirm("You have unsaved changes. Are you sure you want to discard them?"))) {
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
          <h2 className="text-xl font-bold">{initialData ? "Edit Event" : "Create Event"}</h2>
          <button onClick={handleClose} className="text-[#C4C4D4] hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Event Banner</label>
            <ImageUpload 
              value={banner_image_url || ""}
              onChange={(url) => setValue("banner_image_url", url, { shouldDirty: true })}
              folder="events"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Event Title *</label>
              <input 
                {...register("title")}
                className="w-full bg-[#111432] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Slug (URL) *</label>
              <div className="flex items-center bg-[#111432] border border-white/10 rounded-lg px-3 overflow-hidden">
                <span className="text-gray-500 text-sm">/events/</span>
                <input 
                  {...register("slug")}
                  onChange={(e) => {
                    setValue("slug", e.target.value, { shouldValidate: true, shouldDirty: true });
                    setIsAutoSlug(false); // Stop auto-generating if manually edited
                  }}
                  className="w-full bg-transparent py-2 text-white focus:outline-none"
                />
              </div>
              {errors.slug && <p className="text-red-400 text-xs mt-1">{errors.slug.message}</p>}
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Category *</label>
              <select 
                {...register("category")}
                className="w-full bg-[#111432] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="WORKSHOP">Workshop</option>
                <option value="HACKATHON">Hackathon</option>
                <option value="SEMINAR">Seminar</option>
                <option value="COMPETITION">Competition</option>
                <option value="EXHIBITION">Exhibition</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category.message}</p>}
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Venue</label>
              <input 
                {...register("venue")}
                placeholder="Online, Auditorium, etc."
                className="w-full bg-[#111432] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Start Date/Time *</label>
              <input 
                type="datetime-local" 
                {...register("start_datetime")}
                className="w-full bg-[#111432] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
              {errors.start_datetime && <p className="text-red-400 text-xs mt-1">{errors.start_datetime.message}</p>}
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-[#C4C4D4] mb-1">End Date/Time *</label>
              <input 
                type="datetime-local" 
                {...register("end_datetime")}
                className="w-full bg-[#111432] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
              {errors.end_datetime && <p className="text-red-400 text-xs mt-1">{errors.end_datetime.message}</p>}
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Registration Deadline</label>
              <input 
                type="datetime-local" 
                {...register("registration_deadline")}
                className="w-full bg-[#111432] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Max Participants</label>
              <input 
                type="number"
                placeholder="Leave empty for unlimited"
                {...register("max_participants")}
                className="w-full bg-[#111432] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Registration/External Link</label>
              <input 
                type="url"
                placeholder="https://docs.google.com/forms/..."
                {...register("registration_link")}
                className="w-full bg-[#111432] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
              {errors.registration_link && <p className="text-red-400 text-xs mt-1">{errors.registration_link.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Short Description</label>
              <input 
                {...register("short_description")}
                placeholder="Brief summary for cards"
                className="w-full bg-[#111432] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
              {errors.short_description && <p className="text-red-400 text-xs mt-1">{errors.short_description.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#C4C4D4] mb-1">Detailed Description *</label>
              <textarea 
                rows={4}
                {...register("description")}
                className="w-full bg-[#111432] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 resize-y"
              />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
            </div>
            
            <div className="md:col-span-2 flex items-center gap-3 bg-[#111432] p-4 rounded-lg border border-white/10">
              <input
                type="checkbox"
                id="is_published"
                {...register("is_published")}
                className="w-5 h-5 rounded border-white/20 bg-transparent text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="is_published" className="text-white font-medium cursor-pointer">
                Publish Event
                <p className="text-sm text-[#C4C4D4] font-normal">If unchecked, this event will be saved as a draft.</p>
              </label>
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
              {initialData ? "Update Event" : "Create Event"}
            </LoadingButton>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
