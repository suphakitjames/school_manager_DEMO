import prisma from "@/lib/db";
import { NextResponse } from "next/server";

// GET — list all divisions
export async function GET() {
  try {
    const divisions = await prisma.administrativeDivision.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        headTeacher: {
          include: { user: true },
        },
        _count: { select: { members: true } },
      },
    });
    return NextResponse.json(divisions);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch divisions" }, { status: 500 });
  }
}

// POST — create new division
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const division = await prisma.administrativeDivision.create({
      data: {
        name: body.name,
        nameEn: body.nameEn || null,
        description: body.description || null,
        icon: body.icon || null,
        coverImage: body.coverImage || null,
        headTeacherId: body.headTeacherId || null,
        order: body.order || 0,
      },
    });
    return NextResponse.json(division, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create division" }, { status: 500 });
  }
}
