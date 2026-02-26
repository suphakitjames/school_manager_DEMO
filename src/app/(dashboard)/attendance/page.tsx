"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Filter, Loader2, Save, X, Calendar as CalendarIcon } from "lucide-react";

// --- Types ---
type Student = {
  id: number;
  studentCode: string;
  firstName: string;
  lastName: string;
};

type Classroom = { id: number; name: string };
type RecordStatus = "PRESENT" | "ABSENT" | "LATE" | "LEAVE";

// --- Helpers ---
const thaiStatusMap: Record<RecordStatus | string, string> = {
  PRESENT: "มาเรียน",
  ABSENT: "ขาดเรียน",
  LATE: "มาสาย",
  LEAVE: "ลา",
};

const revThaiStatusMap: Record<string, RecordStatus> = {
  "มาเรียน": "PRESENT",
  "ขาดเรียน": "ABSENT",
  "มาสาย": "LATE",
  "ลา": "LEAVE",
};

const statusOrder: RecordStatus[] = ["PRESENT", "ABSENT", "LATE", "LEAVE"];

function StatusBadge({ status, onClick, isEditable }: { status: string; onClick?: () => void; isEditable?: boolean }) {
  const map: Record<string, string> = {
    "มาเรียน": "bg-emerald-100 text-emerald-700",
    "ขาดเรียน": "bg-red-100 text-red-700",
    "มาสาย": "bg-yellow-100 text-yellow-700",
    "ลา": "bg-blue-100 text-blue-700",
    "-": "bg-slate-100 text-slate-400",
  };

  const ringClass = isEditable ? "ring-2 ring-indigo-400 ring-offset-1 shadow-sm transition-all" : "";
  const cursorClass = isEditable ? "cursor-pointer hover:opacity-80" : "cursor-default";

  return (
    <span
      onClick={onClick}
      className={`text-xs font-semibold px-2 py-0.5 rounded-full select-none ${map[status] || map["-"]} ${ringClass} ${cursorClass}`}
    >
      {status}
    </span>
  );
}

// Get the Monday of the given date's week
function getMonday(d: Date) {
  d = new Date(d);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
}

// Format YYYY-MM-DD
function formatDateString(d: Date) {
  const t = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return t.toISOString().split("T")[0];
}

export default function AttendancePage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [currentDateInput, setCurrentDateInput] = useState(formatDateString(new Date()));
  const [currentMonday, setCurrentMonday] = useState<Date>(getMonday(new Date()));
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<number, Record<string, RecordStatus>>>({});

  // Editing logic
  const [editMode, setEditMode] = useState(false);
  const [changes, setChanges] = useState<Record<number, RecordStatus>>({}); // only for "today" (currentDateInput)
  const [saving, setSaving] = useState(false);

  // 1. Fetch Classrooms
  useEffect(() => {
    fetch("/api/classrooms")
      .then((res) => res.json())
      .then((data) => {
        setClassrooms(data);
        if (data.length > 0) setSelectedClassId(data[0].id.toString());
      })
      .catch((err) => console.error(err));
  }, []);

  // 2. Compute the week's days (Mon-Fri) based on chosen date
  const weekDays = useMemo(() => {
    const monday = getMonday(new Date(currentDateInput));
    const dates = [];
    const dayNames = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"];
    for (let i = 0; i < 5; i++) {
       const d = new Date(monday);
       d.setDate(monday.getDate() + i);
       dates.push({
         dateObj: d,
         dateStr: formatDateString(d),
         label: dayNames[i]
       });
    }
    return dates;
  }, [currentDateInput]);

  useEffect(() => {
    setCurrentMonday(getMonday(new Date(currentDateInput)));
  }, [currentDateInput]);

  // 3. Fetch Data for the week
  const fetchData = useCallback(async () => {
    if (!selectedClassId) return;
    setLoading(true);
    setError("");
    setEditMode(false);
    setChanges({});

    const mondayStr = weekDays[0].dateStr;
    const fridayStr = weekDays[4].dateStr;

    try {
      const res = await fetch(`/api/attendance?classroomId=${selectedClassId}&startDate=${mondayStr}&endDate=${fridayStr}`);
      if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
      const json = await res.json();
      setStudents(json.students || []);
      setAttendanceData(json.attendanceMap || {});
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [selectedClassId, weekDays]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived state for the UI
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = search.trim().toLowerCase();
      return s.firstName.toLowerCase().includes(q) || s.lastName.toLowerCase().includes(q) || s.studentCode.includes(q);
    });
  }, [students, search]);

  const stats = useMemo(() => {
    let present = 0, absent = 0, late = 0, leave = 0;
    Object.values(attendanceData).forEach((studentRecords) => {
      Object.values(studentRecords).forEach((status) => {
        if (status === "PRESENT") present++;
        if (status === "ABSENT") absent++;
        if (status === "LATE") late++;
        if (status === "LEAVE") leave++;
      });
    });
    return { present, absent, late, leave };
  }, [attendanceData]);

  const className = classrooms.find((c) => c.id.toString() === selectedClassId)?.name || "กำลังโหลด...";

  // Formatting strings
  const weekNumber = Math.ceil(currentMonday.getDate() / 7);
  const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  const headerSubtitle = `สัปดาห์ที่ ${weekNumber} · ${monthNames[currentMonday.getMonth()]} ${currentMonday.getFullYear() + 543}`;
  
  const weekStartStr = currentMonday.getDate();
  let fridayDate = new Date(currentMonday);
  fridayDate.setDate(fridayDate.getDate() + 4);
  const weekEndStr = fridayDate.getDate();
  const weekSubtitle = `${weekStartStr}–${weekEndStr} ${monthNames[currentMonday.getMonth()]} ${currentMonday.getFullYear() + 543}`;

  // Interactions
  const handleToggleStatus = (studentId: number) => {
    if (!editMode) return;
    
    // Cycle through statusOrder: PRESENT -> ABSENT -> LATE -> LEAVE -> PRESENT
    const currentVal = changes[studentId] || attendanceData[studentId]?.[currentDateInput] || "PRESENT";
    const idx = statusOrder.indexOf(currentVal);
    const nextIdx = (idx + 1) % statusOrder.length;
    
    setChanges((prev) => ({ ...prev, [studentId]: statusOrder[nextIdx] }));
  };

  const handleSave = async () => {
    // Only saving for `currentDateInput`
    const payload = Object.keys(changes).map((studentIdStr) => {
      const studentId = Number(studentIdStr);
      const status = changes[studentId];
      return {
        studentId,
        date: currentDateInput,
        status,
      };
    });

    if (payload.length === 0) {
      setEditMode(false);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: payload }),
      });
      if (!res.ok) throw new Error("เกิดข้อผิดพลาดในการบันทึก");
      
      // refetch
      await fetchData();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">การเช็คชื่อนักเรียน</h1>
          <p className="text-slate-500 text-sm mt-1">{headerSubtitle}</p>
        </div>
        
        {editMode ? (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setEditMode(false); setChanges({}); }}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
            >
              <X className="w-4 h-4" /> ยกเลิก
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              บันทึกการเช็คชื่อ
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm w-fit"
          >
            บันทึกการเช็คชื่อวันนี้
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "มาเรียน", value: stats.present.toLocaleString(), color: "emerald" },
          { label: "ขาดเรียน", value: stats.absent.toLocaleString(), color: "red" },
          { label: "มาสาย", value: stats.late.toLocaleString(), color: "yellow" },
          { label: "ลา", value: stats.leave.toLocaleString(), color: "blue" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
            <p className={`text-2xl font-bold text-${s.color}-600`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
             <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
             <span className="ml-2 text-sm font-medium text-slate-600">กำลังโหลด...</span>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="ค้นหานักเรียน..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" 
            />
          </div>
          <select 
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow cursor-pointer"
          >
            {classrooms.map((c) => (
               <option key={c.id} value={c.id.toString()}>{c.name}</option>
            ))}
          </select>
          <input 
            type="date" 
            value={currentDateInput}
            onChange={(e) => setCurrentDateInput(e.target.value)}
            className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" 
          />
          <button 
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 text-sm border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Filter className="w-4 h-4" /> กรอง
          </button>
        </div>
      </div>

      {/* Error notification if loading fails */}
      {error && !loading && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm flex items-center gap-2">
          <X className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Weekly attendance grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
        {editMode && (
           <div className="bg-indigo-50 text-indigo-700 px-5 py-2.5 text-sm font-medium border-b border-indigo-100 flex items-center justify-between">
             <span>คุณกำลังอยู่ในโหมดแก้ไขสำหรับวันที่: <strong>{new Date(currentDateInput).toLocaleDateString("th-TH", { day: 'numeric', month: 'long', year: 'numeric' })}</strong> กดที่ชื่อสถานะเพื่อเปลี่ยน</span>
           </div>
        )}
        <div className="px-5 py-4 border-b border-slate-200 flex items-end justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">ตารางการมาเรียนรายสัปดาห์ — {className}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{weekSubtitle}</p>
          </div>
        </div>
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3 w-64 min-w-[200px]">นักเรียน</th>
                {weekDays.map((d) => (
                  <th key={d.dateStr} className={`text-center text-xs font-semibold uppercase px-4 py-3 min-w-[100px] ${editMode && d.dateStr === currentDateInput ? 'text-indigo-600 bg-indigo-50 border-x border-indigo-100 shadow-[inset_0_2px_0_var(--color-indigo-400)]' : 'text-slate-500'}`}>
                    <div>{d.label}</div>
                    <div className="text-[10px] font-medium opacity-70 mt-0.5">{d.dateObj.getDate()}</div>
                  </th>
                ))}
                <th className="text-center text-xs font-semibold text-slate-500 uppercase px-5 py-3 min-w-[100px]">รวม มา</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                     ไม่มีข้อมูลนักเรียน
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  let presentCount = 0;
                  
                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-800">{student.firstName} {student.lastName}</span>
                          <span className="text-[11px] text-slate-400 font-medium">{student.studentCode}</span>
                        </div>
                      </td>
                      {weekDays.map((d) => {
                        const isTargetDate = d.dateStr === currentDateInput;
                        const isCellEditable = editMode && isTargetDate;
                        
                        let stRecord = attendanceData[student.id]?.[d.dateStr];
                        if (isTargetDate && changes[student.id]) {
                          stRecord = changes[student.id]; // overriding with local edit
                        }
                        
                        // Default to - if not yet marked
                        let displayStatus = "-";
                        if (editMode && isTargetDate && !stRecord) {
                          // If in edit mode and no record exists, default them to PRESENT to visually represent defaults
                          displayStatus = "มาเรียน";
                          stRecord = "PRESENT";
                        } else if (stRecord) {
                          displayStatus = thaiStatusMap[stRecord] || "-";
                        }

                        if (stRecord === "PRESENT") presentCount++;

                        return (
                          <td key={d.dateStr} className={`px-4 py-3 text-center align-middle ${isCellEditable ? 'bg-indigo-50/30' : ''}`}>
                            <StatusBadge 
                              status={displayStatus} 
                              isEditable={isCellEditable}
                              onClick={() => isCellEditable && handleToggleStatus(student.id)}
                            />
                          </td>
                        );
                      })}
                      <td className="px-5 py-3 text-center font-mono">
                        <span className={`text-sm font-bold ${presentCount === 5 ? "text-emerald-600" : presentCount >= 3 ? "text-amber-600" : "text-red-600"}`}>
                          {presentCount}/5
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
