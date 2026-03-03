import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const galleries = await prisma.activityGallery.findMany({
      where: search ? {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } }
        ]
      } : undefined,
      orderBy: { date: "desc" }
    });

    return NextResponse.json(galleries);
  } catch (error) {
    console.error("Error fetching galleries:", error);
    return NextResponse.json(
      { error: "Failed to fetch galleries" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, coverImage, images, facebookUrl, date, isActive } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const gallery = await prisma.activityGallery.create({
      data: {
        title,
        description,
        coverImage,
        images: images || [],
        facebookUrl,
        date: date ? new Date(date) : new Date(),
        isActive: isActive !== undefined ? isActive : true,
      }
    });

    return NextResponse.json(gallery, { status: 201 });
  } catch (error) {
    console.error("Error creating gallery:", error);
    return NextResponse.json(
      { error: "Failed to create gallery" },
      { status: 500 }
    );
  }
}
