import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { firstName, lastName, gender, phone, position, department, qualification, joinDate } = body;

    const teacher = await prisma.teacher.update({
      where: { id: Number(id) },
      data: {
        firstName,
        lastName,
        gender: gender || null,
        phone: phone || null,
        position: position || null,
        department: department || null,
        qualification: qualification || null,
        joinDate: joinDate ? new Date(joinDate) : null,
      },
    });

    // Update user name too
    await prisma.user.update({
      where: { id: teacher.userId },
      data: { name: `${firstName} ${lastName}`, phone: phone || null },
    });

    return NextResponse.json(teacher);
  } catch (error) {
    console.error("[PUT /api/teachers/[id]]", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const teacher = await prisma.teacher.findUnique({
      where: { id: Number(id) },
      select: { userId: true },
    });
    if (!teacher) return NextResponse.json({ error: "ไม่พบครู" }, { status: 404 });

    await prisma.teacher.delete({ where: { id: Number(id) } });
    await prisma.user.delete({ where: { id: teacher.userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/teachers/[id]]", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
