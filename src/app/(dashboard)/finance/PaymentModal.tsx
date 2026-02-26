"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export function PaymentModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  preselectedStudent,
  studentsList
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSuccess: () => void;
  preselectedStudent?: any;
  studentsList: any[];
}) {
  const [studentId, setStudentId] = useState("");
  const [feeTypeId, setFeeTypeId] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStudentId(preselectedStudent?.id ? String(preselectedStudent.id) : "");
      setFeeTypeId("");
      setAmountPaid("");
      setPaymentMethod("CASH");
      setNote("");
    }
  }, [isOpen, preselectedStudent]);

  if (!isOpen) return null;

  const selectedStudentData = preselectedStudent || studentsList.find(s => s.id === Number(studentId));
  const availableFeeTypes = selectedStudentData?.feeTypes || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/finance/payments/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: Number(studentId),
          feeTypeId: Number(feeTypeId),
          amountPaid: Number(amountPaid),
          paymentMethod,
          note
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || "บันทึกไม่สำเร็จ");
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">บันทึกการชำระเงิน</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">นักเรียน</label>
            {preselectedStudent ? (
              <input 
                type="text" 
                value={preselectedStudent.student} 
                disabled 
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none"
              />
            ) : (
              <select 
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">เลือกนักเรียน</option>
                {studentsList.map(s => (
                  <option key={s.id} value={s.id}>{s.student} ({s.class})</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">รายการชำระ</label>
            <select 
              required
              value={feeTypeId}
              onChange={(e) => {
                setFeeTypeId(e.target.value);
                // Auto fill amount if needed
                const fee = availableFeeTypes.find((f: any) => f.id === Number(e.target.value));
                if (fee) {
                  const remaining = fee.amount - fee.paid;
                  if (remaining > 0) setAmountPaid(remaining.toString());
                }
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">เลือกรายการ</option>
              {availableFeeTypes.map((f: any) => {
                const remaining = f.amount - f.paid;
                return (
                  <option key={f.id} value={f.id}>
                    {f.name} (ค้างชำระ: ฿{remaining.toLocaleString()})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">จำนวนเงิน (บาท)</label>
            <input 
              required
              type="number"
              min="1"
              step="0.01"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ช่องทางชำระเงิน</label>
            <select 
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="CASH">เงินสด</option>
              <option value="TRANSFER">โอนเงิน</option>
              <option value="OTHER">อื่นๆ</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">หมายเหตุ (ถ้ามี)</label>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
            >
              {isSubmitting ? "กำลังบันทึก..." : "ยืนยันการชำระเงิน"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
