"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  Save,
  X,
  Edit2,
  FileText,
  Download,
  ChevronUp,
  ChevronDown,
  Loader2,
  GraduationCap,
  RefreshCw,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type AcademicYear = { id: number; year: string; semester: number; isActive: boolean };
type Classroom    = { id: number; name: string };
type Student      = { id: number; studentCode: string; firstName: string; lastName: string };
type Subject      = { id: number; code: string; name: string };
type GradeRecord  = { id?: number; studentId: number; subjectId: number; totalScore: number | null; gradeLetter: string | null; gpa: number | null };
type SortConfig   = { key: string; direction: "asc" | "desc" } | null;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function gradeColor(letter: string | null) {
  if (!letter) return "text-slate-400";
  if (["4", "4.0"].includes(letter)) return "text-emerald-700 bg-emerald-50 border border-emerald-200";
  if (["3.5"].includes(letter))      return "text-teal-700 bg-teal-50 border border-teal-200";
  if (["3", "3.0"].includes(letter)) return "text-blue-700 bg-blue-50 border border-blue-200";
  if (["2.5"].includes(letter))      return "text-indigo-700 bg-indigo-50 border border-indigo-200";
  if (["2", "2.0"].includes(letter)) return "text-amber-700 bg-amber-50 border border-amber-200";
  if (["1.5"].includes(letter))      return "text-orange-700 bg-orange-50 border border-orange-200";
  if (["1", "1.0"].includes(letter)) return "text-red-700 bg-red-50 border border-red-200";
  return "text-red-800 bg-red-100 border border-red-300";
}

function gpaColor(gpa: number) {
  if (gpa >= 3.5) return "bg-emerald-500 text-white";
  if (gpa >= 3.0) return "bg-blue-500 text-white";
  if (gpa >= 2.5) return "bg-indigo-500 text-white";
  if (gpa >= 2.0) return "bg-amber-500 text-white";
  if (gpa >= 1.0) return "bg-orange-500 text-white";
  return "bg-red-500 text-white";
}

function rankBadge(rank: number) {
  if (rank === 1) return "bg-amber-400 text-white shadow-amber-200";
  if (rank === 2) return "bg-slate-400 text-white shadow-slate-200";
  if (rank === 3) return "bg-orange-400 text-white shadow-orange-200";
  return "bg-slate-200 text-slate-600";
}

// ─── SortIcon ─────────────────────────────────────────────────────────────────
function SortIcon({ col, sortConfig }: { col: string; sortConfig: SortConfig }) {
  if (!sortConfig || sortConfig.key !== col)
    return <ChevronUp className="w-3.5 h-3.5 text-slate-300 print:hidden" />;
  return sortConfig.direction === "asc"
    ? <ChevronUp   className="w-3.5 h-3.5 text-indigo-500 print:hidden" />
    : <ChevronDown className="w-3.5 h-3.5 text-indigo-500 print:hidden" />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function GradesPage() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classrooms,    setClassrooms]    = useState<Classroom[]>([]);
  const [selectedYearId,  setSelectedYearId]  = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [search,   setSearch]  = useState("");
  const [loading,  setLoading] = useState(false);
  const [error,    setError]   = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [records,  setRecords]  = useState<Record<number, GradeRecord[]>>({});
  const [editMode, setEditMode] = useState(false);
  const [changes,  setChanges]  = useState<Record<string, string>>({});
  const [saving,   setSaving]   = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Load dropdowns
  useEffect(() => {
    (async () => {
      try {
        const [rY, rC] = await Promise.all([fetch("/api/academic-years"), fetch("/api/classrooms")]);
        if (rY.ok && rC.ok) {
          const years: AcademicYear[] = await rY.json();
          const cls: Classroom[]      = await rC.json();
          setAcademicYears(years);
          setClassrooms(cls);
          if (years.length) setSelectedYearId((years.find(y => y.isActive) || years[0]).id.toString());
          if (cls.length)   setSelectedClassId(cls[0].id.toString());
        }
      } catch {}
    })();
  }, []);

  // Load grades
  useEffect(() => {
    if (!selectedYearId || !selectedClassId) return;
    (async () => {
      setLoading(true);
      setError("");
      setEditMode(false);
      setChanges({});
      setSortConfig(null);
      try {
        const res = await fetch(`/api/grade-records?classroomId=${selectedClassId}&academicYearId=${selectedYearId}`);
        if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
        const d = await res.json();
        setStudents(d.students || []);
        setSubjects(d.subjects || []);
        setRecords(d.records || {});
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedYearId, selectedClassId]);

  // Merged view of records + local changes
  const currentRecords = useMemo(() => {
    const out: Record<number, Record<number, { score: string; letter: string | null }>> = {};
    students.forEach(st => {
      out[st.id] = {};
      const recs = records[st.id] || [];
      subjects.forEach(sub => {
        const r   = recs.find((x: any) => x.subjectId === sub.id);
        const key = `${st.id}_${sub.id}`;
        out[st.id][sub.id] = {
          score:  key in changes ? changes[key] : (r?.totalScore != null ? String(r.totalScore) : ""),
          letter: key in changes ? null : (r?.gradeLetter || null),
        };
      });
    });
    return out;
  }, [students, subjects, records, changes]);

  const studentStats = useMemo(() => {
    const s: Record<number, { gpa: number; isComputed: boolean }> = {};
    students.forEach(st => {
      const recs = records[st.id] || [];
      let total = 0, cnt = 0;
      subjects.forEach(sub => {
        const r = recs.find((x: any) => x.subjectId === sub.id);
        if (r?.gpa != null) { total += r.gpa; cnt++; }
      });
      s[st.id] = { gpa: cnt > 0 ? total / cnt : 0, isComputed: cnt > 0 };
    });
    return s;
  }, [students, subjects, records]);

  const rankings = useMemo(() => {
    const gpas = Object.values(studentStats).filter(s => s.isComputed).map(s => s.gpa).sort((a, b) => b - a);
    const r: Record<number, number> = {};
    Object.keys(studentStats).forEach(id => {
      const n = Number(id);
      r[n] = studentStats[n].isComputed ? gpas.indexOf(studentStats[n].gpa) + 1 : 0;
    });
    return r;
  }, [studentStats]);

  // Sort + filter
  const filteredStudents = useMemo(() => {
    const term = search.toLowerCase();
    let list = students.filter(s =>
      s.firstName.toLowerCase().includes(term) ||
      s.lastName.toLowerCase().includes(term)  ||
      s.studentCode.toLowerCase().includes(term)
    );
    if (sortConfig) {
      list = [...list].sort((a, b) => {
        const { key, direction } = sortConfig;
        let av: any, bv: any;
        if (key === "name") {
          av = `${a.firstName} ${a.lastName}`;
          bv = `${b.firstName} ${b.lastName}`;
        } else if (key === "gpa") {
          av = studentStats[a.id]?.gpa ?? 0;
          bv = studentStats[b.id]?.gpa ?? 0;
        } else if (key === "rank") {
          av = rankings[a.id] || 999;
          bv = rankings[b.id] || 999;
        } else if (key.startsWith("sub_")) {
          const sid = Number(key.slice(4));
          av = Number(currentRecords[a.id]?.[sid]?.score || 0);
          bv = Number(currentRecords[b.id]?.[sid]?.score || 0);
        }
        if (av < bv) return direction === "asc" ? -1 : 1;
        if (av > bv) return direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [students, search, sortConfig, studentStats, rankings, currentRecords]);

  const handleSort = (key: string) => {
    setSortConfig(prev =>
      prev?.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const handleScoreChange = (studentId: number, subjectId: number, value: string) => {
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
    setChanges(prev => ({ ...prev, [`${studentId}_${subjectId}`]: value }));
  };

  const handleSave = async () => {
    if (!Object.keys(changes).length) { setEditMode(false); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/grade-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classroomId:    Number(selectedClassId),
          academicYearId: Number(selectedYearId),
          records: Object.entries(changes).map(([key, value]) => {
            const [studentId, subjectId] = key.split("_").map(Number);
            return { studentId, subjectId, totalScore: value };
          }),
        }),
      });
      if (!res.ok) throw new Error("บันทึกไม่สำเร็จ");
      const ref = await fetch(`/api/grade-records?classroomId=${selectedClassId}&academicYearId=${selectedYearId}`);
      if (ref.ok) setRecords((await ref.json()).records || {});
      setChanges({});
      setEditMode(false);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const className  = classrooms.find(c  => c.id.toString() === selectedClassId)?.name || "";
  const yearData   = academicYears.find(y => y.id.toString() === selectedYearId);
  const yearLabel  = yearData ? `ภาคเรียนที่ ${yearData.semester}/${yearData.year}` : "";
  const printDate  = new Date().toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });

  const thBase = "px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider select-none cursor-pointer group-hover:bg-slate-100/80 transition-colors";

  return (
    <>
      {/* ─── PRINT STYLES ─────────────────────────────────────────────────── */}
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 12mm; }
          body * { visibility: hidden !important; }
          #grades-print-area, #grades-print-area * { visibility: visible !important; }
          #grades-print-area {
            position: fixed !important;
            inset: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      <div className="space-y-5 max-w-[1400px] mx-auto">
        {/* ─── Header ───────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <GraduationCap className="w-7 h-7 text-indigo-600" />
              ผลการเรียน
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {className && yearLabel ? `${className} · ${yearLabel}` : "เลือกห้องเรียนและภาคเรียนเพื่อเริ่มต้น"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => window.print()}
              disabled={students.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition shadow-sm disabled:opacity-40"
            >
              <Download className="w-4 h-4" /> Export PDF
            </button>

            {editMode ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setEditMode(false); setChanges({}); }}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:text-red-600 transition shadow-sm"
                >
                  <X className="w-4 h-4" /> ยกเลิก
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition shadow-md disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  บันทึกเกรด
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                disabled={students.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-md disabled:opacity-40"
              >
                <Edit2 className="w-4 h-4" /> แก้ไขเกรด
              </button>
            )}
          </div>
        </div>

        {/* ─── Toolbar ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 print:hidden">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="ค้นหานักเรียน..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition placeholder:text-slate-400 shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-700 shadow-sm cursor-pointer transition"
            >
              {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select
              value={selectedYearId}
              onChange={e => setSelectedYearId(e.target.value)}
              className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-700 shadow-sm cursor-pointer transition"
            >
              {academicYears.map(y => (
                <option key={y.id} value={y.id}>ภาคเรียนที่ {y.semester}/{y.year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ─── DataTable card ───────────────────────────────────────────────── */}
        <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print:shadow-none print:border-none print:rounded-none" ref={printRef}>

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin mb-3" />
              <span className="text-sm font-semibold text-slate-600">กำลังโหลดข้อมูล...</span>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/95">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <p className="font-bold text-slate-900 text-lg mb-1">เกิดข้อผิดพลาด</p>
              <p className="text-slate-500 text-sm mb-4">{error}</p>
              <button
                onClick={() => setSelectedClassId(prev => prev)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition"
              >
                <RefreshCw className="w-4 h-4" /> ลองใหม่
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filteredStudents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <FileText className="w-10 h-10 text-slate-400" />
              </div>
              <p className="font-bold text-slate-700 text-lg">ไม่พบข้อมูลนักเรียน</p>
              <p className="text-slate-400 text-sm mt-1">ลองเปลี่ยนห้องเรียน หรือภาคเรียน</p>
            </div>
          )}

          {/* ── Print header (only visible when printing) ── */}
          <div id="grades-print-area" className="hidden print:block p-8">
            <div className="border-b-2 border-black pb-4 mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-black">รายงานผลการเรียน</h1>
                <p className="text-base text-black mt-1">ห้องเรียน: <strong>{className}</strong> &nbsp;|&nbsp; {yearLabel}</p>
              </div>
              <div className="text-right text-sm text-black">
                <p>วันที่พิมพ์: {printDate}</p>
                <p>จำนวนนักเรียน: {filteredStudents.length} คน</p>
              </div>
            </div>

            {/* Print table */}
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 px-3 py-2 text-left font-bold text-black whitespace-nowrap">ลำดับ</th>
                  <th className="border border-gray-400 px-3 py-2 text-left font-bold text-black whitespace-nowrap">รหัสนักเรียน</th>
                  <th className="border border-gray-400 px-3 py-2 text-left font-bold text-black">ชื่อ - นามสกุล</th>
                  {subjects.map(s => (
                    <th key={s.id} className="border border-gray-400 px-2 py-2 text-center font-bold text-black">
                      <div>{s.name}</div>
                      <div className="font-normal text-xs text-gray-600">{s.code}</div>
                    </th>
                  ))}
                  <th className="border border-gray-400 px-3 py-2 text-center font-bold text-black">GPA</th>
                  <th className="border border-gray-400 px-3 py-2 text-center font-bold text-black">ลำดับที่</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s, i) => {
                  const st    = studentStats[s.id];
                  const rank  = rankings[s.id];
                  const srecs = currentRecords[s.id] || {};
                  return (
                    <tr key={s.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border border-gray-300 px-3 py-2 text-center text-black">{i + 1}</td>
                      <td className="border border-gray-300 px-3 py-2 text-black font-mono">{s.studentCode}</td>
                      <td className="border border-gray-300 px-3 py-2 text-black">{s.firstName} {s.lastName}</td>
                      {subjects.map(sub => {
                        const rec = srecs[sub.id];
                        return (
                          <td key={sub.id} className="border border-gray-300 px-2 py-2 text-center text-black">
                            {rec?.score ? (
                              <span>{rec.score}<span className="text-xs ml-1 text-gray-500">({rec.letter || "?"})</span></span>
                            ) : "-"}
                          </td>
                        );
                      })}
                      <td className="border border-gray-300 px-3 py-2 text-center font-bold text-black">{st?.isComputed ? st.gpa.toFixed(2) : "-"}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center font-bold text-black">{st?.isComputed ? rank : "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100">
                  <td colSpan={3 + subjects.length + 2} className="border border-gray-400 px-3 py-2 text-sm text-black">
                    รวมทั้งหมด {filteredStudents.length} คน &nbsp;·&nbsp;
                    เฉลี่ย GPA: {filteredStudents.length > 0
                      ? (filteredStudents.reduce((sum, s) => sum + (studentStats[s.id]?.gpa || 0), 0) / filteredStudents.filter(s => studentStats[s.id]?.isComputed).length || 0).toFixed(2)
                      : "-"}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="mt-10 grid grid-cols-3 gap-8 text-sm text-black">
              <div className="text-center">
                <div className="border-t border-black pt-2 mt-8">ลายมือชื่อครูผู้สอน</div>
              </div>
              <div className="text-center">
                <div className="border-t border-black pt-2 mt-8">ลายมือชื่อหัวหน้าวิชาการ</div>
              </div>
              <div className="text-center">
                <div className="border-t border-black pt-2 mt-8">ลายมือชื่อผู้อำนวยการ</div>
              </div>
            </div>
          </div>

          {/* ── Screen DataTable ── */}
          {!loading && !error && filteredStudents.length > 0 && (
            <div className="overflow-x-auto print:hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className={`${thBase} text-left pl-6 whitespace-nowrap min-w-[56px]`}>#</th>
                    <th
                      className={`${thBase} text-left min-w-[220px] group`}
                      onClick={() => handleSort("name")}
                    >
                      <span className="flex items-center gap-1.5">
                        รายชื่อนักเรียน
                        <SortIcon col="name" sortConfig={sortConfig} />
                      </span>
                    </th>
                    {subjects.map(s => (
                      <th
                        key={s.id}
                        className={`${thBase} text-center min-w-[100px] group`}
                        onClick={() => handleSort(`sub_${s.id}`)}
                        title={s.code}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="flex items-center gap-1">
                            {s.name}
                            <SortIcon col={`sub_${s.id}`} sortConfig={sortConfig} />
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal normal-case tracking-normal">{s.code}</span>
                        </div>
                      </th>
                    ))}
                    <th
                      className={`${thBase} text-center min-w-[90px] border-l border-slate-200 group`}
                      onClick={() => handleSort("gpa")}
                    >
                      <span className="flex items-center justify-center gap-1">
                        GPA
                        <SortIcon col="gpa" sortConfig={sortConfig} />
                      </span>
                    </th>
                    <th
                      className={`${thBase} text-center min-w-[80px] group`}
                      onClick={() => handleSort("rank")}
                    >
                      <span className="flex items-center justify-center gap-1">
                        ลำดับ
                        <SortIcon col="rank" sortConfig={sortConfig} />
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((s, i) => {
                    const st    = studentStats[s.id];
                    const rank  = rankings[s.id];
                    const srecs = currentRecords[s.id] || {};

                    return (
                      <tr key={s.id} className="hover:bg-indigo-50/30 transition-colors group">
                        {/* Row # */}
                        <td className="pl-6 py-3.5 text-xs text-slate-400 font-medium w-14">{i + 1}</td>

                        {/* Name */}
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                              {s.firstName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 text-sm leading-tight">{s.firstName} {s.lastName}</p>
                              <p className="text-xs text-slate-400 font-mono">{s.studentCode}</p>
                            </div>
                          </div>
                        </td>

                        {/* Subjects */}
                        {subjects.map(sub => {
                          const rec      = srecs[sub.id];
                          const changeKey = `${s.id}_${sub.id}`;
                          const isChanged = changeKey in changes;
                          return (
                            <td key={sub.id} className="py-3.5 px-4 text-center align-middle">
                              {editMode ? (
                                <input
                                  type="text"
                                  value={rec?.score || ""}
                                  onChange={e => handleScoreChange(s.id, sub.id, e.target.value)}
                                  placeholder="–"
                                  className={`w-16 text-center text-sm py-1.5 px-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${
                                    isChanged
                                      ? "border-amber-400 bg-amber-50 text-amber-900"
                                      : "border-slate-300 bg-white text-slate-700"
                                  }`}
                                />
                              ) : rec?.score ? (
                                <div className="flex flex-col items-center gap-1">
                                  <span className="font-bold text-slate-800">{rec.score}</span>
                                  {rec.letter && (
                                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${gradeColor(rec.letter)}`}>
                                      {rec.letter}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-300">–</span>
                              )}
                            </td>
                          );
                        })}

                        {/* GPA */}
                        <td className="py-3.5 px-4 text-center align-middle border-l border-slate-100">
                          {st?.isComputed ? (
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold shadow-sm ${gpaColor(st.gpa)}`}>
                              {st.gpa.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-slate-300">–</span>
                          )}
                        </td>

                        {/* Rank */}
                        <td className="py-3.5 px-4 text-center align-middle">
                          {st?.isComputed ? (
                            <span className={`inline-flex w-8 h-8 items-center justify-center rounded-full text-xs font-bold shadow-sm ${rankBadge(rank)}`}>
                              {rank}
                            </span>
                          ) : (
                            <span className="text-slate-300">–</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
                <span>
                  แสดง <strong className="text-slate-700">{filteredStudents.length}</strong> จาก{" "}
                  <strong className="text-slate-700">{students.length}</strong> รายการ
                  {sortConfig && (
                    <button
                      onClick={() => setSortConfig(null)}
                      className="ml-3 text-indigo-500 hover:text-indigo-700 underline underline-offset-2 transition"
                    >
                      ล้างการเรียงลำดับ
                    </button>
                  )}
                </span>
                {Object.keys(changes).length > 0 && (
                  <span className="text-amber-600 font-semibold">
                    มีการแก้ไข {Object.keys(changes).length} รายการที่ยังไม่ได้บันทึก
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
