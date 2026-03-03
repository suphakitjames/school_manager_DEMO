"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, Save, AlertCircle, UploadCloud, FileText, Search } from "lucide-react";

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

type FormData = {
  title: string;
  description: string;
  fileUrl: string;
  category: DocumentCategory;
  isActive: boolean;
};

const blankForm: FormData = {
  title: "",
  description: "",
  fileUrl: "",
  category: "GENERAL",
  isActive: true,
};

const categoryLabels: Record<DocumentCategory, string> = {
  "STUDENT": "นักเรียน/ผู้ปกครอง",
  "TEACHER": "ครูและบุคลากร",
  "GENERAL": "ทั่วไป"
};

export default function DocumentManagePage() {
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("ALL");

  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [form, setForm] = useState<FormData>(blankForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/documents");
      setItems(await res.json());
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = items.filter(a => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "ALL" || a.category === filterCat;
    return matchSearch && matchCat;
  });

  const openAdd = () => {
    setForm(blankForm);
    setEditId(null);
    setError("");
    setModalMode("add");
  };

  const openEdit = (a: DocumentItem) => {
    setForm({
      title: a.title || "",
      description: a.description || "",
      fileUrl: a.fileUrl,
      category: a.category,
      isActive: a.isActive,
    });
    setEditId(a.id);
    setError("");
    setModalMode("edit");
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`ยืนยันลบเอกสารนี้?`)) return;
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
    else alert("ลบไม่สำเร็จ");
  };

  const handleSave = async () => {
    if (!form.title) { setError("กรุณาระบุชื่อเอกสาร"); return; }
    if (!form.fileUrl) { setError("กรุณาอัปโหลดไฟล์เอกสาร"); return; }
    
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        fileUrl: form.fileUrl,
        category: form.category,
        isActive: form.isActive,
      };

      const url = modalMode === "add" ? "/api/documents" : `/api/documents/${editId}`;
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
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
      setForm(p => ({ ...p, fileUrl: data.url }));
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการอัปโหลดไฟล์");
    } finally {
      setUploadingFile(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการศูนย์ดาวน์โหลดเอกสาร</h1>
          <p className="text-slate-500 text-sm mt-1">
            เพิ่มแบบฟอร์มหรือเอกสารต่างๆ สำหรับให้นักเรียน ผู้ปกครอง หรือครู ดาวน์โหลด
          </p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm w-fit">
          <Plus className="w-4 h-4" /> เพิ่มเอกสารใหม่
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-4 flex flex-col sm:flex-row gap-4">
         <div className="relative flex-1">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <input type="text" value={search} onChange={e => setSearch(e.target.value)}
             placeholder="ค้นหาชื่อเอกสาร..."
             className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
         </div>
         <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
           className="w-full sm:w-48 px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
             <option value="ALL">ทุกหมวดหมู่</option>
             <option value="STUDENT">นักเรียน/ผู้ปกครอง</option>
             <option value="TEACHER">ครูและบุคลากร</option>
             <option value="GENERAL">ทั่วไป</option>
         </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">ชื่อเอกสาร</th>
                <th className="px-6 py-4 font-semibold">หมวดหมู่</th>
                <th className="px-6 py-4 font-semibold">ไฟล์</th>
                <th className="px-6 py-4 font-semibold text-center">เปิดใช้งาน</th>
                <th className="px-6 py-4 font-semibold text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">กำลังโหลดข้อมูล...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">ย้งไม่มีข้อมูลเอกสาร</td>
                </tr>
              ) : (
                filtered.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                         <div className="font-medium text-slate-800">{item.title}</div>
                         {item.description && <div className="text-xs text-slate-500 mt-1 line-clamp-1">{item.description}</div>}
                      </td>
                      <td className="px-6 py-4">
                         <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md backdrop-blur-sm border border-indigo-100/50">
                           {categoryLabels[item.category]}
                         </span>
                      </td>
                      <td className="px-6 py-4">
                        <a href={item.fileUrl} target="_blank" className="flex items-center gap-1.5 text-blue-500 hover:text-blue-700 font-medium text-xs">
                          <FileText className="w-3.5 h-3.5" /> ดาวน์โหลด
                        </a>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.isActive ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-300 inline-block"></span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openEdit(item)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Pencil className="w-4 h-4"/></button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4"/></button>
                      </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalMode && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="font-bold text-lg text-slate-800">{modalMode === "add" ? "เพิ่มเอกสารใหม่" : "แก้ไขข้อมูลเอกสาร"}</h2>
              <button onClick={() => setModalMode(null)}><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            
            <div className="p-6 space-y-5">
              {error && <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg flex items-center gap-2"><AlertCircle className="w-4 h-4"/>{error}</div>}
              
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700">ชื่อเอกสาร *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="เช่น ใบคำร้องขอระเบียนฯ (ปพ.1)" />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700">รายละเอียดเพิ่มเติม</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none resize-none" placeholder="อธิบายเงื่อนไขการใช้เอกสารนี้ (ถ้ามี)" rows={2} />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700">หมวดหมู่เกสาร *</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as DocumentCategory }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none bg-white">
                  <option value="GENERAL">ทั่วไป</option>
                  <option value="STUDENT">นักเรียน/ผู้ปกครอง</option>
                  <option value="TEACHER">ครูและบุคลากร</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700">ไฟล์เอกสาร (PDF, Word, etc.) *</label>
                <div className="flex flex-col gap-2">
                   {form.fileUrl && (
                      <div className="flex items-center justify-between p-3 border border-indigo-100 bg-indigo-50 rounded-xl">
                         <a href={form.fileUrl} target="_blank" className="text-indigo-600 font-medium text-sm flex items-center gap-2 italic">
                            <FileText className="w-4 h-4" /> ดูไฟล์ปัจจุบัน
                         </a>
                         <button onClick={() => setForm(p => ({ ...p, fileUrl: ""}))} className="p-1 text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                      </div>
                   )}
                   {!form.fileUrl && (
                      <label className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 cursor-pointer hover:bg-slate-100 hover:border-indigo-400 transition-colors text-slate-600 font-medium text-sm">
                        <UploadCloud className="w-5 h-5" />
                        {uploadingFile ? "กำลังอัปโหลดไฟล์..." : "อัปโหลดไฟล์ใหม่ (PDF, DOCX)"}
                        <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" className="hidden" onChange={handleFileUpload} disabled={uploadingFile} />
                      </label>
                   )}
                </div>
              </div>

              <label className="flex items-center gap-3 mt-4">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
                  className="w-5 h-5 accent-indigo-600 rounded" />
                <span className="text-sm font-bold text-slate-700">เปิดให้ดาวน์โหลด (เผยแพร่)</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-slate-50 rounded-b-2xl">
              <button onClick={() => setModalMode(null)} className="px-4 py-2 text-sm bg-white border rounded-lg hover:bg-slate-50 font-semibold text-slate-600">ยกเลิก</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-50">
                <Save className="w-4 h-4"/> บันทึกเอกสาร
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
