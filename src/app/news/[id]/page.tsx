import prisma from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bell, Building, Calendar, FileText, User } from "lucide-react";

export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;
  
  if (isNaN(Number(id))) {
    notFound();
  }

  const news = await prisma.announcement.findUnique({
    where: { id: Number(id) },
    include: { author: true }
  });

  if (!news || news.targetRole !== null) {
    notFound();
  }

  const schoolSetting = await prisma.schoolSetting.findFirst();
  const primaryColor = schoolSetting?.primaryColor || "#1d4ed8";
  const secondaryColor = schoolSetting?.secondaryColor || "#f59e0b";

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
          <Link href="/news" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-theme-primary transition-colors bg-slate-100 px-4 py-2 rounded-xl hover:bg-slate-200">
            <ArrowLeft className="w-4 h-4" /> กลับหน้ารวมข่าว
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <article className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 relative overflow-hidden">
          {news.isPinned && (
            <div className="absolute top-0 right-8 bg-theme-secondary text-white text-xs font-bold px-4 py-2 rounded-b-xl shadow-sm z-10 flex items-center gap-1.5">
              📌 ประกาศสำคัญ (ปักหมุด)
            </div>
          )}
          
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <span className="text-sm font-bold px-3 py-1 bg-theme-primary/10 text-theme-primary rounded-lg tracking-wide border border-theme-primary/20">
              {news.type === "GENERAL" ? "ข่าวทั่วไป" : news.type === "URGENT" ? "ข่าวด่วน" : "กิจกรรม"}
            </span>
            <span className="text-sm text-slate-500 font-medium flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
              <Calendar className="w-4 h-4" />
              {new Date(news.createdAt).toLocaleDateString("th-TH", { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-8 leading-tight">
            {news.title}
          </h1>
          
          <div className="h-px bg-slate-100 w-full mb-8" />
          
          <div className="prose prose-slate max-w-none prose-lg text-slate-700 whitespace-pre-wrap leading-relaxed">
            {news.content}
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 text-slate-400">
              {news.author?.avatarUrl ? (
                 <img src={news.author.avatarUrl} alt="author" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">ผู้ประกาศ: {news.author?.name || "ผู้ดูแลระบบ"}</p>
              <p className="text-xs text-slate-500">
                อัปเดตล่าสุด: {new Date(news.updatedAt).toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' })} น.
              </p>
            </div>
          </div>
        </article>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8 border-t-4 border-theme-secondary text-center text-sm">
        &copy; {new Date().getFullYear()} {schoolSetting?.name || "School Management System"}
      </footer>
    </div>
  );
}
