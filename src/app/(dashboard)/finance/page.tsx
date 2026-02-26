"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Download, DollarSign, AlertCircle, CheckCircle, Settings } from "lucide-react";
import { PaymentModal } from "./PaymentModal";
import { PaymentHistoryModal } from "./PaymentHistoryModal";
import { FeeTypeManagerModal } from "./FeeTypeManagerModal";

function statusStyle(status: string) {
  switch (status) {
    case "ชำระแล้ว": return "bg-emerald-100 text-emerald-700";
    case "ค้างชำระ": return "bg-red-100 text-red-700";
    case "ชำระบางส่วน": return "bg-amber-100 text-amber-700";
    default: return "bg-slate-100 text-slate-600";
  }
}

export default function FinancePage() {
  const [summary, setSummary] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ทุกสถานะ");
  const [classFilter, setClassFilter] = useState("ทุกห้อง");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isFeeManagerOpen, setIsFeeManagerOpen] = useState(false);
  const [preselectedStudent, setPreselectedStudent] = useState<any>(null);

  // Available classes for filter
  const [classes, setClasses] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sumRes, payRes] = await Promise.all([
        fetch("/api/finance/summary"),
        fetch(`/api/finance/payments?search=${encodeURIComponent(search)}&status=${encodeURIComponent(statusFilter)}&classroomId=${encodeURIComponent(classFilter)}`)
      ]);
      const sumData = await sumRes.json();
      const payData = await payRes.json();

      setSummary(sumData);
      setPayments(payData);

      // Extract unique classes dynamically if not filtering by class
      if (classFilter === "ทุกห้อง" && payData.length > 0) {
        const uniqueClasses = Array.from(new Set(payData.map((p: any) => p.class))).filter(c => c !== '-') as string[];
        setClasses(uniqueClasses);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounced fetch
    const timeout = setTimeout(fetchData, 300);
    return () => clearTimeout(timeout);
  }, [search, statusFilter, classFilter]);

  const progressPercent = summary && summary.totalExpected > 0 
    ? (summary.totalCollected / summary.totalExpected) * 100 
    : 0;

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "นักเรียน,ห้อง,รายการ,ยอดรวม,ชำระแล้ว,คงเหลือ,วันที่ล่าสุด,วิธีชำระ,สถานะ\n";
    
    payments.forEach((p) => {
      const remaining = p.amount - p.paid;
      const row = `"${p.student}","${p.class}","${p.fee}",${p.amount},${p.paid},${remaining},"${p.date}","${p.method}","${p.status}"`;
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `finance_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">การเงิน</h1>
          <p className="text-slate-500 text-sm mt-1">สรุปข้อมูลการชำระเงิน</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setIsFeeManagerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Settings className="w-4 h-4" />
            ตั้งค่ารายการ
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={() => {
              setPreselectedStudent(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm w-fit"
          >
            <Plus className="w-4 h-4" />
            บันทึกการชำระเงิน
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-sm text-slate-500 font-medium">ชำระแล้ว (รวบรวม)</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            ฿{summary ? summary.totalCollected.toLocaleString() : "0"}
          </p>
          <p className="text-xs text-slate-400 mt-1">จากนักเรียนที่ชำระครบ {summary ? summary.studentsPaid : 0} คน</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-sm text-slate-500 font-medium">ค้างชำระ (ส่วนที่เหลือ)</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            ฿{summary ? summary.totalPending.toLocaleString() : "0"}
          </p>
          <p className="text-xs text-slate-400 mt-1">จากนักเรียน {summary ? summary.studentsUnpaid : 0} คน</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-sm text-slate-500 font-medium">รายรับเป้าหมาย</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            ฿{summary ? summary.totalExpected.toLocaleString() : "0"}
          </p>
          <p className="text-xs text-slate-400 mt-1">เป้าหมายทั้งหมด ({summary ? summary.totalStudents : 0} คน)</p>
        </div>
      </div>

      {/* Collection progress */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-slate-700">ความคืบหน้าการจัดเก็บค่าเทอม</span>
          <span className="text-sm font-bold text-indigo-600">{progressPercent.toFixed(1)}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: `${progressPercent}%` }} />
        </div>
        <p className="text-xs text-slate-400 mt-1">
          ฿{summary ? summary.totalCollected.toLocaleString() : "0"} จาก ฿{summary ? summary.totalExpected.toLocaleString() : "0"}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="ค้นหานักเรียน..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none"
          >
            <option value="ทุกสถานะ">ทุกสถานะ</option>
            <option value="ชำระแล้ว">ชำระแล้ว</option>
            <option value="ค้างชำระ">ค้างชำระ</option>
            <option value="ชำระบางส่วน">ชำระบางส่วน</option>
          </select>
          <select 
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none"
          >
            <option value="ทุกห้อง">ทุกห้อง</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {["นักเรียน", "ห้อง", "รายการ", "ยอดรวม", "ชำระแล้ว", "คงเหลือ", "วันที่ล่าสุด", "สถานะ", "จัดการ"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length > 0 ? payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 text-sm font-semibold text-slate-800 whitespace-nowrap">{p.student}</td>
                  <td className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap">{p.class}</td>
                  <td className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap">{p.fee}</td>
                  <td className="px-5 py-4 text-sm font-medium text-slate-800 whitespace-nowrap">฿{p.amount.toLocaleString()}</td>
                  <td className="px-5 py-4 text-sm font-medium text-emerald-600 whitespace-nowrap">฿{p.paid.toLocaleString()}</td>
                  <td className="px-5 py-4 text-sm font-medium text-red-500 whitespace-nowrap">฿{(p.amount - p.paid).toLocaleString()}</td>
                  <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">{p.date}</td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle(p.status)}`}>{p.status}</span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setPreselectedStudent(p);
                          setIsModalOpen(true);
                        }}
                        disabled={p.status === "ชำระแล้ว"}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${p.status === "ชำระแล้ว" ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:shadow-sm"}`}
                      >
                        รับชำระ
                      </button>
                      <button 
                        onClick={() => {
                          setPreselectedStudent(p);
                          setIsHistoryModalOpen(true);
                        }}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-200 transition-all hover:shadow-sm"
                      >
                        ประวัติ
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-sm text-slate-500">
                    {loading ? "กำลังโหลดข้อมูล..." : "ไม่พบข้อมูล"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PaymentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchData(); // Refresh data
        }}
        preselectedStudent={preselectedStudent}
        studentsList={payments}
      />
      <PaymentHistoryModal 
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        studentData={preselectedStudent}
      />
      <FeeTypeManagerModal 
        isOpen={isFeeManagerOpen}
        onClose={() => setIsFeeManagerOpen(false)}
        onSuccess={() => fetchData()}
      />
    </div>
  );
}
