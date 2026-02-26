"use client";

import { useState, useEffect, useRef } from "react";

type Schedule = {
  id: number;
  classroomId: number;
  subjectId: number;
  teacherId: number;
  academicYearId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  roomNumber: string | null;
  subject: { name: string; code: string };
  teacher: { firstName: string; lastName: string; id: number };
  classroom: { name: string; id: number };
};

type AcademicYear = { id: number; year: string; semester: number };
type Classroom = { id: number; name: string };
type Teacher = { id: number; firstName: string; lastName: string };
type Subject = { id: number; name: string };

const days = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"];
const periods = [
  { label: "คาบ 1", time: "08:00–09:00", start: "08:00", end: "09:00", isBreak: false },
  { label: "คาบ 2", time: "09:00–10:00", start: "09:00", end: "10:00", isBreak: false },
  { label: "คาบ 3", time: "10:00–11:00", start: "10:00", end: "11:00", isBreak: false },
  { label: "พัก", time: "11:00–11:30", start: "11:00", end: "11:30", isBreak: true },
  { label: "คาบ 4", time: "11:30–12:30", start: "11:30", end: "12:30", isBreak: false },
  { label: "พักกลางวัน", time: "12:30–13:30", start: "12:30", end: "13:30", isBreak: true },
  { label: "คาบ 5", time: "13:30–14:30", start: "13:30", end: "14:30", isBreak: false },
  { label: "คาบ 6", time: "14:30–15:30", start: "14:30", end: "15:30", isBreak: false },
  { label: "คาบ 7", time: "15:30–16:30", start: "15:30", end: "16:30", isBreak: false },
];

const colorPalette = [
  "bg-indigo-100 text-indigo-700 border-indigo-200",
  "bg-emerald-100 text-emerald-700 border-emerald-200",
  "bg-amber-100 text-amber-700 border-amber-200",
  "bg-violet-100 text-violet-700 border-violet-200",
  "bg-rose-100 text-rose-700 border-rose-200",
  "bg-cyan-100 text-cyan-700 border-cyan-200",
  "bg-pink-100 text-pink-700 border-pink-200",
];

export default function SchedulePage() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"student" | "teacher">("student");
  const [selectedClassroom, setSelectedClassroom] = useState<number>(0);
  const [selectedTeacher, setSelectedTeacher] = useState<number>(0);

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    startTime: "",
    endTime: "",
    subjectId: 0,
    teacherId: 0,
    classroomId: 0,
    roomNumber: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/academic-years").then(res => res.json()),
      fetch("/api/classrooms").then(res => res.json()),
      fetch("/api/teachers").then(res => res.json()),
      fetch("/api/subjects").then(res => res.json()),
    ]).then(([yearsData, classData, teacherData, subjectData]) => {
      setAcademicYears(yearsData);
      setClassrooms(classData);
      setTeachers(teacherData);
      setSubjects(subjectData);

      if (yearsData.length > 0) setSelectedYear(yearsData[0].id);
      if (classData.length > 0) setSelectedClassroom(classData[0].id);
      if (teacherData.length > 0) setSelectedTeacher(teacherData[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedYear) return;
    if (viewMode === "student" && !selectedClassroom) return;
    if (viewMode === "teacher" && !selectedTeacher) return;

    fetchSchedules();
  }, [selectedYear, viewMode, selectedClassroom, selectedTeacher]);

  const fetchSchedules = async () => {
    setIsLoading(true);
    let url = `/api/schedules?academicYearId=${selectedYear}`;
    if (viewMode === "student") {
      url += `&classroomId=${selectedClassroom}`;
    } else {
      url += `&teacherId=${selectedTeacher}`;
    }

    try {
      const res = await fetch(url);
      const data = await res.json();
      setSchedules(data);
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const openAddModal = (dayIdx: number, period: any) => {
    setFormData({
      dayOfWeek: dayIdx + 1,
      startTime: period.start,
      endTime: period.end,
      subjectId: subjects.length > 0 ? subjects[0].id : 0,
      teacherId: viewMode === "teacher" ? selectedTeacher : (teachers.length > 0 ? teachers[0].id : 0),
      classroomId: viewMode === "student" ? selectedClassroom : (classrooms.length > 0 ? classrooms[0].id : 0),
      roomNumber: "",
    });
    setIsModalOpen(true);
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          academicYearId: selectedYear,
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchSchedules();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add schedule");
      }
    } catch (error) {
      console.error(error);
      alert("Error adding schedule");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("คุณต้องการลบวิชานี้ออกจากตารางเรียนใช่หรือไม่?")) return;
    try {
      const res = await fetch(`/api/schedules/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchSchedules();
      } else {
        alert("Failed to delete");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getScheduleForSlot = (dayIdx: number, start: string) => {
    return schedules.find((s) => s.dayOfWeek === dayIdx + 1 && s.startTime === start);
  };

  const selectedYearLabel = academicYears.find(y => y.id === selectedYear)
    ? `ภาคเรียนที่ ${academicYears.find(y => y.id === selectedYear)?.semester} ปีการศึกษา ${academicYears.find(y => y.id === selectedYear)?.year}`
    : "";

  const handleExportPDF = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    let title = "ตารางเรียน";
    if (viewMode === "student") {
      const c = classrooms.find(c => c.id === selectedClassroom);
      if (c) title = `ตารางเรียน ${c.name}`;
    } else {
      const t = teachers.find(t => t.id === selectedTeacher);
      if (t) title = `ตารางสอน ${t.firstName} ${t.lastName}`;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("กรุณาอนุญาตป๊อปอัพเพื่อพิมพ์ PDF");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Sarabun', sans-serif; padding: 20px; background: #fff; color: #1e293b; }
          h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
          .subtitle { font-size: 13px; color: #64748b; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f1f5f9; font-size: 12px; font-weight: 600; color: #475569; padding: 8px 10px; border: 1px solid #e2e8f0; text-align: center; }
          th:first-child { text-align: left; width: 100px; }
          td { padding: 6px 8px; border: 1px solid #e2e8f0; vertical-align: middle; height: 60px; }
          td:first-child { background: #f8fafc; width: 100px; }
          .period-label { font-size: 12px; font-weight: 600; color: #334155; }
          .period-time { font-size: 10px; color: #94a3b8; }
          .break-row td { background: #f8fafc; text-align: center; font-size: 11px; color: #94a3b8; font-weight: 500; letter-spacing: 2px; height: 36px; }
          .cell { border-radius: 8px; padding: 6px 10px; height: 100%; display: flex; flex-direction: column; justify-content: center; }
          .cell-subject { font-size: 12px; font-weight: 700; }
          .cell-info { font-size: 10px; opacity: 0.8; margin-top: 2px; }
          .cell-room { font-size: 9px; opacity: 0.7; margin-top: 1px; }
          .c0 { background: #e0e7ff; color: #4338ca; border: 1px solid #c7d2fe; }
          .c1 { background: #d1fae5; color: #047857; border: 1px solid #a7f3d0; }
          .c2 { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
          .c3 { background: #ede9fe; color: #6d28d9; border: 1px solid #ddd6fe; }
          .c4 { background: #ffe4e6; color: #be123c; border: 1px solid #fecdd3; }
          .c5 { background: #cffafe; color: #0e7490; border: 1px solid #a5f3fc; }
          .c6 { background: #fce7f3; color: #be185d; border: 1px solid #fbcfe8; }
          @media print {
            body { padding: 10px; }
            @page { size: landscape; margin: 10mm; }
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p class="subtitle">${selectedYearLabel}</p>
        ${printContent.querySelector('table')?.outerHTML
          .replace(/data-html2canvas-ignore="true"/g, '')
          .replace(/<button[^>]*>[\s\S]*?<\/button>/g, '')
          .replace(/class="[^"]*"/g, '')
          || ''}
      </body>
      </html>
    `);

    // Re-build the table properly with inline styles
    const srcTable = printContent.querySelector('table');
    if (srcTable) {
      const rows = srcTable.querySelectorAll('tr');
      let tableHtml = '<table>';
      
      // Header
      const headerRow = rows[0];
      if (headerRow) {
        tableHtml += '<thead><tr>';
        headerRow.querySelectorAll('th').forEach(th => {
          tableHtml += `<th>${th.textContent}</th>`;
        });
        tableHtml += '</tr></thead>';
      }

      // Body
      tableHtml += '<tbody>';
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.querySelectorAll('td');
        const isBreak = cells.length === 2 && cells[1]?.getAttribute('colspan');
        
        if (isBreak) {
          tableHtml += `<tr class="break-row">`;
          tableHtml += `<td><span class="period-label">${cells[0]?.querySelector('.text-xs')?.textContent || ''}</span><br/><span class="period-time">${cells[0]?.querySelector('.text-\\[11px\\],.text-\\[11px\\]')?.textContent || cells[0]?.querySelectorAll('p')[1]?.textContent || ''}</span></td>`;
          tableHtml += `<td colspan="5">${cells[1]?.textContent || ''}</td>`;
          tableHtml += '</tr>';
        } else {
          tableHtml += '<tr>';
          cells.forEach((td, ci) => {
            if (ci === 0) {
              const ps = td.querySelectorAll('p');
              tableHtml += `<td><span class="period-label">${ps[0]?.textContent || ''}</span><br/><span class="period-time">${ps[1]?.textContent || ''}</span></td>`;
            } else {
              const cellDiv = td.querySelector('div[class*="rounded"]');
              if (cellDiv && cellDiv.querySelector('.text-sm,.font-bold')) {
                const subjectName = cellDiv.querySelector('p')?.textContent || '';
                const ps = cellDiv.querySelectorAll('p');
                const info = ps[1]?.textContent || '';
                const room = ps[2]?.textContent || '';
                // Determine a color class based on position
                const colorIdx = Math.abs(subjectName.charCodeAt(0) + subjectName.charCodeAt(subjectName.length - 1)) % 7;
                tableHtml += `<td><div class="cell c${colorIdx}"><span class="cell-subject">${subjectName}</span><span class="cell-info">${info}</span>${room ? `<span class="cell-room">${room}</span>` : ''}</div></td>`;
              } else {
                tableHtml += '<td></td>';
              }
            }
          });
          tableHtml += '</tr>';
        }
      }
      tableHtml += '</tbody></table>';

      printWindow.document.close();
      printWindow.document.body.innerHTML = '';
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <title>${title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Sarabun', sans-serif; padding: 20px; background: #fff; color: #1e293b; }
            h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
            .subtitle { font-size: 13px; color: #64748b; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f1f5f9; font-size: 12px; font-weight: 600; color: #475569; padding: 8px 10px; border: 1px solid #e2e8f0; text-align: center; }
            th:first-child { text-align: left; width: 100px; }
            td { padding: 6px 8px; border: 1px solid #e2e8f0; vertical-align: middle; height: 60px; }
            td:first-child { background: #f8fafc; width: 100px; }
            .period-label { font-size: 12px; font-weight: 600; color: #334155; }
            .period-time { font-size: 10px; color: #94a3b8; }
            .break-row td { background: #f8fafc; text-align: center; font-size: 11px; color: #94a3b8; font-weight: 500; letter-spacing: 2px; height: 36px; }
            .cell { border-radius: 8px; padding: 6px 10px; height: 100%; display: flex; flex-direction: column; justify-content: center; }
            .cell-subject { font-size: 12px; font-weight: 700; }
            .cell-info { font-size: 10px; opacity: 0.8; margin-top: 2px; }
            .cell-room { font-size: 9px; opacity: 0.7; margin-top: 1px; }
            .c0 { background: #e0e7ff; color: #4338ca; border: 1px solid #c7d2fe; }
            .c1 { background: #d1fae5; color: #047857; border: 1px solid #a7f3d0; }
            .c2 { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
            .c3 { background: #ede9fe; color: #6d28d9; border: 1px solid #ddd6fe; }
            .c4 { background: #ffe4e6; color: #be123c; border: 1px solid #fecdd3; }
            .c5 { background: #cffafe; color: #0e7490; border: 1px solid #a5f3fc; }
            .c6 { background: #fce7f3; color: #be185d; border: 1px solid #fbcfe8; }
            @media print {
              body { padding: 10px; }
              @page { size: landscape; margin: 10mm; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p class="subtitle">${selectedYearLabel}</p>
          ${tableHtml}
        </body>
        </html>
      `);
    }

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">ตารางเรียน / ตารางสอน</h1>
          <p className="text-slate-500 text-sm mt-1">{selectedYearLabel}</p>
        </div>
        <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm w-fit print:hidden">
          📄 Export PDF
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {academicYears.map(y => (
              <option key={y.id} value={y.id}>ภาคเรียน {y.semester}/{y.year}</option>
            ))}
          </select>

          {viewMode === "student" ? (
            <select 
              value={selectedClassroom}
              onChange={(e) => setSelectedClassroom(Number(e.target.value))}
              className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {classrooms.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          ) : (
             <select 
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(Number(e.target.value))}
              className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
              ))}
            </select>
          )}

          <div className="flex gap-2 ml-auto">
            <button 
              onClick={() => setViewMode("student")}
              className={`px-3 py-2 text-sm border rounded-xl font-medium ${viewMode === "student" ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
            >
              ตารางนักเรียน
            </button>
            <button 
              onClick={() => setViewMode("teacher")}
              className={`px-3 py-2 text-sm border rounded-xl font-medium ${viewMode === "teacher" ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
            >
              ตารางสอน
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div ref={printRef} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 backdrop-blur-[1px]">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 w-28">คาบ / เวลา</th>
                {days.map((d) => (
                  <th key={d} className="text-center text-xs font-semibold text-slate-500 uppercase px-3 py-3 w-[16%]">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period, ri) => (
                <tr key={ri} className={`border-b border-slate-100 ${period.isBreak ? "bg-slate-50" : ""}`}>
                  <td className="px-4 py-3 border-r border-slate-100 bg-slate-50/50">
                    <p className="text-xs font-semibold text-slate-700">{period.label}</p>
                    <p className="text-[11px] text-slate-400">{period.time}</p>
                  </td>
                  {period.isBreak ? (
                    <td colSpan={5} className="px-4 py-3 text-center text-xs text-slate-400 font-medium tracking-widest">
                      — {period.label} —
                    </td>
                  ) : (
                    days.map((_, ci) => {
                      const cell = getScheduleForSlot(ci, period.start);
                      const colorClass = colorPalette[(cell?.subjectId || 0) % colorPalette.length];
                      
                      return (
                        <td key={ci} className="px-2 py-2 border-r border-slate-100 last:border-r-0 relative group h-20">
                          {cell ? (
                            <div className={`h-full rounded-xl border px-3 py-2 flex flex-col justify-center relative overflow-hidden transition-all hover:shadow-md ${colorClass}`}>
                              <p className="text-sm font-bold leading-tight truncate">{cell.subject.name}</p>
                              {viewMode === "student" ? (
                                <p className="text-[11px] mt-1 opacity-80 truncate">{cell.teacher.firstName} {cell.teacher.lastName}</p>
                              ) : (
                                <p className="text-[11px] mt-1 opacity-80 truncate">ห้อง {cell.classroom.name}</p>
                              )}
                              {cell.roomNumber && <p className="text-[10px] opacity-70 mt-0.5">({cell.roomNumber})</p>}
                              
                              <button 
                                onClick={() => handleDelete(cell.id)}

                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-opacity"
                                title="ลบตารางเรียน"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                              </button>
                            </div>
                          ) : (
                            <div 
                              onClick={() => openAddModal(ci, period)}
                              className="w-full h-full rounded-xl border border-dashed border-transparent hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center cursor-pointer transition-colors group/empty"
                            >
                              <span className="text-slate-400 opacity-0 group-hover/empty:opacity-100 text-xl">+</span>
                            </div>
                          )}
                        </td>
                      );
                    })
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">เพิ่มตารางเรียน</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <form onSubmit={handleAddSchedule} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">วัน</label>
                  <select 
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({...formData, dayOfWeek: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {days.map((d, i) => <option key={i} value={i+1}>{d}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">เริ่ม</label>
                     <input type="time" required value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm" />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">ถึง</label>
                     <input type="time" required value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">วิชา</label>
                <select 
                  value={formData.subjectId}
                  onChange={(e) => setFormData({...formData, subjectId: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              {viewMode === "student" ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ครูผู้สอน</label>
                  <select 
                    value={formData.teacherId}
                    onChange={(e) => setFormData({...formData, teacherId: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    {teachers.map((t) => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ห้องเรียน</label>
                  <select 
                    value={formData.classroomId}
                    onChange={(e) => setFormData({...formData, classroomId: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    {classrooms.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ห้องที่เรียน (ระบุหรือไม่ก็ได้)</label>
                <input 
                  type="text" 
                  placeholder="เช่น LAB 1, 302, สนาม"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" 
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">บันทึกตารางเรียน</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
