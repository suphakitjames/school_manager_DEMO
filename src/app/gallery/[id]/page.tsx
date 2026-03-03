import prisma from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building, Calendar, Image as ImageIcon, Info, ExternalLink } from "lucide-react";
import GalleryViewer from "@/components/landing/GalleryViewer";

export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GalleryDetailPage({ params }: Props) {
  const { id } = await params;
  
  if (isNaN(Number(id))) {
    notFound();
  }

  const gallery = await prisma.activityGallery.findUnique({
    where: { id: Number(id) },
  });

  if (!gallery || !gallery.isActive) {
    notFound();
  }

  const schoolSetting = await prisma.schoolSetting.findFirst();
  const primaryColor = schoolSetting?.primaryColor || "#1d4ed8";
  const secondaryColor = schoolSetting?.secondaryColor || "#f59e0b";

  const imagesList = Array.isArray(gallery.images) ? (gallery.images as string[]) : [];

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
          <Link href="/gallery" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-theme-primary transition-colors bg-slate-100 px-4 py-2 rounded-xl hover:bg-slate-200">
            <ArrowLeft className="w-4 h-4" /> กลับหน้ารวมอัลบั้ม
          </Link>
        </div>
      </header>

      {/* COVER SECTION */}
      <div className="bg-slate-900 w-full relative">
         <div className="absolute inset-0 opacity-20">
             {gallery.coverImage && (
                 <img src={gallery.coverImage} className="w-full h-full object-cover blur-md scale-105" alt="Background Blur" />
             )}
         </div>
         <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col items-center text-center">
             <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-white backdrop-blur-md border border-white/20 shadow-xl mb-6">
                 <ImageIcon className="w-10 h-10 drop-shadow" />
             </div>
             
             {gallery.facebookUrl && (
                <a href={gallery.facebookUrl} target="_blank" rel="noopener noreferrer" className="mb-6 inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 border border-blue-400/50">
                   <ExternalLink className="w-4 h-4" /> ดูอัลบั้มเต็มบน Facebook
                </a>
             )}
             
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-md border border-white/10 mb-6 drop-shadow-sm">
                 <Calendar className="w-4 h-4" />
                 จัดเมื่อ: {new Date(gallery.date).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
             </div>
             
             <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight drop-shadow-lg max-w-4xl leading-tight mb-6">
                 {gallery.title}
             </h1>
             
             {gallery.description && (
                 <p className="text-lg text-white/80 max-w-3xl leading-relaxed drop-shadow-md">
                     {gallery.description}
                 </p>
             )}
         </div>
      </div>

      {/* GALLERY GRID */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
               ประมวลภาพกิจกรรม
            </h2>
            <div className="text-sm font-semibold text-slate-500 bg-slate-100 px-4 py-1.5 rounded-full">
               ทั้งหมด {imagesList.length} ภาพ
            </div>
        </div>

        {imagesList.length > 0 ? (
           <GalleryViewer images={imagesList} title={gallery.title} />
        ) : gallery.facebookUrl ? (
           <div className="text-center py-20 bg-blue-50/50 rounded-3xl border border-blue-100 max-w-2xl mx-auto shadow-sm">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                  <ExternalLink className="w-8 h-8" />
              </div>
              <p className="text-lg text-slate-800 font-bold mb-3">รูปภาพกิจกรรมนี้อยู่ใน Facebook</p>
              <a href={gallery.facebookUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm">
                 คลิกเพื่อดูอัลบั้มภาพบน Facebook <ExternalLink className="w-4 h-4" />
              </a>
           </div>
        ) : (
           <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 border-dashed max-w-2xl mx-auto shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Info className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-lg text-slate-600 font-bold mb-1">อัลบั้มนี้ยังไม่มีรูปภาพเพิ่มเติม</p>
              <p className="text-sm text-slate-400">อัลบั้มนี้อาจมีเพียงภาพปก หรือรอการอัปเดตเพิ่มเติมจากทางโรงเรียน</p>
           </div>
        )}
        
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8 border-t-4 border-theme-secondary text-center text-sm">
        &copy; {new Date().getFullYear()} {schoolSetting?.name || "School Management System"}
      </footer>
    </div>
  );
}
