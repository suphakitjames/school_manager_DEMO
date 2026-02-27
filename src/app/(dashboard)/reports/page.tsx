"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart3, TrendingUp, Users, GraduationCap, DollarSign, ClipboardCheck, Download } from "lucide-react";

type ReportData = {
  kpis: {
    totalStudents: number;
    attendanceRate: string;
    averageGPA: string;
    totalIncome: number;
  };
  charts: {
    monthlyData: Array<{ month: string; students: number; income: number }>;
    subjectAvg: Array<{ subject: string; avg: number; color: string }>;
  };
};

function formatCurrency(amount: number) {
  if (amount >= 1000000) return `฿${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `฿${(amount / 1000).toFixed(1)}K`;
  return `฿${amount}`;
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">กำลังประมวลผลรายงานสถิติ...</p>
        </div>
      </div>
    );
  }

  const { monthlyData, subjectAvg } = data.charts;
  const maxIncome = Math.max(...monthlyData.map((d) => d.income), 10000); // 10k fallback

  const handleExport = () => {
    // 1. Export KPIs
    let csvContent = "--- รายงานสรุป KPI (ปีการศึกษา 2569) ---\n";
    csvContent += "หัวข้อ,จำนวน/สถิติ\n";
    csvContent += `นักเรียนทั้งหมด (Active),${data.kpis.totalStudents}\n`;
    csvContent += `อัตราส่วนการมาเรียนวันนี้,${data.kpis.attendanceRate}\n`;
    csvContent += `GPA เฉลี่ยทั้งโรงเรียน,${data.kpis.averageGPA}\n`;
    csvContent += `รายรับรวม (ปีนี้),${data.kpis.totalIncome}\n\n`;

    // 2. Export Monthly Data
    csvContent += "--- สถิติรายเดือน ---\n";
    csvContent += "เดือน,จำนวนนักเรียน,รายรับโดยประมาณ (บาท)\n";
    monthlyData.forEach(d => {
      csvContent += `${d.month},${d.students},${d.income}\n`;
    });
    
    csvContent += "\n--- คะแนนเฉลี่ยแต่ละวิชา ---\n";
    csvContent += "วิชา,คะแนนเฉลี่ย (%)\n";
    subjectAvg.forEach(s => {
      csvContent += `${s.subject},${s.avg}\n`;
    });

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `school_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">รายงานและสถิติ</h1>
          <p className="text-slate-500 text-sm mt-1">ปีการศึกษา 2569</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm w-fit">
          <Download className="w-4 h-4" />
          Export รายงานทั้งหมด
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "นักเรียนทั้งหมด (Active)", value: data.kpis.totalStudents.toLocaleString(), icon: GraduationCap, color: "indigo", change: "อัปเดตล่าสุด" },
          { label: "อัตราส่วนการมาเรียนวันนี้", value: data.kpis.attendanceRate, icon: ClipboardCheck, color: "emerald", change: "เกณฑ์ปกติ" },
          { label: "GPA เฉลี่ยทั้งโรงเรียน", value: data.kpis.averageGPA, icon: BarChart3, color: "violet", change: "เทียบเทอมที่แล้ว" },
          { label: "รายรับรวม (ปีนี้)", value: formatCurrency(data.kpis.totalIncome), icon: DollarSign, color: "amber", change: "การเติบโต +8%" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <div className={`w-10 h-10 rounded-xl bg-${kpi.color}-50 flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 text-${kpi.color}-600`} />
              </div>
              <p className="text-2xl font-bold text-slate-800">{kpi.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{kpi.label}</p>
              <p className="text-xs text-emerald-600 font-semibold mt-1">{kpi.change}</p>
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
            <h2 className="font-semibold text-slate-800">รายรับรายเดือนโดยประมาณ (บาท)</h2>
          </div>
          <div className="flex items-end gap-3 h-48">
            {monthlyData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-slate-400">{(d.income / 1000).toFixed(0)}K</span>
                <div
                  className="w-full bg-indigo-500 rounded-t-lg transition-all hover:bg-indigo-600"
                  style={{ height: `${Math.max((d.income / maxIncome) * 100, 10)}%`, minHeight: "8px" }}
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
          <h2 className="font-semibold text-slate-800">แนวโน้มการเติบโตของจำนวนนักเรียน</h2>
        </div>
        <div className="flex items-end gap-4 h-36">
          {monthlyData.map((d, i) => {
            const min = Math.max(Math.min(...monthlyData.map((x) => x.students)) - 10, 0);
            const max = Math.max(...monthlyData.map((x) => x.students), 10);
            const pct = max === min ? 50 : ((d.students - min) / (max - min)) * 80 + 20;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-semibold text-slate-600">{d.students}</span>
                <div
                  className="w-full bg-emerald-400 rounded-t-lg hover:bg-emerald-500 transition-colors"
                  style={{ height: `${pct}%`, minHeight: "20px" }}
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
          { title: "รายงานผลการเรียน", desc: "สรุปเกรดและ GPA ทุกห้องเรียน", icon: "📊", color: "indigo", href: "/classes" },
          { title: "รายงานการเข้าเรียน", desc: "สถิติการมาเรียนรายบุคคลและรายห้อง", icon: "📋", color: "emerald", href: "/attendance" },
          { title: "รายงานการเงิน", desc: "สรุปรายรับ-รายจ่าย และหนี้ค้างชำระ", icon: "💰", color: "amber", href: "/finance" },
        ].map((r) => (
          <Link href={r.href} key={r.title} className={`block bg-white rounded-2xl border border-${r.color}-200 shadow-sm p-5 card-hover cursor-pointer`}>
            <div className="text-3xl mb-3">{r.icon}</div>
            <h3 className="font-semibold text-slate-800">{r.title}</h3>
            <p className="text-sm text-slate-500 mt-1">{r.desc}</p>
            <div className={`mt-3 text-sm font-semibold text-${r.color}-600 hover:underline`}>
              ดูรายงาน →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
