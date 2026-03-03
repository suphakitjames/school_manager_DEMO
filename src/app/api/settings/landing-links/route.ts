import { NextResponse } from "next/server";
import { PrismaClient, LandingLinkType } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const links = await prisma.landingLink.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(links);
  } catch (error) {
    console.error("Error fetching landing links:", error);
    return NextResponse.json(
      { error: "Failed to fetch landing links" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, url, icon, type, isActive, order } = body;

    const link = await prisma.landingLink.create({
      data: {
        title,
        url,
        icon,
        type: type as LandingLinkType || "QUICK_LINK",
        isActive: isActive !== undefined ? isActive : true,
        order: order || 0,
      },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error("Error creating landing link:", error);
    return NextResponse.json(
      { error: "Failed to create landing link" },
      { status: 500 }
    );
  }
}
