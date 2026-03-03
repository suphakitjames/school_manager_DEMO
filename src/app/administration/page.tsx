import prisma from "@/lib/db";
import Link from "next/link";
import {
  Building, ArrowLeft, Users, ChevronRight,
} from "lucide-react";
import * as LucideIcons from "lucide-react";

export const revalidate = 60;

const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (LucideIcons as any)[name] || Building;
  return <IconComponent className={className} />;
};

export default async function AdministrationPage() {
  const schoolSetting = await prisma.schoolSetting.findFirst();
  const primaryColor = schoolSetting?.primaryColor || "#1d4ed8";
  const secondaryColor = schoolSetting?.secondaryColor || "#f59e0b";

  const divisions = await prisma.administrativeDivision.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    include: {
      headTeacher: { include: { user: true } },
      _count: { select: { members: true } },
    },
  });

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
        .hover\\:text-theme-primary:hover { color: var(--theme-primary); }
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
              <h1 className="text-xl font-bold tracking-tight text-slate-900">ฝ่ายบริหารงาน</h1>
              <p className="text-xs text-theme-primary font-semibold">{schoolSetting?.name || "โรงเรียนทดสอบวิทยา"}</p>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-theme-primary transition-colors bg-slate-100 px-4 py-2 rounded-xl hover:bg-slate-200">
            <ArrowLeft className="w-4 h-4" /> กลับหน้าหลัก
          </Link>
        </div>
      </header>

      {/* HERO */}
      <div className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 xmlns=http://www.w3.org/2000/svg%3E%3Cpath d=%27M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%27 fill=%27white%27 fill-rule=%27evenodd%27/%3E%3C/svg%3E')]"></div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-theme-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-theme-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20 shadow-xl">
            <Building className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            ฝ่ายบริหารงาน
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            โครงสร้างการบริหารงาน 4 ฝ่ายหลัก ตามมาตรฐานสำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.)
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {divisions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {divisions.map((div, i) => {
              const colors = [
                { bg: "from-blue-500 to-indigo-600", light: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", hover: "hover:border-blue-300" },
                { bg: "from-emerald-500 to-teal-600", light: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", hover: "hover:border-emerald-300" },
                { bg: "from-amber-500 to-orange-600", light: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", hover: "hover:border-amber-300" },
                { bg: "from-purple-500 to-violet-600", light: "bg-purple-50", text: "text-purple-600", border: "border-purple-200", hover: "hover:border-purple-300" },
              ];
              const color = colors[i % colors.length];

              return (
                <Link
                  key={div.id}
                  href={`/administration/${div.id}`}
                  className={`group bg-white rounded-3xl shadow-sm border ${color.border} ${color.hover} overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col`}
                >
                  {/* Card Header with Gradient */}
                  <div className={`relative bg-gradient-to-r ${color.bg} p-6 pb-12 overflow-hidden`}>
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full"></div>
                    <div className="relative z-10">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <DynamicIcon name={div.icon || "Building"} className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">{div.name}</h3>
                      {div.nameEn && (
                        <p className="text-white/70 text-sm font-medium">{div.nameEn}</p>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 -mt-6 relative z-10 flex-1 flex flex-col">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex-1">
                      {/* Description */}
                      <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed mb-5">
                        {div.description?.split("\n")[0] || "ยังไม่มีคำอธิบาย"}
                      </p>

                      {/* Head Teacher */}
                      {div.headTeacher ? (
                        <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-xl">
                          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 border-2 border-white shadow-sm">
                            {div.headTeacher.photoUrl || div.headTeacher.user?.avatarUrl ? (
                              <img
                                src={div.headTeacher.photoUrl || div.headTeacher.user?.avatarUrl || ""}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-sm font-bold text-slate-400">
                                {div.headTeacher.firstName?.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">
                              {div.headTeacher.firstName} {div.headTeacher.lastName}
                            </p>
                            <p className="text-xs text-slate-500">หัวหน้าฝ่าย</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-xl">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5 text-slate-300" />
                          </div>
                          <p className="text-xs text-slate-400">ยังไม่ได้กำหนดหัวหน้าฝ่าย</p>
                        </div>
                      )}

                      {/* Stats & CTA */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <span className={`text-xs font-bold ${color.text} ${color.light} px-3 py-1.5 rounded-full`}>
                          <Users className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                          {div._count.members} คน
                        </span>
                        <span className="text-xs font-semibold text-theme-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                          ดูรายละเอียด <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
            <Building className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">ยังไม่มีข้อมูลฝ่ายบริหาร</h3>
            <p className="text-slate-500 mt-2">กรุณาเพิ่มข้อมูลฝ่ายบริหารงานจาก <strong>แผงควบคุม</strong></p>
          </div>
        )}

        {/* Back button */}
        <div className="mt-12 flex justify-center">
          <Link href="/" className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-4 h-4" /> กลับหน้าหลัก
          </Link>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-8 mt-12 border-t-4 border-theme-secondary text-center text-sm">
        &copy; {new Date().getFullYear()} {schoolSetting?.name || "School Management System"}. All rights reserved.
      </footer>
    </div>
  );
}
