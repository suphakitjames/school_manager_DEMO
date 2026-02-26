import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    if (!id) {
       return NextResponse.json({ error: "ไม่พบรหัสตารางเรียน" }, { status: 400 });
    }

    await prisma.schedule.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "ลบตารางเรียนสำเร็จ" });
  } catch (error) {
    console.error("[DELETE /api/schedules/[id]]", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบตารางเรียน" }, { status: 500 });
  }
}
