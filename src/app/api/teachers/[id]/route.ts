import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { firstName, lastName, gender, phone, position, department, qualification, joinDate, role, isExecutive, executiveOrder, photoUrl, isActive } = body;

    const updateData: any = {
      firstName,
      lastName,
      gender: gender || null,
      phone: phone || null,
      position: position || null,
      department: department || null,
      qualification: qualification || null,
      photoUrl: photoUrl || null,
      joinDate: joinDate ? new Date(joinDate) : null,
    };

    if (isExecutive !== undefined) {
      updateData.isExecutive = isExecutive;
      updateData.executiveOrder = isExecutive ? Number(executiveOrder || 99) : 99;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const teacher = await prisma.teacher.update({
      where: { id: Number(id) },
      data: updateData,
    });

    // Update user name and avatar too
    const userUpdateData: any = { 
      name: `${firstName} ${lastName}`, 
      phone: phone || null,
      avatarUrl: photoUrl || null,
    };

    if (role) {
      userUpdateData.role = role;
    }

    if (isActive !== undefined) {
      userUpdateData.isActive = isActive;
    }

    await prisma.user.update({
      where: { id: teacher.userId },
      data: userUpdateData,
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
