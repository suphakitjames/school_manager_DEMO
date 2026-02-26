"use client";

import { useEffect, useState } from "react";
import { Plus, Pin, Calendar, Search, X, Save, Pencil, Trash2, Sparkles } from "lucide-react";
import { SimpleRichTextEditor, renderRichText } from "./SimpleRichTextEditor";

type Announcement = {
  id: number;
  title: string;
  content: string;
  type: string;
  targetRole: string | null;
  isPinned: boolean;
  createdAt: string;
  author: { name: string; role: string };
};

const typeMap: Record<string, { label: string; cls: string }> = {
  URGENT:   { label: "ด่วน",     cls: "bg-red-100 text-red-700" },
  EVENT:    { label: "กิจกรรม", cls: "bg-emerald-100 text-emerald-700" },
  ACADEMIC: { label: "วิชาการ",  cls: "bg-violet-100 text-violet-700" },
  GENERAL:  { label: "ทั่วไป",   cls: "bg-slate-100 text-slate-600" },
};

type FormData = { title: string; content: string; type: string; targetRole: string; isPinned: boolean };
const blankForm: FormData = { title: "", content: "", type: "GENERAL", targetRole: "", isPinned: false };

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");

  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [form, setForm] = useState<FormData>(blankForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/announcements");
      setItems(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = items.filter(a => {
    const matchSearch = !search || a.title.includes(search) || a.content.includes(search);
    const matchType = !filterType || a.type === filterType;
    return matchSearch && matchType;
  });

  const openAdd = () => {
    setForm(blankForm);
    setEditId(null);
    setError("");
    setModalMode("add");
  };

  const openEdit = (a: Announcement) => {
    setForm({ title: a.title, content: a.content, type: a.type, targetRole: a.targetRole ?? "", isPinned: a.isPinned });
    setEditId(a.id);
    setError("");
    setModalMode("edit");
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`ยืนยันลบประกาศ "${title}"?`)) return;
    const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
    else alert("ลบไม่สำเร็จ");
  };

  const handleSave = async () => {
    if (!form.title || !form.content) { setError("กรุณากรอกชื่อเรื่องและเนื้อหา"); return; }
    setSaving(true);
    setError("");
    try {
      const url = modalMode === "add" ? "/api/announcements" : `/api/announcements/${editId}`;
      const method = modalMode === "add" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setModalMode(null);
        fetchData();
      } else {
        const d = await res.json();
        setError(d.error || "บันทึกไม่สำเร็จ");
      }
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">ประกาศและข่าวสาร</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading ? "กำลังโหลด..." : `ประกาศทั้งหมด ${filtered.length} รายการ`}
          </p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm w-fit">
          <Plus className="w-4 h-4" /> สร้างประกาศใหม่
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหาประกาศ..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">ทุกประเภท</option>
            <option value="URGENT">ด่วน</option>
            <option value="GENERAL">ทั่วไป</option>
            <option value="EVENT">กิจกรรม</option>
            <option value="ACADEMIC">วิชาการ</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">กำลังโหลดข้อมูล...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">ไม่พบประกาศ</div>
        ) : (
          filtered.map((a, index) => {
            const t = typeMap[a.type] ?? typeMap.GENERAL;
            const isNew = new Date(a.createdAt).getTime() > Date.now() - 3 * 24 * 60 * 60 * 1000;
            return (
              <div 
                key={a.id} 
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300 p-5 animate-in slide-in-from-bottom-4 fade-in"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {isNew && (
                        <span className="flex items-center gap-1 text-xs text-white bg-gradient-to-r from-indigo-500 to-violet-500 px-2 py-0.5 rounded-full font-bold shadow-sm animate-pulse">
                          <Sparkles className="w-3 h-3 text-yellow-200" /> ใหม่
                        </span>
                      )}
                      {a.isPinned && (
                        <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                          <Pin className="w-3 h-3" /> ปักหมุด
                        </span>
                      )}
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${t.cls}`}>{t.label}</span>
                      {a.targetRole && (
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          กลุ่มเป้าหมาย: {a.targetRole}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg">{a.title}</h3>
                    <div className="mt-2.5 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                      {renderRichText(a.content)}
                    </div>
                    <div className="flex items-center gap-3 mt-4 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(a.createdAt)}
                      </span>
                      <span>โดย: {a.author?.name ?? "-"}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg text-slate-500 hover:bg-amber-50 hover:text-amber-600 transition-colors" title="แก้ไข">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(a.id, a.title)} className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors" title="ลบ">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ring-1 ring-slate-200 translate-y-0 scale-100 opacity-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white">
              <h2 className="font-semibold text-slate-800">{modalMode === "add" ? "สร้างประกาศใหม่" : "แก้ไขประกาศ"}</h2>
              <button onClick={() => setModalMode(null)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">หัวข้อ *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ประเภท</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="GENERAL">ทั่วไป</option>
                    <option value="URGENT">ด่วน</option>
                    <option value="EVENT">กิจกรรม</option>
                    <option value="ACADEMIC">วิชาการ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">กลุ่มเป้าหมาย</label>
                  <select value={form.targetRole} onChange={e => setForm(p => ({ ...p, targetRole: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">ทุกกลุ่ม</option>
                    <option value="นักเรียน">นักเรียน</option>
                    <option value="ครู">ครู</option>
                    <option value="ผู้ปกครอง">ผู้ปกครอง</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">เนื้อหา *</label>
                <SimpleRichTextEditor 
                  value={form.content} 
                  onChange={(val) => setForm(p => ({ ...p, content: val }))} 
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isPinned} onChange={e => setForm(p => ({ ...p, isPinned: e.target.checked }))}
                  className="w-4 h-4 accent-indigo-600" />
                <span className="text-sm text-slate-700">ปักหมุดประกาศนี้</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 sticky bottom-0 bg-white">
              <button onClick={() => setModalMode(null)} className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">
                ยกเลิก
              </button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-60">
                <Save className="w-4 h-4" />
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
