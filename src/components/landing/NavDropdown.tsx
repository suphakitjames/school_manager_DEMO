"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Crown, BookOpen } from "lucide-react";

interface NavDropdownProps {
  departments: string[];
  hasExecutives: boolean;
}

export default function NavDropdown({ departments, hasExecutives }: NavDropdownProps) {
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
    <div className="relative group" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-sm font-medium text-slate-600 hover:text-theme-primary flex items-center gap-1 py-4 transition-colors"
      >
        กลุ่มสาระการเรียนรู้
        <ChevronRight
          className={`w-4 h-4 opacity-50 transition-transform duration-200 ${open ? "rotate-270" : "rotate-90"}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Executives row */}
          {hasExecutives && (
            <Link
              href="/departments?group=executives"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors border-b border-slate-100"
            >
              <Crown className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="font-semibold">ทำเนียบผู้บริหาร</span>
            </Link>
          )}

          {/* Subject groups */}
          <div className="py-1">
            {departments.length > 0 ? (
              departments.map((dept) => (
                <Link
                  key={dept}
                  href={`/departments?group=${encodeURIComponent(dept)}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-theme-primary transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                  {dept}
                </Link>
              ))
            ) : (
              <p className="px-4 py-3 text-xs text-slate-400">ยังไม่มีกลุ่มสาระ</p>
            )}
          </div>

          {/* View All */}
          <div className="border-t border-slate-100 px-4 py-2.5">
            <Link
              href="/departments"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-theme-primary hover:opacity-80 transition-opacity"
            >
              ดูบุคลากรทั้งหมด →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
