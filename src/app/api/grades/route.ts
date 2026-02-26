import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const grades = await prisma.grade.findMany({
      orderBy: [
        { level: "asc" },
        { name: "asc" },
      ],
    });
    return NextResponse.json(grades);
  } catch (error) {
    console.error("[GET /api/grades]", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
