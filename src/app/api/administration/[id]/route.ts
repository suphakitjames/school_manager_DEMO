import prisma from "@/lib/db";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{ id: string }>;
}

// GET — single division with members
export async function GET(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const division = await prisma.administrativeDivision.findUnique({
      where: { id: parseInt(id) },
      include: {
        headTeacher: { include: { user: true } },
        members: {
          orderBy: { order: "asc" },
          include: {
            teacher: { include: { user: true } },
          },
        },
      },
    });
    if (!division) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(division);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch division" }, { status: 500 });
  }
}

// PUT — update division
export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const division = await prisma.administrativeDivision.update({
      where: { id: parseInt(id) },
      data: {
        name: body.name,
        nameEn: body.nameEn,
        description: body.description,
        icon: body.icon,
        coverImage: body.coverImage,
        headTeacherId: body.headTeacherId || null,
        order: body.order,
        isActive: body.isActive,
      },
    });
    return NextResponse.json(division);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update division" }, { status: 500 });
  }
}

// DELETE — delete division
export async function DELETE(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.administrativeDivision.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete division" }, { status: 500 });
  }
}
