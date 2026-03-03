import prisma from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Building, Eye, Target } from "lucide-react";

export const revalidate = 60;

export default async function VisionPage() {
  const schoolSetting = await prisma.schoolSetting.findFirst();
  const primaryColor = schoolSetting?.primaryColor || "#1d4ed8";
  const secondaryColor = schoolSetting?.secondaryColor || "#f59e0b";

  const executives = await prisma.teacher.findMany({
    where: { isExecutive: true, isActive: true },
    orderBy: { executiveOrder: "asc" },
    include: { user: true },
    take: 1,
  });
  const director = executives[0] ?? null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800">
      <style dangerouslySetInnerHTML={{__html: `
        :root { --theme-primary: ${primaryColor}; --theme-secondary: ${secondaryColor}; }
        .bg-theme-primary { background-color: var(--theme-primary); }
        .text-theme-primary { color: var(--theme-primary); }
        .border-theme-primary { border-color: var(--theme-primary); }
        .bg-theme-secondary { background-color: var(--theme-secondary); }
        .text-theme-secondary { color: var(--theme-secondary); }
        .border-theme-secondary { border-color: var(--theme-secondary); }
      `}} />

      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="w-12 h-12 bg-theme-primary text-white rounded-2xl flex items-center justify-center shadow hover:scale-105 transition-transform">
              {schoolSetting?.logoUrl ? (
                <img src={schoolSetting.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
              ) : (
                <Building className="w-6 h-6" />
              )}
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">วิสัยทัศน์</h1>
              <p className="text-xs text-theme-primary font-semibold">{schoolSetting?.name || "โรงเรียนทดสอบวิทยา"}</p>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-theme-primary transition-colors bg-slate-100 px-4 py-2 rounded-xl hover:bg-slate-200">
            <ArrowLeft className="w-4 h-4" /> กลับหน้าหลัก
          </Link>
        </div>
      </header>

      {/* HERO */}
      <div className="bg-theme-primary relative overflow-hidden py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 xmlns=http://www.w3.org/2000/svg%3E%3Cpath d=M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z fill=white fill-rule=evenodd/%3E%3C/svg%3E')]"></div>
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="w-20 h-20 bg-white/15 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-6 border border-white/30">
            <Eye className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow">วิสัยทัศน์</h2>
          <p className="text-white/80 text-lg">Vision</p>
        </div>
      </div>

      {/* CONTENT */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {schoolSetting?.vision ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-10 md:p-16 text-center relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-theme-primary text-white rounded-full flex items-center justify-center shadow-lg">
              <Eye className="w-6 h-6" />
            </div>
            <blockquote className="text-2xl md:text-3xl font-bold text-slate-800 leading-relaxed mb-8">
              "{schoolSetting.vision}"
            </blockquote>
            <div className="w-24 h-1 bg-theme-secondary rounded-full mx-auto mb-8" />
            {director && (
              <div className="flex items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden border-2 border-white shadow">
                  {director.photoUrl || director.user?.avatarUrl ? (
                    <img src={director.photoUrl || director.user?.avatarUrl || ""} alt="director" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-slate-400">
                      {director.firstName?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800">{director.firstName} {director.lastName}</p>
                  <p className="text-sm text-theme-primary font-semibold">ผู้อำนวยการโรงเรียน</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
            <Eye className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">ยังไม่ได้กรอกวิสัยทัศน์</h3>
            <p className="text-slate-500 mt-2">กรุณาเพิ่มข้อมูลวิสัยทัศน์ใน <strong>ตั้งค่าระบบ → ข้อมูลโรงเรียน</strong></p>
          </div>
        )}

        {/* Quick nav */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/about/mission" className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700 transition-colors">
            <Target className="w-5 h-5" /> ดูพันธกิจ →
          </Link>
          <Link href="/" className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-4 h-4" /> กลับหน้าหลัก
          </Link>
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8 mt-16 border-t-4 border-theme-secondary text-center text-sm">
        &copy; {new Date().getFullYear()} {schoolSetting?.name || "School Management System"}
      </footer>
    </div>
  );
}
