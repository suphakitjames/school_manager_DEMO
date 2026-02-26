import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const gradeId = searchParams.get("gradeId");
    const status = searchParams.get("status");

    const students = await prisma.student.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { firstName: { contains: search } },
                  { lastName: { contains: search } },
                  { studentCode: { contains: search } },
                ],
              }
            : {},
          gradeId ? { classroom: { gradeId: Number(gradeId) } } : {},
          status ? { status: status as "ACTIVE" | "INACTIVE" | "TRANSFERRED" | "GRADUATED" } : {},
        ],
      },
      include: {
        classroom: {
          include: { grade: true },
        },
      },
      orderBy: { studentCode: "asc" },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("[GET /api/students]", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      studentCode, firstName, lastName, firstNameEn, lastNameEn,
      dob, gender, nationalId, bloodType, address, classroomId,
      enrollDate, status, parentName, parentPhone, parentEmail, parentLine,
    } = body;

    if (!studentCode || !firstName || !lastName) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลที่จำเป็น" }, { status: 400 });
    }

    const student = await prisma.student.create({
      data: {
        studentCode,
        firstName,
        lastName,
        firstNameEn: firstNameEn || null,
        lastNameEn: lastNameEn || null,
        dob: dob ? new Date(dob) : null,
        gender: gender || null,
        nationalId: nationalId || null,
        bloodType: bloodType || null,
        address: address || null,
        classroomId: classroomId ? Number(classroomId) : null,
        enrollDate: enrollDate ? new Date(enrollDate) : null,
        status: status || "ACTIVE",
        parentName: parentName || null,
        parentPhone: parentPhone || null,
        parentEmail: parentEmail || null,
        parentLine: parentLine || null,
      },
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error: unknown) {
    console.error("[POST /api/students]", error);
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "รหัสนักเรียนซ้ำ" }, { status: 400 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
