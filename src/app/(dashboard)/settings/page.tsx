"use client";

import { useState, useEffect } from "react";
import { School, Save, Database, Users, Bell, RefreshCw, CheckCircle2 } from "lucide-react";
import AcademicYearTab from "@/components/settings/AcademicYearTab";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [activeTab, setActiveTab] = useState("ข้อมูลโรงเรียน");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    logoUrl: "",
    nameEn: "", // Adding optional English name purely for UI matching the design, though DB only has `name` currently
  });

  // Summary stats (placeholder for UI since we only implemented School Settings table)
  // In a full system, you would fetch these from an API
  const summaryStats = {
    academicYear: "2569 ภาคเรียนที่ 1",
    usersCount: "128 คน",
    emailNotifyStatus: "เปิดใช้งาน"
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error("Failed to fetch settings");
        const data = await res.json();
        
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          website: data.website || "",
          address: data.address || "",
          logoUrl: data.logoUrl || "",
          nameEn: data.nameEn || "", // If your backend evolves to support it
        });
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSaveSuccess(false); // Reset success message when editing
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save settings");
      
      setSaveSuccess(true);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("ขนาดไฟล์ใหญ่เกินไป (สูงสุด 2MB)");
      return;
    }

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setFormData(prev => ({ ...prev, logoUrl: data.url }));
      setSaveSuccess(false);
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logoUrl: "" }));
    setSaveSuccess(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 gap-4">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
        <p>กำลังโหลดการตั้งค่าระบบ...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">ตั้งค่าระบบ</h1>
          <p className="text-slate-500 text-sm mt-1">จัดการข้อมูลพื้นฐานและการตั้งค่าต่างๆ ของระบบบริหารสถานศึกษา</p>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-0 hide-scrollbar mb-6">
        {["ข้อมูลโรงเรียน", "ปีการศึกษา", "ผู้ใช้งาน", "การแจ้งเตือน", "ระบบ"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* School Info Form */}
      {activeTab === "ข้อมูลโรงเรียน" && (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <School className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">ข้อมูลสถานศึกษา</h2>
            <p className="text-xs text-slate-500">ข้อมูลนี้จะถูกนำไปใช้ในเอกสารและใบเสร็จต่างๆ ของระบบ</p>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 pb-8 border-b border-slate-100">
          <div className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 relative overflow-hidden">
            {uploadingLogo ? (
               <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            ) : formData.logoUrl ? (
              <img src={formData.logoUrl} alt="School Logo" className="w-full h-full object-cover" />
            ) : (
              <>
                <School className="w-8 h-8 mb-2" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Logo</span>
              </>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-800">ตราสัญลักษณ์โรงเรียน</h3>
            <p className="text-xs text-slate-500 mt-1 mb-3">แนะนำให้ใช้รูปภาพสี่เหลี่ยมจัตุรัส ไฟล์ PNG หรือ JPG ขนาดไม่เกิน 2MB เพื่อความคมชัดในเอกสาร</p>
            <div className="flex gap-3 items-center">
              <label className="cursor-pointer px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
                อัปโหลดรูปภาพใหม่
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg" 
                  className="hidden" 
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                />
              </label>
              {formData.logoUrl && (
                <button 
                  onClick={handleRemoveLogo}
                  disabled={uploadingLogo}
                  className="px-4 py-2 text-xs font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  ลบรูปภาพ
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">ชื่อโรงเรียน <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="เช่น โรงเรียนสาธิตมหาวิทยาลัย..."
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">เบอร์โทรศัพท์ติดต่อ</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="02-XXX-XXXX"
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">เว็บไซต์โรงเรียน</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://www.school.ac.th"
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">อีเมลติดต่อหลัก</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="contact@school.ac.th"
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">ที่อยู่โรงเรียน (สำหรับออกเอกสารใบเสร็จ)</label>
            <textarea
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleChange}
              placeholder="เลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors resize-none"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t border-slate-100">
          <div className="h-8 flex items-center mb-4 sm:mb-0">
            {saveSuccess && (
              <span className="flex items-center gap-2 text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                <CheckCircle2 className="w-4 h-4" /> บันทึกข้อมูลสำเร็จ
              </span>
            )}
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> บันทึกการเปลี่ยนแปลง
              </>
            )}
          </button>
        </div>
      </div>
      )}

      {activeTab === "ปีการศึกษา" && <AcademicYearTab />}

      {activeTab === "ผู้ใช้งาน" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-700 mb-2">การจัดการผู้ใช้งาน</h2>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">การจัดการผู้ใช้งานโดยละเอียดถูกแยกไว้ที่เมนู "ผู้ใช้งาน" เพื่อความสะดวกและฟังก์ชันที่ครบถ้วนกว่า</p>
          <a href="/users" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">
            <Users className="w-4 h-4" /> ไปที่ระบบจัดการผู้ใช้งาน
          </a>
        </div>
      )}

      {activeTab === "การแจ้งเตือน" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-500">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p>ระบบตั้งค่าการแจ้งเตือนกำลังอยู่ในระหว่างการพัฒนา</p>
        </div>
      )}

      {activeTab === "ระบบ" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-500">
          <Database className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p>การตั้งค่าระบบขั้นสูงกำลังอยู่ในระหว่างการพัฒนา</p>
        </div>
      )}

      {/* Quick Setting Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[
          { icon: Database, title: "ปีการศึกษาปัจจุบัน", value: summaryStats.academicYear, desc: "ระบบอ้างอิงข้อมูลและการเงิน", action: "จัดการปีการศึกษา", color: "emerald" },
          { icon: Users, title: "ผู้ใช้งานในระบบ", value: summaryStats.usersCount, desc: "นักเรียน, ครู, ผู้บริหาร และผู้ปกครอง", action: "จัดการผู้ใช้งาน", color: "cyan" },
          { icon: Bell, title: "สถานะการแจ้งเตือน", value: summaryStats.emailNotifyStatus, desc: "แจ้งเตือนผ่าน Email/Line", action: "ตั้งค่าการแจ้งเตือน", color: "amber" },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-slate-300 transition-colors group cursor-pointer relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-${card.color}-500/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110`} />
              
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-${card.color}-50 flex items-center justify-center group-hover:bg-${card.color}-100 transition-colors`}>
                  <Icon className={`w-6 h-6 text-${card.color}-600`} />
                </div>
              </div>
              
              <p className="text-sm font-bold text-slate-500 mb-1">{card.title}</p>
              <h3 className="text-xl font-black text-slate-800 mb-2">{card.value}</h3>
              <p className="text-xs text-slate-500 mb-5">{card.desc}</p>
              
              <div className="flex items-center text-sm font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">
                {card.action} <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
