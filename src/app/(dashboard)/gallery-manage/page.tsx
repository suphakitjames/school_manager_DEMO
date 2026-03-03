"use client";

import { useEffect, useState } from "react";
import { Plus, Image as ImageIcon, Calendar, Search, X, Save, Pencil, Trash2, Link as LinkIcon, AlertCircle, UploadCloud, FolderUp, Facebook } from "lucide-react";

type Gallery = {
  id: number;
  title: string;
  description: string | null;
  coverImage: string | null;
  images: string[] | null;
  facebookUrl: string | null;
  date: string;
  isActive: boolean;
  createdAt: string;
};

type FormData = { 
  title: string; 
  description: string; 
  coverImage: string; 
  imagesString: string; 
  facebookUrl: string; 
  date: string; 
  isActive: boolean 
};
const blankForm: FormData = { 
  title: "", 
  description: "", 
  coverImage: "", 
  imagesString: "", 
  facebookUrl: "", 
  date: new Date().toISOString().split("T")[0], 
  isActive: true 
};

export default function GalleryDashboardPage() {
  const [items, setItems] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [form, setForm] = useState<FormData>(blankForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageSource, setImageSource] = useState<"upload" | "facebook">("upload");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gallery");
      setItems(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = items.filter(a => !search || a.title.includes(search));

  const openAdd = () => {
    setForm(blankForm);
    setEditId(null);
    setError("");
    setModalMode("add");
  };

  const openEdit = (a: Gallery) => {
    setForm({ 
      title: a.title, 
      description: a.description || "", 
      coverImage: a.coverImage || "", 
      imagesString: Array.isArray(a.images) ? a.images.join("\n") : "", 
      facebookUrl: a.facebookUrl || "",
      date: new Date(a.date).toISOString().split("T")[0],
      isActive: a.isActive 
    });
    setEditId(a.id);
    setImageSource(a.facebookUrl ? "facebook" : "upload");
    setError("");
    setModalMode("edit");
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`ยืนยันลบกิจกรรม "${title}"?`)) return;
    const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
    else alert("ลบไม่สำเร็จ");
  };

  const handleSave = async () => {
    if (!form.title) { setError("กรุณากรอกชื่อกิจกรรม"); return; }
    setSaving(true);
    setError("");
    try {
      // Parse images string (separated by newline) into array
      const imagesArray = imageSource === "upload" 
        ? form.imagesString.split("\n").map(s => s.trim()).filter(Boolean)
        : [];

      const payload = {
        title: form.title,
        description: form.description,
        coverImage: form.coverImage,
        images: imagesArray,
        facebookUrl: imageSource === "facebook" ? form.facebookUrl : null,
        date: form.date,
        isActive: form.isActive,
      };

      const url = modalMode === "add" ? "/api/gallery" : `/api/gallery/${editId}`;
      const method = modalMode === "add" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setModalMode(null);
        fetchData();
      } else {
        const d = await res.json();
        setError(d.error || "บันทึกไม่สำเร็จ");
      }
    } catch (e: any) {
      setError(e.message || "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("อัปโหลดไม่สำเร็จ");
      const data = await res.json();
      setForm(p => ({ ...p, coverImage: data.url }));
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการอัปโหลดรูปปก");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    setError("");
    
    try {
      const uploadedUrls: string[] = [];
      // Upload files sequentially or with Promise.all
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error(`อัปโหลดไฟล์ที่ ${i+1} ไม่สำเร็จ`);
        const data = await res.json();
        uploadedUrls.push(data.url);
      }

      // Append to existing images string
      setForm(p => {
        const currentLinks = p.imagesString ? p.imagesString.split("\n").map(s => s.trim()).filter(Boolean) : [];
        const newLinks = [...currentLinks, ...uploadedUrls].join("\n");
        return { ...p, imagesString: newLinks };
      });
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพรวม");
    } finally {
      setUploadingImages(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการหน้าภาพกิจกรรม</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading ? "กำลังโหลด..." : `อัลบั้มภาพทั้งหมด ${filtered.length} รายการ`}
          </p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm w-fit">
          <Plus className="w-4 h-4" /> สร้างอัลบั้มใหม่
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อกิจกรรม..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
           <div className="col-span-full py-20 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 border-dashed">
             กำลังโหลดข้อมูล...
           </div>
        ) : filtered.length === 0 ? (
           <div className="col-span-full py-20 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 border-dashed">
             <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
             <p className="font-semibold text-slate-600">ไม่พบกิจกรรม</p>
             <p className="text-sm">คลิก "สร้างอัลบั้มใหม่" เพื่อเริ่มต้น</p>
           </div>
        ) : (
          filtered.map((item, idx) => (
            <div 
              key={item.id} 
              className="bg-white border rounded-2xl overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-300 hover:border-indigo-200"
              style={{ animationDelay: `${idx * 50}ms`, animationFillMode: "both" }}
            >
              <div className="aspect-[4/3] bg-slate-100 relative group overflow-hidden">
                {item.coverImage ? (
                  <img src={item.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.title} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                    <ImageIcon className="w-10 h-10 opacity-50" />
                    <span className="text-xs font-semibold">ไม่มีรูปปก</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  {!item.isActive && (
                    <span className="px-2 py-1 bg-slate-900/70 text-white text-[10px] font-bold rounded-md backdrop-blur-sm">ซ่อนอยู่</span>
                  )}
                  {Array.isArray(item.images) && item.images.length > 0 && (
                     <span className="px-2 py-1 bg-black/60 text-white text-[10px] font-bold rounded-md flex items-center gap-1 backdrop-blur-sm">
                       <ImageIcon className="w-3 h-3" /> {item.images.length}
                     </span>
                  )}
                </div>
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mb-2">
                  <Calendar className="w-3.5 h-3.5" /> {formatDate(item.date)}
                </div>
                <h3 className="font-bold text-slate-800 line-clamp-2 leading-snug mb-2 group-hover:text-indigo-600 transition-colors">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 mt-auto">
                    {item.description}
                  </p>
                )}
                
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button onClick={() => openEdit(item)} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="แก้ไข">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id, item.title)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="ลบ">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Add/Edit */}
      {modalMode && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ring-1 ring-slate-200 translate-y-0 scale-100 opacity-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
              <h2 className="font-bold text-lg text-slate-800">{modalMode === "add" ? "สร้างอัลบั้มใหม่" : "แก้ไขกิจกรรม"}</h2>
              <button onClick={() => setModalMode(null)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {error && <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{error}</div>}
              
              <div className="grid sm:grid-cols-3 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">ชื่อกิจกรรม *</label>
                  <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="เช่น กีฬาสีประจำปี 2567"
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">วันที่จัดงาน</label>
                  <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">รายละเอียดกิจกรรม</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="รายละเอียดเพิ่มเติมของกิจกรรมที่ต้องการสื่อสาร" rows={3}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                 
                 {/* Cover Image */}
                 <div>
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
                       <ImageIcon className="w-4 h-4 text-indigo-500" /> รูปภาพหน้าปก (Cover Image)
                    </label>
                    <div className="flex flex-col gap-3">
                       {form.coverImage && (
                          <div className="relative w-full max-w-sm aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                             <img src={form.coverImage} className="w-full h-full object-cover" alt="Cover preview" />
                             <button onClick={() => setForm(p => ({...p, coverImage: ""}))} className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-lg backdrop-blur-sm transition-colors">
                                <X className="w-4 h-4" />
                             </button>
                          </div>
                       )}
                       
                       <div className="flex items-center gap-3 w-full">
                          <label className={`flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-xl bg-white text-sm font-semibold transition-colors cursor-pointer hover:bg-slate-50 ${uploadingCover ? 'opacity-50 cursor-not-allowed' : ''}`}>
                             <UploadCloud className="w-4 h-4 text-indigo-500" />
                             {uploadingCover ? "กำลังอัปโหลด..." : "อัปโหลดรูปภาพปก"}
                             <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploadingCover} />
                          </label>
                          <span className="text-xs text-slate-400 font-medium">หรือระบุ URL</span>
                          <input value={form.coverImage} onChange={e => setForm(p => ({ ...p, coverImage: e.target.value }))}
                             placeholder="https://example.com/cover.jpg"
                             className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs bg-white" />
                       </div>
                    </div>
                 </div>

                 <div className="h-px bg-slate-200 w-full" />

                 {/* Gallery Images Source Toggle */}
                 <div>
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
                       <FolderUp className="w-4 h-4 text-emerald-500" /> รูปภาพในอัลบั้ม
                    </label>
                    
                    <div className="flex p-1 bg-slate-200/50 rounded-xl w-fit mb-4">
                       <button onClick={() => setImageSource("upload")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${imageSource === "upload" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                          <UploadCloud className="w-4 h-4" /> อัปโหลดไฟล์รูป
                       </button>
                       <button onClick={() => setImageSource("facebook")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${imageSource === "facebook" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                          <Facebook className="w-4 h-4" /> ลิงก์อัลบั้ม Facebook
                       </button>
                    </div>

                    {imageSource === "facebook" ? (
                       <div className="space-y-2 relative">
                          <div className="absolute left-3 top-2.5">
                             <Facebook className="w-5 h-5 text-blue-500" />
                          </div>
                          <input value={form.facebookUrl} onChange={e => setForm(p => ({ ...p, facebookUrl: e.target.value }))}
                             placeholder="วางลิงก์อัลบั้ม Facebook ของโรงเรียนที่นี่ (เช่น https://www.facebook.com/media/set/?set=a...)"
                             className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          <p className="text-xs text-slate-500 mt-1.5 ml-1">เมื่อผู้ใช้กดดูอัลบั้มนี้ ระบบจะพาไปยัง Facebook ทันที</p>
                       </div>
                    ) : (
                       <div className="space-y-3">
                          <label className={`flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-2xl bg-white text-center cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition-colors ${uploadingImages ? 'opacity-50 pointer-events-none' : ''}`}>
                             <UploadCloud className="w-8 h-8 text-slate-400 mb-3" />
                             <span className="text-sm font-bold text-slate-700">{uploadingImages ? "กำลังอัปโหลดไฟล์..." : "คลิกเพื่อเลือกไฟล์รูปภาพที่ต้องการเพิ่มในอัลบั้ม"}</span>
                             <span className="text-xs text-slate-400 mt-1">สามารถเลือกได้หลายไฟล์พร้อมกัน (Multiple selection)</span>
                             <input type="file" accept="image/*" multiple className="hidden" onChange={handleImagesUpload} disabled={uploadingImages} />
                          </label>
                          
                          {form.imagesString && (
                             <div className="mt-4">
                               <p className="text-xs font-semibold text-slate-600 mb-2">ลิงก์รูปภาพที่เพิ่มแล้ว (สามารถเพิ่ม/ลบ URL นี้ด้วยตัวเองได้)</p>
                               <textarea value={form.imagesString} onChange={e => setForm(p => ({ ...p, imagesString: e.target.value }))}
                                  placeholder={"https://example.com/img1.jpg\nhttps://example.com/img2.jpg"} rows={4}
                                  className="w-full px-3 py-2.5 text-xs font-mono border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 whitespace-pre" />
                               <div className="flex items-center gap-2 mt-2">
                                  <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-600 rounded-md">
                                     รวม {(form.imagesString.match(/https?:\/\//g) || []).length} รูปภาพ
                                  </span>
                               </div>
                             </div>
                          )}
                       </div>
                    )}
                 </div>
              </div>

              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
                  className="w-5 h-5 accent-indigo-600 rounded" />
                <div>
                   <span className="text-sm font-bold text-slate-800 block">เปิดการแสดงผล</span>
                   <span className="text-xs text-slate-500">แสดงกิจกรรมนี้บนหน้าเว็บไซต์สาธารณะให้ผู้คนเห็น</span>
                </div>
              </label>

            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 sticky bottom-0 bg-white z-10 rounded-b-2xl">
              <button onClick={() => setModalMode(null)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                ยกเลิก
              </button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-colors shadow-sm">
                <Save className="w-4 h-4" />
                {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
