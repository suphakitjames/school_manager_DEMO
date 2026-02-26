"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search, Plus, Filter, Download, Eye, Pencil, Trash2, GraduationCap, X, Save,
} from "lucide-react";

type Classroom = { id: number; name: string; grade: { name: string } };
type Student = {
  id: number;
  studentCode: string;
  firstName: string;
  lastName: string;
  gender: string | null;
  parentName: string | null;
  parentPhone: string | null;
  status: string;
  classroom: Classroom | null;
};

const statusMap: Record<string, { label: string; cls: string }> = {
  ACTIVE:      { label: "กำลังศึกษา", cls: "bg-emerald-100 text-emerald-700" },
  INACTIVE:    { label: "ไม่ใช้งาน",   cls: "bg-slate-100 text-slate-600" },
  TRANSFERRED: { label: "ย้ายโรงเรียน", cls: "bg-amber-100 text-amber-700" },
  GRADUATED:   { label: "จบการศึกษา",  cls: "bg-indigo-100 text-indigo-700" },
};

const genderMap: Record<string, string> = { MALE: "ชาย", FEMALE: "หญิง", OTHER: "อื่นๆ" };

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Edit Modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Partial<Student> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filterStatus) params.set("status", filterStatus);
      const res = await fetch(`/api/students?${params}`);
      const data = await res.json();
      setStudents(data);
    } catch {
      setError("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, [search, filterStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`ยืนยันลบนักเรียน "${name}"?`)) return;
    const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
    if (res.ok) fetchStudents();
    else alert("ลบไม่สำเร็จ");
  };

  const openEdit = (s: Student) => {
    setEditStudent({ ...s });
    setEditOpen(true);
    setError("");
  };

  const handleSave = async () => {
    if (!editStudent) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/students/${editStudent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentCode: editStudent.studentCode,
          firstName: editStudent.firstName,
          lastName: editStudent.lastName,
          status: editStudent.status,
          parentName: editStudent.parentName,
          parentPhone: editStudent.parentPhone,
        }),
      });
      if (res.ok) {
        setEditOpen(false);
        fetchStudents();
      } else {
        const d = await res.json();
        setError(d.error || "บันทึกไม่สำเร็จ");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการนักเรียน</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading ? "กำลังโหลด..." : `นักเรียนทั้งหมด ${students.length} คน`}
          </p>
        </div>
        <Link
          href="/students/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 w-fit"
        >
          <Plus className="w-4 h-4" />
          ลงทะเบียนนักเรียนใหม่
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อ, รหัส..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">ทุกสถานะ</option>
            <option value="ACTIVE">กำลังศึกษา</option>
            <option value="INACTIVE">ไม่ใช้งาน</option>
            <option value="TRANSFERRED">ย้ายโรงเรียน</option>
            <option value="GRADUATED">จบการศึกษา</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
            <Filter className="w-4 h-4" /> กรองเพิ่มเติม
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {["นักเรียน", "รหัส", "ห้องเรียน", "ผู้ปกครอง", "สถานะ", "จัดการ"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">กำลังโหลดข้อมูล...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">ไม่พบข้อมูลนักเรียน</td></tr>
              ) : (
                students.map((s) => {
                  const st = statusMap[s.status] ?? { label: s.status, cls: "bg-slate-100 text-slate-600" };
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{s.firstName} {s.lastName}</p>
                            <p className="text-xs text-slate-500">{genderMap[s.gender ?? ""] ?? ""} · {s.parentPhone ?? "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 font-mono">{s.studentCode}</td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-slate-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                          {s.classroom?.name ?? "-"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{s.parentName ?? "-"}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${st.cls}`}>{st.label}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <Link href={`/students/${s.id}`} className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors" title="ดูรายละเอียด">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-slate-500 hover:bg-amber-50 hover:text-amber-600 transition-colors" title="แก้ไข">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(s.id, `${s.firstName} ${s.lastName}`)} className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors" title="ลบ">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-200">
          <p className="text-sm text-slate-500">แสดง {students.length} รายการ</p>
        </div>
      </div>

      {/* Edit Modal */}
      {editOpen && editStudent && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-800">แก้ไขข้อมูลนักเรียน</h2>
              <button onClick={() => setEditOpen(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">รหัสนักเรียน</label>
                  <input value={editStudent.studentCode ?? ""} onChange={e => setEditStudent(p => ({ ...p, studentCode: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">สถานะ</label>
                  <select value={editStudent.status ?? "ACTIVE"} onChange={e => setEditStudent(p => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="ACTIVE">กำลังศึกษา</option>
                    <option value="INACTIVE">ไม่ใช้งาน</option>
                    <option value="TRANSFERRED">ย้ายโรงเรียน</option>
                    <option value="GRADUATED">จบการศึกษา</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อ</label>
                  <input value={editStudent.firstName ?? ""} onChange={e => setEditStudent(p => ({ ...p, firstName: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">นามสกุล</label>
                  <input value={editStudent.lastName ?? ""} onChange={e => setEditStudent(p => ({ ...p, lastName: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้ปกครอง</label>
                <input value={editStudent.parentName ?? ""} onChange={e => setEditStudent(p => ({ ...p, parentName: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">เบอร์โทรผู้ปกครอง</label>
                <input value={editStudent.parentPhone ?? ""} onChange={e => setEditStudent(p => ({ ...p, parentPhone: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200">
              <button onClick={() => setEditOpen(false)} className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">
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
