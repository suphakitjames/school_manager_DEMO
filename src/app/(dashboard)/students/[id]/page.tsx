import Link from "next/link";
import {
  ArrowLeft, GraduationCap, Phone, Mail, MapPin, User, Calendar,
  BookOpen, ClipboardCheck, DollarSign, Edit
} from "lucide-react";

const student = {
  id: 1,
  code: "67001",
  name: "ด.ช. สมชาย ใจดี",
  nameEn: "Somchai Jaidee",
  class: "ม.2/1",
  gender: "ชาย",
  dob: "15 มกราคม 2554",
  age: "13 ปี",
  nationalId: "1-1001-12345-67-8",
  bloodType: "O",
  address: "123/45 ถนนรัชดาภิเษก แขวงจตุจักร เขตจตุจักร กรุงเทพมหานคร 10900",
  parentName: "นาย สมศักดิ์ ใจดี",
  parentPhone: "081-234-5678",
  parentEmail: "somsak@email.com",
  parentLine: "@somsak123",
  enrollDate: "1 มิถุนายน 2566",
  status: "กำลังศึกษา",
  photo: null,
};

const attendanceSummary = { present: 42, absent: 3, late: 5, leave: 2, total: 52, pct: "80.8%" };

const grades = [
  { subject: "คณิตศาสตร์", mid: 78, final: 82, activity: 90, total: 82.4, letter: "A", gpa: 4.0 },
  { subject: "วิทยาศาสตร์", mid: 70, final: 75, activity: 85, total: 74.5, letter: "B+", gpa: 3.5 },
  { subject: "ภาษาไทย", mid: 85, final: 88, activity: 92, total: 87.7, letter: "A", gpa: 4.0 },
  { subject: "ภาษาอังกฤษ", mid: 65, final: 70, activity: 80, total: 69.5, letter: "B", gpa: 3.0 },
];

const payments = [
  { fee: "ค่าเทอม 2/2567", amount: 8500, status: "ชำระแล้ว", date: "15 ก.พ. 2567" },
  { fee: "ค่าเทอม 1/2567", amount: 8500, status: "ชำระแล้ว", date: "1 มิ.ย. 2566" },
];

export default function StudentDetailPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/students" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">โปรไฟล์นักเรียน</h1>
          <p className="text-slate-500 text-sm">รหัสนักเรียน: {student.code}</p>
        </div>
        <button className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
          <Edit className="w-4 h-4" /> แก้ไขข้อมูล
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
          <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-12 h-12 text-indigo-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">{student.name}</h2>
          <p className="text-sm text-slate-500">{student.nameEn}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
            {student.status}
          </span>
          <div className="mt-4 space-y-2 text-left border-t border-slate-100 pt-4">
            {[
              { icon: User, label: "ชั้นเรียน", value: student.class },
              { icon: Calendar, label: "วันเกิด", value: `${student.dob} (${student.age})` },
              { icon: User, label: "เพศ", value: student.gender },
              { icon: User, label: "หมู่เลือด", value: student.bloodType },
              { icon: Calendar, label: "วันเข้าเรียน", value: student.enrollDate },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-2 text-sm">
                  <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-500 w-24">{item.label}</span>
                  <span className="text-slate-700 font-medium">{item.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Details Column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Contact Info */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-4">ข้อมูลติดต่อและผู้ปกครอง</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-500 text-xs">ที่อยู่</p>
                    <p className="text-slate-700">{student.address}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-slate-500 text-xs">ผู้ปกครอง</p>
                    <p className="text-slate-700 font-medium">{student.parentName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <p className="text-slate-700">{student.parentPhone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <p className="text-slate-700">{student.parentEmail}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardCheck className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-slate-800">สถิติการมาเรียน (ภาคเรียนที่ 2)</h3>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { label: "มาเรียน", value: attendanceSummary.present, color: "emerald" },
                { label: "ขาด", value: attendanceSummary.absent, color: "red" },
                { label: "มาสาย", value: attendanceSummary.late, color: "yellow" },
                { label: "ลา", value: attendanceSummary.leave, color: "blue" },
              ].map((s) => (
                <div key={s.label} className={`text-center p-3 rounded-xl bg-${s.color}-50`}>
                  <p className={`text-xl font-bold text-${s.color}-600`}>{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>อัตราการมาเรียน</span>
              <span className="font-semibold text-slate-700">{attendanceSummary.pct}</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: attendanceSummary.pct }} />
            </div>
          </div>

          {/* Grades */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-slate-800">ผลการเรียน</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    {["วิชา", "กลางภาค", "ปลายภาค", "กิจกรรม", "รวม", "เกรด", "GPA"].map((h) => (
                      <th key={h} className="text-center text-xs text-slate-400 font-semibold pb-3 px-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grades.map((g) => (
                    <tr key={g.subject} className="border-b border-slate-50 last:border-0">
                      <td className="py-2.5 px-3 font-medium text-slate-700">{g.subject}</td>
                      <td className="py-2.5 px-3 text-center text-slate-600">{g.mid}</td>
                      <td className="py-2.5 px-3 text-center text-slate-600">{g.final}</td>
                      <td className="py-2.5 px-3 text-center text-slate-600">{g.activity}</td>
                      <td className="py-2.5 px-3 text-center font-semibold text-slate-800">{g.total}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${g.gpa >= 4 ? "bg-emerald-100 text-emerald-700" : g.gpa >= 3 ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700"}`}>{g.letter}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-800">{g.gpa.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payments */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-slate-800">ประวัติการชำระเงิน</h3>
            </div>
            <div className="space-y-2">
              {payments.map((p) => (
                <div key={p.fee} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{p.fee}</p>
                    <p className="text-xs text-slate-400">{p.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">฿{p.amount.toLocaleString()}</p>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
