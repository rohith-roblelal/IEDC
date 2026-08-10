"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { motion } from "framer-motion";
import Image from "next/image";

interface RegistrationFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  event: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function RegistrationForm({ event, onSuccess, onCancel }: RegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const customFields = event?.custom_fields || [];

  // Build dynamic zod schema
  const buildSchema = () => {
    const customAnswersSchema: Record<string, z.ZodTypeAny> = {};
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customFields.forEach((field: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let fSchema: any;
      if (field.type === "email") {
        fSchema = z.string().email("Invalid email");
      } else if (field.type === "number") {
        fSchema = z.string(); // Keep as string for inputs, handle regex if strict
      } else if (field.type === "checkbox") {
        fSchema = z.array(z.string());
      } else {
        fSchema = z.string();
      }

      if (field.type === "iedc_member_check") {
        customAnswersSchema[`${field.id}_screenshot`] = z.string().optional();
      }

      if (field.required) {
        if (field.type === "checkbox") {
          fSchema = fSchema.min(1, "Please select at least one option");
        } else {
          fSchema = fSchema.min(1, "This field is required");
        }
      } else {
        if (field.type === "checkbox") {
          fSchema = fSchema.optional();
        } else {
          fSchema = fSchema.optional().or(z.literal(""));
        }
      }
      customAnswersSchema[field.id] = fSchema;
    });

    return z.object({
      name: z.string().min(2, "Name is required"),
      email: z.string().email("Invalid email address"),
      phone: z.string().min(10, "Phone number must be at least 10 digits"),
      gender: z.enum(["Male", "Female"]),
      year: z.enum(["1", "2", "3", "4"]),
      department: z.enum(["ICE", "ECE", "EEE", "CIVIL", "MECH", "CSE (Ai)", "CSE (Cyber)", "CSE"]),
      has_laptop: z.string().min(1, "Please select an option"),
      custom_answers: z.object(customAnswersSchema).optional(),
    });
  };

  const dynamicSchema = buildSchema();
  type RegistrationData = z.infer<typeof dynamicSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegistrationData>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      custom_answers: customFields.reduce((acc: any, f: any) => {
        if (f.type === "checkbox") acc[f.id] = [];
        else acc[f.id] = "";
        return acc;
      }, {})
    }
  });

  const customAnswersWatch = watch("custom_answers") || {};

  const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentList = (customAnswersWatch as any)[fieldId] || [];
    if (checked) {
      setValue(`custom_answers.${fieldId}`, [...currentList, option], { shouldValidate: true });
    } else {
      setValue(`custom_answers.${fieldId}`, currentList.filter((val: string) => val !== option), { shouldValidate: true });
    }
  };

  const onSubmit = async (data: RegistrationData) => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/v1/events/${event.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          has_laptop: data.has_laptop.toString() === "true",
          is_iedc_member: false,
          custom_answers: data.custom_answers || {},
        }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const errData = await res.json();
        if (Array.isArray(errData.detail)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setErrorMsg(errData.detail.map((e: any) => e.msg).join(", "));
        } else {
            setErrorMsg(errData.detail || "Failed to register. Please try again.");
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomField = (field: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const error = (errors.custom_answers as any)?.[field.id]?.message;

    return (
      <div key={field.id} className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {field.label} {field.required && "*"}
        </label>
        
        {field.type === "short_text" || field.type === "email" || field.type === "number" || field.type === "phone" ? (
          <input 
            type={field.type === "short_text" ? "text" : field.type}
            placeholder={field.placeholder}
            {...register(`custom_answers.${field.id}`)} 
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-[#4F7DF9] focus:border-[#4F7DF9] outline-none transition-all"
          />
        ) : field.type === "long_text" ? (
          <textarea 
            placeholder={field.placeholder}
            {...register(`custom_answers.${field.id}`)} 
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-[#4F7DF9] focus:border-[#4F7DF9] outline-none transition-all"
          />
        ) : field.type === "dropdown" ? (
          <select 
            {...register(`custom_answers.${field.id}`)} 
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-[#4F7DF9] focus:border-[#4F7DF9] outline-none transition-all bg-white"
          >
            <option value="">Select an option</option>
            {field.options?.map((opt: string, i: number) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        ) : field.type === "radio" ? (
          <div className="flex flex-col gap-2 mt-2">
            {field.options?.map((opt: string, i: number) => (
              <label key={i} className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  value={opt} 
                  {...register(`custom_answers.${field.id}`)} 
                  className="w-4 h-4 text-[#4F7DF9]" 
                />
                <span className="text-gray-700">{opt}</span>
              </label>
            ))}
          </div>
        ) : field.type === "checkbox" ? (
          <div className="flex flex-col gap-2 mt-2">
            {field.options?.map((opt: string, i: number) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const currentValues = (customAnswersWatch as any)[field.id] || [];
              const isChecked = currentValues.includes(opt);
              return (
                <label key={i} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isChecked}
                    onChange={(e) => handleCheckboxChange(field.id, opt, e.target.checked)}
                    className="w-4 h-4 text-[#4F7DF9] rounded" 
                  />
                  <span className="text-gray-700">{opt}</span>
                </label>
              );
            })}
          </div>
        ) : field.type === "date" ? (
          <input 
            type="date"
            {...register(`custom_answers.${field.id}`)} 
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-[#4F7DF9] focus:border-[#4F7DF9] outline-none transition-all"
          />
        ) : field.type === "file_upload" ? (
          <div className="text-sm text-gray-500">
            <input 
              type="text" 
              placeholder="Paste file URL here (e.g. Google Drive link)"
              {...register(`custom_answers.${field.id}`)} 
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-[#4F7DF9] focus:border-[#4F7DF9] outline-none transition-all"
            />
          </div>
        ) : field.type === "iedc_member_check" ? (
          <div className="mt-2 flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              {field.options?.map((opt: string, i: number) => (
                <label key={i} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    value={opt} 
                    {...register(`custom_answers.${field.id}`)} 
                    className="w-4 h-4 text-[#4F7DF9]" 
                  />
                  <span className="text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
            {/* Show QR if 'No' is selected */}
            {(customAnswersWatch as any)[field.id] === "No" && field.qr_image_url && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 p-4 border border-blue-500/20 bg-blue-500/5 rounded-lg overflow-hidden"
              >
                <p className="text-sm text-gray-800 mb-3 font-medium">Non-member Payment Required</p>
                <p className="text-xs text-gray-600 mb-3">Please scan the QR code to complete payment, then upload the screenshot below.</p>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="relative w-[150px] aspect-square rounded-lg shadow-sm border border-gray-200 overflow-hidden shrink-0">
                    <Image src={field.qr_image_url} alt="Payment QR Code" fill sizes="150px" className="object-contain" />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Payment Screenshot *</label>
                    <ImageUpload 
                      value={(customAnswersWatch as any)[`${field.id}_screenshot`] || ""}
                      onChange={(url) => setValue(`custom_answers.${field.id}_screenshot`, url, { shouldValidate: true })}
                      folder="events/payments"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ) : null}

        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
          {errorMsg}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input 
          {...register("name")} 
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-[#4F7DF9] focus:border-[#4F7DF9] outline-none transition-all"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email ID *</label>
          <input 
            type="email"
            {...register("email")} 
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-[#4F7DF9] focus:border-[#4F7DF9] outline-none transition-all"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone no. *</label>
          <input 
            {...register("phone")} 
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-[#4F7DF9] focus:border-[#4F7DF9] outline-none transition-all"
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
          <select 
            {...register("gender")} 
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-[#4F7DF9] focus:border-[#4F7DF9] outline-none transition-all bg-white"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
          <select 
            {...register("year")} 
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-[#4F7DF9] focus:border-[#4F7DF9] outline-none transition-all bg-white"
          >
            <option value="">Select Year</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
          {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
        <select 
          {...register("department")} 
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-[#4F7DF9] focus:border-[#4F7DF9] outline-none transition-all bg-white"
        >
          <option value="">Select Department</option>
          <option value="ICE">ICE</option>
          <option value="ECE">ECE</option>
          <option value="EEE">EEE</option>
          <option value="CIVIL">CIVIL</option>
          <option value="MECH">MECH</option>
          <option value="CSE (Ai)">CSE (Ai)</option>
          <option value="CSE (Cyber)">CSE (Cyber)</option>
          <option value="CSE">CSE</option>
        </select>
        {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Are you able to bring your laptop? *</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="true" {...register("has_laptop")} className="w-4 h-4 text-[#4F7DF9]" />
              <span className="text-gray-700">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="false" {...register("has_laptop")} className="w-4 h-4 text-[#4F7DF9]" />
              <span className="text-gray-700">No</span>
            </label>
          </div>
          {errors.has_laptop && <p className="text-red-500 text-xs mt-1">{errors.has_laptop.message}</p>}
        </div>
      </div>

      {/* Render Dynamic Custom Fields */}
      {customFields.length > 0 && (
        <div className="border-t border-gray-200 pt-4 mt-6">
          <h4 className="text-lg font-bold text-gray-900 mb-2">Additional Information</h4>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {customFields.map((field: any) => renderCustomField(field))}
        </div>
      )}

      <div className="pt-4 mt-2 flex gap-3">
        <button 
          type="button" 
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="flex-1 py-3 px-4 bg-[#4F7DF9] text-white rounded-lg font-medium hover:bg-[#3d65ce] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Submitting...
            </>
          ) : "Submit Registration"}
        </button>
      </div>
    </form>
  );
}
