import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const { isActive } = await req.json();

    const updatedFee = await prisma.feeType.update({
      where: { id },
      data: { isActive }
    });

    return NextResponse.json(updatedFee);
  } catch (error) {
    console.error("[PATCH /api/finance/fees/[id]]", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดตสถานะ" }, { status: 500 });
  }
}
