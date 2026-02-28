import nodemailer from "nodemailer";
import prisma from "@/lib/db";

/**
 * Creates a configured nodemailer transport based on current DB settings.
 * Returns null if email is disabled or settings are incomplete.
 */
async function getEmailTransporter() {
  const settings = await prisma.notificationSetting.findFirst();

  if (!settings || !settings.emailEnabled) {
    return null;
  }

  if (!settings.smtpHost || !settings.smtpPort || !settings.smtpUser || !settings.smtpPassword) {
    return null;
  }

  return {
    transporter: nodemailer.createTransport({
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
    }),
    senderAddress: settings.smtpUser
  };
}

// 1. Attendance Alert
export async function sendAttendanceAlert(
  parentEmail: string, 
  studentName: string, 
  date: Date, 
  status: string,
  className: string
) {
  try {
    const config = await getEmailTransporter();
    if (!config) return;

    // Check if attendance notification is turned on
    const settings = await prisma.notificationSetting.findFirst();
    if (!settings?.notifyAttendance) return;

    const formattedDate = new Intl.DateTimeFormat('th-TH', { 
        day: 'numeric', month: 'long', year: 'numeric' 
    }).format(new Date(date));

    const statusText = status === "ABSENT" ? "ขาดเรียน" : "มาสาย";

    await config.transporter.sendMail({
      from: `"ระบบบริหารสถานศึกษา" <${config.senderAddress}>`,
      to: parentEmail,
      subject: `[แจ้งเตือน] การเข้าเรียนของ ${studentName} (${formattedDate})`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
          <h2 style="color: #ef4444;">แจ้งเตือนการเข้าเรียน: ${statusText}</h2>
          <p>เรียน ผู้ปกครองของนักเรียน <strong>${studentName}</strong> (ชั้น ${className})</p>
          <p>ระบบขอเรียนแจ้งให้ทราบว่า ในวันที่ <strong>${formattedDate}</strong> นักเรียนมีสถานะการเข้าเรียนคือ <strong>${statusText}</strong></p>
          <p>หากมีข้อสงสัยประการใด สามารถติดต่อสอบถามครูประจำชั้นได้โดยตรง</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">อีเมลฉบับนี้เป็นการแจ้งเตือนอัตโนมัติจากระบบบริหารสถานศึกษา กรุณาอย่าตอบกลับ</p>
        </div>
      `,
    });
    console.log(`[Email] Attendance alert sent to ${parentEmail} for ${studentName}`);
  } catch (error) {
    console.error("[Email Error] Failed to send attendance alert:", error);
  }
}

// 2. Grade Update
export async function sendGradeUpdate(
  parentEmail: string, 
  studentName: string, 
  subjectName: string, 
  academicYearStr: string,
  totalScore: number,
  gradeLetter: string
) {
  try {
    const config = await getEmailTransporter();
    if (!config) return;

    const settings = await prisma.notificationSetting.findFirst();
    if (!settings?.notifyGrades) return;

    await config.transporter.sendMail({
      from: `"ระบบบริหารสถานศึกษา" <${config.senderAddress}>`,
      to: parentEmail,
      subject: `[ประกาศผลการเรียน] วิชา ${subjectName} ของ ${studentName}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
          <h2 style="color: #3b82f6;">ประกาศผลการเรียน</h2>
          <p>เรียน ผู้ปกครองของนักเรียน <strong>${studentName}</strong></p>
          <p>ระบบได้ทำการบันทึกผลการเรียนในรายวิชา <strong>${subjectName}</strong> (ภาคเรียนที่ ${academicYearStr}) เรียบร้อยแล้ว</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 0;"><strong>คะแนนรวม:</strong> ${totalScore} คะแนน</p>
            <p style="margin: 5px 0 0 0;"><strong>เกรดที่ได้:</strong> <span style="font-size: 18px; color: #2563eb; font-weight: bold;">${gradeLetter}</span></p>
          </div>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">อีเมลฉบับนี้เป็นการแจ้งเตือนอัตโนมัติจากระบบบริหารสถานศึกษา กรุณาอย่าตอบกลับ</p>
        </div>
      `,
    });
    console.log(`[Email] Grade update sent to ${parentEmail} for ${studentName}`);
  } catch (error) {
    console.error("[Email Error] Failed to send grade update:", error);
  }
}

// 3. Announcements
export async function sendAnnouncementAlert(
  toEmails: string[], 
  title: string, 
  content: string, 
  authorName: string
) {
  try {
    if (toEmails.length === 0) return;
    
    const config = await getEmailTransporter();
    if (!config) return;

    const settings = await prisma.notificationSetting.findFirst();
    if (!settings?.notifyAnnouncements) return;

    await config.transporter.sendMail({
      from: `"ระบบบริหารสถานศึกษา" <${config.senderAddress}>`,
      to: config.senderAddress, // Use sender as primary to avoid exposing all emails in 'to'
      bcc: toEmails, // Hide recipient list via BCC
      subject: `[ประกาศ] ${title}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #333; max-width: 600px;">
          <h2 style="color: #6366f1;">📌 ${title}</h2>
          <p style="font-size: 13px; color: #6b7280;">ประกาศโดย: ${authorName}</p>
          <div style="padding: 15px; border-left: 4px solid #6366f1; background-color: #f8fafc; margin-top: 15px;">
            <p style="white-space: pre-wrap; margin: 0;">${content}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">อีเมลฉบับนี้เป็นการแจ้งเตือนอัตโนมัติจากระบบบริหารสถานศึกษา กรุณาอย่าตอบกลับ</p>
        </div>
      `,
    });
    console.log(`[Email] Announcement sent to ${toEmails.length} recipients`);
  } catch (error) {
    console.error("[Email Error] Failed to send announcement:", error);
  }
}

// 4. Payments
export async function sendPaymentReceipt(
  parentEmail: string, 
  studentName: string, 
  feeTypeName: string, 
  amountPaid: number,
  receiptNo: string | null,
  date: Date
) {
  try {
    const config = await getEmailTransporter();
    if (!config) return;

    const settings = await prisma.notificationSetting.findFirst();
    if (!settings?.notifyPayments) return;
    
    const formattedDate = new Intl.DateTimeFormat('th-TH', { 
        day: 'numeric', month: 'long', year: 'numeric' 
    }).format(new Date(date));

    // Format money
    const formatter = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' });
    const formattedAmount = formatter.format(amountPaid);

    await config.transporter.sendMail({
      from: `"ระบบบริหารสถานศึกษา" <${config.senderAddress}>`,
      to: parentEmail,
      subject: `[ใบเสร็จรับเงิน] ${feeTypeName} ของ ${studentName}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #333; max-width: 600px;">
          <h2 style="color: #10b981;">✅ บันทึกการชำระเงินสำเร็จ</h2>
          <p>เรียน ผู้ปกครองของนักเรียน <strong>${studentName}</strong></p>
          <p>ระบบได้รับการชำระเงินสำหรับรายการอ้างอิงของท่านเรียบร้อยแล้ว ดังมีรายละเอียดต่อไปนี้:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">รายการ</th>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${feeTypeName}</td>
            </tr>
            <tr>
              <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">เลขที่ใบเสร็จ</th>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${receiptNo || '-'}</td>
            </tr>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">ยอดชำระ</th>
              <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; color: #10b981;">${formattedAmount}</td>
            </tr>
            <tr>
              <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">วันที่ชำระ</th>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${formattedDate}</td>
            </tr>
          </table>
          
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">อีเมลฉบับนี้เป็นการแจ้งเตือนอัตโนมัติจากระบบบริหารสถานศึกษา กรุณาอย่าตอบกลับ</p>
        </div>
      `,
    });
    console.log(`[Email] Payment receipt sent to ${parentEmail} for ${studentName}`);
  } catch (error) {
    console.error("[Email Error] Failed to send payment receipt:", error);
  }
}
