import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Only fetch settings (id = 1)
export async function GET() {
  try {
    let settings = await prisma.schoolSetting.findFirst();

    if (!settings) {
      settings = await prisma.schoolSetting.create({
        data: {
          name: "โรงเรียนตัวอย่าง",
        },
      });
    }

    return NextResponse.json({
      maintenanceMode: settings.maintenanceMode,
      debugMode: settings.debugMode,
      // Fake metrics for now since we don't have real OS level stats in the frontend yet
      storageUsedGb: 45.2,
      storageTotalGb: 100,
      version: "v2.5.0",
      status: settings.maintenanceMode ? "maintenance" : "online",
    });
  } catch (error) {
    console.error("Error fetching system settings:", error);
    return NextResponse.json({ error: "Failed to fetch system settings" }, { status: 500 });
  }
}

// Update settings
export async function PUT(req: Request) {
  try {
    const data = await req.json();

    let settings = await prisma.schoolSetting.findFirst();

    if (!settings) {
      settings = await prisma.schoolSetting.create({
        data: {
          name: "โรงเรียนตัวอย่าง",
        },
      });
    }

    const updated = await prisma.schoolSetting.update({
      where: { id: settings.id },
      data: {
        maintenanceMode: data.maintenanceMode !== undefined ? data.maintenanceMode : settings.maintenanceMode,
        debugMode: data.debugMode !== undefined ? data.debugMode : settings.debugMode,
      },
    });

    return NextResponse.json({
      maintenanceMode: updated.maintenanceMode,
      debugMode: updated.debugMode,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating system settings:", error);
    return NextResponse.json({ error: "Failed to update system settings" }, { status: 500 });
  }
}
