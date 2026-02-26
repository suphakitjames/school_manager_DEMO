import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const student = await prisma.student.findUnique({
      where: { id: Number(id) },
      include: { classroom: { include: { grade: true } } },
    });
    if (!student) return NextResponse.json({ error: "ไม่พบนักเรียน" }, { status: 404 });
    return NextResponse.json(student);
  } catch (error) {
    console.error("[GET /api/students/[id]]", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      studentCode, firstName, lastName, firstNameEn, lastNameEn,
      dob, gender, nationalId, bloodType, address, classroomId,
      enrollDate, status, parentName, parentPhone, parentEmail, parentLine,
    } = body;

    const student = await prisma.student.update({
      where: { id: Number(id) },
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
    return NextResponse.json(student);
  } catch (error) {
    console.error("[PUT /api/students/[id]]", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.student.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/students/[id]]", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
