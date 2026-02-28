import prisma from "@/lib/db";
import Link from "next/link";
import { 
  Menu, X, ChevronRight, BookOpen, Users, Building, 
  Phone, Mail, MapPin, Award, FileText, Landmark,
  Calendar, ArrowRight, Bell, Trophy
} from "lucide-react";
import Image from "next/image";

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

  const marqueeText = urgentNews 
    ? `✨ ข่าวด่วน: ${urgentNews.title}` 
    : "ยินดีต้อนรับสู่เว็บไซต์ ทดสอบวิทยา (Test School) - มุ่งมั่นพัฒนาวิชาการ สร้างสานคุณธรรม";

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden text-slate-800">
      
      {/* 1. TOP HEADER & NAVIGATION */}
      <header className="bg-white border-b border-slate-200">
        {/* Top bar (Login & small links) */}
        <div className="bg-slate-900 text-white py-1.5 px-4 sm:px-6 lg:px-8 text-xs font-medium flex justify-between items-center">
          <div className="flex gap-4 opacity-80">
            <span className="hidden sm:inline-flex items-center gap-1.5"><Phone className="w-3 h-3"/> 02-XXX-XXXX</span>
            <span className="hidden sm:inline-flex items-center gap-1.5"><Mail className="w-3 h-3"/> contact@testschool.ac.th</span>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/login" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
              ระบบสำหรับบุคลากร <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            {/* Logo */}
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-14 h-14 bg-blue-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-700/20 group-hover:scale-105 transition-transform">
                <Building className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">โรงเรียนทดสอบวิทยา</h1>
                <p className="text-sm text-blue-600 font-semibold tracking-wide uppercase">Test School</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link href="#" className="text-sm font-semibold text-blue-700">หน้าแรก</Link>
              <div className="relative group">
                <button className="text-sm font-medium text-slate-600 hover:text-blue-700 flex items-center gap-1 py-4">
                  เกี่ยวกับโรงเรียน <ChevronRight className="w-4 h-4 rotate-90 opacity-50" />
                </button>
              </div>
              <div className="relative group">
                <button className="text-sm font-medium text-slate-600 hover:text-blue-700 flex items-center gap-1 py-4">
                  ฝ่ายบริหารงาน <ChevronRight className="w-4 h-4 rotate-90 opacity-50" />
                </button>
              </div>
              <Link href="#" className="text-sm font-medium text-slate-600 hover:text-blue-700">กลุ่มสาระการเรียนรู้</Link>
              <Link href="#" className="text-sm font-medium text-slate-600 hover:text-blue-700">ติดต่อเรา</Link>
            </nav>

            {/* Mobile Menu Button - Placeholder */}
            <button className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MARQUEE (News Ticker) */}
      <div className="bg-amber-100 border-b border-amber-200 py-2.5 overflow-hidden flex items-center relative z-0 shadow-sm">
        <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-amber-100 to-transparent w-12 z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-amber-100 to-transparent w-12 z-10"></div>
        <div className="flex whitespace-nowrap animate-marquee">
          <span className="text-amber-900 font-medium text-sm px-8 inline-block">
            {marqueeText}
          </span>
          {/* Duplicate for seamless loop */}
          <span className="text-amber-900 font-medium text-sm px-8 inline-block aria-hidden:true">
            {marqueeText}
          </span>
        </div>
      </div>

      {/* 3. HERO BANNER */}
      <section className="relative w-full h-[300px] md:h-[450px] bg-slate-900 overflow-hidden group">
        {/* Placeholder image using Next/Image and Unsplash pattern or strict CSS gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 mix-blend-multiply opacity-90"></div>
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 mb-6 group-hover:scale-110 transition-transform duration-500">
             <Landmark className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-md">
            “ปรัชญาจำลอง วิสัยทัศน์ก้าวหน้า”
          </h2>
          <p className="text-blue-100 text-lg max-w-2xl drop-shadow">
            โรงเรียนทดสอบวิทยา มุ่งมั่นจัดการเรียนการสอนเพื่อพัฒนาทักษะแห่งอนาคต ปลูกฝังคุณธรรม นำนักเรียนสู่สากล
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
               <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-5 py-4">
                 <h3 className="font-bold text-white flex items-center gap-2">
                   <BookOpen className="w-5 h-5 text-blue-200" />
                   ข้อมูลพื้นฐาน
                 </h3>
               </div>
               <div className="p-3">
                 <ul className="space-y-1">
                   {[
                     "ข้อมูลพื้นฐานโรงเรียน", "ประวัติโรงเรียน", "วิสัยทัศน์/พันธกิจ", 
                     "ตราสัญลักษณ์/สีประจำโรงเรียน", "ทำเนียบผู้บริหาร", "แผนที่โรงเรียน"
                   ].map((item, i) => (
                     <li key={i}>
                       <Link href="#" className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors group">
                         <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-500 transition-colors"></div>
                         {item}
                       </Link>
                     </li>
                   ))}
                 </ul>
               </div>
            </div>

            {/* Box 2: E-Service */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="bg-gradient-to-r from-amber-500 to-amber-400 px-5 py-4">
                 <h3 className="font-bold text-white flex items-center gap-2">
                   <FileText className="w-5 h-5 text-amber-100" />
                   E-Service
                 </h3>
               </div>
               <div className="p-3 grid grid-cols-2 gap-2 text-center">
                 <a href="/login" className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-amber-50 rounded-xl transition-colors border border-slate-100">
                   <Users className="w-8 h-8 text-amber-500 mb-2" />
                   <span className="text-xs font-semibold text-slate-700">บุคลากร</span>
                 </a>
                 <a href="#" className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-amber-50 rounded-xl transition-colors border border-slate-100">
                   <Trophy className="w-8 h-8 text-amber-500 mb-2" />
                   <span className="text-xs font-semibold text-slate-700">ผลงาน</span>
                 </a>
                 <a href="#" className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-amber-50 rounded-xl transition-colors border border-slate-100">
                   <Calendar className="w-8 h-8 text-amber-500 mb-2" />
                   <span className="text-xs font-semibold text-slate-700">ปฏิทิน</span>
                 </a>
                 <a href="#" className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-amber-50 rounded-xl transition-colors border border-slate-100">
                   <FileText className="w-8 h-8 text-amber-500 mb-2" />
                   <span className="text-xs font-semibold text-slate-700">ดาวน์โหลด</span>
                 </a>
               </div>
            </div>
            
          </aside>


          {/* ==================== CENTER COLUMN: NEWS & PR ==================== */}
          <div className="lg:col-span-6 space-y-8">
            
            {/* PR Header */}
            <div className="flex items-end justify-between border-b-2 border-slate-200 pb-4">
              <div className="flex gap-3 items-center">
                <div className="w-12 h-12 bg-blue-100 lg:bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                   <Bell className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">จดหมายข่าว <span className="text-blue-600">ประชาสัมพันธ์</span></h2>
                  <p className="text-sm text-slate-500 font-medium">อัปเดตข่าวสารและกิจกรรมล่าสุดจากทางโรงเรียน</p>
                </div>
              </div>
              <Link href="#" className="hidden sm:inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                ดูทั้งหมด <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {/* News Feed - Fetched from Database */}
            <div className="space-y-5">
              {announcements.length > 0 ? (
                announcements.map((news) => (
                  <article key={news.id} className="group bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden">
                    {news.isPinned && (
                      <div className="absolute top-0 right-0 bg-gradient-to-br from-amber-400 to-amber-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-bl-xl shadow-sm z-10 flex items-center gap-1">
                        📌 ปักหมุด
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row gap-5">
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
                        <h3 className="text-lg font-bold text-slate-800 mb-2 leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
                          {news.title}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-3">
                          {news.content}
                        </p>
                        <div className="mt-auto flex items-center text-xs font-semibold text-blue-600">
                          อ่านต่อ <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
                   <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                   <p className="text-slate-500 font-medium">ย้งไม่มีประกาศประชาสัมพันธ์</p>
                </div>
              )}
            </div>

            <div className="pt-4 text-center sm:hidden">
              <Link href="#" className="inline-flex items-center justify-center w-full px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors">
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
                 
                 {/* Director */}
                 <div className="flex flex-col items-center group cursor-default">
                   <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-md bg-slate-100 overflow-hidden mb-4 group-hover:shadow-lg transition-shadow">
                     {/* Placeholder Avatar */}
                     <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100">
                        <Users className="w-12 h-12 text-blue-300" />
                     </div>
                   </div>
                   <h4 className="font-bold text-slate-800 text-center">นาย สมมติ รักเรียน</h4>
                   <p className="text-xs font-semibold text-blue-600 mt-1 bg-blue-50 px-3 py-1 rounded-full text-center inline-block">ผู้อำนวยการโรงเรียน</p>
                 </div>

                 <div className="h-px bg-slate-100 w-full"></div>

                 {/* Deputy Directors */}
                 <div className="grid grid-cols-2 gap-4">
                   <div className="flex flex-col items-center">
                     <div className="w-20 h-20 rounded-full border-2 border-white shadow bg-slate-100 overflow-hidden mb-3">
                       <div className="w-full h-full flex items-center justify-center bg-slate-100">
                          <Users className="w-8 h-8 text-slate-300" />
                       </div>
                     </div>
                     <h4 className="font-bold text-slate-700 text-xs text-center line-clamp-1">นาง สมหญิง ขยัน</h4>
                     <p className="text-[10px] text-slate-500 mt-0.5 text-center">รองผู้อำนวยการ</p>
                   </div>
                   
                   <div className="flex flex-col items-center">
                     <div className="w-20 h-20 rounded-full border-2 border-white shadow bg-slate-100 overflow-hidden mb-3">
                       <div className="w-full h-full flex items-center justify-center bg-slate-100">
                          <Users className="w-8 h-8 text-slate-300" />
                       </div>
                     </div>
                     <h4 className="font-bold text-slate-700 text-xs text-center line-clamp-1">นาย สมชาย อดทน</h4>
                     <p className="text-[10px] text-slate-500 mt-0.5 text-center">รองผู้อำนวยการ</p>
                   </div>
                 </div>

               </div>
            </div>

            {/* Quick Contact Box */}
            <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl shadow-sm text-white p-6 relative overflow-hidden group border border-blue-800">
               <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
               <h3 className="font-bold mb-4 flex items-center gap-2">
                 <MapPin className="w-5 h-5 text-amber-400" /> ติดต่อเรา
               </h3>
               <address className="not-italic text-sm text-blue-100/80 space-y-2 leading-relaxed">
                 <p>123 หมู่ 4 ถนนจำลองสมมติ<br/>ตำบลใจดี อำเภอเมือง<br/>จังหวัดสมมติ 12345</p>
                 <div className="pt-2 flex items-center gap-2">
                   <Phone className="w-4 h-4 text-amber-400" /> 02-XXX-XXXX
                 </div>
               </address>
            </div>

          </aside>

        </div>
      </main>

      {/* 5. MINIMAL FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t-4 border-amber-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center rounded-lg">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">โรงเรียนทดสอบวิทยา</span>
              <span className="text-xs">Test School Management System</span>
            </div>
          </div>
          <p className="text-xs text-center">
            &copy; {new Date().getFullYear()} Demo Education Project. <br className="sm:hidden" />Designed with Next.js & Tailwind CSS.
          </p>
        </div>
      </footer>

    </div>
  );
}
