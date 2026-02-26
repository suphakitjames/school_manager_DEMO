"use client";

import { useEffect, useState } from "react";
import {
  GraduationCap,
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  ClipboardCheck,
  AlertCircle,
  Calendar,
  Sparkles,
  MapPin,
  CheckSquare,
  BadgeCent
} from "lucide-react";
import Link from "next/link";

// --- Types ---
type DashboardData = {
  stats: {
    totalStudents: number;
    totalTeachers: number;
    totalSubjects: number;
    totalRevenue: number;
  };
  attendance: {
    PRESENT: number;
    ABSENT: number;
    LATE: number;
    LEAVE: number;
    total: number;
  };
  recentStudents: Array<{
    id: number;
    name: string;
    class: string;
    date: string;
    status: string;
  }>;
  announcements: Array<{
    id: number;
    title: string;
    type: string;
    date: string;
    isPinned: boolean;
  }>;
  upcomingEvents: Array<{
    id: number;
    title: string;
    date: string;
    location: string;
    color: string;
  }>;
  genderStats: {
    male: number;
    female: number;
  };
};

// --- Helper Functions ---
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "อรุณสวัสดิ์, วันนี้มีอะไรให้จัดการบ้างคะ?";
  if (hour < 18) return "สวัสดีตอนบ่าย, ภาพรวมโรงเรียนเป็นอย่างไรบ้าง?";
  return "สวัสดีตอนเย็น, เช็คข้อมูลสรุปก่อนจบวันกันเถอะ!";
}

function formatCurrency(amount: number) {
  if (amount >= 1000000) {
    return `฿${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 10000) {
    return `฿${(amount / 1000).toFixed(0)}k`;
  }
  return `฿${amount.toLocaleString()}`;
}

function getAnnouncementBadge(type: string, isNew: boolean) {
  if (isNew) return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm";
  switch (type) {
    case "URGENT": return "bg-red-100 text-red-700";
    case "EVENT": return "bg-emerald-100 text-emerald-700";
    case "ACADEMIC": return "bg-amber-100 text-amber-700";
    case "GENERAL":
    default: return "bg-slate-100 text-slate-600";
  }
}

function translateType(type: string) {
  switch (type) {
    case "URGENT": return "ด่วน";
    case "EVENT": return "กิจกรรม";
    case "ACADEMIC": return "วิชาการ";
    case "GENERAL": return "ทั่วไป";
    default: return type;
  }
}

// --- Animated Counter Component ---
function AnimatedCounter({ value, prefix = "" }: { value: number | string, prefix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const isNumber = typeof value === 'number';

  useEffect(() => {
    if (!isNumber) return;
    let start = 0;
    const end = value as number;
    const duration = 1500;
    const increment = end / (duration / 16); // 60fps

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, isNumber]);

  return <>{prefix}{isNumber ? displayValue.toLocaleString() : value}</>;
}


export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, []);

  const statsList = data ? [
    {
      label: "นักเรียนปัจจุบัน",
      value: data.stats.totalStudents,
      icon: GraduationCap,
      color: "blue",
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
      border: "border-blue-100",
    },
    {
      label: "ครูและบุคลากร",
      value: data.stats.totalTeachers,
      icon: Users,
      color: "emerald",
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      border: "border-emerald-100",
    },
    {
      label: "วิชาที่เปิดสอน",
      value: data.stats.totalSubjects,
      icon: BookOpen,
      color: "cyan",
      bg: "bg-cyan-50",
      iconColor: "text-cyan-600",
      border: "border-cyan-100",
    },
    {
      label: "รายรับสะสม (ปีนี้)",
      value: formatCurrency(data.stats.totalRevenue),
      icon: DollarSign,
      color: "amber",
      bg: "bg-amber-50",
      iconColor: "text-amber-600",
      border: "border-amber-100",
    },
  ] : [];

  const attTotal = data?.attendance?.total || 1; // prevent div by zero
  const attendanceOverview = data ? [
    { label: "มาเรียน", value: data.attendance.PRESENT, pct: Math.round((data.attendance.PRESENT / attTotal) * 100) || 0, color: "bg-emerald-500", shadow: "shadow-emerald-500/20" },
    { label: "ขาดเรียน", value: data.attendance.ABSENT, pct: Math.round((data.attendance.ABSENT / attTotal) * 100) || 0, color: "bg-red-500", shadow: "shadow-red-500/20" },
    { label: "มาสาย", value: data.attendance.LATE, pct: Math.round((data.attendance.LATE / attTotal) * 100) || 0, color: "bg-amber-500", shadow: "shadow-amber-500/20" },
    { label: "ลา", value: data.attendance.LEAVE, pct: Math.round((data.attendance.LEAVE / attTotal) * 100) || 0, color: "bg-blue-500", shadow: "shadow-blue-500/20" },
  ] : [];

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">กำลังโหลดข้อมูลแดชบอร์ด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-8 sm:p-10 shadow-xl border border-slate-700/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-cyan-500/20 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
              ภาพรวมโรงเรียน <Sparkles className="w-6 h-6 text-cyan-400" />
            </h1>
            <p className="text-slate-300 text-lg mt-2 font-medium">
              {getGreeting()}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-inner">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-200" />
              <span className="text-sm text-blue-50 font-medium">
                {new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statsList.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`bg-white rounded-3xl p-6 border ${stat.border} shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-8`}
              style={{ animationDelay: `${i * 100 + 200}ms`, animationFillMode: "both" }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center shadow-inner`}>
                  <Icon className={`w-7 h-7 ${stat.iconColor}`} />
                </div>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
                  <AnimatedCounter value={stat.value} />
                </p>
                <p className="text-sm text-slate-500 font-medium mt-1">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Attendance Widget & Stats col */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300 fill-mode-both hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-slate-800 text-lg">สถิติเข้าเรียนวันนี้</h2>
              </div>
            </div>
            <div className="space-y-4">
              {attendanceOverview.map((item, i) => (
                <div key={item.label} className="group">
                  <div className="flex justify-between text-sm mb-1.5 align-baseline">
                    <span className="text-slate-500 font-medium group-hover:text-slate-800 transition-colors">{item.label}</span>
                    <div className="text-right">
                      <span className="font-bold text-slate-800">{item.value} คน</span>
                      <span className="text-xs text-slate-400 ml-1.5">({item.pct}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`h-full ${item.color} ${item.shadow} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <Link href="/attendance" className="text-sm text-blue-600 font-semibold hover:text-blue-800 transition-colors inline-flex items-center gap-1">
                จัดการการลงเวลาเรียน →
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 shadow-sm border border-slate-700 relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300 fill-mode-both">
            <h2 className="font-bold text-white text-base mb-1 relative z-10">สัดส่วนนักเรียน (Active)</h2>
            <p className="text-slate-400 text-xs mb-5 relative z-10">แบ่งตามเพศ</p>
            <div className="flex items-center justify-between relative z-10">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2 text-blue-400">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-xl font-bold text-white">{data.genderStats.male}</div>
                <div className="text-xs text-slate-400 font-medium">ชาย</div>
              </div>
              <div className="w-px h-16 bg-slate-700"></div>
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-2 text-pink-400">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-xl font-bold text-white">{data.genderStats.female}</div>
                <div className="text-xs text-slate-400 font-medium">หญิง</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-500 delay-[400ms] fill-mode-both hover:shadow-md transition-shadow xl:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-slate-800 text-lg">นักเรียนเข้าใหม่</h2>
            </div>
            <Link href="/students" className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-3 py-1.5 bg-blue-50 rounded-lg transition-colors">
              ดูทั้งหมด
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {data.recentStudents.length === 0 ? (
               <p className="text-sm text-slate-400 col-span-2 py-8 text-center bg-slate-50 rounded-xl">ยังไม่มีนักเรียนใหม่</p>
            ) : data.recentStudents.map((s) => (
              <div key={s.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors border border-slate-100 shadow-sm group">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-700 text-sm font-bold flex items-center justify-center shrink-0 shadow-sm">
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors">{s.name}</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{s.class} · {new Date(s.date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}</p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold shrink-0 border border-emerald-100 uppercase tracking-wide">
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-500 delay-[500ms] fill-mode-both hover:shadow-md transition-shadow xl:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-slate-800 text-lg">ประกาศล่าสุด</h2>
            </div>
            <Link href="/announcements" className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-3 py-1.5 bg-blue-50 rounded-lg transition-colors">
              ดูทั้งหมด
            </Link>
          </div>
          <div className="space-y-3">
            {data.announcements.length === 0 ? (
               <p className="text-sm text-slate-400 text-center py-8 bg-slate-50 rounded-xl">ไม่มีประกาศใหม่</p>
            ) : data.announcements.map((a) => {
              const date = new Date(a.date);
              const isNew = date.getTime() > Date.now() - 3 * 24 * 60 * 60 * 1000;
              return (
                <div key={a.id} className="p-4 bg-slate-50/50 hover:bg-blue-50/50 rounded-2xl border border-slate-100 hover:border-blue-100 transition-colors group">
                  <div className="flex gap-2 items-start mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide shrink-0 ${getAnnouncementBadge(a.type, isNew)}`}>
                      {isNew ? "ใหม่ล่าสุด" : translateType(a.type)}
                    </span>
                    <p className="text-sm text-slate-800 font-bold leading-snug group-hover:text-blue-700 transition-colors line-clamp-1">{a.title}</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 ml-0">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-500 font-medium">{date.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events Widget */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 shadow-sm border border-blue-600 relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500 delay-[600ms] fill-mode-both xl:col-span-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex items-center justify-between mb-5">
            <h2 className="font-bold text-white text-lg flex items-center gap-2">
               ปฏิทินกิจกรรม
            </h2>
          </div>
          <div className="space-y-3 relative z-10">
            {data.upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-10 h-10 text-blue-300 mx-auto mb-2 opacity-50" />
                <p className="text-sm text-blue-100">ไม่มีกิจกรรมเร็วๆ นี้</p>
              </div>
            ) : data.upcomingEvents.map(e => {
              const d = new Date(e.date);
              return (
                <div key={e.id} className="flex items-start gap-4 p-3 bg-white/10 hover:bg-white/20 rounded-2xl overflow-hidden transition-colors border border-white/10">
                  <div className="bg-white/90 rounded-xl p-2 text-center w-12 shrink-0 shadow-sm">
                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none mb-1">{d.toLocaleDateString('th-TH', { month: 'short' })}</div>
                    <div className="text-lg font-black text-slate-800 leading-none">{d.getDate()}</div>
                  </div>
                  <div className="flex-1 min-w-0 py-0.5">
                    <p className="font-bold text-white text-sm line-clamp-1 mb-1 shadow-sm">{e.title}</p>
                    <div className="flex items-center gap-1 text-xs text-blue-100">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{e.location}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-[700ms] fill-mode-both">
        {[
          { icon: Users, label: "จัดการนักเรียน", href: "/students", color: "text-blue-600", bg: "bg-blue-50" },
          { icon: CheckSquare, label: "เช็คชื่อวันพรุ่งนี้", href: "/attendance", color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: BadgeCent, label: "รับชำระค่าเทอม", href: "/finance", color: "text-amber-600", bg: "bg-amber-50" },
          { icon: AlertCircle, label: "สร้างประกาศใหม่", href: "/announcements", color: "text-cyan-600", bg: "bg-cyan-50" },
        ].map(a => {
          const Icon = a.icon;
          return (
            <Link key={a.label} href={a.href} className="flex flex-col items-center justify-center p-5 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${a.bg}`}>
                <Icon className={`w-5 h-5 ${a.color}`} />
              </div>
              <span className="text-sm font-semibold text-slate-700">{a.label}</span>
            </Link>
          )
        })}
      </div>

    </div>
  );
}
