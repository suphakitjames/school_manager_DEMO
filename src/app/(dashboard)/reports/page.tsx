import { BarChart3, TrendingUp, Users, GraduationCap, DollarSign, ClipboardCheck, Download } from "lucide-react";

const monthlyData = [
  { month: "ส.ค.", students: 1200, income: 180000 },
  { month: "ก.ย.", students: 1215, income: 220000 },
  { month: "ต.ค.", students: 1220, income: 195000 },
  { month: "พ.ย.", students: 1230, income: 210000 },
  { month: "ธ.ค.", students: 1235, income: 185000 },
  { month: "ม.ค.", students: 1240, income: 240000 },
  { month: "ก.พ.", students: 1248, income: 260000 },
];

const maxIncome = Math.max(...monthlyData.map((d) => d.income));

const subjectAvg = [
  { subject: "คณิตศาสตร์", avg: 74, color: "bg-indigo-500" },
  { subject: "วิทยาศาสตร์", avg: 77, color: "bg-emerald-500" },
  { subject: "ภาษาไทย", avg: 80, color: "bg-violet-500" },
  { subject: "ภาษาอังกฤษ", avg: 71, color: "bg-amber-500" },
  { subject: "สังคมศึกษา", avg: 79, color: "bg-rose-500" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">รายงานและสถิติ</h1>
          <p className="text-slate-500 text-sm mt-1">ปีการศึกษา 2569</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm w-fit">
          <Download className="w-4 h-4" />
          Export รายงานทั้งหมด
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "นักเรียนทั้งหมด", value: "1,248", icon: GraduationCap, color: "indigo", change: "↑ 12" },
          { label: "อัตราการมาเรียน", value: "91.5%", icon: ClipboardCheck, color: "emerald", change: "↑ 0.3%" },
          { label: "GPA เฉลี่ย", value: "2.85", icon: BarChart3, color: "violet", change: "↑ 0.1" },
          { label: "รายรับรวม", value: "฿2.4M", icon: DollarSign, color: "amber", change: "↑ 8%" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <div className={`w-10 h-10 rounded-xl bg-${kpi.color}-50 flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 text-${kpi.color}-600`} />
              </div>
              <p className="text-2xl font-bold text-slate-800">{kpi.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{kpi.label}</p>
              <p className="text-xs text-emerald-600 font-semibold mt-1">{kpi.change} จากปีก่อน</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Income Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold text-slate-800">รายรับรายเดือน (บาท)</h2>
          </div>
          <div className="flex items-end gap-3 h-48">
            {monthlyData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-slate-400">{(d.income / 1000).toFixed(0)}K</span>
                <div
                  className="w-full bg-indigo-500 rounded-t-lg transition-all hover:bg-indigo-600"
                  style={{ height: `${(d.income / maxIncome) * 100}%`, minHeight: "8px" }}
                />
                <span className="text-xs text-slate-500">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subject Avg Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-violet-600" />
            <h2 className="font-semibold text-slate-800">คะแนนเฉลี่ยแต่ละวิชา</h2>
          </div>
          <div className="space-y-4">
            {subjectAvg.map((s) => (
              <div key={s.subject}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{s.subject}</span>
                  <span className="font-bold text-slate-800">{s.avg}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${s.color} rounded-full transition-all`} style={{ width: `${s.avg}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Students trend */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-5 h-5 text-emerald-600" />
          <h2 className="font-semibold text-slate-800">แนวโน้มจำนวนนักเรียนรายเดือน</h2>
        </div>
        <div className="flex items-end gap-4 h-36">
          {monthlyData.map((d, i) => {
            const min = Math.min(...monthlyData.map((x) => x.students));
            const max = Math.max(...monthlyData.map((x) => x.students));
            const pct = ((d.students - min) / (max - min)) * 80 + 20;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-slate-400">{d.students}</span>
                <div
                  className="w-full bg-emerald-400 rounded-t-lg hover:bg-emerald-500 transition-colors"
                  style={{ height: `${pct}%` }}
                />
                <span className="text-xs text-slate-500">{d.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Report Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: "รายงานผลการเรียน", desc: "สรุปเกรดและ GPA ทุกห้องเรียน", icon: "📊", color: "indigo" },
          { title: "รายงานการเข้าเรียน", desc: "สถิติการมาเรียนรายบุคคลและรายห้อง", icon: "📋", color: "emerald" },
          { title: "รายงานการเงิน", desc: "สรุปรายรับ-รายจ่าย และหนี้ค้างชำระ", icon: "💰", color: "amber" },
        ].map((r) => (
          <div key={r.title} className={`bg-white rounded-2xl border border-${r.color}-200 shadow-sm p-5 card-hover cursor-pointer`}>
            <div className="text-3xl mb-3">{r.icon}</div>
            <h3 className="font-semibold text-slate-800">{r.title}</h3>
            <p className="text-sm text-slate-500 mt-1">{r.desc}</p>
            <button className={`mt-3 text-sm font-semibold text-${r.color}-600 hover:underline`}>
              ดูรายงาน →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
