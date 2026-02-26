import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
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

    const totalExpectedPerStudent = feeTypes.reduce((sum, fee) => sum + Number(fee.amount), 0);

    // 3. Fetch all active students in the active academic year
    const students = await prisma.student.findMany({
      where: {
        status: "ACTIVE",
        classroom: {
          academicYearId: activeYear.id,
        },
      },
      include: {
        payments: {
          where: {
            feeTypeId: { in: feeTypes.map(f => f.id) },
          },
        },
      },
    });

    let totalCollected = 0;
    let studentsPaid = 0;
    let studentsUnpaid = 0; // including partial

    for (const student of students) {
      const studentPaid = student.payments.reduce((sum, p) => sum + Number(p.amountPaid), 0);
      totalCollected += studentPaid;

      if (studentPaid >= totalExpectedPerStudent) {
        studentsPaid++;
      } else {
        studentsUnpaid++;
      }
    }

    const totalExpected = students.length * totalExpectedPerStudent;
    const totalPending = totalExpected - totalCollected;

    return NextResponse.json({
      totalCollected,
      totalPending,
      totalExpected,
      studentsPaid,
      studentsUnpaid,
      totalStudents: students.length,
    });
  } catch (error) {
    console.error("[GET /api/finance/summary]", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลสรุปการเงิน" }, { status: 500 });
  }
}
