"use client";

import { useEffect, useState, useRef } from "react";
import { Image as ImageIcon, Trash2, X, UploadCloud, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GalleryPage() {
  const [images, setImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/gallery/");
      if (res.ok) {
        const data = await res.json();
        setImages(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

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
      formData.append("folder", "gallery");

      const token = localStorage.getItem("access_token");
      const res = await fetch("http://127.0.0.1:8000/api/v1/gallery/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      await fetchImages();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      setError("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/gallery/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        fetchImages();
      } else {
        alert("Failed to delete image");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ImageIcon className="text-cyan-400" /> Event Poster Manager
          </h1>
          <p className="text-[#C4C4D4] mt-2">Manage uploaded event posters.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Upload Image
        </button>
      </div>

      <div className="bg-[#111432] rounded-2xl border border-white/10 p-6">
        {isLoading ? (
          <div className="text-center text-[#C4C4D4] py-8">Loading posters...</div>
        ) : images.length === 0 ? (
          <div className="text-center text-[#C4C4D4] py-8">No images found.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img: any, idx) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                key={img.id} 
                className="group relative rounded-xl overflow-hidden border border-white/10 aspect-square bg-[#0A0E27]"
              >
                <img src={img.image_url} alt="Gallery item" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                  <div className="self-end">
                    <button 
                      onClick={() => handleDelete(img.id)}
                      className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors backdrop-blur-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="text-xs text-white bg-black/40 p-1.5 rounded backdrop-blur-md truncate text-center">
                    {img.event_id ? "Event Image" : "General"}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1A1D3D] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative"
            >
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setError(null);
                }}
                className="absolute top-4 right-4 text-[#C4C4D4] hover:text-white"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-bold mb-2 text-white flex items-center gap-2">
                <UploadCloud className="text-cyan-400" /> Upload Image
              </h2>
              <p className="text-[#C4C4D4] text-sm mb-6">Select an image to add to the public gallery.</p>
              
              {error && <p className="text-red-400 text-sm mb-4 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}

              <div
                onDragOver={onDragOver}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                  isUploading ? "border-cyan-500 bg-cyan-500/10" : "border-white/20 hover:border-cyan-500/50 hover:bg-white/5"
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
                  <div className="flex flex-col items-center gap-3 text-cyan-400">
                    <Loader2 className="animate-spin" size={36} />
                    <span className="font-medium">Uploading to Gallery...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-[#C4C4D4]">
                    <UploadCloud size={40} className="text-cyan-400" />
                    <div>
                      <p className="font-medium text-white mb-1">Click to upload or drag and drop</p>
                      <p className="text-sm">JPG, PNG, WEBP (Max 5MB)</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
