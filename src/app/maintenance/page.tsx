"use client";

import { useState, useEffect } from "react";
import { Wrench, RefreshCw, Settings, ArrowLeft } from "lucide-react";

export default function MaintenancePage() {
  const [schoolName, setSchoolName] = useState("ระบบบริหารจัดการโรงเรียน");
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // Fetch school name for display
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.name) setSchoolName(data.name);
      })
      .catch(() => {});
  }, []);

  const handleRetry = async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/settings/maintenance-status");
      const data = await res.json();
      if (!data.maintenance) {
        window.location.href = "/";
        return;
      }
    } catch {}
    setChecking(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-100/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Animated icon */}
        <div className="relative inline-flex mb-8">
          <div className="w-28 h-28 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-slate-200/80 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50" />
            <Wrench className="w-14 h-14 text-orange-500 relative z-10 animate-pulse" />
          </div>
          {/* Floating gear */}
          <div className="absolute -top-2 -right-2 w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center border border-amber-200 shadow-md">
            <Settings className="w-5 h-5 text-amber-600 animate-spin" style={{ animationDuration: "4s" }} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3 tracking-tight">
          ระบบกำลังปิดปรับปรุง
        </h1>
        <p className="text-slate-500 text-lg mb-2 font-medium">
          {schoolName}
        </p>
        <p className="text-slate-400 text-sm mb-10 max-w-md mx-auto leading-relaxed">
          ขณะนี้ระบบกำลังอยู่ในระหว่างการบำรุงรักษาและปรับปรุงประสิทธิภาพ
          <br />
          กรุณาลองเข้าใช้งานอีกครั้งในภายหลัง
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleRetry}
            disabled={checking}
            className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
            {checking ? "กำลังตรวจสอบ..." : "ลองอีกครั้ง"}
          </button>

          <button
            onClick={() => { window.location.href = "/login"; }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            เข้าสู่ระบบผู้ดูแล
          </button>
        </div>

        {/* Status badge */}
        <div className="mt-12 inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200/60 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-500">
            Maintenance Mode Active
          </span>
        </div>
      </div>
    </div>
  );
}
