"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Edit2, AlertCircle, Save } from "lucide-react";

export function FeeTypeManagerModal({ 
  isOpen, 
  onClose,
  onSuccess
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Fee State
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFees();
      setIsAdding(false);
      resetForm();
    }
  }, [isOpen]);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/finance/fees");
      const data = await res.json();
      setFees(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewName("");
    setNewAmount("");
    setNewDesc("");
  };

  const handleAddFee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/finance/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          amount: Number(newAmount),
          description: newDesc
        })
      });

      if (res.ok) {
        await fetchFees();
        setIsAdding(false);
        resetForm();
        onSuccess(); // Refresh main page
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/finance/fees/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (res.ok) {
        await fetchFees();
        onSuccess();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-slate-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <span className="text-xl">⚙️</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">จัดการรายการค่าธรรมเนียม</h2>
              <p className="text-sm text-slate-500 font-medium mt-0.5">ตั้งค่ารายการเก็บเงินของโรงเรียนเรย์</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto bg-slate-50/50">
          
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-700">รายการทั้งหมด ({fees.length})</h3>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              เพิ่มรายการใหม่
            </button>
          </div>

          {isAdding && (
            <form onSubmit={handleAddFee} className="mb-6 bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm animate-in slide-in-from-top-4">
              <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
                สร้างรายการชำระเงินใหม่
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">ชื่อรายการ <span className="text-red-500">*</span></label>
                  <input 
                    required
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="เช่น ค่าเทอม, ค่าหนังสือ..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">จำนวนเงิน (บาท) <span className="text-red-500">*</span></label>
                  <input 
                    required
                    type="number"
                    min="1"
                    step="0.01"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">รายละเอียด (ทางเลือก)</label>
                  <input 
                    type="text"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="รายละเอียดเพิ่มเติมของรายการนี้..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? "กำลังบันทึก..." : "บันทึกรายการ"}
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-center py-12 text-slate-400">กำลังโหลด...</div>
          ) : fees.length > 0 ? (
            <div className="space-y-3">
              {fees.map((f: any) => (
                <div key={f.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${f.isActive ? 'bg-white border-slate-200 shadow-sm hover:border-indigo-300' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">{f.name}</h4>
                    {f.description && <p className="text-sm text-slate-500 mt-0.5">{f.description}</p>}
                    <span className={`inline-block mt-2 text-xs font-semibold px-2.5 py-1.5 rounded-lg ${f.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                      {f.isActive ? 'กำลังใช้งาน' : 'ปิดใช้งาน'}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className="text-lg font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl">฿{Number(f.amount).toLocaleString()}</span>
                    <button 
                      onClick={() => toggleStatus(f.id, f.isActive)}
                      className={`text-xs font-semibold px-3 py-1.5 border rounded-lg transition-colors ${f.isActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                    >
                      {f.isActive ? 'ปิดการใช้งาน' : 'เปิดการใช้งาน'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">ยังไม่มีรายการค่าธรรมเนียม</p>
              <p className="text-sm text-slate-400 mt-1">กด "เพิ่มรายการใหม่" เพื่อเริ่มต้น</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
