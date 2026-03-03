import prisma from "@/lib/db";
import Link from "next/link";
import { 
  Menu, ChevronRight, BookOpen, Users, Building, 
  Phone, Mail, MapPin, FileText, Landmark,
  ArrowRight, Bell, Globe, Facebook
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import NavDropdown from "@/components/landing/NavDropdown";
import AboutDropdown from "@/components/landing/AboutDropdown";
import AdminDropdown from "@/components/landing/AdminDropdown";
import GlobalPopupBanner from "@/components/landing/GlobalPopupBanner";

// Helper to dynamically render Lucide icons
const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
  const IconComponent = (LucideIcons as any)[name] || BookOpen;
  return <IconComponent className={className} />;
};

export const revalidate = 60; // Revalidate every 60 seconds

export default async function LandingPage() {
  // Fetch public announcements for the main content area
  const announcements = await prisma.announcement.findMany({
    where: { targetRole: null }, 
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take: 4,
  });

  // Fetch a pinned or latest urgent announcement for the marquee
  const urgentNews = await prisma.announcement.findFirst({
    where: { targetRole: null, OR: [{ type: "URGENT" }, { isPinned: true }] },
    orderBy: { createdAt: "desc" }
  });

  // Fetch School Settings
  const schoolSetting = await prisma.schoolSetting.findFirst();

  // Fetch Banners
  const activeBanners = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" }
  });

  // Fetch Landing Links
  const landingLinks = await prisma.landingLink.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" }
  });

  const quickLinks = landingLinks.filter(l => l.type === "QUICK_LINK");
  const eServices = landingLinks.filter(l => l.type === "E_SERVICE");

  // Fetch Executive Teachers
  const executives = await prisma.teacher.findMany({
    where: { isExecutive: true },
    orderBy: { executiveOrder: "asc" },
    include: { user: true }
  });

  // Fetch Documents
  const documents = await prisma.document.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Fetch distinct departments for the dropdown nav
  const allDeptTeachers = await prisma.teacher.findMany({
    where: { isActive: true, isExecutive: false },
    select: { department: true },
    distinct: ["department"],
  });
  const navDepartments = [...new Set(
    allDeptTeachers
      .map(t => t.department?.trim())
      .filter((d): d is string => !!d && d !== "-")
  )].sort((a, b) => a.localeCompare(b, "th"));

  // Fetch Administrative Divisions for navbar
  const adminDivisions = await prisma.administrativeDivision.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: { id: true, name: true, nameEn: true, icon: true },
  });
  
  // Separate Director (order 1 or lowest) and Deputy Directors
  const director = executives.length > 0 ? executives[0] : null;
  const deputyDirectors = executives.slice(1);

  const marqueeText = urgentNews 
    ? `✨ ข่าวด่วน: ${urgentNews.title}` 
    : `ยินดีต้อนรับสู่เว็บไซต์ ${schoolSetting?.name || "ทดสอบวิทยา"} - ${schoolSetting?.philosophy || "มุ่งมั่นพัฒนาวิชาการ สร้างสานคุณธรรม"}`;

  // Use dynamic colors if available, otherwise fallbacks
  const primaryColor = schoolSetting?.primaryColor || "#1d4ed8"; // tailwind blue-700
  const secondaryColor = schoolSetting?.secondaryColor || "#f59e0b"; // tailwind amber-500

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden text-slate-800">
      
      {/* Dynamic Style Block for custom colors */}
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
        .border-theme-secondary { border-color: var(--theme-secondary); }
        .hover\\:text-theme-primary:hover { color: var(--theme-primary); }
        .hover\\:bg-theme-primary:hover { background-color: var(--theme-primary); text-color: white; }
      `}} />

      {/* 1. TOP HEADER & NAVIGATION */}
      <header className="bg-white border-b border-slate-200">
        {/* Top bar (Login & small links) */}
        <div className="bg-slate-900 text-white py-1.5 px-4 sm:px-6 lg:px-8 text-xs font-medium flex justify-between items-center">
          <div className="flex gap-4 opacity-80">
            {schoolSetting?.phone && <span className="hidden sm:inline-flex items-center gap-1.5"><Phone className="w-3 h-3"/> {schoolSetting.phone}</span>}
            {schoolSetting?.email && <span className="hidden sm:inline-flex items-center gap-1.5"><Mail className="w-3 h-3"/> {schoolSetting.email}</span>}
          </div>
          <div className="flex gap-4 items-center">
            {schoolSetting?.facebookUrl && (
              <a href={schoolSetting.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-theme-secondary transition-colors">
                <Facebook className="w-3.5 h-3.5" />
              </a>
            )}
            <Link href="/login" className="hover:text-theme-secondary transition-colors flex items-center gap-1.5">
              ระบบสำหรับบุคลากร <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            {/* Logo */}
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-14 h-14 bg-theme-primary text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                {schoolSetting?.logoUrl ? (
                  <img src={schoolSetting.logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
                ) : (
                  <Building className="w-8 h-8" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">{schoolSetting?.name || "โรงเรียนทดสอบวิทยา"}</h1>
                {schoolSetting?.nameEn && <p className="text-sm text-theme-primary font-semibold tracking-wide uppercase">{schoolSetting.nameEn}</p>}
              </div>
            </div>

            {/* Desktop Menu */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link href="#" className="text-sm font-semibold text-theme-primary">หน้าแรก</Link>
              <Link href="/gallery" className="text-sm font-medium text-slate-600 hover:text-theme-primary">ภาพกิจกรรม</Link>
              <AboutDropdown />
              <AdminDropdown divisions={adminDivisions} />
              <NavDropdown departments={navDepartments} hasExecutives={executives.length > 0} />
              <Link href="/contact" className="text-sm font-medium text-slate-600 hover:text-theme-primary">ติดต่อเรา</Link>
            </nav>

            {/* Mobile Menu Button - Placeholder */}
            <button className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MARQUEE (News Ticker) */}
      <div className="bg-theme-secondary/10 border-b border-theme-secondary/20 py-2.5 overflow-hidden flex items-center relative z-0 shadow-sm text-theme-secondary">
        <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-white to-transparent w-12 z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-white to-transparent w-12 z-10"></div>
        <div className="flex whitespace-nowrap animate-marquee">
          <span className="font-medium text-sm px-8 inline-block mix-blend-multiply drop-shadow-sm">
            {marqueeText}
          </span>
          <span className="font-medium text-sm px-8 inline-block aria-hidden:true mix-blend-multiply drop-shadow-sm">
            {marqueeText}
          </span>
        </div>
      </div>

      {/* 3. HERO BANNER */}
      <section className="relative w-full h-[300px] md:h-[450px] bg-slate-900 overflow-hidden group">
        
        {/* Carousel implementation (simplified for first banner if multiple, or fallback) */}
        {activeBanners.length > 0 ? (
          <img src={activeBanners[0].imageUrl} alt="Hero Banner" className="absolute inset-0 w-full h-full object-cover opacity-80" />
        ) : schoolSetting?.heroBannerUrl ? (
          <img src={schoolSetting.heroBannerUrl} alt="School Banner" className="absolute inset-0 w-full h-full object-cover opacity-80" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 mix-blend-multiply opacity-90"></div>
        )}
        
        <div className="absolute inset-0 bg-black/40 z-0"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl">
             <Landmark className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            “{schoolSetting?.philosophy || "ปรัชญาจำลอง วิสัยทัศน์ก้าวหน้า"}”
          </h2>
          <p className="text-white/90 text-lg md:text-xl max-w-3xl drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-medium">
            {schoolSetting?.vision || "โรงเรียนทดสอบวิทยา มุ่งมั่นจัดการเรียนการสอนเพื่อพัฒนาทักษะแห่งอนาคต ปลูกฝังคุณธรรม นำนักเรียนสู่สากล"}
          </p>
        </div>
      </section>

      {/* 4. MAIN LAYOUT (3 COLUMNS) */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ==================== LEFT COLUMN: QUICK LINKS ==================== */}
          <aside className="lg:col-span-3 space-y-6">
            
            {/* Box 1: Info Links */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="bg-theme-primary px-5 py-4">
                 <h3 className="font-bold text-white flex items-center gap-2">
                   <BookOpen className="w-5 h-5 text-white/80" />
                   ข้อมูลพื้นฐาน (Quick Links)
                 </h3>
               </div>
               <div className="p-3">
                 <ul className="space-y-1">
                   {quickLinks.length > 0 ? quickLinks.map((item) => (
                     <li key={item.id}>
                       <Link href={item.url} className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:text-theme-primary hover:bg-slate-50 rounded-xl transition-colors group">
                         <DynamicIcon name={item.icon || "Link"} className="w-4 h-4 text-slate-400 group-hover:text-theme-primary transition-colors" />
                         {item.title}
                       </Link>
                     </li>
                   )) : (
                     <li className="px-4 py-3 text-sm text-slate-400 text-center">ยังไม่มีข้อมูล</li>
                   )}
                 </ul>
               </div>
            </div>

            {/* Box 2: E-Service */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="bg-theme-secondary px-5 py-4">
                 <h3 className="font-bold text-white flex items-center gap-2 drop-shadow-sm">
                   <Globe className="w-5 h-5 text-white/90" />
                   E-Service
                 </h3>
               </div>
               <div className="p-3 grid grid-cols-2 gap-2 text-center">
                 {eServices.length > 0 ? eServices.map((item) => (
                   <a key={item.id} href={item.url} className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-100 group">
                     <DynamicIcon name={item.icon || "Monitor"} className="w-8 h-8 text-theme-secondary mb-2 group-hover:scale-110 transition-transform" />
                     <span className="text-xs font-semibold text-slate-700 break-words w-full px-1">{item.title}</span>
                   </a>
                 )) : (
                   <div className="col-span-2 py-6 text-sm text-slate-400">ยังไม่มีบริการ</div>
                 )}
               </div>
            </div>

            {/* Box 3: Documents Download */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
               <div className="bg-indigo-600 px-5 py-4 flex justify-between items-center">
                 <h3 className="font-bold text-white flex items-center gap-2 drop-shadow-sm text-sm">
                   <FileText className="w-5 h-5 text-white/90" />
                   ดาวน์โหลดเอกสาร
                 </h3>
                 <Link href="/documents" className="text-xs text-indigo-100 hover:text-white transition-colors flex items-center gap-1">
                   ดูทั้งหมด <ArrowRight className="w-3 h-3" />
                 </Link>
               </div>
               <div className="p-3 flex-1 flex flex-col">
                 <ul className="space-y-1.5 flex-1">
                   {documents.length > 0 ? documents.map((doc) => (
                     <li key={doc.id}>
                       <a 
                         href={doc.fileUrl} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="flex items-start gap-3 p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 rounded-xl transition-colors group"
                       >
                         <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                           <FileText className="w-4 h-4" />
                         </div>
                         <div className="flex-1 min-w-0">
                           <h4 className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700 truncate">{doc.title}</h4>
                           <span className="text-[10px] px-1.5 py-0.5 bg-slate-200/50 text-slate-500 rounded mt-1 inline-block">
                             {doc.category === "STUDENT" ? "นักเรียน/ผู้ปกครอง" : doc.category === "TEACHER" ? "ครู/บุคลากร" : "ทั่วไป"}
                           </span>
                         </div>
                       </a>
                     </li>
                   )) : (
                     <li className="px-4 py-8 text-sm text-slate-400 text-center flex flex-col items-center justify-center h-full gap-2">
                       <FileText className="w-8 h-8 text-slate-200" />
                       ไม่มีเอกสารใหม่
                     </li>
                   )}
                 </ul>
               </div>
            </div>
            
          </aside>


          {/* ==================== CENTER COLUMN: NEWS & PR ==================== */}
          <div className="lg:col-span-6 space-y-8">
            
            {/* PR Header */}
            <div className="flex items-end justify-between border-b-2 border-slate-200 pb-4">
              <div className="flex gap-3 items-center">
                <div className="w-12 h-12 bg-theme-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                   <Bell className="w-6 h-6 text-theme-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">จดหมายข่าว <span className="text-theme-primary">ประชาสัมพันธ์</span></h2>
                  <p className="text-sm text-slate-500 font-medium">อัปเดตข่าวสารและกิจกรรมล่าสุดจากทางโรงเรียน</p>
                </div>
              </div>
              <Link href="/news" className="hidden sm:inline-flex items-center text-sm font-semibold text-theme-primary hover:text-opacity-80 transition-opacity">
                ดูทั้งหมด <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {/* News Feed - Fetched from Database */}
            <div className="space-y-5">
              {announcements.length > 0 ? (
                announcements.map((news) => (
                  <Link key={news.id} href={`/news/${news.id}`} className="group block">
                    <article className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-theme-primary/30 transition-all relative overflow-hidden h-full flex flex-col">
                      {news.isPinned && (
                        <div className="absolute top-0 right-0 bg-theme-secondary text-white text-[10px] font-bold px-3 py-1.5 rounded-bl-xl shadow-sm z-10 flex items-center gap-1 drop-shadow-sm">
                          📌 ปักหมุด
                        </div>
                      )}
                      
                      <div className="flex flex-col sm:flex-row gap-5 flex-1">
                        {/* Placeholder Image for News */}
                        <div className="w-full sm:w-40 h-40 sm:h-32 bg-slate-100 rounded-xl shrink-0 overflow-hidden relative group-hover:shadow-inner transition-all border border-slate-200">
                           {/* Fallback abstract pattern since we don't have real images in DB yet */}
                           <div className="absolute inset-0 opacity-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                           <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-amber-50 flex items-center justify-center">
                              <FileText className="w-10 h-10 text-slate-300 group-hover:scale-110 transition-transform duration-500" />
                           </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-center">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md tracking-wide">
                              {news.type === "GENERAL" ? "ทั่วไป" : news.type === "URGENT" ? "ด่วน" : "กิจกรรม"}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                              {new Date(news.createdAt).toLocaleDateString("th-TH", { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-800 mb-2 leading-snug group-hover:text-theme-primary transition-colors line-clamp-2">
                            {news.title}
                          </h3>
                          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-3 flex-1">
                            {news.content}
                          </p>
                          <div className="mt-auto flex items-center text-xs font-semibold text-theme-primary">
                            อ่านต่อ <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
                   <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                   <p className="text-slate-500 font-medium">ย้งไม่มีประกาศประชาสัมพันธ์</p>
                </div>
              )}
            </div>

            <div className="pt-4 text-center sm:hidden">
              <Link href="/news" className="inline-flex items-center justify-center w-full px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors">
                ดูข่าวทั้งหมด <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
            
          </div>


          {/* ==================== RIGHT COLUMN: DIRECTORS ==================== */}
          <aside className="lg:col-span-3 space-y-6">
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="bg-slate-800 px-5 py-4">
                 <h3 className="font-bold text-white text-center">
                   ทำเนียบผู้บริหาร
                 </h3>
               </div>
               <div className="p-5 space-y-6">
                 
                 {director ? (
                   <>
                     {/* Director */}
                     <div className="flex flex-col items-center group cursor-default">
                       <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-md bg-slate-100 overflow-hidden mb-4 group-hover:shadow-lg transition-shadow">
                         {director.photoUrl || director.user?.avatarUrl ? (
                           <img src={director.photoUrl || director.user?.avatarUrl || ""} alt={`${director.firstName} ${director.lastName}`} className="w-full h-full object-cover" />
                         ) : (
                           <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                              <span className="text-3xl font-bold text-slate-300">{director.firstName?.charAt(0) || "ผ"}</span>
                           </div>
                         )}
                       </div>
                       <h4 className="font-bold text-slate-800 text-center">{director.firstName} {director.lastName}</h4>
                       <p className="text-xs font-semibold text-theme-primary mt-1 bg-theme-primary/10 px-3 py-1 rounded-full text-center inline-block">ผู้อำนวยการโรงเรียน</p>
                     </div>

                     {deputyDirectors.length > 0 && <div className="h-px bg-slate-100 w-full"></div>}

                     {/* Deputy Directors */}
                     {deputyDirectors.length > 0 && (
                       <div className="grid grid-cols-2 gap-4">
                         {deputyDirectors.map(deputy => (
                           <div key={deputy.id} className="flex flex-col items-center">
                             <div className="w-20 h-20 rounded-full border-2 border-white shadow bg-slate-100 overflow-hidden mb-3 group-hover:shadow-md transition-shadow">
                               {deputy.photoUrl || deputy.user?.avatarUrl ? (
                                 <img src={deputy.photoUrl || deputy.user?.avatarUrl || ""} alt={`${deputy.firstName} ${deputy.lastName}`} className="w-full h-full object-cover" />
                               ) : (
                                 <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                    <span className="text-xl font-bold text-slate-300">{deputy.firstName?.charAt(0) || "ร"}</span>
                                 </div>
                               )}
                             </div>
                             <h4 className="font-bold text-slate-700 text-xs text-center line-clamp-1">{deputy.firstName} {deputy.lastName}</h4>
                             <p className="text-[10px] text-slate-500 mt-0.5 text-center">รองผู้อำนวยการ</p>
                           </div>
                         ))}
                       </div>
                     )}
                   </>
                 ) : (
                   <div className="text-center py-10 text-slate-400 text-sm">ยังไม่มีข้อมูลผู้บริหาร</div>
                 )}

               </div>
            </div>

            {/* Quick Contact Box */}
            <div className="bg-slate-800 rounded-2xl shadow-sm text-white p-6 relative overflow-hidden group">
               <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
               <div className="flex justify-between items-center mb-4 relative z-10">
                 <h3 className="font-bold flex items-center gap-2">
                   <MapPin className="w-5 h-5 text-theme-secondary" /> ติดต่อเรา
                 </h3>
                 <Link href="/contact" className="text-xs text-theme-secondary hover:text-white transition-colors flex items-center gap-1 group/btn">
                   ดูแผนที่ <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                 </Link>
               </div>
               <address className="not-italic text-sm text-slate-300 space-y-3 leading-relaxed relative z-10">
                 <p>{schoolSetting?.address || "123 โรงเรียนทดสอบวิทยา ถนนสมมติ ตำบลจำลอง อำเภอเมือง จังหวัดสมมติ 12345"}</p>
                 <div className="pt-2 border-t border-slate-700/50 flex flex-col gap-2">
                   {schoolSetting?.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /> {schoolSetting.phone}</div>}
                   {schoolSetting?.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /> {schoolSetting.email}</div>}
                 </div>
               </address>
            </div>

          </aside>

        </div>
      </main>

      {/* 5. MINIMAL FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t-4 border-theme-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-theme-primary text-white flex items-center justify-center rounded-lg">
              {schoolSetting?.logoUrl ? <img src={schoolSetting.logoUrl} alt="Logo" className="w-5 h-5 object-contain" /> : <Building className="w-4 h-4" />}
            </div>
            <div>
              <span className="font-bold text-white block">{schoolSetting?.name || "โรงเรียนทดสอบวิทยา"}</span>
              <span className="text-xs">Test School Management System</span>
            </div>
          </div>
          <p className="text-xs text-center">
            &copy; {new Date().getFullYear()} Demo Education Project. <br className="sm:hidden" />Designed with Next.js & Tailwind CSS.
          </p>
        </div>
      </footer>

      {/* Popup Banner */}
      <GlobalPopupBanner />

    </div>
  );
}
