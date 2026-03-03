import prisma from "@/lib/db";
import Link from "next/link";
import { Building, ArrowLeft, Users, ChevronLeft, ChevronRight } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { notFound } from "next/navigation";

export const revalidate = 60;

const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (LucideIcons as any)[name] || Building;
  return <IconComponent className={className} />;
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DivisionDetailPage({ params }: Props) {
  const { id } = await params;
  const divisionId = parseInt(id);

  const schoolSetting = await prisma.schoolSetting.findFirst();
  const primaryColor = schoolSetting?.primaryColor || "#1d4ed8";
  const secondaryColor = schoolSetting?.secondaryColor || "#f59e0b";

  const division = await prisma.administrativeDivision.findUnique({
    where: { id: divisionId },
    include: {
      headTeacher: { include: { user: true } },
      members: {
        orderBy: { order: "asc" },
        include: {
          teacher: { include: { user: true } },
        },
      },
    },
  });

  if (!division) return notFound();

  // Get all divisions for navigation
  const allDivisions = await prisma.administrativeDivision.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: { id: true, name: true, icon: true },
  });

  const currentIndex = allDivisions.findIndex((d) => d.id === divisionId);
  const prevDivision = currentIndex > 0 ? allDivisions[currentIndex - 1] : null;
  const nextDivision = currentIndex < allDivisions.length - 1 ? allDivisions[currentIndex + 1] : null;

  // Color scheme per order
  const colorSchemes: Record<number, { gradient: string; light: string; text: string }> = {
    0: { gradient: "from-blue-500 to-indigo-600", light: "bg-blue-50", text: "text-blue-600" },
    1: { gradient: "from-blue-500 to-indigo-600", light: "bg-blue-50", text: "text-blue-600" },
    2: { gradient: "from-emerald-500 to-teal-600", light: "bg-emerald-50", text: "text-emerald-600" },
    3: { gradient: "from-amber-500 to-orange-600", light: "bg-amber-50", text: "text-amber-600" },
    4: { gradient: "from-purple-500 to-violet-600", light: "bg-purple-50", text: "text-purple-600" },
  };
  const scheme = colorSchemes[currentIndex + 1] || colorSchemes[0];

  // Parse description into paragraphs and bullet points
  const descParts = division.description?.split("\n").filter(Boolean) || [];
  const introParagraph = descParts.length > 0 ? descParts[0] : null;
  const bulletPoints = descParts.slice(1).filter((line) => line.startsWith("•") || line.startsWith("-"));
  const sectionTitle = descParts.find(
    (line) => !line.startsWith("•") && !line.startsWith("-") && descParts.indexOf(line) > 0
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        :root { --theme-primary: ${primaryColor}; --theme-secondary: ${secondaryColor}; }
        .bg-theme-primary { background-color: var(--theme-primary); }
        .text-theme-primary { color: var(--theme-primary); }
        .border-theme-primary { border-color: var(--theme-primary); }
        .bg-theme-secondary { background-color: var(--theme-secondary); }
        .text-theme-secondary { color: var(--theme-secondary); }
        .border-theme-secondary { border-color: var(--theme-secondary); }
      `,
        }}
      />

      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="w-12 h-12 bg-theme-primary text-white rounded-2xl flex items-center justify-center shadow hover:scale-105 transition-transform"
            >
              {schoolSetting?.logoUrl ? (
                <img src={schoolSetting.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
              ) : (
                <Building className="w-6 h-6" />
              )}
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 line-clamp-1">{division.name}</h1>
              <p className="text-xs text-theme-primary font-semibold">
                {schoolSetting?.name || "โรงเรียนทดสอบวิทยา"}
              </p>
            </div>
          </div>
          <Link
            href="/administration"
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-theme-primary transition-colors bg-slate-100 px-4 py-2 rounded-xl hover:bg-slate-200"
          >
            <ArrowLeft className="w-4 h-4" /> ฝ่ายบริหารงาน
          </Link>
        </div>
      </header>

      {/* HERO */}
      <div className={`relative overflow-hidden py-16 md:py-24 bg-gradient-to-br ${scheme.gradient}`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 xmlns=http://www.w3.org/2000/svg%3E%3Cpath d=%27M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%27 fill=%27white%27 fill-rule=%27evenodd%27/%3E%3C/svg%3E')]"></div>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="w-20 h-20 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20 shadow-xl">
            <DynamicIcon name={division.icon || "Building"} className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-3 drop-shadow-lg">{division.name}</h2>
          {division.nameEn && <p className="text-white/70 text-lg font-medium">{division.nameEn}</p>}
        </div>
      </div>

      {/* CONTENT */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
        {/* Description Section */}
        {division.description && (
          <section>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-10">
              {introParagraph && (
                <p className="text-lg text-slate-700 leading-relaxed mb-6">{introParagraph}</p>
              )}

              {sectionTitle && (
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className={`w-1.5 h-6 rounded-full bg-gradient-to-b ${scheme.gradient} inline-block`}></span>
                  {sectionTitle}
                </h3>
              )}

              {bulletPoints.length > 0 && (
                <div className="grid gap-3">
                  {bulletPoints.map((point, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-4 p-4 ${scheme.light} rounded-xl border border-slate-100`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full bg-gradient-to-br ${scheme.gradient} text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm`}
                      >
                        {i + 1}
                      </div>
                      <p className="text-slate-700 font-medium pt-1">{point.replace(/^[•\-]\s*/, "")}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Head Teacher Section */}
        {division.headTeacher && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className={`w-1.5 h-7 rounded-full bg-gradient-to-b ${scheme.gradient} inline-block`}></span>
              <h3 className="text-xl font-bold text-slate-800">หัวหน้าฝ่าย</h3>
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex flex-col sm:flex-row items-center gap-8">
              <div className="w-32 h-32 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border-4 border-white shadow-lg">
                {division.headTeacher.photoUrl || division.headTeacher.user?.avatarUrl ? (
                  <img
                    src={division.headTeacher.photoUrl || division.headTeacher.user?.avatarUrl || ""}
                    alt={`${division.headTeacher.firstName} ${division.headTeacher.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-300">
                    {division.headTeacher.firstName?.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-2xl font-bold text-slate-800 mb-1">
                  {division.headTeacher.firstName} {division.headTeacher.lastName}
                </h4>
                <p className={`font-semibold ${scheme.text} mb-2`}>
                  {division.headTeacher.position || "หัวหน้าฝ่าย"}
                </p>
                {division.headTeacher.qualification && (
                  <p className="text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg inline-block border border-slate-100">
                    🎓 {division.headTeacher.qualification}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Members Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className={`w-1.5 h-7 rounded-full bg-gradient-to-b ${scheme.gradient} inline-block`}></span>
            <h3 className="text-xl font-bold text-slate-800">บุคลากรในฝ่าย</h3>
            <span className="ml-auto px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full">
              {division.members.length} คน
            </span>
          </div>

          {division.members.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {division.members.map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:border-slate-300 transition-all group"
                >
                  <div className="relative h-48 bg-slate-100 flex items-center justify-center overflow-hidden border-b border-slate-100">
                    {member.teacher.photoUrl || member.teacher.user?.avatarUrl ? (
                      <img
                        src={member.teacher.photoUrl || member.teacher.user?.avatarUrl || ""}
                        alt={`${member.teacher.firstName} ${member.teacher.lastName}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-50 group-hover:bg-slate-100 transition-colors">
                        <span className="text-5xl font-bold text-slate-300">
                          {member.teacher.firstName?.charAt(0) || "ค"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 text-center">
                    <h4 className="font-bold text-slate-800 text-base mb-1">
                      {member.teacher.firstName} {member.teacher.lastName}
                    </h4>
                    <p className={`text-sm font-semibold ${scheme.text} mb-2`}>
                      {member.role || member.teacher.position || "สมาชิก"}
                    </p>
                    {member.teacher.qualification && (
                      <div className="inline-block bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 text-xs text-slate-600">
                        {member.teacher.qualification}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-lg font-bold text-slate-700">ยังไม่มีสมาชิก</h4>
              <p className="text-slate-500 mt-1 text-sm">สามารถเพิ่มบุคลากรได้จากแผงควบคุม</p>
            </div>
          )}
        </section>

        {/* Navigation between divisions */}
        <section>
          {/* Quick Division Nav */}
          <div className="flex flex-wrap justify-center gap-3 py-6 border-t border-slate-200">
            {allDivisions.map((d) => (
              <Link
                key={d.id}
                href={`/administration/${d.id}`}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  d.id === divisionId
                    ? `bg-gradient-to-r ${scheme.gradient} text-white shadow-md`
                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <DynamicIcon name={d.icon || "Building"} className="w-4 h-4" />
                <span className="hidden sm:inline">{d.name}</span>
              </Link>
            ))}
          </div>

          {/* Prev / Next */}
          <div className="flex justify-between items-center gap-4 mt-4">
            {prevDivision ? (
              <Link
                href={`/administration/${prevDivision.id}`}
                className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{prevDivision.name}</span>
                <span className="sm:hidden">ฝ่ายก่อนหน้า</span>
              </Link>
            ) : (
              <div />
            )}
            {nextDivision ? (
              <Link
                href={`/administration/${nextDivision.id}`}
                className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span className="hidden sm:inline">{nextDivision.name}</span>
                <span className="sm:hidden">ฝ่ายถัดไป</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <div />
            )}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-8 mt-12 border-t-4 border-theme-secondary text-center text-sm">
        &copy; {new Date().getFullYear()} {schoolSetting?.name || "School Management System"}. All rights reserved.
      </footer>
    </div>
  );
}
