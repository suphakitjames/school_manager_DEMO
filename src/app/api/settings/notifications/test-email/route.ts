import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { to, subject, text, html } = await req.json();

    if (!to || !subject) {
      return NextResponse.json(
        { error: "Missing required fields (to, subject)" },
        { status: 400 }
      );
    }

    // 1. Fetch SMTP settings from database
    const settings = await prisma.notificationSetting.findFirst();

    if (!settings || !settings.emailEnabled) {
      return NextResponse.json(
        { error: "ระบบส่งอีเมลถูกปิดใช้งาน กรุณาตั้งค่าก่อน" },
        { status: 400 }
      );
    }

    if (!settings.smtpHost || !settings.smtpPort || !settings.smtpUser || !settings.smtpPassword) {
      return NextResponse.json(
        { error: "ข้อมูล SMTP ไม่ครบถ้วน กรุณาตั้งค่าเซิร์ฟเวอร์ก่อนส่ง" },
        { status: 400 }
      );
    }

    // 2. Configure NodeMailer Transport
    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: Number(settings.smtpPort),
      secure: Number(settings.smtpPort) === 465, // true for 465, false for other ports
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPassword,
      },
      tls: {
       rejectUnauthorized: false
      }
    });

    // 3. Send Email
    const info = await transporter.sendMail({
      from: `"ระบบบริหารสถานศึกษา" <${settings.smtpUser}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text: text || "ไม่มีข้อความ", // plain text body
      html: html || `<p>${text || "ไม่มีข้อความ"}</p>`, // html body
    });

    return NextResponse.json({ 
      success: true, 
      messageId: info.messageId 
    });

  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "การส่งอีเมลล้มเหลว: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
}
