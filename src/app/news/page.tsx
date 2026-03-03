import prisma from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Bell, Building, Calendar, FileText } from "lucide-react";

export const revalidate = 60;

export default async function NewsListPage() {
  const schoolSetting = await prisma.schoolSetting.findFirst();
  const primaryColor = schoolSetting?.primaryColor || "#1d4ed8";
  const secondaryColor = schoolSetting?.secondaryColor || "#f59e0b";

  const announcements = await prisma.announcement.findMany({
    where: { targetRole: null },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 flex flex-col">
      <style dangerouslySetInnerHTML={{__html: `
        :root { --theme-primary: ${primaryColor}; --theme-secondary: ${secondaryColor}; }
        .bg-theme-primary { background-color: var(--theme-primary); }
        .text-theme-primary { color: var(--theme-primary); }
        .bg-theme-secondary { background-color: var(--theme-secondary); }
        .border-theme-secondary { border-color: var(--theme-secondary); }
      `}} />

      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm shrink-0">
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
              <h1 className="text-xl font-bold tracking-tight text-slate-900">ประชาสัมพันธ์</h1>
              <p className="text-xs text-theme-primary font-semibold">{schoolSetting?.name || "โรงเรียนทดสอบวิทยา"}</p>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-theme-primary transition-colors bg-slate-100 px-4 py-2 rounded-xl hover:bg-slate-200">
            <ArrowLeft className="w-4 h-4" /> กลับหน้าหลัก
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-theme-primary/10 rounded-2xl flex items-center justify-center text-theme-primary">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">ข่าวประชาสัมพันธ์ทั้งหมด</h2>
            <p className="text-sm text-slate-500">จดหมายข่าวและกิจกรรมล่าสุดจากทางโรงเรียน</p>
          </div>
        </div>

        {announcements.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {announcements.map((news) => (
              <Link key={news.id} href={`/news/${news.id}`} className="group block">
                <article className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md hover:border-theme-primary/30 transition-all h-full flex flex-col relative overflow-hidden">
                  {news.isPinned && (
                    <div className="absolute top-0 right-0 bg-theme-secondary text-white text-[10px] font-bold px-3 py-1.5 rounded-bl-xl shadow-sm z-10">
                      📌 ปักหมุด
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md tracking-wide">
                      {news.type === "GENERAL" ? "ทั่วไป" : news.type === "URGENT" ? "ด่วน" : "กิจกรรม"}
                    </span>
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(news.createdAt).toLocaleDateString("th-TH", { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2 leading-snug group-hover:text-theme-primary transition-colors line-clamp-2">
                    {news.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed mb-4 flex-1">
                    {news.content}
                  </p>
                  <div className="text-sm font-semibold text-theme-primary flex items-center mt-auto">
                    อ่านรายละเอียด <ArrowLeft className="w-4 h-4 ml-1 rotate-180 group-hover:translate-x-1 transition-transform" />
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
             <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
             <p className="text-slate-500 font-medium">ยังไม่มีประกาศประชาสัมพันธ์</p>
          </div>
        )}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8 border-t-4 border-theme-secondary text-center text-sm">
        &copy; {new Date().getFullYear()} {schoolSetting?.name || "School Management System"}
      </footer>
    </div>
  );
}
