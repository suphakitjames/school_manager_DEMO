"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  DollarSign,
  Megaphone,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  School,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "ภาพรวม",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "นักเรียน",
    href: "/students",
    icon: GraduationCap,
  },
  {
    label: "ครูและบุคลากร",
    href: "/teachers",
    icon: Users,
  },
  {
    label: "ห้องเรียนและหลักสูตร",
    href: "/classes",
    icon: School,
  },
  {
    label: "ตารางเรียน",
    href: "/schedule",
    icon: CalendarDays,
  },
  {
    label: "ผลการเรียน",
    href: "/grades",
    icon: BookOpen,
  },
  {
    label: "การเช็คชื่อ",
    href: "/attendance",
    icon: ClipboardCheck,
  },
  {
    label: "การเงิน",
    href: "/finance",
    icon: DollarSign,
  },
  {
    label: "ประกาศและข่าวสาร",
    href: "/announcements",
    icon: Megaphone,
  },
  {
    label: "รายงานและสถิติ",
    href: "/reports",
    icon: BarChart3,
  },
  {
    label: "ผู้ใช้งาน",
    href: "/users",
    icon: UserCog,
  },
  {
    label: "ตั้งค่าระบบ",
    href: "/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "h-full bg-white border-r border-slate-200 flex flex-col shadow-sm sidebar-transition",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-slate-200">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <School className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">โรงเรียน</p>
              <p className="text-xs text-slate-500 truncate">SMS System</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                    isActive
                      ? "bg-indigo-50 text-indigo-700 shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 flex-shrink-0",
                      isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                  {isActive && !collapsed && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Toggle Button */}
      <div className="p-3 border-t border-slate-200">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center py-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span className="text-xs font-medium">ย่อเมนู</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
