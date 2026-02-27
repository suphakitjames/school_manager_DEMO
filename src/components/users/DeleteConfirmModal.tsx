import { AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  userName?: string;
  isLoading?: boolean;
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, userName, isLoading }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-center p-6">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
          <AlertTriangle className="w-8 h-8" />
        </div>
        
        <h2 className="text-xl font-bold text-slate-800 mb-2">ยืนยันการลบ</h2>
        <p className="text-slate-500 text-sm mb-6">
          คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งาน <strong className="text-slate-700">{userName}</strong>?<br/>
          การกระทำนี้ไม่สามารถกู้คืนได้
        </p>

        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex-1"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex-1 flex items-center justify-center gap-2"
          >
            {isLoading ? "กำลังลบ..." : "ลบข้อมูล"}
          </button>
        </div>
      </div>
    </div>
  );
}
