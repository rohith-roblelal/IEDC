"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { galleryApi } from "@/lib/api/gallery";

export default function GalleryClient({ initialImages = [] }: { initialImages?: any[] }) {
  const [images, setImages] = useState<any[]>(initialImages);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-[1100px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center p-4 bg-cyan-500/10 rounded-full mb-6">
            <ImageIcon className="text-cyan-400" size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Event Poster</h1>
          <p className="text-[#C4C4D4] max-w-2xl mx-auto text-lg">
            Posters and highlights from our incredible events.
          </p>
        </motion.div>

        {images.length === 0 ? (
          <div className="text-center text-[#C4C4D4] py-20 bg-[#111432]/50 rounded-3xl border border-white/5">
            <p className="text-xl">No images uploaded yet.</p>
            <p className="mt-2 text-sm">Check back later for exciting photos!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {images.map((img: any, idx) => {
              return (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                  key={img.id} 
                  onClick={() => setSelectedImage(img)}
                  className="group relative rounded-2xl overflow-hidden border border-white/10 bg-[#0A0E27] cursor-pointer aspect-[4/5] shadow-lg"
                >
                  <Image 
                    src={img.image_url} 
                    alt={img.description || ""} 
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 z-10">
                    {img.description && (
                      <p className="text-white text-sm md:text-base font-medium mb-3 line-clamp-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 text-shadow-sm">
                        {img.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75 w-full">
                      <span className="text-white/80 font-medium text-sm">
                        {img.event_id ? "Event Memory" : ""}
                      </span>
                      <span className="text-cyan-400 text-sm ml-auto">
                        {new Date(img.created_at).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 md:p-8 backdrop-blur-md cursor-zoom-out flex-col"
          >
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full backdrop-blur-md transition-colors z-50 focus:outline-none"
            >
              <X size={24} />
            </button>
            <div className="relative max-w-3xl w-full h-full flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <motion.img 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                src={selectedImage.image_url} 
                alt={selectedImage.description || ""} 
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl"
              />
              {selectedImage.description && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 text-center max-w-xl bg-black/50 p-4 rounded-xl border border-white/10 backdrop-blur-md"
                >
                  <p className="text-white text-lg font-medium leading-relaxed">
                    {selectedImage.description}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
