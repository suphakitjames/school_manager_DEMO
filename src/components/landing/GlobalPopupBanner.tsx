"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

type PopupBanner = {
  id: number;
  title: string | null;
  imageUrl: string;
  linkUrl: string | null;
  isActive: boolean;
  expiresAt: string | null;
};

export default function GlobalPopupBanner() {
  const [banner, setBanner] = useState<PopupBanner | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        console.log("[PopupBanner] Fetching popup banner...");
        const res = await fetch("/api/popup", { cache: "no-store" });
        if (!res.ok) {
          console.error("[PopupBanner] API error:", res.status);
          return;
        }
        const banners: PopupBanner[] = await res.json();
        console.log("[PopupBanner] Response:", banners);

        // Find the first active banner that hasn't expired
        const activeBanner = banners.find((b) => {
          if (!b.isActive) return false;
          if (b.expiresAt && new Date(b.expiresAt) < new Date()) return false;
          return true;
        });

        console.log("[PopupBanner] Active banner:", activeBanner);

        if (activeBanner) {
          // Check if user already closed this specific banner in this session
          const isClosed = sessionStorage.getItem(
            `popup_closed_${activeBanner.id}`
          );
          if (!isClosed) {
            setBanner(activeBanner);
            setVisible(true);
          } else {
            console.log("[PopupBanner] Already closed by user, skipping.");
          }
        }
      } catch (error) {
        console.error("[PopupBanner] Failed to load popup banner:", error);
      }
    };

    fetchBanner();
  }, []);

  if (!visible || !banner) return null;

  const handleClose = () => {
    sessionStorage.setItem(`popup_closed_${banner.id}`, "true");
    setVisible(false);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
      onClick={handleClose}
    >
      <div
        className="relative max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute -top-10 right-0 w-9 h-9 flex items-center justify-center bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors z-10"
          aria-label="ปิด"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Banner Image */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
          {banner.linkUrl ? (
            <a
              href={banner.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
            >
              <img
                src={banner.imageUrl}
                alt={banner.title || "ประกาศ"}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            </a>
          ) : (
            <img
              src={banner.imageUrl}
              alt={banner.title || "ประกาศ"}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          )}
        </div>

        {/* Close hint */}
        <p className="text-center text-white/70 text-xs mt-3">
          คลิกที่ใดก็ได้เพื่อปิด
        </p>
      </div>
    </div>
  );
}
