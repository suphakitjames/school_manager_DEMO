import prisma from "@/lib/db";
import Link from "next/link";
import { Users, Building, ArrowLeft, Crown, BookOpen, LayoutGrid } from "lucide-react";

export const revalidate = 60;

interface Props {
  searchParams: Promise<{ group?: string }>;
}

export default async function DepartmentsPage({ searchParams }: Props) {
  const { group } = await searchParams;

  const schoolSetting = await prisma.schoolSetting.findFirst();
  const primaryColor = schoolSetting?.primaryColor || "#1d4ed8";
  const secondaryColor = schoolSetting?.secondaryColor || "#f59e0b";

  // Fetch all active teachers
  const teachers = await prisma.teacher.findMany({
    where: { isActive: true },
    orderBy: [
      { isExecutive: "desc" },
      { executiveOrder: "asc" },
      { firstName: "asc" }
    ],
    include: { user: true }
  });

  // Determine sidebar groups
  const executives = teachers.filter(t => t.isExecutive);
  const nonExecs = teachers.filter(t => !t.isExecutive);

  const deptSet = new Set<string>();
  nonExecs.forEach(t => {
    const d = t.department?.trim();
    if (d && d !== "-") deptSet.add(d);
  });
  const allDepartments = [...deptSet].sort((a, b) => a.localeCompare(b, "th"));

  // Filter based on ?group param
  let filteredTeachers = teachers;
  let pageTitle = "บุคลากรและกลุ่มสาระการเรียนรู้";
  let pageDesc = "ทำเนียบรายชื่อครูและบุคลากรทางการศึกษา แบ่งตามกลุ่มสาระการเรียนรู้และแผนกวิชาต่างๆ ภายในโรงเรียน";
  let isFiltered = false;

  if (group === "executives") {
    filteredTeachers = executives;
    pageTitle = "ทำเนียบผู้บริหาร";
    pageDesc = "รายชื่อคณะผู้บริหารโรงเรียน";
    isFiltered = true;
  } else if (group) {
    filteredTeachers = nonExecs.filter(t => {
      const d = t.department?.trim() || "ทั่วไป / ไม่ระบุแผนก";
      return d === group;
    });
    pageTitle = `กลุ่มสาระ: ${group}`;
    pageDesc = `รายชื่อครูในกลุ่มสาระการเรียนรู้ "${group}"`;
    isFiltered = true;
  }

  // Group by dept for "all" view  
  const groupedTeachers = filteredTeachers.reduce((acc, teacher) => {
    const dept = group === "executives"
      ? "ผู้บริหาร"
      : (teacher.department?.trim() || "ทั่วไป / ไม่ระบุแผนก");
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(teacher);
    return acc;
  }, {} as Record<string, typeof teachers>);

  const deptGroups = Object.keys(groupedTeachers).sort((a, b) => {
    if (a === "ผู้บริหาร") return -1;
    if (b === "ผู้บริหาร") return 1;
    if (a === "ทั่วไป / ไม่ระบุแผนก") return 1;
    if (b === "ทั่วไป / ไม่ระบุแผนก") return -1;
    return a.localeCompare(b, "th");
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden text-slate-800">

      {/* Dynamic Theme Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --theme-primary: ${primaryColor};
          --theme-secondary: ${secondaryColor};
        }
        .bg-theme-primary { background-color: var(--theme-primary); }
        .text-theme-primary { color: var(--theme-primary); }
        .border-theme-primary { border-color: var(--theme-primary); }
        .bg-theme-secondary { background-color: var(--theme-secondary); }
        .text-theme-secondary { color: var(--theme-secondary); }
        .hover\\:text-theme-primary:hover { color: var(--theme-primary); }
        .hover\\:bg-theme-secondary\\/10:hover { background-color: color-mix(in srgb, var(--theme-secondary) 10%, transparent); }
      `}} />

      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer">
            <Link href="/" className="w-12 h-12 bg-theme-primary text-white rounded-2xl flex items-center justify-center shadow hover:scale-105 transition-transform">
              {schoolSetting?.logoUrl ? (
                <img src={schoolSetting.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
              ) : (
                <Building className="w-6 h-6" />
              )}
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">บุคลากรและกลุ่มสาระ</h1>
              <p className="text-xs text-theme-primary font-semibold">{schoolSetting?.name || "โรงเรียนทดสอบวิทยา"}</p>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-theme-primary transition-colors bg-slate-100 px-4 py-2 rounded-xl hover:bg-slate-200">
            <ArrowLeft className="w-4 h-4" /> กลับหน้าหลัก
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 items-start">

          {/* ===== SIDEBAR ===== */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-28">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-800 px-4 py-3">
                <p className="text-white font-bold text-sm flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4" /> หมวดหมู่บุคลากร
                </p>
              </div>
              <div className="p-2 space-y-0.5">
                {/* All */}
                <Link
                  href="/departments"
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                    ${!group ? "bg-theme-primary text-white" : "text-slate-600 hover:text-theme-primary hover:bg-slate-50"}`}
                >
                  <Users className="w-4 h-4 shrink-0" /> ทั้งหมด
                </Link>

                {/* Executives */}
                {executives.length > 0 && (
                  <Link
                    href="/departments?group=executives"
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                      ${group === "executives" ? "bg-amber-500 text-white" : "text-slate-600 hover:text-amber-600 hover:bg-amber-50"}`}
                  >
                    <Crown className="w-4 h-4 shrink-0" /> ทำเนียบผู้บริหาร
                    <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full font-bold
                      ${group === "executives" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                      {executives.length}
                    </span>
                  </Link>
                )}

                {/* Divider */}
                {allDepartments.length > 0 && (
                  <p className="text-[10px] font-bold uppercase text-slate-400 px-3 pt-3 pb-1 tracking-wider">กลุ่มสาระการเรียนรู้</p>
                )}

                {/* Subject Groups */}
                {allDepartments.map(dept => (
                  <Link
                    key={dept}
                    href={`/departments?group=${encodeURIComponent(dept)}`}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                      ${group === dept ? "bg-theme-primary text-white" : "text-slate-600 hover:text-theme-primary hover:bg-slate-50"}`}
                  >
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span className="truncate">{dept}</span>
                    <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full font-bold shrink-0
                      ${group === dept ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                      {nonExecs.filter(t => (t.department?.trim() || "ทั่วไป / ไม่ระบุแผนก") === dept).length}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* ===== MAIN CONTENT ===== */}
          <main className="flex-1 min-w-0">
            {/* Title */}
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-slate-900">{pageTitle}</h2>
              <p className="text-slate-500 mt-1 text-sm">{pageDesc}</p>
              {isFiltered && (
                <Link href="/departments" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-theme-primary bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                  ✕ ล้างตัวกรอง – ดูทั้งหมด
                </Link>
              )}
            </div>

            {deptGroups.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-700">ไม่พบบุคลากร</h3>
                <p className="text-slate-500 mt-2">ไม่มีครูในกลุ่มนี้</p>
              </div>
            ) : (
              <div className="space-y-14">
                {deptGroups.map(dept => (
                  <section key={dept} className="scroll-mt-28" id={`dept-${dept.replace(/\s+/g, '-')}`}>
                    <div className="flex items-center gap-4 mb-6">
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                        <span className="w-2 h-7 bg-theme-primary rounded-full inline-block"></span>
                        {dept}
                      </h3>
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full">{groupedTeachers[dept].length} คน</span>
                      <div className="h-px bg-slate-200 flex-1 ml-4 hidden sm:block"></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {groupedTeachers[dept].map(teacher => (
                        <div key={teacher.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:border-theme-primary/30 transition-all group">
                          <div className="relative h-52 bg-slate-100 flex items-center justify-center overflow-hidden border-b border-slate-100">
                            {teacher.photoUrl || teacher.user?.avatarUrl ? (
                              <img
                                src={teacher.photoUrl || teacher.user?.avatarUrl || ""}
                                alt={`${teacher.firstName} ${teacher.lastName}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-slate-100 group-hover:bg-slate-200 transition-colors">
                                <span className="text-5xl font-bold text-slate-300">{teacher.firstName?.charAt(0) || "ค"}</span>
                              </div>
                            )}

                            {teacher.isExecutive && (
                              <div className="absolute top-3 right-3 bg-linear-to-r from-amber-500 to-yellow-500 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                                👑 ผู้บริหาร
                              </div>
                            )}
                          </div>

                          <div className="p-4 text-center">
                            <h4 className="font-bold text-slate-800 text-base mb-1 line-clamp-1" title={`${teacher.firstName} ${teacher.lastName}`}>
                              {teacher.firstName} {teacher.lastName}
                            </h4>
                            <p className="text-sm font-semibold text-theme-primary mb-3 line-clamp-1" title={teacher.position || "ครูผู้สอน"}>
                              {teacher.position || "ครูผู้สอน"}
                            </p>
                            <div className="inline-block bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 text-xs text-slate-600 font-medium">
                              {teacher.qualification || "ไม่ได้ระบุวุฒิการศึกษา"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-10 mt-20 border-t-4 border-theme-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 bg-theme-primary text-white flex items-center justify-center rounded-xl opacity-50">
            {schoolSetting?.logoUrl ? <img src={schoolSetting.logoUrl} alt="Logo" className="w-6 h-6 object-contain" /> : <Building className="w-6 h-6" />}
          </div>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} {schoolSetting?.name || "School Management System"}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
