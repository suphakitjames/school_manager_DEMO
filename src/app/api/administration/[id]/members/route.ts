import prisma from "@/lib/db";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{ id: string }>;
}

// POST — add member to division
export async function POST(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const member = await prisma.divisionMember.create({
      data: {
        divisionId: parseInt(id),
        teacherId: body.teacherId,
        role: body.role || null,
        order: body.order || 0,
      },
    });
    return NextResponse.json(member, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Teacher already in this division" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
  }
}

// DELETE — remove member from division
export async function DELETE(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");

    if (!memberId) {
      return NextResponse.json({ error: "memberId is required" }, { status: 400 });
    }

    await prisma.divisionMember.delete({
      where: {
        id: parseInt(memberId),
        divisionId: parseInt(id),
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
