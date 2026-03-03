import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch only teachers marked as executive, ordered by their defined order
    const executives = await prisma.teacher.findMany({
      where: { isExecutive: true, isActive: true },
      orderBy: { executiveOrder: "asc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });

    return NextResponse.json(executives);
  } catch (error) {
    console.error("Error fetching executives:", error);
    return NextResponse.json(
      { error: "Failed to fetch executives" },
      { status: 500 }
    );
  }
}

// Update executive status and order
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { teacherId, isExecutive, executiveOrder } = body;

    if (!teacherId) {
       return NextResponse.json({ error: "Missing teacher id" }, { status: 400 });
    }

    const teacher = await prisma.teacher.update({
      where: { id: parseInt(teacherId) },
      data: {
        isExecutive: isExecutive !== undefined ? isExecutive : undefined,
        executiveOrder: executiveOrder !== undefined ? parseInt(executiveOrder) : undefined,
      },
      include: {
        user: true
      }
    });

    return NextResponse.json(teacher);
  } catch (error) {
    console.error("Error updating executive status:", error);
    return NextResponse.json(
      { error: "Failed to update executive status" },
      { status: 500 }
    );
  }
}
