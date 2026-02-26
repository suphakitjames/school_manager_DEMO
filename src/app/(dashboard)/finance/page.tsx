import { Search, Plus, Download, DollarSign, AlertCircle, CheckCircle } from "lucide-react";

const mockPayments = [
  { id: 1, student: "ด.ช. สมชาย ใจดี", class: "ม.2/1", fee: "ค่าเทอม 2/2567", amount: 8500, paid: 8500, date: "15 ก.พ. 2567", method: "โอนเงิน", status: "ชำระแล้ว" },
  { id: 2, student: "ด.ญ. สมหญิง รักเรียน", class: "ป.5/2", fee: "ค่าเทอม 2/2567", amount: 7500, paid: 0, date: "-", method: "-", status: "ค้างชำระ" },
  { id: 3, student: "ด.ช. วิชัย เก่งกล้า", class: "ม.1/3", fee: "ค่าเทอม 2/2567", amount: 8000, paid: 4000, date: "10 ก.พ. 2567", method: "เงินสด", status: "ชำระบางส่วน" },
  { id: 4, student: "ด.ญ. มานี มีสุข", class: "ป.3/1", fee: "ค่าเทอม 2/2567", amount: 6500, paid: 6500, date: "5 ก.พ. 2567", method: "เงินสด", status: "ชำระแล้ว" },
  { id: 5, student: "ด.ช. ธนกร ทรงคุณ", class: "ม.3/2", fee: "ค่าเทอม 2/2567", amount: 9000, paid: 9000, date: "3 ก.พ. 2567", method: "โอนเงิน", status: "ชำระแล้ว" },
];

function statusStyle(status: string) {
  switch (status) {
    case "ชำระแล้ว": return "bg-emerald-100 text-emerald-700";
    case "ค้างชำระ": return "bg-red-100 text-red-700";
    case "ชำระบางส่วน": return "bg-amber-100 text-amber-700";
    default: return "bg-slate-100 text-slate-600";
  }
}

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">การเงิน</h1>
          <p className="text-slate-500 text-sm mt-1">ภาคเรียนที่ 2 ปีการศึกษา 2567</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm w-fit">
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
            <p className="text-sm text-slate-500 font-medium">ชำระแล้ว</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">฿1,840,000</p>
          <p className="text-xs text-slate-400 mt-1">จากนักเรียน 865 คน</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-sm text-slate-500 font-medium">ค้างชำระ</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">฿560,000</p>
          <p className="text-xs text-slate-400 mt-1">จากนักเรียน 383 คน</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-sm text-slate-500 font-medium">รายรับรวม</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">฿2,400,000</p>
          <p className="text-xs text-slate-400 mt-1">เป้าหมายทั้งหมด</p>
        </div>
      </div>

      {/* Collection progress */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-slate-700">ความคืบหน้าการจัดเก็บค่าเทอม</span>
          <span className="text-sm font-bold text-indigo-600">76.7%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: "76.7%" }} />
        </div>
        <p className="text-xs text-slate-400 mt-1">฿1,840,000 จาก ฿2,400,000</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="ค้นหานักเรียน..." className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <select className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none">
            <option>ทุกสถานะ</option>
            <option>ชำระแล้ว</option>
            <option>ค้างชำระ</option>
            <option>ชำระบางส่วน</option>
          </select>
          <select className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none">
            <option>ทุกห้อง</option>
            <option>ม.2/1</option><option>ป.5/2</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {["นักเรียน", "ห้อง", "รายการ", "ยอดรวม", "ชำระแล้ว", "คงเหลือ", "วันที่", "สถานะ", "จัดการ"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 text-sm font-semibold text-slate-800">{p.student}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{p.class}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{p.fee}</td>
                  <td className="px-5 py-4 text-sm font-medium text-slate-800">฿{p.amount.toLocaleString()}</td>
                  <td className="px-5 py-4 text-sm font-medium text-emerald-600">฿{p.paid.toLocaleString()}</td>
                  <td className="px-5 py-4 text-sm font-medium text-red-500">฿{(p.amount - p.paid).toLocaleString()}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{p.date}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle(p.status)}`}>{p.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <button className="text-xs text-indigo-600 font-medium hover:underline">รับชำระ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
