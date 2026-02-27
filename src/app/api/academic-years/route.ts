import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const academicYears = await prisma.academicYear.findMany({
      orderBy: [
        { year: "desc" },
        { semester: "desc" },
      ],
    });
    return NextResponse.json(academicYears);
  } catch (error) {
    console.error("[GET /api/academic-years]", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลปีการศึกษา" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { year, semester, startDate, endDate, isActive } = body;

    // If this one is active, and we only want one active at a time:
    if (isActive) {
      await prisma.academicYear.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const newAcademicYear = await prisma.academicYear.create({
      data: {
        year,
        semester: Number(semester),
        startDate: start,
        endDate: end,
        isActive: Boolean(isActive)
      }
    });

    return NextResponse.json(newAcademicYear, { status: 201 });
  } catch (error) {
    console.error("[POST /api/academic-years]", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างปีการศึกษา" }, { status: 500 });
  }
}
