import prisma from "@/lib/db";
import Link from "next/link";
import {
  ArrowLeft,
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Facebook,
  Clock,
  Send,
} from "lucide-react";
import ContactForm from "@/components/contact/ContactForm";
import { Toaster } from "react-hot-toast";

export const revalidate = 60;

export default async function ContactPage() {
  const schoolSetting = await prisma.schoolSetting.findFirst();
  const primaryColor = schoolSetting?.primaryColor || "#1d4ed8";
  const secondaryColor = schoolSetting?.secondaryColor || "#f59e0b";

  const phoneHref = schoolSetting?.phone
    ? `tel:${schoolSetting.phone.replace(/\D/g, "")}`
    : "#";
  const emailHref = schoolSetting?.email
    ? `mailto:${schoolSetting.email}`
    : "#";

  // Auto-generate map embed using school name and address
  const mapQuery = encodeURIComponent(
    `${schoolSetting?.name || "โรงเรียน"} ${schoolSetting?.address || ""}`.trim()
  );
  const mapEmbedUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  
  // Check if mapUrl is an iframe code (for backward compatibility)
  const isIframe = schoolSetting?.mapUrl?.includes("<iframe");

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-900">
      <Toaster position="top-right" />

      {/* Dynamic Theme Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          :root {
            --theme-primary: ${primaryColor};
            --theme-secondary: ${secondaryColor};
          }
          .bg-theme-primary { background-color: var(--theme-primary); }
          .text-theme-primary { color: var(--theme-primary); }
          .border-theme-primary { border-color: var(--theme-primary); }
          .bg-theme-secondary { background-color: var(--theme-secondary); }
          .text-theme-secondary { color: var(--theme-secondary); }
        `,
        }}
      />

      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="w-12 h-12 bg-theme-primary text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-300"
            >
              {schoolSetting?.logoUrl ? (
                <img
                  src={schoolSetting.logoUrl}
                  alt="Logo"
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <Building className="w-6 h-6" />
              )}
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
                ติดต่อเรา
              </h1>
              <p className="text-xs text-theme-primary font-bold tracking-wide">
                {schoolSetting?.name || "โรงเรียนทดสอบวิทยา"}
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-theme-primary transition-colors bg-slate-100/80 backdrop-blur-sm px-4 py-2.5 rounded-xl hover:bg-slate-200/80"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">กลับหน้าหลัก</span>
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <div className="relative overflow-hidden bg-slate-900 pt-20 pb-28 md:pt-28 md:pb-36">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-0" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-theme-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 z-0 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-theme-secondary/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 z-0 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 mb-6 sm:mb-8">
            <Send className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4 sm:mb-6">
            พร้อมให้คำปรึกษา
            <br className="sm:hidden" />
            และบริการคุณ
          </h2>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed px-4">
            หากคุณมีข้อสงสัยเกี่ยวกับการรับสมัครเรียน ข้อมูลหลักสูตร
            หรือต้องการติดต่อสอบถามเรื่องอื่นๆ
            สามารถติดต่อเราได้ผ่านช่องทางด้านล่างนี้
          </p>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-24 relative z-20 pb-20">
        {/* INFO CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {/* Address Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40 border border-slate-100 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300 group">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
              <MapPin className="w-6 h-6 text-rose-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 sm:mb-3">
              ที่อยู่โรงเรียน
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              {schoolSetting?.address || "โปรดเพิ่มที่อยู่ในระบบหลังบ้าน"}
            </p>
          </div>

          {/* Contact Methods Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40 border border-slate-100 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300 group">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
              <Phone className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 sm:mb-3">
              ช่องทางติดต่อหลัก
            </h3>
            <div className="space-y-3">
              <a
                href={phoneHref}
                className="flex items-center gap-3 text-sm font-semibold text-slate-600 hover:text-theme-primary transition-colors p-2 -ml-2 rounded-lg hover:bg-slate-50"
              >
                <Phone className="w-4 h-4 text-slate-400" />
                {schoolSetting?.phone || "ไม่ได้ระบุเบอร์โทร"}
              </a>
              <a
                href={emailHref}
                className="flex items-center gap-3 text-sm font-semibold text-slate-600 hover:text-theme-primary transition-colors p-2 -ml-2 rounded-lg hover:bg-slate-50 truncate"
              >
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">
                  {schoolSetting?.email || "ไม่ได้ระบุอีเมล"}
                </span>
              </a>
            </div>
          </div>

          {/* Online & Social Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40 border border-slate-100 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300 group">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
              <Globe className="w-6 h-6 text-indigo-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 sm:mb-3">
              สื่อสังคมออนไลน์
            </h3>
            <div className="space-y-3">
              <a
                href={schoolSetting?.facebookUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm font-semibold text-slate-600 hover:text-[#1877F2] transition-colors p-2 -ml-2 rounded-lg hover:bg-slate-50 truncate"
              >
                <Facebook className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">Facebook Page</span>
              </a>
              {schoolSetting?.lineUrl && (
                <a
                  href={schoolSetting.lineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm font-semibold text-slate-600 hover:text-[#00B900] transition-colors p-2 -ml-2 rounded-lg hover:bg-slate-50 truncate"
                >
                  <div className="w-4 h-4 rounded bg-slate-400 flex items-center justify-center text-[10px] text-white font-black shrink-0">
                    L
                  </div>
                  <span className="truncate">LINE Official</span>
                </a>
              )}
            </div>
          </div>

          {/* Working Hours Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40 border border-slate-100 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300 group">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 sm:mb-3">
              เวลาทำการ
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium whitespace-pre-line">
              {schoolSetting?.workingHours ||
                "จันทร์ - ศุกร์\n08:00 - 16:30 น."}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              หยุดวันเสาร์-อาทิตย์ และนักขัตฤกษ์
            </div>
          </div>
        </div>

        {/* MAP AND FORM SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {/* Map Column */}
          <div className="flex flex-col h-full rounded-3xl overflow-hidden shadow-lg border border-slate-100 bg-white">
            <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between bg-white z-10">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  แผนที่การเดินทาง
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  พิกัดที่ตั้งของ {schoolSetting?.name || "โรงเรียน"}
                </p>
              </div>
              <div className="w-12 h-12 bg-slate-50 rounded-2xl hidden sm:flex items-center justify-center border border-slate-100">
                <MapPin className="w-6 h-6 text-slate-400" />
              </div>
            </div>

            <div className="flex-1 min-h-[400px] lg:min-h-0 relative bg-slate-100">
              {isIframe ? (
                // Backward compatibility for old iframe inputs
                <div
                  className="absolute inset-0 w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-none"
                  dangerouslySetInnerHTML={{ __html: schoolSetting!.mapUrl! }}
                />
              ) : (
                // Auto-generated iframe based on school name and address
                <iframe
                  className="absolute inset-0 w-full h-full border-none"
                  src={mapEmbedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Maps"
                />
              )}
              
              {/* Button to open external Google Maps Link if provided */}
              {!isIframe && schoolSetting?.mapUrl && schoolSetting.mapUrl.startsWith("http") && (
                <div className="absolute bottom-6 right-6 z-10">
                  <a
                    href={schoolSetting.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white/90 backdrop-blur text-slate-800 px-4 py-2.5 rounded-xl font-bold text-sm shadow-xl hover:bg-white hover:scale-105 transition-all border border-slate-200"
                  >
                    <MapPin className="w-4 h-4 text-theme-primary" />
                    เปิดใน Google Maps
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Form Column */}
          <div className="h-full">
            <ContactForm />
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-10 sm:py-12 border-t-4 border-theme-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-5">
          <div className="w-12 h-12 bg-white/5 text-white flex items-center justify-center rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
            {schoolSetting?.logoUrl ? (
              <img
                src={schoolSetting.logoUrl}
                alt="Logo"
                className="w-7 h-7 object-contain opacity-70"
              />
            ) : (
              <Building className="w-7 h-7 opacity-70" />
            )}
          </div>
          <p className="text-sm font-medium tracking-wide">
            &copy; {new Date().getFullYear()}{" "}
            {schoolSetting?.name || "School Management System"}. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
