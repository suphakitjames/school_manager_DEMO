import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET Notification Settings
export async function GET() {
  try {
    let settings = await prisma.notificationSetting.findFirst();

    // If no settings exist yet, create default
    if (!settings) {
      settings = await prisma.notificationSetting.create({
        data: {
          emailEnabled: false,
          lineEnabled: false,
          smsEnabled: false,
          notifyAttendance: true,
          notifyGrades: true,
          notifyAnnouncements: true,
          notifyPayments: false,
        },
      });
    }

    // Hide password for security when sending to frontend
    const { smtpPassword, ...safeSettings } = settings;

    return NextResponse.json({
      ...safeSettings,
      hasSmtpPassword: !!smtpPassword, // Just tell frontend if it's set or not
    });
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification settings" },
      { status: 500 }
    );
  }
}

// UPDATE Notification Settings
export async function PUT(req: Request) {
  try {
    const data = await req.json();

    const existingSettings = await prisma.notificationSetting.findFirst();

    // If frontend sends empty password, it means "don't change the existing password"
    // So we remove it from the update payload
    if (data.smtpPassword === "") {
      delete data.smtpPassword;
    }

    // Remove the helper boolean before saving
    delete data.hasSmtpPassword;

    let updatedSettings;

    if (existingSettings) {
      updatedSettings = await prisma.notificationSetting.update({
        where: { id: existingSettings.id },
        data,
      });
    } else {
      updatedSettings = await prisma.notificationSetting.create({
        data,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return NextResponse.json(
      { error: "Failed to update notification settings" },
      { status: 500 }
    );
  }
}
