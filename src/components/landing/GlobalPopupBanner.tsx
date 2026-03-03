"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

type PopupBanner = {
  id: number;
  imageUrl: string;
  linkUrl: string | null;
  isActive: boolean;
  expiresAt: string | null;
};

export default function GlobalPopupBanner() {
  const [banner, setBanner] = schoolPopupState();

  if (!banner) return null;

  const handleClose = () => {
    // Save to sessionStorage so it doesn't show again in this tab session
    sessionStorage.setItem(`popup_closed_${banner.id}`, "true");
    setBanner(null);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="relative max-w-2xl w-full max-h-[90vh] flex flex-col items-center animate-in zoom-in-95 duration-300">
        
        {/* Close Button above the image */}
        <button 
          onClick={handleClose}
          className="absolute -top-10 right-0 sm:-right-10 w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Banner Content */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full flex flex-col items-center justify-center relative">
          {banner.linkUrl ? (
            <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="block w-full cursor-pointer hover:opacity-95 transition-opacity">
              <img src={banner.imageUrl} alt="Announcement" className="w-full h-auto max-h-[80vh] object-contain" />
            </a>
          ) : (
            <img src={banner.imageUrl} alt="Announcement" className="w-full h-auto max-h-[80vh] object-contain" />
          )}
        </div>
        
      </div>
    </div>
  );
}

// Custom hook to fetch the active banner once
function schoolPopupState() {
  const [banner, setBanner] = useState<PopupBanner | null>(null);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await fetch("/api/popup", { cache: "no-store" });
        if (!res.ok) return;
        const banners: PopupBanner[] = await res.json();
        
        // Find the first active banner that hasn't expired
        const activeBanner = banners.find(b => {
          if (!b.isActive) return false;
          if (b.expiresAt && new Date(b.expiresAt) < new Date()) return false;
          return true;
        });

        if (activeBanner) {
          // Check if user already closed this specific banner in this actual session
          const isClosed = sessionStorage.getItem(`popup_closed_${activeBanner.id}`);
          if (!isClosed) {
             setBanner(activeBanner);
          }
        }
      } catch (error) {
        console.error("Failed to load popup banner", error);
      }
    };
    fetchBanner();
  }, []);

  return [banner, setBanner] as const;
}
