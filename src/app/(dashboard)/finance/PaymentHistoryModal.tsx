"use client";

import { X, Printer } from "lucide-react";

export function PaymentHistoryModal({ 
  isOpen, 
  onClose, 
  studentData 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  studentData: any;
}) {
  if (!isOpen || !studentData) return null;

  const handlePrint = (payment: any) => {
    // Generate a basic print window for the receipt
    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0;">ใบเสร็จรับเงิน</h2>
          <p style="margin: 5px 0; color: #666;">โรงเรียนตัวอย่าง</p>
        </div>
        <div style="margin-bottom: 20px;">
          <p><strong>เลขที่ใบเสร็จ:</strong> ${payment.receiptNo || '-'}</p>
          <p><strong>วันที่:</strong> ${new Date(payment.paymentDate).toLocaleDateString('th-TH')}</p>
          <p><strong>นักเรียน:</strong> ${studentData.student} (${studentData.class})</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="border-bottom: 2px solid #ddd;">
              <th style="text-align: left; padding: 8px;">รายการ</th>
              <th style="text-align: right; padding: 8px;">จำนวนเงิน</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${payment.feeTypeName}</td>
              <td style="text-align: right; padding: 8px; border-bottom: 1px solid #eee;">${payment.amountPaid.toLocaleString()} บาท</td>
            </tr>
          </tbody>
        </table>
        <div style="text-align: right;">
          <p style="font-size: 1.2em;"><strong>ยอดรวม: ${payment.amountPaid.toLocaleString()} บาท</strong></p>
          <p style="color: #666;">วิธีชำระ: ${payment.paymentMethod === 'CASH' ? 'เงินสด' : payment.paymentMethod === 'TRANSFER' ? 'โอนเงิน' : 'อื่นๆ'}</p>
        </div>
        <div style="margin-top: 40px; text-align: center; color: #666; font-size: 0.9em;">
          <p>ขอขอบคุณที่ชำระเงิน</p>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${payment.receiptNo || 'New'}</title>
          </head>
          <body onload="setTimeout(() => { window.print(); window.close(); }, 200);">
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">ประวัติการชำระเงิน</h2>
            <p className="text-sm text-slate-500">{studentData.student} - ห้อง {studentData.class}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto">
          {studentData.history && studentData.history.length > 0 ? (
            <div className="space-y-4">
              {studentData.history.map((record: any) => (
                <div key={record.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between hover:border-indigo-300 hover:shadow-md transition-all gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-slate-800">{record.feeTypeName}</span>
                      {record.receiptNo && (
                        <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 font-semibold shadow-sm">
                          {record.receiptNo}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> 
                        วันที่: {new Date(record.paymentDate).toLocaleDateString("th-TH")}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> 
                        วิธีชำระ: {record.paymentMethod === 'CASH' ? 'เงินสด' : record.paymentMethod === 'TRANSFER' ? 'โอนเงิน' : 'อื่นๆ'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:justify-end">
                    <span className="text-xl font-bold text-emerald-600">฿{record.amountPaid.toLocaleString()}</span>
                    <button 
                      onClick={() => handlePrint(record)}
                      className="p-2.5 bg-slate-50 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl transition-all shadow-sm"
                      title="พิมพ์ใบเสร็จ"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">💸</span>
              </div>
              <p className="text-slate-500 font-medium">ไม่มีประวัติการชำระเงิน</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
