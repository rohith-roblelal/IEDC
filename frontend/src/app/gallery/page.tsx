"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, X } from "lucide-react";

export default function PublicGalleryPage() {
  const [images, setImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
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
    fetchImages();
  }, []);

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

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center text-[#C4C4D4] py-20 bg-[#111432]/50 rounded-3xl border border-white/5">
            <p className="text-xl">No images uploaded yet.</p>
            <p className="mt-2 text-sm">Check back later for exciting photos!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[250px]">
            {images.map((img: any, idx) => {
              // Creating a dynamic masonry feel by spanning some images across multiple rows/cols randomly based on index
              const isLarge = idx % 7 === 0;
              const isWide = idx % 5 === 0 && !isLarge;
              
              return (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                  key={img.id} 
                  onClick={() => setSelectedImage(img.image_url)}
                  className={`group relative rounded-2xl overflow-hidden border border-white/10 bg-[#0A0E27] cursor-pointer 
                    ${isLarge ? 'md:col-span-2 md:row-span-2' : ''} 
                    ${isWide ? 'md:col-span-2' : ''}`}
                >
                  <img 
                    src={img.image_url} 
                    alt="Gallery item" 
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" 
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <span className="text-white font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      {img.event_id ? "Event Memory" : "IEDC Snapshot"}
                    </span>
                    <span className="text-cyan-400 text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                      {new Date(img.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                    </span>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 md:p-12 backdrop-blur-sm cursor-zoom-out"
          >
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 p-2 rounded-full backdrop-blur-md transition-colors z-50"
            >
              <X size={28} />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={selectedImage} 
              alt="Enlarged view" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
