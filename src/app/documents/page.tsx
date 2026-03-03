"use client";

import { useEffect, useState } from "react";
import { FileText, Search, BookOpen, Download } from "lucide-react";

type DocumentCategory = "STUDENT" | "TEACHER" | "GENERAL";

type DocumentItem = {
  id: number;
  title: string;
  description: string | null;
  fileUrl: string;
  category: DocumentCategory;
  isActive: boolean;
  createdAt: string;
};

const categoryLabels: Record<DocumentCategory, string> = {
  "STUDENT": "นักเรียน/ผู้ปกครอง",
  "TEACHER": "ครูและบุคลากร",
  "GENERAL": "ทั่วไป"
};

export default function DocumentCenterPage() {
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("ALL");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/documents");
        const data: DocumentItem[] = await res.json();
        setItems(data.filter(d => d.isActive)); // Only show active documents
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = items.filter(a => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "ALL" || a.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      
      {/* HEADER SECTION */}
      <div className="bg-indigo-900 text-white py-16 px-4 relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-slate-900 opacity-90"></div>
         <div className="absolute -inset-2 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay"></div>
         
         <div className="max-w-5xl mx-auto relative z-10 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md shadow-inner border border-white/20">
               <BookOpen className="w-8 h-8 text-indigo-200" />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">ศูนย์โหลดเอกสาร</h1>
            <p className="text-indigo-200 text-lg max-w-2xl mx-auto font-medium">รวบรวมแบบฟอร์ม ใบคำร้อง และเอกสารสำคัญต่างๆ สำหรับนักเรียน ผู้ปกครอง และครู</p>
         </div>
      </div>

      {/* SEARCH AND FILTER */}
      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col md:flex-row gap-4 border border-slate-100">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อเอกสาร, แบบฟอร์ม..."
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow text-slate-700 font-medium placeholder:font-normal"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hidde-scrollbar">
             {["ALL", "STUDENT", "TEACHER", "GENERAL"].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  className={`px-5 py-3.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-colors flex-1 md:flex-none ${
                    filterCat === cat 
                      ? "bg-indigo-600 text-white shadow-md" 
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {cat === "ALL" ? "ทั้งหมด" : categoryLabels[cat as DocumentCategory] || cat}
                </button>
             ))}
          </div>
        </div>
      </div>

      {/* DOCUMENT LIST */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {loading ? (
             Array.from({length: 6}).map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex animate-pulse gap-4">
                   <div className="w-12 h-12 bg-slate-200 rounded-xl shrink-0"></div>
                   <div className="space-y-3 w-full py-1">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                   </div>
                </div>
             ))
          ) : filtered.length === 0 ? (
             <div className="col-span-full py-20 text-center">
                <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-700 mb-2">ไม่มีเอกสารที่ตรงกับการค้นหา</h3>
                <p className="text-slate-500">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นดูสิ</p>
             </div>
          ) : (
            filtered.map((doc) => (
               <div key={doc.id} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex items-start gap-4 sm:gap-5 group relative overflow-hidden">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                     <FileText className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider">
                           {categoryLabels[doc.category]}
                        </span>
                     </div>
                     <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-tight mb-1 group-hover:text-indigo-600 transition-colors">
                        {doc.title}
                     </h3>
                     {doc.description && (
                        <p className="text-sm text-slate-500 line-clamp-2 mt-1">{doc.description}</p>
                     )}
                     
                     <div className="mt-4 flex items-center gap-3">
                        <a 
                          href={doc.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg text-sm font-bold transition-colors"
                        >
                           <Download className="w-4 h-4" />
                           ดาวน์โหลด
                        </a>
                     </div>
                  </div>
               </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
