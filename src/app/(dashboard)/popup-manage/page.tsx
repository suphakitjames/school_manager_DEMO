"use client";

import { useEffect, useState } from "react";
import { Plus, Image as ImageIcon, Calendar, Trash2, Pencil, X, Save, AlertCircle, UploadCloud, Monitor } from "lucide-react";

type PopupBanner = {
  id: number;
  title: string | null;
  imageUrl: string;
  linkUrl: string | null;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
};

type FormData = {
  title: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  expiresAt: string;
};

const blankForm: FormData = {
  title: "",
  imageUrl: "",
  linkUrl: "",
  isActive: true,
  expiresAt: "",
};

export default function PopupManagePage() {
  const [items, setItems] = useState<PopupBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [form, setForm] = useState<FormData>(blankForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/popup");
      setItems(await res.json());
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    setForm(blankForm);
    setEditId(null);
    setError("");
    setModalMode("add");
  };

  const openEdit = (a: PopupBanner) => {
    setForm({
      title: a.title || "",
      imageUrl: a.imageUrl,
      linkUrl: a.linkUrl || "",
      isActive: a.isActive,
      expiresAt: a.expiresAt ? new Date(a.expiresAt).toISOString().split("T")[0] : "",
    });
    setEditId(a.id);
    setError("");
    setModalMode("edit");
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`ยืนยันลบแบนเนอร์นี้?`)) return;
    const res = await fetch(`/api/popup/${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
    else alert("ลบไม่สำเร็จ");
  };

  const handleSave = async () => {
    if (!form.imageUrl) { setError("กรุณาอัปโหลดรูปภาพแบนเนอร์"); return; }
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title || null,
        imageUrl: form.imageUrl,
        linkUrl: form.linkUrl || null,
        isActive: form.isActive,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      };

      const url = modalMode === "add" ? "/api/popup" : `/api/popup/${editId}`;
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
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
      setForm(p => ({ ...p, imageUrl: data.url }));
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการอัปโหลดรูป");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการหน้าต่างประกาศ (Popup)</h1>
          <p className="text-slate-500 text-sm mt-1">
            แบนเนอร์ที่จะเด้งแจ้งเตือนตอนเข้าหน้าเว็บครั้งแรก (มีผลเฉพาะรายการที่เปิดใช้งานและยังไม่หมดอายุ)
          </p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm w-fit">
          <Plus className="w-4 h-4" /> เพิ่มแบนเนอร์ใหม่
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">รูปภาพ</th>
                <th className="px-6 py-4 font-semibold">หัวข้อ (ถ้ามี)</th>
                <th className="px-6 py-4 font-semibold">ลิงก์ปลายทาง</th>
                <th className="px-6 py-4 font-semibold text-center">สถานะ</th>
                <th className="px-6 py-4 font-semibold text-center">หมดอายุ</th>
                <th className="px-6 py-4 font-semibold text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">กำลังโหลดข้อมูล...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">ย้งไม่มีข้อมูล Popup Banner</td>
                </tr>
              ) : (
                items.map((item) => {
                  const isExpired = item.expiresAt && new Date(item.expiresAt) < new Date();
                  return (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-24 h-16 bg-slate-100 rounded border flex items-center justify-center overflow-hidden">
                          <img src={item.imageUrl} alt="banner" className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">{item.title || "-"}</td>
                      <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate">
                        {item.linkUrl ? <a href={item.linkUrl} target="_blank" className="text-blue-500 hover:underline">{item.linkUrl}</a> : "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.isActive ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md">เปิดใช้งาน</span>
                        ) : (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md">ปิด</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.expiresAt ? (
                          <span className={isExpired ? "text-red-500 font-medium" : "text-slate-600"}>
                            {new Date(item.expiresAt).toLocaleDateString('th-TH')}
                            {isExpired && <span className="block text-[10px]">(หมดอายุ)</span>}
                          </span>
                        ) : "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openEdit(item)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Pencil className="w-4 h-4"/></button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4"/></button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalMode && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="font-bold text-lg">{modalMode === "add" ? "เพิ่ม Popup Banner" : "แก้ไขแบนเนอร์"}</h2>
              <button onClick={() => setModalMode(null)}><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            
            <div className="p-6 space-y-5">
              {error && <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg flex items-center gap-2"><AlertCircle className="w-4 h-4"/>{error}</div>}
              
              <div>
                <label className="block text-sm font-semibold mb-1">ภาพแบนเนอร์ *</label>
                {form.imageUrl ? (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border">
                    <img src={form.imageUrl} className="w-full h-full object-contain bg-slate-900" alt="preview" />
                    <button onClick={() => setForm(p => ({...p, imageUrl: ""}))} className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 cursor-pointer">
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm font-medium">{uploadingImage ? "กำลังอัปโหลด..." : "อัปโหลดรูปภาพ"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">ชื่ออ้างอิง (ไว้ดูหลังบ้าน)</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="ไม่ต้องใส่ก็ได้" />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">ลิงก์เมื่อคลิกรูปภาพ</label>
                <input value={form.linkUrl} onChange={e => setForm(p => ({ ...p, linkUrl: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-xs" placeholder="https://..." />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">วันที่หมดอายุ (จะซ่อนออโต้)</label>
                <input type="date" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none" />
                <p className="text-xs text-slate-500 mt-1">ปล่อยว่างไว้ถ้าไม่มีกำหนดหมดอายุ</p>
              </div>

              <label className="flex items-center gap-3 mt-4">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
                  className="w-5 h-5 accent-indigo-600 rounded" />
                <span className="text-sm font-bold">เปิดใช้งานแบนเนอร์นี้</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-slate-50 rounded-b-2xl">
              <button onClick={() => setModalMode(null)} className="px-4 py-2 text-sm bg-white border rounded-lg hover:bg-slate-50">ยกเลิก</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg disabled:opacity-50">
                <Save className="w-4 h-4"/> บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
