import prisma from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Building, Calendar, Image as ImageIcon } from "lucide-react";

export const revalidate = 60;

export default async function GalleryListPage() {
  const schoolSetting = await prisma.schoolSetting.findFirst();
  const primaryColor = schoolSetting?.primaryColor || "#1d4ed8";
  const secondaryColor = schoolSetting?.secondaryColor || "#f59e0b";

  const galleries = await prisma.activityGallery.findMany({
    where: { isActive: true },
    orderBy: { date: "desc" },
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
              <h1 className="text-xl font-bold tracking-tight text-slate-900">ภาพกิจกรรม</h1>
              <p className="text-xs text-theme-primary font-semibold">{schoolSetting?.name || "โรงเรียนทดสอบวิทยา"}</p>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-theme-primary transition-colors bg-slate-100 px-4 py-2 rounded-xl hover:bg-slate-200">
            <ArrowLeft className="w-4 h-4" /> กลับหน้าหลัก
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-theme-primary/10 rounded-2xl flex items-center justify-center text-theme-primary shrink-0">
              <ImageIcon className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">ภาพกิจกรรมโรงเรียน</h2>
              <p className="text-base text-slate-500 mt-1">ประมวลภาพกิจกรรมและผลงานต่างๆ ของนักเรียนและบุคลากร</p>
            </div>
          </div>
        </div>

        {galleries.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {galleries.map((gallery) => {
               const imagesCount = Array.isArray(gallery.images) ? gallery.images.length : 0;
               return (
                  <Link key={gallery.id} href={`/gallery/${gallery.id}`} className="group block">
                     <article className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 hover:border-theme-primary/30 transition-all duration-300 h-full flex flex-col">
                     <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 relative mb-4">
                        {gallery.coverImage ? (
                           <img 
                           src={gallery.coverImage} 
                           alt={gallery.title} 
                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                           />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                           <ImageIcon className="w-12 h-12" />
                           </div>
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {imagesCount > 0 && (
                           <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm border border-white/10 group-hover:bg-theme-primary transition-colors">
                              <ImageIcon className="w-3.5 h-3.5" /> +{imagesCount} รูป
                           </div>
                        )}
                     </div>
                     <div className="flex-1 flex flex-col px-2 pb-2">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                           <Calendar className="w-3.5 h-3.5" />
                           {new Date(gallery.date).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
                           </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 leading-snug group-hover:text-theme-primary transition-colors line-clamp-2 mb-2">
                           {gallery.title}
                        </h3>
                        {gallery.description && (
                           <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4 flex-1">
                           {gallery.description}
                           </p>
                        )}
                        <div className="mt-auto text-sm font-bold text-theme-primary flex items-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                           เปิดดูอัลบั้ม <ArrowLeft className="w-4 h-4 ml-1 rotate-180" />
                        </div>
                     </div>
                     </article>
                  </Link>
               );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 border-dashed max-w-2xl mx-auto shadow-sm">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <ImageIcon className="w-10 h-10 text-slate-300" />
             </div>
             <p className="text-lg text-slate-600 font-bold mb-1">ยังไม่มีภาพกิจกรรมในขณะนี้</p>
             <p className="text-slate-400">อัลบั้มภาพกิจกรรมใหม่จะแสดงที่นี่เมื่อมีการอัปเดต</p>
          </div>
        )}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8 border-t-4 border-theme-secondary text-center text-sm">
        &copy; {new Date().getFullYear()} {schoolSetting?.name || "School Management System"}
      </footer>
    </div>
  );
}
