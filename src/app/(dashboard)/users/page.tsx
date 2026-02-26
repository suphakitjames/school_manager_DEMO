import { Search, Plus, Filter, Pencil, Trash2, Shield } from "lucide-react";

const mockUsers = [
  { id: 1, name: "นาย สมศักดิ์ วิชาการ", email: "admin@school.ac.th", role: "SUPER_ADMIN", lastLogin: "23 ก.พ. 2567", status: "ใช้งาน" },
  { id: 2, name: "นาง สมใจ บริหาร", email: "admin2@school.ac.th", role: "ADMIN", lastLogin: "23 ก.พ. 2567", status: "ใช้งาน" },
  { id: 3, name: "นาย วิชัย สอนดี", email: "teacher@school.ac.th", role: "TEACHER", lastLogin: "22 ก.พ. 2567", status: "ใช้งาน" },
  { id: 4, name: "นางสาว ปิยะ เก่งกล้า", email: "teacher2@school.ac.th", role: "TEACHER", lastLogin: "21 ก.พ. 2567", status: "ใช้งาน" },
  { id: 5, name: "ด.ช. สมชาย ใจดี", email: "student@school.ac.th", role: "STUDENT", lastLogin: "20 ก.พ. 2567", status: "ใช้งาน" },
  { id: 6, name: "นาย สมพร รักบุตร", email: "parent@school.ac.th", role: "PARENT", lastLogin: "18 ก.พ. 2567", status: "ระงับ" },
];

const roleConfig: Record<string, { label: string; badge: string; icon: string }> = {
  SUPER_ADMIN: { label: "ผู้ดูแลระบบ", badge: "bg-rose-100 text-rose-700", icon: "🔴" },
  ADMIN: { label: "ผู้บริหาร", badge: "bg-indigo-100 text-indigo-700", icon: "🔵" },
  TEACHER: { label: "ครู", badge: "bg-emerald-100 text-emerald-700", icon: "🟢" },
  STUDENT: { label: "นักเรียน", badge: "bg-amber-100 text-amber-700", icon: "🟡" },
  PARENT: { label: "ผู้ปกครอง", badge: "bg-violet-100 text-violet-700", icon: "🟣" },
};

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการผู้ใช้งาน</h1>
          <p className="text-slate-500 text-sm mt-1">ผู้ใช้งานทั้งหมด {mockUsers.length} คน</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm w-fit">
          <Plus className="w-4 h-4" /> เพิ่มผู้ใช้งาน
        </button>
      </div>

      {/* Role summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(roleConfig).map(([role, cfg]) => {
          const count = mockUsers.filter((u) => u.role === role).length;
          return (
            <div key={role} className="bg-white rounded-xl border border-slate-200 p-3 text-center shadow-sm">
              <span className="text-xl">{cfg.icon}</span>
              <p className="text-lg font-bold text-slate-800 mt-1">{count}</p>
              <p className="text-xs text-slate-500">{cfg.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="ค้นหาชื่อ, อีเมล..." className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <select className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none">
            <option>ทุก Role</option>
            <option>SUPER_ADMIN</option>
            <option>ADMIN</option>
            <option>TEACHER</option>
            <option>STUDENT</option>
            <option>PARENT</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
            <Filter className="w-4 h-4" /> กรอง
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {["ผู้ใช้งาน", "อีเมล", "สิทธิ์", "เข้าสู่ระบบล่าสุด", "สถานะ", "จัดการ"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockUsers.map((u) => {
                const rc = roleConfig[u.role];
                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <p className="text-sm font-semibold text-slate-800">{u.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{u.email}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-slate-400" />
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${rc.badge}`}>{rc.label}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">{u.lastLogin}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.status === "ใช้งาน" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg text-slate-500 hover:bg-amber-50 hover:text-amber-600 transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
