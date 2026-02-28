import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendPaymentReceipt } from "@/lib/email";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    // Optional: add auth checks here
    // const session = await getServerSession(authOptions);
    // if (!session || !session.user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const body = await req.json();
    const { studentId, feeTypeId, amountPaid, paymentMethod, note } = body;

    if (!studentId || !feeTypeId || !amountPaid || !paymentMethod) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    // Generate receipt no (e.g. REC-YYYYMMDD-XXXX)
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    // get count of payments today
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);

    const count = await prisma.paymentRecord.count({
      where: {
        paymentDate: {
          gte: startOfDay,
          lte: endOfDay,
        }
      }
    });

    const receiptNo = `REC-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;

    const payment = await prisma.paymentRecord.create({
      data: {
        studentId: Number(studentId),
        feeTypeId: Number(feeTypeId),
        amountPaid: Number(amountPaid),
        paymentDate: new Date(),
        receiptNo,
        paymentMethod,
        note,
      },
      include: {
        student: true,
        feeType: true
      }
    });

    // --- Fire Email Async ---
    if (payment.student && payment.student.parentEmail) {
      sendPaymentReceipt(
        payment.student.parentEmail,
        `${payment.student.firstName} ${payment.student.lastName}`,
        payment.feeType.name,
        Number(payment.amountPaid),
        payment.receiptNo,
        payment.paymentDate
      ).catch(err => console.error("Async email error:", err));
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error("[POST /api/finance/payments/record]", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการบันทึกการชำระเงิน" }, { status: 500 });
  }
}
