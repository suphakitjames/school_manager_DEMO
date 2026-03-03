import { NextResponse } from "next/server";
import { PrismaClient, LandingLinkType } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const body = await req.json();

    const link = await prisma.landingLink.update({
      where: { id },
      data: {
        ...body,
        type: body.type as LandingLinkType | undefined,
      },
    });

    return NextResponse.json(link);
  } catch (error) {
    console.error("Error updating landing link:", error);
    return NextResponse.json(
      { error: "Failed to update landing link" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    await prisma.landingLink.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting landing link:", error);
    return NextResponse.json(
      { error: "Failed to delete landing link" },
      { status: 500 }
    );
  }
}
