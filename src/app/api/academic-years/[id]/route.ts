import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();
    const { year, semester, startDate, endDate, isActive } = body;

    // If making this one active, deactivate others
    if (isActive) {
      await prisma.academicYear.updateMany({
        where: { id: { not: id }, isActive: true },
        data: { isActive: false }
      });
    }

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const updated = await prisma.academicYear.update({
      where: { id },
      data: {
        year,
        semester: semester ? Number(semester) : undefined,
        startDate: start,
        endDate: end,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(`[PUT /api/academic-years/${params.id}]`, error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    
    // Optional: check if there are related classrooms before deleting
    // If Prisma restrictions apply, this will throw an error automatically 
    // or we can explicitly prevent it here.

    await prisma.academicYear.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[DELETE /api/academic-years/${params.id}]`, error);
    return NextResponse.json({ error: "ไม่สามารถลบปีการศึกษาได้ เนื่องจากอาจมีข้อมูลที่เชื่อมโยงอยู่" }, { status: 500 });
  }
}
