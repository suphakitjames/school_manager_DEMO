import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Public API endpoint for middleware to check maintenance mode
export async function GET() {
  try {
    const settings = await prisma.schoolSetting.findFirst({
      select: { maintenanceMode: true },
    });

    return NextResponse.json({
      maintenance: settings?.maintenanceMode ?? false,
    });
  } catch (error) {
    console.error("Error checking maintenance status:", error);
    // Default to NOT in maintenance if there's an error
    return NextResponse.json({ maintenance: false });
  }
}
