"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Building, Users, Plus, Pencil, Trash2, ChevronDown, ChevronUp,
  X, Check, UserPlus, GripVertical, Search
} from "lucide-react";

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  position: string | null;
  photoUrl: string | null;
  user?: { avatarUrl: string | null };
}

interface Member {
  id: number;
  teacherId: number;
  role: string | null;
  order: number;
  teacher: Teacher;
}

interface Division {
  id: number;
  name: string;
  nameEn: string | null;
  description: string | null;
  icon: string | null;
  headTeacherId: number | null;
  order: number;
  isActive: boolean;
  headTeacher: Teacher | null;
  members: Member[];
  _count?: { members: number };
}

export default function AdminDivisionManagePage() {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Division>>({});
  const [addingMemberTo, setAddingMemberTo] = useState<number | null>(null);
  const [memberRole, setMemberRole] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDivisions = useCallback(async () => {
    const res = await fetch("/api/administration");
    const data = await res.json();
    // For each division, also fetch full detail with members
    const detailed = await Promise.all(
      data.map(async (d: Division) => {
        const r = await fetch(`/api/administration/${d.id}`);
        return r.json();
      })
    );
    setDivisions(detailed);
    setLoading(false);
  }, []);

  const fetchTeachers = useCallback(async () => {
    const res = await fetch("/api/teachers");
    const data = await res.json();
    setTeachers(Array.isArray(data) ? data : data.teachers || []);
  }, []);

  useEffect(() => {
    fetchDivisions();
    fetchTeachers();
  }, [fetchDivisions, fetchTeachers]);

  const handleSaveEdit = async (id: number) => {
    await fetch(`/api/administration/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditingId(null);
    fetchDivisions();
  };

  const handleAddMember = async (divisionId: number) => {
    if (!selectedTeacherId) return;
    await fetch(`/api/administration/${divisionId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teacherId: selectedTeacherId,
        role: memberRole || null,
      }),
    });
    setAddingMemberTo(null);
    setSelectedTeacherId(null);
    setMemberRole("");
    setSearchTerm("");
    fetchDivisions();
  };

  const handleRemoveMember = async (divisionId: number, memberId: number) => {
    if (!confirm("ลบสมาชิกออกจากฝ่ายนี้?")) return;
    await fetch(`/api/administration/${divisionId}/members?memberId=${memberId}`, {
      method: "DELETE",
    });
    fetchDivisions();
  };

  const filteredTeachers = (divisionMembers: Member[]) => {
    const existingIds = divisionMembers.map((m) => m.teacherId);
    return teachers
      .filter((t) => !existingIds.includes(t.id))
      .filter(
        (t) =>
          !searchTerm ||
          `${t.firstName} ${t.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Building className="w-7 h-7 text-indigo-600" />
            ฝ่ายบริหารงาน
          </h1>
          <p className="text-slate-500 text-sm mt-1">จัดการข้อมูลฝ่ายบริหารงาน 4 ฝ่ายหลัก</p>
        </div>
      </div>

      {/* Division Cards */}
      <div className="space-y-4">
        {divisions.map((div) => {
          const isExpanded = expandedId === div.id;
          const isEditing = editingId === div.id;

          return (
            <div
              key={div.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Division Header */}
              <div
                className="flex items-center gap-4 p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : div.id)}
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                  <Building className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800">{div.name}</h3>
                  <p className="text-sm text-slate-500">{div.nameEn || ""}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full">
                    <Users className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                    {div.members?.length || 0} คน
                  </span>
                  {div.headTeacher && (
                    <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full hidden sm:inline">
                      หัวหน้า: {div.headTeacher.firstName}
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-slate-100">
                  {/* Edit Section */}
                  <div className="p-5 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-slate-700 text-sm">ข้อมูลฝ่าย</h4>
                      {!isEditing ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(div.id);
                            setEditForm({
                              name: div.name,
                              nameEn: div.nameEn,
                              description: div.description,
                              icon: div.icon,
                              headTeacherId: div.headTeacherId,
                            });
                          }}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-slate-200"
                        >
                          <Pencil className="w-3.5 h-3.5" /> แก้ไข
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(div.id)}
                            className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1 px-3 py-1.5 rounded-lg"
                          >
                            <Check className="w-3.5 h-3.5" /> บันทึก
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200"
                          >
                            <X className="w-3.5 h-3.5" /> ยกเลิก
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="grid gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">
                              ชื่อฝ่าย (ไทย)
                            </label>
                            <input
                              type="text"
                              value={editForm.name || ""}
                              onChange={(e) =>
                                setEditForm({ ...editForm, name: e.target.value })
                              }
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">
                              ชื่อฝ่าย (อังกฤษ)
                            </label>
                            <input
                              type="text"
                              value={editForm.nameEn || ""}
                              onChange={(e) =>
                                setEditForm({ ...editForm, nameEn: e.target.value })
                              }
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-600 mb-1 block">
                            หัวหน้าฝ่าย
                          </label>
                          <select
                            value={editForm.headTeacherId || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                headTeacherId: e.target.value
                                  ? parseInt(e.target.value)
                                  : null,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                          >
                            <option value="">-- ไม่ระบุ --</option>
                            {teachers.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.firstName} {t.lastName}{" "}
                                {t.position ? `(${t.position})` : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-600 mb-1 block">
                            คำอธิบาย
                          </label>
                          <textarea
                            value={editForm.description || ""}
                            onChange={(e) =>
                              setEditForm({ ...editForm, description: e.target.value })
                            }
                            rows={4}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-600 space-y-2">
                        <p>
                          <span className="font-semibold text-slate-700">หัวหน้าฝ่าย:</span>{" "}
                          {div.headTeacher
                            ? `${div.headTeacher.firstName} ${div.headTeacher.lastName}`
                            : "ยังไม่ได้กำหนด"}
                        </p>
                        <p className="line-clamp-2">
                          <span className="font-semibold text-slate-700">คำอธิบาย:</span>{" "}
                          {div.description?.split("\n")[0] || "ไม่มี"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Members List */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-slate-700 text-sm">
                        สมาชิกในฝ่าย ({div.members?.length || 0})
                      </h4>
                      <button
                        onClick={() =>
                          setAddingMemberTo(addingMemberTo === div.id ? null : div.id)
                        }
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> เพิ่มสมาชิก
                      </button>
                    </div>

                    {/* Add Member Form */}
                    {addingMemberTo === div.id && (
                      <div className="bg-indigo-50 rounded-xl p-4 mb-4 border border-indigo-100">
                        <div className="grid gap-3">
                          <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">
                              ค้นหาครู
                            </label>
                            <div className="relative">
                              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                type="text"
                                placeholder="พิมพ์ชื่อครู..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">
                              เลือกครู
                            </label>
                            <select
                              value={selectedTeacherId || ""}
                              onChange={(e) =>
                                setSelectedTeacherId(
                                  e.target.value ? parseInt(e.target.value) : null
                                )
                              }
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            >
                              <option value="">-- เลือกครู --</option>
                              {filteredTeachers(div.members || []).map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.firstName} {t.lastName}{" "}
                                  {t.position ? `(${t.position})` : ""}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">
                              บทบาท (ไม่บังคับ)
                            </label>
                            <input
                              type="text"
                              placeholder="เช่น หัวหน้างาน, คณะกรรมการ"
                              value={memberRole}
                              onChange={(e) => setMemberRole(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                setAddingMemberTo(null);
                                setSearchTerm("");
                              }}
                              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white rounded-lg border border-slate-200 hover:bg-slate-50"
                            >
                              ยกเลิก
                            </button>
                            <button
                              onClick={() => handleAddMember(div.id)}
                              disabled={!selectedTeacherId}
                              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              เพิ่ม
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Members Grid */}
                    {div.members && div.members.length > 0 ? (
                      <div className="space-y-2">
                        {div.members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
                          >
                            <GripVertical className="w-4 h-4 text-slate-300 shrink-0 cursor-grab" />
                            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
                              {member.teacher.photoUrl ||
                              member.teacher.user?.avatarUrl ? (
                                <img
                                  src={
                                    member.teacher.photoUrl ||
                                    member.teacher.user?.avatarUrl ||
                                    ""
                                  }
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-sm font-bold text-slate-400">
                                  {member.teacher.firstName?.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-slate-800 truncate">
                                {member.teacher.firstName} {member.teacher.lastName}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {member.role || member.teacher.position || "สมาชิก"}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveMember(div.id, member.id)}
                              className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 rounded-lg hover:bg-red-50"
                              title="ลบสมาชิก"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-400 text-sm">
                        <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        ยังไม่มีสมาชิกในฝ่ายนี้
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {divisions.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">ไม่พบข้อมูลฝ่ายบริหาร</h3>
          <p className="text-sm text-slate-500 mt-1">
            กรุณารัน seed script เพื่อสร้างข้อมูลฝ่ายบริหาร 4 ฝ่าย
          </p>
        </div>
      )}
    </div>
  );
}
