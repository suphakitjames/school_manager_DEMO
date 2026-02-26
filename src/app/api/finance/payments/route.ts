import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ทุกสถานะ";
    const classroomId = searchParams.get("classroomId") || "ทุกห้อง";

    // 1. Find active academic year
    const activeYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    });

    if (!activeYear) {
      return NextResponse.json({ error: "ไม่พบปีการศึกษาที่ใช้งานอยู่" }, { status: 404 });
    }

    // 2. Fetch active fee types for this year
    const feeTypes = await prisma.feeType.findMany({
      where: { 
        academicYearId: activeYear.id,
        isActive: true,
      },
    });

    const activeFeeTypeIds = feeTypes.map(f => f.id);
    const expectedAmountTotal = feeTypes.reduce((sum, f) => sum + Number(f.amount), 0);

    const whereClause: any = {
      status: "ACTIVE",
      classroom: {
        academicYearId: activeYear.id,
      }
    };

    if (search) {
      whereClause.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { studentCode: { contains: search } },
      ];
    }

    if (classroomId !== "ทุกห้อง") {
      whereClause.classroomId = Number(classroomId);
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        classroom: {
          include: {
            grade: true
          }
        },
        payments: {
          where: {
            feeTypeId: { in: activeFeeTypeIds },
          },
          orderBy: {
            paymentDate: 'desc'
          }
        },
      },
      orderBy: [
        { classroomId: 'asc' },
        { id: 'asc' }
      ]
    });

    let results = students.map(student => {
      const studentPaid = student.payments.reduce((sum, p) => sum + Number(p.amountPaid), 0);
      let studentStatus = "ค้างชำระ";
      if (studentPaid >= expectedAmountTotal && expectedAmountTotal > 0) {
        studentStatus = "ชำระแล้ว";
      } else if (studentPaid > 0) {
        studentStatus = "ชำระบางส่วน";
      }

      // get latest payment date
      const lastPayment = student.payments.length > 0 ? student.payments[0] : null;
      let lastPaymentDate = "-";
      let method = "-";

      if (lastPayment) {
        lastPaymentDate = new Intl.DateTimeFormat('th-TH', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        }).format(new Date(lastPayment.paymentDate));
        method = lastPayment.paymentMethod === 'CASH' ? 'เงินสด' : lastPayment.paymentMethod === 'TRANSFER' ? 'โอนเงิน' : 'อื่นๆ';
      }

      const className = student.classroom ? student.classroom.name : '-';

      return {
        id: student.id,
        student: `${student.firstName} ${student.lastName}`,
        class: className,
        fee: `ค่าเทอม ${activeYear.semester}/${activeYear.year}`,
        amount: expectedAmountTotal,
        paid: studentPaid,
        date: lastPaymentDate,
        method: method,
        status: studentStatus,
        history: student.payments.map(p => ({
          id: p.id,
          amountPaid: Number(p.amountPaid),
          paymentDate: p.paymentDate,
          receiptNo: p.receiptNo,
          paymentMethod: p.paymentMethod,
          feeTypeId: p.feeTypeId,
          feeTypeName: feeTypes.find(f => f.id === p.feeTypeId)?.name || 'ไม่ทราบรายการ'
        })),
        feeTypes: feeTypes.map(f => ({
          id: f.id,
          name: f.name,
          amount: Number(f.amount),
          paid: student.payments.filter(p => p.feeTypeId === f.id).reduce((s, p) => s + Number(p.amountPaid), 0)
        }))
      };
    });

    if (status !== "ทุกสถานะ") {
      results = results.filter(r => r.status === status);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("[GET /api/finance/payments]", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลการชำระเงิน" }, { status: 500 });
  }
}
