"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Plus, Eye, Pencil, Trash2, Users, X, Save } from "lucide-react";

type Classroom = { id: number; name: string };
type Teacher = {
  id: number;
  teacherCode: string;
  firstName: string;
  lastName: string;
  gender: string | null;
  phone: string | null;
  position: string | null;
  department: string | null;
  qualification: string | null;
  joinDate: string | null;
  isActive: boolean;
  classrooms: Classroom[];
  user: { email: string; isActive: boolean };
};

const genderMap: Record<string, string> = { MALE: "ชาย", FEMALE: "หญิง", OTHER: "อื่นๆ" };

type FormData = {
  teacherCode: string;
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
  position: string;
  department: string;
  qualification: string;
  joinDate: string;
  email: string;
  password: string;
};

const blankForm: FormData = {
  teacherCode: "", firstName: "", lastName: "", gender: "", phone: "",
  position: "", department: "", qualification: "", joinDate: "",
  email: "", password: "teacher1234",
};

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");

  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [viewTeacher, setViewTeacher] = useState<Teacher | null>(null);
  const [form, setForm] = useState<FormData>(blankForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (department) params.set("department", department);
      const res = await fetch(`/api/teachers?${params}`);
      setTeachers(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeachers(); }, [search, department]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setForm(blankForm);
    setError("");
    setEditId(null);
    setModalMode("add");
  };

  const openEdit = (t: Teacher) => {
    setForm({
      teacherCode: t.teacherCode,
      firstName: t.firstName,
      lastName: t.lastName,
      gender: t.gender ?? "",
      phone: t.phone ?? "",
      position: t.position ?? "",
      department: t.department ?? "",
      qualification: t.qualification ?? "",
      joinDate: t.joinDate ? t.joinDate.substring(0, 10) : "",
      email: t.user.email,
      password: "",
    });
    setEditId(t.id);
    setError("");
    setModalMode("edit");
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`ยืนยันลบครู "${name}"?`)) return;
    const res = await fetch(`/api/teachers/${id}`, { method: "DELETE" });
    if (res.ok) fetchTeachers();
    else alert("ลบไม่สำเร็จ");
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      let res: Response;
      if (modalMode === "add") {
        res = await fetch("/api/teachers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch(`/api/teachers/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      if (res.ok) {
        setModalMode(null);
        fetchTeachers();
      } else {
        const d = await res.json();
        setError(d.error || "บันทึกไม่สำเร็จ");
      }
    } finally {
      setSaving(false);
    }
  };

  const f = (field: keyof FormData) => form[field] as string;
  const sf = (field: keyof FormData, val: string) => setForm(p => ({ ...p, [field]: val }));

  const activeCount = teachers.filter(t => t.isActive).length;
  const departments = [...new Set(teachers.map(t => t.department).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">ครูและบุคลากร</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading ? "กำลังโหลด..." : `บุคลากรทั้งหมด ${teachers.length} คน`}
          </p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm w-fit">
          <Plus className="w-4 h-4" /> เพิ่มครูใหม่
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "ครูทั้งหมด",  value: teachers.length, color: "indigo" },
          { label: "ปฏิบัติงาน",  value: activeCount,      color: "emerald" },
          { label: "ไม่ใช้งาน",   value: teachers.length - activeCount, color: "amber" },
          { label: "แผนกวิชา",    value: departments.length, color: "violet" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
            <p className={`text-2xl font-bold text-${c.color}-600`}>{c.value}</p>
            <p className="text-xs text-slate-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อครู, รหัส, แผนก..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <select value={department} onChange={e => setDepartment(e.target.value)}
            className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">ทุกแผนก</option>
            {departments.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {["ครู", "รหัส", "ตำแหน่ง", "แผนก", "ห้องเรียน", "วุฒิการศึกษา", "สถานะ", "จัดการ"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-slate-400">กำลังโหลดข้อมูล...</td></tr>
              ) : teachers.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-slate-400">ไม่พบข้อมูลครู</td></tr>
              ) : (
                teachers.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{t.firstName} {t.lastName}</p>
                          <p className="text-xs text-slate-500">{t.phone ?? "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-mono text-slate-600">{t.teacherCode}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{t.position ?? "-"}</td>
                    <td className="px-5 py-4">
                      <span className="text-sm bg-violet-50 text-violet-700 px-2.5 py-1 rounded-lg font-medium">{t.department ?? "-"}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700 text-center">{t.classrooms.length} ห้อง</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{t.qualification ?? "-"}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${t.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {t.isActive ? "ปฏิบัติงาน" : "ไม่ใช้งาน"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewTeacher(t)} className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors" title="ดูรายละเอียด">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg text-slate-500 hover:bg-amber-50 hover:text-amber-600 transition-colors" title="แก้ไข">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(t.id, `${t.firstName} ${t.lastName}`)} className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors" title="ลบ">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View details Modal */}
      {viewTeacher && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ring-1 ring-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                ข้อมูลรายละเอียดครู
              </h2>
              <button 
                onClick={() => setViewTeacher(null)} 
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                title="ปิด"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-6 mb-6">
                <div className="w-24 h-24 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                  <Users className="w-10 h-10" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-2xl font-bold text-slate-800">{viewTeacher.firstName} {viewTeacher.lastName}</h3>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${viewTeacher.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {viewTeacher.isActive ? "ปฏิบัติงาน" : "ไม่ใช้งาน"}
                    </span>
                  </div>
                  <p className="text-slate-500 mb-4">รหัสประจำตัว: <span className="font-mono text-slate-700 font-medium">{viewTeacher.teacherCode}</span></p>
                  
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div>
                      <span className="block text-xs text-slate-400 mb-1">ตำแหน่ง</span>
                      <span className="font-medium text-slate-800">{viewTeacher.position || "-"}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-400 mb-1">แผนก</span>
                      <span className="font-medium text-slate-800">{viewTeacher.department || "-"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-700 mb-4">
                    ข้อมูลส่วนตัว
                  </h4>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between items-start"><span className="text-slate-500">เพศ:</span> <span className="font-medium text-slate-800 text-right">{genderMap[viewTeacher.gender || ""] || viewTeacher.gender || "-"}</span></li>
                    <li className="flex justify-between items-start"><span className="text-slate-500">เบอร์โทร:</span> <span className="font-medium text-slate-800 text-right">{viewTeacher.phone || "-"}</span></li>
                    <li className="flex justify-between items-start"><span className="text-slate-500">อีเมล:</span> <span className="font-medium text-slate-800 text-right break-all ml-4">{viewTeacher.user?.email || "-"}</span></li>
                    <li className="flex justify-between items-start"><span className="text-slate-500">วุฒิการศึกษา:</span> <span className="font-medium text-slate-800 text-right">{viewTeacher.qualification || "-"}</span></li>
                    <li className="flex justify-between items-start"><span className="text-slate-500 whitespace-nowrap">วันที่เริ่มงาน:</span> <span className="font-medium text-slate-800 text-right">{viewTeacher.joinDate ? new Date(viewTeacher.joinDate).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }) : "-"}</span></li>
                  </ul>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-700 mb-4">
                    ห้องเรียนประจำที่ดูแล ({viewTeacher.classrooms?.length || 0})
                  </h4>
                  {viewTeacher.classrooms && viewTeacher.classrooms.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {viewTeacher.classrooms.map(c => (
                        <span key={c.id} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium shadow-sm">
                          {c.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic mt-2">ไม่มีข้อมูลห้องเรียน</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button onClick={() => setViewTeacher(null)} className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors">
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white">
              <h2 className="font-semibold text-slate-800">
                {modalMode === "add" ? "เพิ่มครูใหม่" : "แก้ไขข้อมูลครู"}
              </h2>
              <button onClick={() => setModalMode(null)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">รหัสครู *</label>
                  <input value={f("teacherCode")} onChange={e => sf("teacherCode", e.target.value)} disabled={modalMode === "edit"}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">เพศ</label>
                  <select value={f("gender")} onChange={e => sf("gender", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">-- เลือก --</option>
                    <option value="MALE">ชาย</option>
                    <option value="FEMALE">หญิง</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อ *</label>
                  <input value={f("firstName")} onChange={e => sf("firstName", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">นามสกุล *</label>
                  <input value={f("lastName")} onChange={e => sf("lastName", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ตำแหน่ง</label>
                  <input value={f("position")} onChange={e => sf("position", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">แผนก</label>
                  <input value={f("department")} onChange={e => sf("department", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">วุฒิการศึกษา</label>
                  <input value={f("qualification")} onChange={e => sf("qualification", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">เบอร์โทร</label>
                  <input value={f("phone")} onChange={e => sf("phone", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">วันที่เริ่มงาน</label>
                <input type="date" value={f("joinDate")} onChange={e => sf("joinDate", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              {modalMode === "add" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">อีเมล *</label>
                    <input type="email" value={f("email")} onChange={e => sf("email", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่าน</label>
                    <input type="password" value={f("password")} onChange={e => sf("password", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <p className="text-xs text-slate-400 mt-1">ค่าเริ่มต้น: teacher1234</p>
                  </div>
                </>
              )}
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
