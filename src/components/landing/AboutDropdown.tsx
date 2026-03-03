"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Eye, Target, Info } from "lucide-react";

const ITEMS = [
  { href: "/about/vision",  label: "วิสัยทัศน์",  icon: Eye,    desc: "Vision" },
  { href: "/about/mission", label: "พันธกิจ",     icon: Target, desc: "Mission" },
];

export default function AboutDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="text-sm font-medium text-slate-600 hover:text-theme-primary flex items-center gap-1 py-4 transition-colors"
      >
        เกี่ยวกับโรงเรียน
        <ChevronRight
          className={`w-4 h-4 opacity-50 transition-transform duration-200 ${open ? "rotate-270" : "rotate-90"}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 py-2">
          {ITEMS.map(({ href, label, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-theme-primary transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="font-semibold leading-tight">{label}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
