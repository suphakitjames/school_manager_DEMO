"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to send message");

      setIsSuccess(true);
      toast.success("ส่งข้อความสำเร็จ! เราจะรีบติดต่อกลับให้เร็วที่สุด", {
        duration: 5000,
      });
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      
      // Reset success state after a few seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 p-8 sm:p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">ส่งข้อความสำเร็จ</h3>
        <p className="text-slate-500 mb-8 max-w-sm mx-auto">
          ขอบคุณที่ติดต่อเรา ข้อความของคุณถูกส่งไปยังระบบแล้ว เจ้าหน้าที่จะรีบดำเนินการและติดต่อกลับโดยเร็วที่สุด
        </p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
        >
          ส่งข้อความใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 sm:p-10 relative overflow-hidden h-full">
      {/* Decorative background blur */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-theme-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">ส่งข้อความถึงเรา</h3>
          <p className="text-slate-500 text-sm">มีข้อสงสัยหรือคำติชม? กรอกแบบฟอร์มด้านล่างแล้วเราจะติดต่อกลับไป</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-semibold text-slate-700">ชื่อ - นามสกุล <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all bg-slate-50 focus:bg-white text-slate-800"
                placeholder="Ex. สมชาย ใจดี"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-semibold text-slate-700">เบอร์โทรศัพท์</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all bg-slate-50 focus:bg-white text-slate-800"
                placeholder="Ex. 0812345678"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
             <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-slate-700">อีเมล <span className="text-red-500">*</span></label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all bg-slate-50 focus:bg-white text-slate-800"
                placeholder="Ex. email@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="subject" className="text-sm font-semibold text-slate-700">หัวข้อติดต่อ <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all bg-slate-50 focus:bg-white text-slate-800"
                placeholder="Ex. สอบถามเรื่องการรับสมัคร"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="message" className="text-sm font-semibold text-slate-700">ข้อความ <span className="text-red-500">*</span></label>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all bg-slate-50 focus:bg-white text-slate-800 resize-none"
              placeholder="รายละเอียดที่ต้องการสอบถาม..."
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 bg-theme-primary text-white font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> กำลังส่งข้อความ...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" /> ส่งข้อความ
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
