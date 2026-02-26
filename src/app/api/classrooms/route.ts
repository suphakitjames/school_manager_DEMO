import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const classrooms = await prisma.classroom.findMany({
      include: {
        grade: true,
        teacher: { select: { firstName: true, lastName: true } },
        _count: {
          select: { students: true },
        },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(classrooms);
  } catch (error) {
    console.error("[GET /api/classrooms]", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, gradeId, teacherId, capacity } = body;

    if (!name || !gradeId) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลที่จำเป็น" }, { status: 400 });
    }

    // Find active academic year
    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    });

    if (!academicYear) {
      return NextResponse.json({ error: "ไม่พบปีการศึกษาที่ใช้งานอยู่ กรุณาตั้งค่าปีการศึกษาก่อน" }, { status: 400 });
    }

    const newClassroom = await prisma.classroom.create({
      data: {
        name,
        gradeId: Number(gradeId),
        academicYearId: academicYear.id,
        teacherId: teacherId ? Number(teacherId) : null,
        capacity: capacity ? Number(capacity) : 40,
      },
      include: {
        grade: true,
        teacher: { select: { firstName: true, lastName: true } },
        _count: {
          select: { students: true },
        },
      },
    });

    return NextResponse.json(newClassroom, { status: 201 });
  } catch (error) {
    console.error("[POST /api/classrooms]", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างห้องเรียน" }, { status: 500 });
  }
}
