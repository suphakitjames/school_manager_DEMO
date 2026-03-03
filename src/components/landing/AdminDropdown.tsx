"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Building } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface Division {
  id: number;
  name: string;
  nameEn: string | null;
  icon: string | null;
}

interface AdminDropdownProps {
  divisions: Division[];
}

const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (LucideIcons as any)[name] || Building;
  return <IconComponent className={className} />;
};

export default function AdminDropdown({ divisions }: AdminDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-sm font-medium text-slate-600 hover:text-theme-primary flex items-center gap-1 py-4 transition-colors"
      >
        ฝ่ายบริหารงาน
        <ChevronRight
          className={`w-4 h-4 opacity-50 transition-transform duration-200 ${open ? "rotate-270" : "rotate-90"}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="py-1">
            {divisions.length > 0 ? (
              divisions.map((div) => (
                <Link
                  key={div.id}
                  href={`/administration/${div.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-theme-primary transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <DynamicIcon name={div.icon || "Building"} className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold leading-tight truncate">{div.name}</p>
                    {div.nameEn && <p className="text-xs text-slate-400">{div.nameEn}</p>}
                  </div>
                </Link>
              ))
            ) : (
              <p className="px-4 py-3 text-xs text-slate-400">ยังไม่มีข้อมูล</p>
            )}
          </div>
          <div className="border-t border-slate-100 px-4 py-2.5">
            <Link
              href="/administration"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-theme-primary hover:opacity-80 transition-opacity"
            >
              ดูฝ่ายบริหารทั้งหมด →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
