"use client";

import { useState, useEffect } from "react";
import { Search, Plus, BookOpen, X, Loader2 } from "lucide-react";

type Grade = {
  id: number;
  name: string;
  level: number;
};

type Teacher = {
  id: number;
  firstName: string;
  lastName: string;
};

type Classroom = {
  id: number;
  name: string;
  capacity: number;
  grade: Grade;
  teacher?: { firstName: string; lastName: string } | null;
  _count: { students: number };
};

export default function ClassesPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedGrade, setSelectedGrade] = useState("ทั้งหมด");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Classroom | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    gradeId: "",
    teacherId: "",
    capacity: "40",
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [clsRes, gradeRes, teacherRes] = await Promise.all([
        fetch("/api/classrooms"),
        fetch("/api/grades"),
        fetch("/api/teachers"),
      ]);
      const [clsData, gradeData, teacherData] = await Promise.all([
        clsRes.json(),
        gradeRes.json(),
        teacherRes.json(),
      ]);
      
      if (Array.isArray(clsData)) setClassrooms(clsData);
      if (Array.isArray(gradeData)) setGrades(gradeData);
      if (Array.isArray(teacherData)) setTeachers(teacherData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/classrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || "เกิดข้อผิดพลาดในการสร้างห้องเรียน");
        return;
      }

      await fetchData(); // Refresh list
      setIsModalOpen(false);
      setFormData({ name: "", gradeId: "", teacherId: "", capacity: "40" });
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredClasses = classrooms.filter((cls) => {
    const matchGrade = selectedGrade === "ทั้งหมด" || cls.grade.name === selectedGrade;
    const teacherName = cls.teacher ? `${cls.teacher.firstName} ${cls.teacher.lastName}` : "ไม่มีครูประจำชั้น";
    const matchSearch = cls.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        teacherName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchGrade && matchSearch;
  });

  const uniqueGradeNames = Array.from(new Set(grades.map(g => g.name)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">ห้องเรียนและหลักสูตร</h1>
          <p className="text-slate-500 text-sm mt-1">จัดการข้อมูลห้องเรียนและครูประจำชั้น</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm w-fit"
        >
          <Plus className="w-4 h-4" />
          สร้างห้องเรียนใหม่
        </button>
      </div>

      {/* Grade Level Tabs */}
      {!isLoading && (
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={() => setSelectedGrade("ทั้งหมด")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${selectedGrade === "ทั้งหมด" ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            ทั้งหมด
          </button>
          {uniqueGradeNames.map((g) => (
            <button 
              key={g} 
              onClick={() => setSelectedGrade(g)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${selectedGrade === g ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาห้องเรียน, ครูประจำชั้น..." 
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" 
          />
        </div>
      </div>

      {/* Classroom Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-slate-500 animate-pulse">กำลังโหลดข้อมูล...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredClasses.length > 0 ? (
            filteredClasses.map((cls) => {
              const studentsCount = cls._count?.students || 0;
              const fillPct = Math.round((studentsCount / cls.capacity) * 100);
              const teacherName = cls.teacher ? `${cls.teacher.firstName} ${cls.teacher.lastName}` : "ยังไม่ได้กำหนด";
              
              return (
                <div key={cls.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg">{cls.name}</h3>
                          <p className="text-xs text-slate-500">{cls.grade.name}</p>
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${fillPct >= 95 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {fillPct >= 95 ? "เต็ม" : "ว่าง"}
                    </span>
                  </div>

                  <div className="space-y-3 text-sm mb-4">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                      <span className="text-slate-500">ครูประจำชั้น</span>
                      <span className="font-medium text-slate-700">{teacherName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">นักเรียน</span>
                      <span className="font-medium text-slate-700">{studentsCount} / {cls.capacity} คน</span>
                    </div>
                  </div>

                  {/* Capacity bar */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                      <span>อัตราการบรรจุ</span>
                      <span>{fillPct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${fillPct >= 95 ? "bg-red-500" : fillPct >= 80 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${Math.min(fillPct, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-5 pt-4 border-t border-slate-50">
                    <button onClick={() => { setSelectedClass(cls); setIsDetailModalOpen(true); }} className="flex-1 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">ดูรายละเอียด</button>
                    <button onClick={() => alert(`ตารางเรียน: ${cls.name} (กำลังพัฒนา)`)} className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">ตารางเรียน</button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">ไม่พบข้อมูลห้องเรียน</p>
              <p className="text-slate-400 text-sm mt-1">ลองเปลี่ยนคำค้นหาหรือระดับชั้น</p>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">สร้างห้องเรียนใหม่</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">ชื่อห้องเรียน <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  placeholder="เช่น ม.1/1"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">ระดับชั้น <span className="text-red-500">*</span></label>
                <select 
                  required
                  value={formData.gradeId}
                  onChange={(e) => setFormData({...formData, gradeId: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">เลือกระดับชั้น</option>
                  {grades.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">ครูประจำชั้น (ไม่บังคับ)</label>
                <select 
                  value={formData.teacherId}
                  onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">เลือกครูประจำชั้น</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">ความจุสูงสุด (คน)</label>
                <input 
                  type="number" 
                  min="1"
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex justify-center items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">รายละเอียดห้องเรียน {selectedClass.name}</h2>
                  <p className="text-xs text-slate-500">ระดับชั้น {selectedClass.grade.name}</p>
                </div>
              </div>
              <button 
                onClick={() => { setIsDetailModalOpen(false); setSelectedClass(null); }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">ครูประจำชั้น</p>
                  <p className="font-semibold text-slate-800">
                    {selectedClass.teacher ? `${selectedClass.teacher.firstName} ${selectedClass.teacher.lastName}` : "ยังไม่ได้กำหนด"}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">จำนวนนักเรียน</p>
                  <p className="font-semibold text-slate-800">
                    {selectedClass._count?.students || 0} / {selectedClass.capacity} คน
                  </p>
                </div>
              </div>
              
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                <h3 className="text-sm font-semibold text-indigo-800 mb-2">ข้อมูลเพิ่มเติม</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex justify-between">
                    <span>ตารางเรียน:</span>
                    <span className="font-medium">ยังไม่ได้กำหนดตาราง</span>
                  </li>
                  <li className="flex justify-between">
                    <span>สถานะความจุ:</span>
                    <span className="font-medium">
                      {Math.round(((selectedClass._count?.students || 0) / selectedClass.capacity) * 100)}% 
                      ({(selectedClass._count?.students || 0) >= selectedClass.capacity ? "เต็ม" : "ว่าง"})
                    </span>
                  </li>
                </ul>
              </div>
              
              <div className="pt-4 flex justify-end">
                <button 
                  onClick={() => { setIsDetailModalOpen(false); setSelectedClass(null); }}
                  className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
