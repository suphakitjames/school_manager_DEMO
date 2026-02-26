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
