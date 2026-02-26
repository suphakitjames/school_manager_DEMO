"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

type Classroom = { id: number; name: string; grade: { name: string } };

export default function NewStudentPage() {
  const router = useRouter();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/classrooms").then(r => r.json()).then(setClassrooms);
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const data = {
      studentCode:  fd.get("studentCode"),
      firstName:    fd.get("firstName"),
      lastName:     fd.get("lastName"),
      firstNameEn:  fd.get("firstNameEn"),
      lastNameEn:   fd.get("lastNameEn"),
      dob:          fd.get("dob"),
      gender:       fd.get("gender"),
      nationalId:   fd.get("nationalId"),
      bloodType:    fd.get("bloodType"),
      address:      fd.get("address"),
      classroomId:  fd.get("classroomId"),
      enrollDate:   fd.get("enrollDate"),
      status:       fd.get("status") || "ACTIVE",
      parentName:   fd.get("parentName"),
      parentPhone:  fd.get("parentPhone"),
      parentEmail:  fd.get("parentEmail"),
      parentLine:   fd.get("parentLine"),
    };

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        router.push("/students");
      } else {
        const d = await res.json();
        setError(d.error || "บันทึกไม่สำเร็จ");
      }
    } finally {
      setSaving(false);
    }
  };

  type Field = { label: string; name: string; placeholder: string; type?: string; required?: boolean; options?: string[]; colSpan?: boolean };
  const sections: { title: string; fields: Field[] }[] = [
    {
      title: "ข้อมูลส่วนตัว",
      fields: [
        { label: "รหัสนักเรียน", name: "studentCode", placeholder: "67001", required: true },
        { label: "เพศ", name: "gender", placeholder: "", type: "select", options: ["MALE|ชาย", "FEMALE|หญิง", "OTHER|อื่นๆ"] },
        { label: "ชื่อ (ภาษาไทย)", name: "firstName", placeholder: "สมชาย", required: true },
        { label: "นามสกุล (ภาษาไทย)", name: "lastName", placeholder: "ใจดี", required: true },
        { label: "ชื่อ (ภาษาอังกฤษ)", name: "firstNameEn", placeholder: "Somchai" },
        { label: "นามสกุล (ภาษาอังกฤษ)", name: "lastNameEn", placeholder: "Jaidee" },
        { label: "วันเดือนปีเกิด", name: "dob", placeholder: "", type: "date" },
        { label: "หมายเลขบัตรประชาชน", name: "nationalId", placeholder: "1-XXXX-XXXXX-XX-X" },
        { label: "หมู่เลือด", name: "bloodType", placeholder: "", type: "select", options: ["A", "B", "AB", "O"] },
      ],
    },
    {
      title: "ข้อมูลการศึกษา",
      fields: [
        { label: "ห้องเรียน", name: "classroomId", placeholder: "", type: "classroom" },
        { label: "วันที่เข้าเรียน", name: "enrollDate", placeholder: "", type: "date" },
        { label: "สถานะ", name: "status", placeholder: "", type: "select", options: ["ACTIVE|กำลังศึกษา", "INACTIVE|ไม่ใช้งาน", "TRANSFERRED|ย้ายโรงเรียน", "GRADUATED|จบการศึกษา"] },
      ],
    },
    {
      title: "ที่อยู่",
      fields: [
        { label: "ที่อยู่", name: "address", placeholder: "บ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด", colSpan: true },
      ],
    },
    {
      title: "ข้อมูลผู้ปกครอง",
      fields: [
        { label: "ชื่อผู้ปกครอง", name: "parentName", placeholder: "นาย สมศักดิ์ ใจดี" },
        { label: "เบอร์โทร", name: "parentPhone", placeholder: "081-234-5678" },
        { label: "อีเมลผู้ปกครอง", name: "parentEmail", placeholder: "parent@email.com", type: "email" },
        { label: "Line ID", name: "parentLine", placeholder: "@lineid" },
      ],
    },
  ];

  const fieldClass = "w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/students" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">ลงทะเบียนนักเรียนใหม่</h1>
          <p className="text-slate-500 text-sm">กรอกข้อมูลนักเรียนให้ครบถ้วน</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-semibold text-slate-800 mb-5 pb-3 border-b border-slate-100">{section.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {section.fields.map((field) => (
                <div key={field.name} className={field.colSpan ? "sm:col-span-2" : ""}>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.type === "classroom" ? (
                    <select name={field.name} className={fieldClass}>
                      <option value="">-- เลือกห้องเรียน --</option>
                      {classrooms.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.grade.name})</option>
                      ))}
                    </select>
                  ) : field.type === "select" ? (
                    <select name={field.name} className={fieldClass}>
                      <option value="">-- เลือก --</option>
                      {field.options?.map(opt => {
                        const [val, label] = opt.includes("|") ? opt.split("|") : [opt, opt];
                        return <option key={val} value={val}>{label}</option>;
                      })}
                    </select>
                  ) : field.colSpan ? (
                    <textarea name={field.name} placeholder={field.placeholder} rows={3}
                      className={`${fieldClass} resize-none`} />
                  ) : (
                    <input type={field.type || "text"} name={field.name} placeholder={field.placeholder}
                      required={field.required} className={fieldClass} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex items-center justify-end gap-3">
          <Link href="/students" className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            ยกเลิก
          </Link>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-60">
            <Save className="w-4 h-4" />
            {saving ? "กำลังบันทึก..." : "บันทึกข้อมูลนักเรียน"}
          </button>
        </div>
      </form>
    </div>
  );
}
