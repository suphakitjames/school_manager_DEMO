"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Filter, Pencil, Trash2, Shield, RefreshCw } from "lucide-react";
import { UserModal, UserFormData } from "@/components/users/UserModal";
import { DeleteConfirmModal } from "@/components/users/DeleteConfirmModal";

const roleConfig: Record<string, { label: string; badge: string; icon: string }> = {
  SUPER_ADMIN: { label: "ผู้ดูแลระบบ", badge: "bg-rose-100 text-rose-700", icon: "🔴" },
  ADMIN: { label: "ผู้บริหาร", badge: "bg-indigo-100 text-indigo-700", icon: "🔵" },
  TEACHER: { label: "ครู", badge: "bg-emerald-100 text-emerald-700", icon: "🟢" },
  STUDENT: { label: "นักเรียน", badge: "bg-amber-100 text-amber-700", icon: "🟡" },
  PARENT: { label: "ผู้ปกครอง", badge: "bg-violet-100 text-violet-700", icon: "🟣" },
};

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ทุก Role");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append("search", searchTerm);
      if (roleFilter && roleFilter !== "ทุก Role") queryParams.append("role", roleFilter);

      const res = await fetch(`/api/users?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้งาน");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, roleFilter]);

  useEffect(() => {
    // Debounce search fetching
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleCreateOrUpdate = async (formData: UserFormData) => {
    setIsSubmitting(true);
    try {
      const url = formData.id ? `/api/users/${formData.id}` : "/api/users";
      const method = formData.id ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Something went wrong");
      }

      setIsModalOpen(false);
      setSelectedUser(null);
      fetchUsers(); // Refresh list
    } catch (error: any) {
      throw error; // Re-throw to be caught by modal and shown to user
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete user");

      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการลบผู้ใช้งาน");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const openDeleteModal = (user: any) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการผู้ใช้งาน</h1>
          <p className="text-slate-500 text-sm mt-1">ผู้ใช้งานทั้งหมดในระบบ {loading ? "..." : users.length} คน</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => fetchUsers()} 
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm w-fit"
          >
            <Plus className="w-4 h-4" /> เพิ่มผู้ใช้งาน
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sticky top-4 z-10">
        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อ, อีเมล..." 
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
            />
          </div>
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-700 min-w-[150px]"
          >
            <option value="ทุก Role">ทุก Role</option>
            {Object.keys(roleConfig).map(role => (
              <option key={role} value={role}>{roleConfig[role].label} ({role})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                {["ผู้ใช้งาน", "อีเมล", "เบอร์โทรศัพท์", "สิทธิ์", "เข้าร่วมเมื่อ", "สถานะ", "จัดการ"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
                      <p>กำลังโหลดข้อมูลผู้ใช้งาน...</p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                        <Search className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="font-medium text-slate-600">ไม่พบข้อมูลผู้ใช้งาน</p>
                      <p className="text-sm">ลองค้นหาด้วยคำอื่น หรือเปลี่ยนตัวกรอง</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const rc = roleConfig[u.role] || { label: u.role, badge: "bg-slate-100 text-slate-700", icon: "👤" };
                  return (
                    <tr key={u.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-700 text-sm font-bold flex items-center justify-center shrink-0 border border-indigo-100/50">
                            {u.name.charAt(0)}
                          </div>
                          <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{u.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">{u.email}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{u.phone || "-"}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 w-fit">
                          <span className="text-[10px] sm:hidden">{rc.icon}</span>
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${rc.badge} flex items-center gap-1.5`}>
                            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
                            {rc.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{formatDate(u.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${u.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200 text-emerald-700" : "bg-red-50 text-red-700 border-red-200"}`}>
                          {u.isActive ? "🟢 ใช้งาน" : "🔴 ระงับ"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openEditModal(u)}
                            className="p-2 rounded-xl text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                            title="แก้ไข"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openDeleteModal(u)}
                            className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="ลบ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Simple pagination / footer info */}
        {!loading && users.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-sm text-slate-500">
            <span>แสดง {users.length} รายการ</span>
            {/* If pagination is needed, add it here */}
          </div>
        )}
      </div>

      {/* Modals */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateOrUpdate}
        initialData={selectedUser}
        isLoading={isSubmitting}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        userName={selectedUser?.name}
        isLoading={isSubmitting}
      />
    </div>
  );
}
