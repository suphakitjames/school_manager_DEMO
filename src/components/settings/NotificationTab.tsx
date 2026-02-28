"use client";

import { useState, useEffect } from "react";
import { Bell, Mail, MessageSquare, Smartphone, Save, RefreshCw, CheckCircle2, ShieldAlert, Send } from "lucide-react";

export default function NotificationTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Test email state
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{success?: boolean, message?: string} | null>(null);

  // Settings state
  const [settings, setSettings] = useState({
    // Channels
    emailEnabled: false,
    lineEnabled: false,
    smsEnabled: false,
    
    // Line Configuration
    lineNotifyToken: "",
    
    // SMTP Configuration
    smtpHost: "",
    smtpPort: "",
    smtpUser: "",
    smtpPassword: "",
    hasSmtpPassword: false, // Flag from backend

    // Triggers
    notifyAttendance: true,
    notifyGrades: true,
    notifyAnnouncements: true,
    notifyPayments: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);
  
  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings/notifications");
      if (res.ok) {
        const data = await res.json();
        // The API sends hasSmtpPassword, and keeps smtpPassword blank
        setSettings(prev => ({ ...prev, ...data, smtpPassword: "" }));
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    setSaveSuccess(false);
    setTestEmailResult(null); // Clear test result on change
  };

  const handeToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof settings]
    }));
    setSaveSuccess(false);
    setTestEmailResult(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setTestEmailResult(null);
    
    try {
      const { hasSmtpPassword, ...dataToSave } = settings;
      const res = await fetch("/api/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      if (!res.ok) throw new Error("Failed to save settings");
      
      setSaveSuccess(true);
      // Re-fetch to update `hasSmtpPassword` state correctly
      fetchSettings(); 
      
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };
  
  const handleTestEmail = async () => {
    if (!settings.smtpUser) {
        alert("กรุณาระบุ Username (อีเมล) ให้เรียบร้อยก่อนทำการทดสอบ");
        return;
    }
    
    setTestingEmail(true);
    setTestEmailResult(null);
    
    try {
      const res = await fetch("/api/settings/notifications/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: settings.smtpUser, // Send to self as test
          subject: "ทดสอบการเชื่อมต่อระบบแจ้งเตือนอีเมล (School Manager)",
          text: "อีเมลฉบับนี้เป็นการทดสอบระบบ หากคุณได้รับข้อความนี้แสดงว่าการตั้งค่า SMTP ถูกต้องและระบบสามารถส่งข้อความได้ตามปกติครับ"
        }),
      });

      const result = await res.json();
      
      if (res.ok) {
         setTestEmailResult({ success: true, message: "ทดสอบสำเร็จ! โปรดตรวจสอบในกล่องจดหมายของคุณ" });
      } else {
         throw new Error(result.error || "Failed to send");
      }
      
    } catch (error: any) {
      setTestEmailResult({ success: false, message: error.message });
    } finally {
      setTestingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 gap-4">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
        <p>กำลังโหลดการตั้งค่าการแจ้งเตือน...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Channels Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">ช่องทางการแจ้งเตือนหลัก</h2>
              <p className="text-xs text-slate-500">เปิด-ปิด และตั้งค่าช่องทางที่ระบบจะใช้ส่งข้อมูลถึงผู้ใช้งาน</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Email Channel */}
            <div className={`border rounded-2xl p-5 transition-all duration-200 ${settings.emailEnabled ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${settings.emailEnabled ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-400'}`}>
                  <Mail className="w-6 h-6" />
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="emailEnabled" className="sr-only peer" checked={settings.emailEnabled} onChange={handleChange} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
              <h3 className="font-bold text-slate-800">อีเมล (Email)</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">ส่งการแจ้งเตือนผ่านระบบอีเมลไปยังกล่องจดหมายของผู้รับโดยตรง</p>
              
              {settings.emailEnabled && (
                <div className="pt-4 border-t border-blue-100 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">SMTP Host <span className="text-red-500">*</span></label>
                      <input type="text" name="smtpHost" value={settings.smtpHost} onChange={handleChange} placeholder="smtp.gmail.com" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Port</label>
                      <input type="text" name="smtpPort" value={settings.smtpPort} onChange={handleChange} placeholder="587" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">บัญชีอีเมล (Username) <span className="text-red-500">*</span></label>
                      <input type="email" name="smtpUser" value={settings.smtpUser} onChange={handleChange} placeholder="example@gmail.com" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">รหัสผ่านสำหรับแอป (App Password)</label>
                      <input type="password" name="smtpPassword" value={settings.smtpPassword} onChange={handleChange} placeholder={settings.hasSmtpPassword ? "•••••••• (มีในระบบแล้ว ใส่ใหม่เพื่อเปลี่ยน)" : "ป้อนรหัสผ่านแอปของคุณ"} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  
                  {/* Test Email Actions */}
                  <div className="pt-2">
                     <button 
                        onClick={handleTestEmail}
                        disabled={testingEmail || !settings.smtpHost || !settings.smtpUser}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                       {testingEmail ? (
                         <><RefreshCw className="w-4 h-4 animate-spin" /> กำลังส่งทดสอบ...</>
                       ) : (
                         <><Send className="w-4 h-4" /> ส่งอีเมลทดสอบเชื่อมต่อ</>
                       )}
                     </button>
                     
                     {testEmailResult && (
                       <div className={`mt-3 p-3 rounded-lg text-sm border ${testEmailResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                         <p className="font-semibold flex items-center gap-2">
                           {testEmailResult.success ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                           {testEmailResult.message}
                         </p>
                       </div>
                     )}
                  </div>
                </div>
              )}
            </div>

            {/* Other Channels */}
            <div className="space-y-5">
              {/* LINE Channel */}
              <div className={`border rounded-2xl p-5 transition-all duration-200 ${settings.lineEnabled ? 'border-green-500 bg-green-50/50' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${settings.lineEnabled ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}>
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="lineEnabled" className="sr-only peer" checked={settings.lineEnabled} onChange={handleChange} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
                <h3 className="font-bold text-slate-800">LINE Notify</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">ส่งการแจ้งเตือนเข้าแอปพลิเคชัน LINE สะดวกและรวดเร็ว</p>
                
                {settings.lineEnabled && (
                  <div className="pt-4 border-t border-green-100 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">LINE Notify Token (กลุ่มแอดมิน)</label>
                      <input type="password" name="lineNotifyToken" value={settings.lineNotifyToken} onChange={handleChange} placeholder="••••••••••••••••••••••••••••••" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-100">
                      <ShieldAlert className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-yellow-700">Token สำหรับแจ้งเตือนผู้ปกครองรายบุคคลจะต้องให้ผู้ปกครองเป็นผู้เชื่อมต่อด้วยตนเองในแอปพลิเคชัน</p>
                    </div>
                  </div>
                )}
              </div>

              {/* SMS Channel */}
              <div className={`border rounded-2xl p-5 transition-all duration-200 ${settings.smsEnabled ? 'border-orange-500 bg-orange-50/50' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${settings.smsEnabled ? 'bg-orange-100 text-orange-600' : 'bg-slate-200 text-slate-400'}`}>
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="smsEnabled" className="sr-only peer" checked={settings.smsEnabled} onChange={handleChange} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
                <h3 className="font-bold text-slate-800">SMS (ข้อความสั้น)</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">ส่งข้อความสั้นไปยังเบอร์โทรศัพท์ (อาจมีค่าใช้จ่ายเพิ่มเติม)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Triggers Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Bell className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">เหตุการณ์ที่ต้องการแจ้งเตือน</h2>
            <p className="text-xs text-slate-500">เลือกเหตุการณ์ในระบบที่จะทำให้เกิดการส่งการแจ้งเตือนทันที</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { id: "notifyAttendance", label: "การเช็คชื่อ / เข้าเรียน", desc: "เมื่อนักเรียนมาสายหรือขาดเรียน" },
            { id: "notifyGrades", label: "ผลการเรียน", desc: "เมื่อมีการประกาศผลการเรียนใหม่" },
            { id: "notifyAnnouncements", label: "ประกาศทั่วไป", desc: "เมื่อมีประกาศใหม่จากโรงเรียนหรือชั้นเรียน" },
            { id: "notifyPayments", label: "บิล / ชำระเงิน", desc: "สลิปใบเสร็จ และแจ้งเตือนเมื่อค้างชำระค่าธรรมเนียม" },
          ].map((item) => (
            <div 
              key={item.id} 
              className={`p-4 rounded-xl border cursor-pointer transition-colors flex items-start gap-4 ${settings[item.id as keyof typeof settings] ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-300'}`}
              onClick={() => handeToggle(item.id as keyof typeof settings)}
            >
              <div className="mt-1">
                <input 
                  type="checkbox" 
                  checked={!!settings[item.id as keyof typeof settings]} 
                  readOnly
                  className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">{item.label}</h4>
                <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-200">
        <div className="h-8 flex items-center mr-auto">
          {saveSuccess && (
            <span className="flex items-center gap-2 text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg animate-in fade-in slide-in-from-bottom-2">
              <CheckCircle2 className="w-4 h-4" /> บันทึกข้อมูลสำเร็จ
            </span>
          )}
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> กำลังบันทึก...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> บันทึกการตั้งค่า
            </>
          )}
        </button>
      </div>

    </div>
  );
}
