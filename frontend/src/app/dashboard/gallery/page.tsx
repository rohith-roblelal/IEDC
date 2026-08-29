"use client";

import { useEffect, useState, useRef } from "react";
import { Image as ImageIcon, Trash2, X, UploadCloud, Loader2, Plus, FileImage } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import { galleryApi, GalleryImage } from "@/lib/api/gallery";
import Image from "next/image";

export default function GalleryPage() {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    try {
      const res = await galleryApi.getImages();
      const items = Array.isArray(res) ? res : (res.items ?? []);
      setImages(items);
    } catch (err) {
      console.error(err);
      toast("Failed to load images", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    
    if (!selectedFile) {
      setError("Please select an image first");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("is_published", "true");
      if (description.trim()) {
        formData.append("description", description.trim());
      }
      
      await galleryApi.uploadImage(formData);
      await fetchImages();
      
      // Reset state and close modal
      setSelectedFile(null);
      setDescription("");
      setIsModalOpen(false);
      toast("Image uploaded successfully", "success");
    } catch (err: unknown) {
      console.error(err);
      setError("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (processingIds.has(id)) return;
    if (!(await confirm("Are you sure you want to delete this image?"))) return;
    
    setProcessingIds(prev => new Set(prev).add(id));
    try {
      await galleryApi.deleteImage(id);
      await fetchImages();
      toast("Image deleted successfully", "success");
    } catch (err) {
      console.error(err);
      toast("Failed to delete image", "error");
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setError(null);
    setSelectedFile(null);
    setDescription("");
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      {/* Header section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            Event Posters
          </h1>
          <p className="text-[#C4C4D4] mt-2 text-lg">
            Manage uploaded event posters and gallery images.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-5 py-2.5 rounded-lg font-bold text-sm transition-colors border border-purple-500/20 shrink-0"
        >
          <UploadCloud size={18} />
          Upload Image
        </button>
      </header>

      {/* Main Content Area */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-square bg-[#111127] border border-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="bg-[#111127] rounded-xl border border-white/5 shadow-2xl flex flex-col items-center justify-center h-[400px] text-center px-6">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <ImageIcon className="text-[#C4C4D4]/50" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No images found</h3>
            <p className="text-[#C4C4D4] mb-6 max-w-md">
              You haven't uploaded any event posters or gallery images yet.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors border border-white/5"
            >
              <UploadCloud size={18} />
              Upload Image
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {images.map((img: GalleryImage, idx) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                key={img.id} 
                className="group relative rounded-2xl overflow-hidden border border-white/5 bg-[#111127] shadow-lg aspect-[4/5]"
              >
                <div className="absolute inset-0 z-0">
                  <Image 
                    src={img.image_url} 
                    alt={img.description || ""} 
                    fill 
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                </div>
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E27]/95 via-[#0A0E27]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col justify-between p-3">
                  <div className="self-end">
                    <button 
                      onClick={() => handleDelete(img.id)}
                      disabled={processingIds.has(img.id)}
                      className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-colors backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      aria-label="Delete image"
                    >
                      {processingIds.has(img.id) ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {img.description && (
                      <p className="text-white text-xs px-2 line-clamp-3 text-shadow-sm">{img.description}</p>
                    )}
                    <div className="text-[0.65rem] font-bold text-white/80 uppercase tracking-wider bg-white/10 p-1.5 rounded-lg backdrop-blur-md border border-white/10 text-center shadow-lg w-max mx-auto">
                      {img.event_id ? "Event Image" : "General"}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#0A0E27]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0A0E27] border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative my-4"
            >
              <button 
                onClick={handleCloseModal}
                className="absolute top-6 right-6 p-2 text-[#C4C4D4] hover:text-white hover:bg-white/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <X size={20} />
              </button>
              
              <h2 className="text-2xl font-bold mb-2 text-white flex items-center gap-3">
                <div className="p-1.5 bg-purple-500/10 rounded-lg">
                  <UploadCloud className="text-purple-400" size={24} />
                </div>
                Upload Poster
              </h2>
              <p className="text-[#C4C4D4] text-sm mb-6">Select an image to add to the public gallery.</p>
              
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleUpload} className="space-y-6">
                {!selectedFile ? (
                  <div
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 border-white/10 hover:border-purple-500/40 hover:bg-white/[0.02]"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                    />
                    
                    <div className="flex flex-col items-center gap-4 text-[#C4C4D4]">
                      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/5 flex items-center justify-center">
                        <UploadCloud size={32} className="text-purple-400" />
                      </div>
                      <div>
                        <p className="font-bold text-white mb-1">Click to select or drag and drop</p>
                        <p className="text-xs tracking-wider uppercase opacity-60">JPG, PNG, WEBP (Max 5MB)</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border border-white/10 rounded-2xl p-6 bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                        <FileImage className="text-purple-400" size={24} />
                      </div>
                      <div className="truncate">
                        <p className="text-white font-medium truncate">{selectedFile.name}</p>
                        <p className="text-[#C4C4D4] text-xs">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="p-2 text-[#C4C4D4] hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors shrink-0"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
                
                <div>
                  <label htmlFor="description" className="block text-xs font-bold text-[#C4C4D4] mb-1.5 uppercase tracking-wider">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-[#111127] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-sm resize-none custom-scrollbar"
                    placeholder="E.g., Keynote poster for the annual tech summit..."
                  />
                </div>
                
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isUploading}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || !selectedFile}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-xl font-bold transition-colors disabled:opacity-50 flex justify-center items-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#0A0E27] text-sm"
                  >
                    {isUploading ? (
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Upload Poster"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
