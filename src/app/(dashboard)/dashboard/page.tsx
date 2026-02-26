import {
  GraduationCap,
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  ClipboardCheck,
  AlertCircle,
  Calendar,
} from "lucide-react";

const stats = [
  {
    label: "นักเรียนทั้งหมด",
    value: "1,248",
    change: "+12",
    changeLabel: "จากปีที่แล้ว",
    icon: GraduationCap,
    color: "indigo",
    bg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    label: "ครูและบุคลากร",
    value: "86",
    change: "+3",
    changeLabel: "รับใหม่ปีนี้",
    icon: Users,
    color: "emerald",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    label: "วิชาที่เปิดสอน",
    value: "42",
    change: "+5",
    changeLabel: "วิชาใหม่",
    icon: BookOpen,
    color: "violet",
    bg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    label: "รายรับปีนี้",
    value: "฿2.4M",
    change: "+8%",
    changeLabel: "จากปีก่อน",
    icon: DollarSign,
    color: "amber",
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
];

const recentStudents = [
  { name: "ด.ช. สมชาย ใจดี", class: "ม.2/1", date: "23 ก.พ. 2567", status: "ใหม่" },
  { name: "ด.ญ. สมหญิง รักเรียน", class: "ป.5/2", date: "22 ก.พ. 2567", status: "ใหม่" },
  { name: "ด.ช. วิชัย เก่งกล้า", class: "ม.1/3", date: "21 ก.พ. 2567", status: "ย้ายมา" },
  { name: "ด.ญ. มานี มีสุข", class: "ป.3/1", date: "20 ก.พ. 2567", status: "ใหม่" },
  { name: "ด.ช. ธนกร ทรงคุณ", class: "ม.3/2", date: "19 ก.พ. 2567", status: "ใหม่" },
];

const announcements = [
  { title: "กำหนดการสอบปลายภาค ภาคเรียนที่ 2/2567", type: "ด่วน", date: "23 ก.พ. 2567" },
  { title: "ประชุมผู้ปกครองประจำภาคเรียน", type: "ทั่วไป", date: "22 ก.พ. 2567" },
  { title: "กิจกรรมวันกีฬาสีโรงเรียน ประจำปี 2567", type: "กิจกรรม", date: "20 ก.พ. 2567" },
  { title: "การรับสมัครนักเรียนใหม่ ปีการศึกษา 2568", type: "วิชาการ", date: "15 ก.พ. 2567" },
];

const attendanceOverview = [
  { label: "มาเรียน", value: 1142, pct: "91.5%", color: "bg-emerald-500" },
  { label: "ขาดเรียน", value: 56, pct: "4.5%", color: "bg-red-500" },
  { label: "มาสาย", value: 28, pct: "2.2%", color: "bg-yellow-500" },
  { label: "ลา", value: 22, pct: "1.8%", color: "bg-blue-500" },
];

function getAnnouncementBadge(type: string) {
  switch (type) {
    case "ด่วน": return "bg-red-100 text-red-700";
    case "กิจกรรม": return "bg-emerald-100 text-emerald-700";
    case "วิชาการ": return "bg-violet-100 text-violet-700";
    default: return "bg-slate-100 text-slate-600";
  }
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">ภาพรวมโรงเรียน</h1>
        <p className="text-slate-500 text-sm mt-1">ปีการศึกษา 2567 ภาคเรียนที่ 2</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm card-hover"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-semibold text-emerald-600">{stat.change}</span>
                <span className="text-xs text-slate-400">{stat.changeLabel}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Attendance Overview */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <ClipboardCheck className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold text-slate-800">สถิติการมาเรียนวันนี้</h2>
          </div>
          <div className="space-y-3">
            {attendanceOverview.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-semibold text-slate-800">{item.value} คน ({item.pct})</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all`}
                    style={{ width: item.pct }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              จำนวนนักเรียนทั้งหมดวันนี้: <span className="font-semibold text-slate-700">1,248 คน</span>
            </p>
          </div>
        </div>

        {/* Recent Students */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold text-slate-800">นักเรียนเข้าใหม่ล่าสุด</h2>
            </div>
            <a href="/students" className="text-xs text-indigo-600 hover:underline font-medium">
              ดูทั้งหมด →
            </a>
          </div>
          <div className="space-y-3">
            {recentStudents.map((s) => (
              <div key={s.name} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                  {s.name.charAt(3)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{s.name}</p>
                  <p className="text-xs text-slate-500">{s.class} · {s.date}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium shrink-0">
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold text-slate-800">ประกาศล่าสุด</h2>
            </div>
            <a href="/announcements" className="text-xs text-indigo-600 hover:underline font-medium">
              ดูทั้งหมด →
            </a>
          </div>
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.title} className="border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                <div className="flex items-start gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 shrink-0 ${getAnnouncementBadge(a.type)}`}>
                    {a.type}
                  </span>
                  <p className="text-sm text-slate-700 font-medium leading-tight">{a.title}</p>
                </div>
                <div className="flex items-center gap-1 mt-1.5 ml-0">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-400">{a.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
        <h2 className="font-semibold text-lg mb-4">การดำเนินการด่วน</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "ลงทะเบียนนักเรียนใหม่", href: "/students/new", icon: "➕" },
            { label: "บันทึกการเช็คชื่อ", href: "/attendance", icon: "✅" },
            { label: "บันทึกผลการเรียน", href: "/grades", icon: "📊" },
            { label: "รับชำระค่าเทอม", href: "/finance", icon: "💰" },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-2 p-4 bg-white/15 hover:bg-white/25 rounded-xl transition-colors backdrop-blur-sm text-center"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-xs font-medium leading-tight">{action.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
