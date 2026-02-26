import { School, Save, Database, Users, Bell } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">ตั้งค่าระบบ</h1>
        <p className="text-slate-500 text-sm mt-1">จัดการข้อมูลโรงเรียนและการตั้งค่าระบบ</p>
      </div>

      {/* Settings Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-0">
        {["ข้อมูลโรงเรียน", "ปีการศึกษา", "ผู้ใช้งาน", "การแจ้งเตือน", "ระบบ"].map((tab, i) => (
          <button
            key={tab}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              i === 0
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* School Info Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <School className="w-5 h-5 text-indigo-600" />
          <h2 className="font-semibold text-slate-800">ข้อมูลโรงเรียน</h2>
        </div>

        {/* Logo Upload */}
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100">
          <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center">
            <School className="w-10 h-10 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">โลโก้โรงเรียน</p>
            <p className="text-xs text-slate-400 mt-0.5">PNG, JPG ขนาดไม่เกิน 2MB</p>
            <button className="mt-2 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
              อัปโหลดรูปภาพ
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { label: "ชื่อโรงเรียน (ภาษาไทย)", placeholder: "โรงเรียน...", defaultVal: "โรงเรียนตัวอย่าง" },
            { label: "ชื่อโรงเรียน (ภาษาอังกฤษ)", placeholder: "School Name", defaultVal: "Example School" },
            { label: "เบอร์โทรศัพท์", placeholder: "02-XXX-XXXX", defaultVal: "02-123-4567" },
            { label: "อีเมล", placeholder: "school@example.ac.th", defaultVal: "info@school.ac.th" },
            { label: "เว็บไซต์", placeholder: "https://", defaultVal: "https://school.ac.th" },
          ].map((field) => (
            <div key={field.label}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{field.label}</label>
              <input
                type="text"
                defaultValue={field.defaultVal}
                placeholder={field.placeholder}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">ที่อยู่</label>
            <textarea
              rows={3}
              defaultValue="123 ถนนตัวอย่าง แขวงตัวอย่าง เขตตัวอย่าง กรุงเทพมหานคร 10000"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
            <Save className="w-4 h-4" />
            บันทึกการเปลี่ยนแปลง
          </button>
        </div>
      </div>

      {/* Quick Setting Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Database, label: "ปีการศึกษาปัจจุบัน", value: "2569 ภาคเรียนที่ 2", action: "เปลี่ยน", color: "emerald" },
          { icon: Users, label: "จำนวนผู้ใช้งาน", value: "86 ครู + 12 Admin", action: "จัดการ", color: "violet" },
          { icon: Bell, label: "การแจ้งเตือน Email", value: "เปิดใช้งาน", action: "ตั้งค่า", color: "amber" },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className={`w-10 h-10 rounded-xl bg-${card.color}-50 flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 text-${card.color}-600`} />
              </div>
              <p className="text-sm font-medium text-slate-700">{card.label}</p>
              <p className="text-base font-semibold text-slate-800 mt-1">{card.value}</p>
              <button className={`mt-3 text-sm font-semibold text-${card.color}-600 hover:underline`}>
                {card.action} →
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
