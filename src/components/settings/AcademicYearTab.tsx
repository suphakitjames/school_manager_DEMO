"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Calendar, CheckCircle2, X } from "lucide-react";

type AcademicYear = {
  id: number;
  year: string;
  semester: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

export default function AcademicYearTab() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    year: "",
    semester: 1,
    startDate: "",
    endDate: "",
    isActive: false,
  });

  const fetchYears = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/academic-years");
      if (res.ok) {
        setAcademicYears(await res.json());
      }
    } catch (error) {
      console.error("Error fetching academic years:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  const handleOpenModal = (year?: AcademicYear) => {
    if (year) {
      setEditingId(year.id);
      setFormData({
        year: year.year,
        semester: year.semester,
        startDate: new Date(year.startDate).toISOString().split('T')[0],
        endDate: new Date(year.endDate).toISOString().split('T')[0],
        isActive: year.isActive,
      });
    } else {
      setEditingId(null);
      setFormData({
        year: (new Date().getFullYear() + 543).toString(),
        semester: 1,
        startDate: "",
        endDate: "",
        isActive: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/academic-years/${editingId}` : "/api/academic-years";
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        handleCloseModal();
        fetchYears();
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบปีการศึกษานี้?")) {
      try {
        const res = await fetch(`/api/academic-years/${id}`, { method: "DELETE" });
        if (res.ok) {
          fetchYears();
        } else {
          alert("ไม่สามารถลบปีการศึกษาได้ (อาจมีข้อมูลอ้างอิงอยู่)");
        }
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    if (currentStatus) return; // Already active, no need to toggle to active
    try {
      const res = await fetch(`/api/academic-years/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });
      if (res.ok) fetchYears();
    } catch (error) {
      console.error("Toggle error:", error);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">กำลังโหลด...</div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 lg:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">จัดการปีการศึกษา</h2>
            <p className="text-xs text-slate-500">กำหนดปีการศึกษาและภาคเรียนสำหรับใช้งานในระบบ</p>
          </div>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> เพิ่มปีการศึกษา
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
              <th className="px-6 py-4 font-semibold">ปีการศึกษา / เทอม</th>
              <th className="px-6 py-4 font-semibold">วันที่เริ่มต้น</th>
              <th className="px-6 py-4 font-semibold">วันที่สิ้นสุด</th>
              <th className="px-6 py-4 font-semibold">สถานะ</th>
              <th className="px-6 py-4 font-semibold text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {academicYears.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  ไม่มีข้อมูลปีการศึกษา
                </td>
              </tr>
            ) : (
              academicYears.map((year) => (
                <tr key={year.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{year.year}</div>
                    <div className="text-xs text-slate-500">ภาคเรียนที่ {year.semester}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(year.startDate).toLocaleDateString('th-TH')}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(year.endDate).toLocaleDateString('th-TH')}
                  </td>
                  <td className="px-6 py-4">
                    {year.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ใช้งานปัจจุบัน
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleToggleActive(year.id, year.isActive)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        ตั้งเป็นปัจจุบัน
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(year)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="แก้ไข"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(year.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="ลบ"
                      >
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {editingId ? "แก้ไขปีการศึกษา" : "เพิ่มปีการศึกษาใหม่"}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">ปีการศึกษา (พ.ศ.)</label>
                  <input
                    type="text"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                    placeholder="2567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">ภาคเรียนที่</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3 (ฤดูร้อน)</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">วันที่เริ่มต้น</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">วันที่สิ้นสุด</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">
                  ตั้งเป็นปีการศึกษาปัจจุบัน
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-6 shrink-0 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
