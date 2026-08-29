"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { clientFetch } from "@/lib/api/client";
import NextImage from "next/image";

interface ImageUploadProps {
  value: string | null | undefined;
  onChange: (url: string) => void;
  folder: string; // e.g. "team/123"
}

export function ImageUpload({ value, onChange, folder }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setError(null);
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      const data = await clientFetch("/api/v1/upload", {
        method: "POST",
        body: formData,
      });

      onChange(data.url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    onChange("");
  };

  return (
    <div className="w-full">
      {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
      
      {value ? (
        <div className="relative rounded-xl border border-white/10 overflow-hidden bg-[#0D1030] group w-full aspect-video md:aspect-auto md:h-48">
          <NextImage src={value} alt="" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={removeImage}
              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={onDragOver}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isUploading ? "border-purple-500 bg-purple-500/10" : "border-white/20 hover:border-purple-500/50 hover:bg-white/5"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleUpload(e.target.files[0]);
              }
            }}
            disabled={isUploading}
          />
          {isUploading ? (
            <div className="flex flex-col items-center gap-3 text-purple-400">
              <Loader2 className="animate-spin" size={32} />
              <span className="font-medium">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-[#C4C4D4]">
              <UploadCloud size={32} className="text-purple-400" />
              <div>
                <p className="font-medium text-white mb-1">Click to upload or drag and drop</p>
                <p className="text-sm">JPG, PNG, WEBP (Max 5MB)</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
