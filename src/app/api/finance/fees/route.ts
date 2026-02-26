import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const activeYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    });

    if (!activeYear) {
      return NextResponse.json({ error: "ไม่พบปีการศึกษาที่ใช้งานอยู่" }, { status: 404 });
    }

    const fees = await prisma.feeType.findMany({
      where: { academicYearId: activeYear.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(fees);
  } catch (error) {
    console.error("[GET /api/finance/fees]", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, amount, description } = await req.json();

    if (!name || isNaN(amount)) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    const activeYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    });

    if (!activeYear) {
      return NextResponse.json({ error: "ไม่พบปีการศึกษาที่ใช้งานอยู่" }, { status: 404 });
    }

    const newFee = await prisma.feeType.create({
      data: {
        name,
        amount: Number(amount),
        description,
        academicYearId: activeYear.id,
        isActive: true
      }
    });

    return NextResponse.json(newFee);
  } catch (error) {
    console.error("[POST /api/finance/fees]", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการบันทึกค่าธรรมเนียม" }, { status: 500 });
  }
}
