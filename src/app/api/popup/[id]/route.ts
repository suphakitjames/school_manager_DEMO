import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const bannerId = parseInt(id, 10);
    
    if (isNaN(bannerId)) {
        return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const { title, imageUrl, linkUrl, isActive, expiresAt } = body;

    const banner = await prisma.popupBanner.update({
      where: { id: bannerId },
      data: {
        title,
        imageUrl,
        linkUrl,
        isActive,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.error("Error updating popup banner:", error);
    return NextResponse.json(
      { error: "Failed to update popup banner" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const bannerId = parseInt(id, 10);
    
    if (isNaN(bannerId)) {
        return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await prisma.popupBanner.delete({
      where: { id: bannerId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting popup banner:", error);
    return NextResponse.json(
      { error: "Failed to delete popup banner" },
      { status: 500 }
    );
  }
}
