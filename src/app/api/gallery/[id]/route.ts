import { NextResponse } from "next/server";
import prisma from "@/lib/db";

interface Props {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, coverImage, images, facebookUrl, date, isActive } = body;

    const gallery = await prisma.activityGallery.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        coverImage,
        images: images !== undefined ? images : undefined,
        facebookUrl: facebookUrl !== undefined ? facebookUrl : undefined,
        date: date ? new Date(date) : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      }
    });

    return NextResponse.json(gallery);
  } catch (error) {
    console.error("Error updating gallery:", error);
    return NextResponse.json(
      { error: "Failed to update gallery" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Props) {
  try {
    const { id } = await params;

    await prisma.activityGallery.delete({
      where: { id: Number(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting gallery:", error);
    return NextResponse.json(
      { error: "Failed to delete gallery" },
      { status: 500 }
    );
  }
}
