import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return NextResponse.json(subjects);
  } catch (error) {
    console.error("[GET /api/subjects]", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลวิชาเรียน" }, { status: 500 });
  }
}
