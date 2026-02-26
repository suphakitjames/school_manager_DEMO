import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null, locale = "th-TH") {
  if (!date) return "-";
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatThaiDate(date: Date | string | null) {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatCurrency(amount: number | string) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
  }).format(num);
}

export function generateReceiptNo(prefix = "RCP") {
  const now = new Date();
  const year = now.getFullYear() + 543; // Buddhist year
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `${prefix}-${year}${month}${day}-${rand}`;
}

export function calculateGrade(totalScore: number): { letter: string; gpa: number } {
  if (totalScore >= 80) return { letter: "A", gpa: 4.0 };
  if (totalScore >= 75) return { letter: "B+", gpa: 3.5 };
  if (totalScore >= 70) return { letter: "B", gpa: 3.0 };
  if (totalScore >= 65) return { letter: "C+", gpa: 2.5 };
  if (totalScore >= 60) return { letter: "C", gpa: 2.0 };
  if (totalScore >= 55) return { letter: "D+", gpa: 1.5 };
  if (totalScore >= 50) return { letter: "D", gpa: 1.0 };
  return { letter: "F", gpa: 0.0 };
}

export function getAttendanceColor(status: string) {
  switch (status) {
    case "PRESENT": return "text-green-600 bg-green-50";
    case "ABSENT": return "text-red-600 bg-red-50";
    case "LATE": return "text-yellow-600 bg-yellow-50";
    case "LEAVE": return "text-blue-600 bg-blue-50";
    default: return "text-gray-600 bg-gray-50";
  }
}

export function getAttendanceLabel(status: string) {
  switch (status) {
    case "PRESENT": return "มาเรียน";
    case "ABSENT": return "ขาดเรียน";
    case "LATE": return "มาสาย";
    case "LEAVE": return "ลา";
    default: return status;
  }
}

export function getRoleLabel(role: string) {
  switch (role) {
    case "SUPER_ADMIN": return "ผู้ดูแลระบบ";
    case "ADMIN": return "ผู้บริหาร";
    case "TEACHER": return "ครู";
    case "STUDENT": return "นักเรียน";
    case "PARENT": return "ผู้ปกครอง";
    default: return role;
  }
}

export function getDayLabel(day: number) {
  const days = ["", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];
  return days[day] || "";
}

export function truncate(str: string, length = 50) {
  return str.length > length ? str.substring(0, length) + "..." : str;
}
