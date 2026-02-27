import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // School settings usually have only one row in many systems, or we use id = 1
    let setting = await prisma.schoolSetting.findFirst();

    // If no setting exists, create a default one
    if (!setting) {
      setting = await prisma.schoolSetting.create({
        data: {
          name: "โรงเรียนตัวอย่าง",
          email: "info@school.ac.th",
          phone: "02-123-4567",
          website: "https://school.ac.th",
          address: "123 ถนนตัวอย่าง แขวงตัวอย่าง เขตตัวอย่าง กรุงเทพมหานคร 10000",
        },
      });
    }

    return NextResponse.json(setting);
  } catch (error) {
    console.error("Error fetching school settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, website, address, logoUrl } = body;

    // Check if a setting exists
    const existingSetting = await prisma.schoolSetting.findFirst();

    let updatedSetting;

    if (existingSetting) {
      // Update existing
      updatedSetting = await prisma.schoolSetting.update({
        where: { id: existingSetting.id },
        data: {
          name,
          email,
          phone,
          website,
          address,
          logoUrl,
        },
      });
    } else {
      // Create new if somehow deleted
      updatedSetting = await prisma.schoolSetting.create({
        data: {
          name: name || "โรงเรียนตัวอย่าง",
          email,
          phone,
          website,
          address,
          logoUrl,
        },
      });
    }

    return NextResponse.json(updatedSetting);
  } catch (error) {
    console.error("Error updating school settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
