"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Maximize2, ZoomIn, ZoomOut } from "lucide-react";

interface GalleryViewerProps {
  images: string[];
  title: string;
}

export default function GalleryViewer({ images, title }: GalleryViewerProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (idx: number) => {
    setSelectedIndex(idx);
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
    document.body.style.overflow = "";
  };

  const nextImage = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex]);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-12">
        {images.map((imgUrl, idx) => (
          <div 
            key={idx} 
            className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 cursor-pointer group relative border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300"
            onClick={() => openLightbox(idx)}
          >
            <img 
              src={imgUrl} 
              alt={`${title} - ภาพที่ ${idx + 1}`} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" 
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
               <Maximize2 className="w-8 h-8 text-white drop-shadow-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-200 backdrop-blur-xl">
          <div className="absolute top-4 right-4 z-50 flex items-center gap-4 text-white/60">
             <span className="text-sm font-semibold hidden sm:inline-block">
                ภาพที่ {selectedIndex + 1} จาก {images.length}
             </span>
             <button 
               onClick={closeLightbox} 
               className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 hover:text-white transition-colors"
             >
               <X className="w-6 h-6" />
             </button>
          </div>

          <div className="relative w-full max-w-7xl h-full flex flex-col pb-safe">
             {/* Main Image Container */}
             <div className="flex-1 min-h-0 relative flex items-center justify-center p-4 sm:p-12">
                 {/* Navigation Buttons */}
                 <button 
                   onClick={(e) => { e.stopPropagation(); prevImage(); }}
                   className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-white/20 text-white transition-colors border border-white/10 z-10"
                 >
                   <ChevronLeft className="w-8 h-8" />
                 </button>
                 
                 <img 
                   src={images[selectedIndex]} 
                   alt={`${title} - ภาพที่ ${selectedIndex + 1}`}
                   className="max-w-full max-h-full object-contain rounded-lg select-none drop-shadow-2xl animate-in zoom-in-95 duration-200"
                   onClick={(e) => { e.stopPropagation(); nextImage(); }}
                 />

                 <button 
                   onClick={(e) => { e.stopPropagation(); nextImage(); }}
                   className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-white/20 text-white transition-colors border border-white/10 z-10"
                 >
                   <ChevronRight className="w-8 h-8" />
                 </button>
             </div>

             {/* Thumbnails preview stripe */}
             <div className="w-full flex justify-center gap-2 p-4 h-28 overflow-x-auto shrink-0 bg-gradient-to-t from-black via-black/80 to-transparent">
                 {images.map((imgUrl, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setSelectedIndex(idx)}
                      className={`h-full aspect-[4/3] shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 ${idx === selectedIndex ? "border-white scale-105 opacity-100" : "border-transparent opacity-40 hover:opacity-100"}`}
                    >
                       <img src={imgUrl} className="w-full h-full object-cover" />
                    </button>
                 ))}
             </div>
          </div>
        </div>
      )}
    </>
  );
}
