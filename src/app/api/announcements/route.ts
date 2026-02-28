import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendAnnouncementAlert } from "@/lib/email";

export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      include: {
        author: { select: { name: true, role: true } },
      },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(announcements);
  } catch (error) {
    console.error("[GET /api/announcements]", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, type, targetRole, isPinned } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลที่จำเป็น" }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        type: type || "GENERAL",
        targetRole: targetRole || null,
        isPinned: isPinned || false,
        authorId: session.user.id,
      },
      include: {
        author: { select: { name: true } }
      }
    });

    // --- Fire Email Async ---
    // Gather recipient emails
    let userQuery: any = { isActive: true };
    if (targetRole) {
      userQuery.role = targetRole;
    }

    const targetUsers = await prisma.user.findMany({
      where: userQuery,
      select: { email: true }
    });

    const emails = targetUsers.map(u => u.email).filter(e => e);
    
    // If targetRole is PARENT or everyone, also include direct parent emails from Student model
    if (!targetRole || targetRole === "PARENT") {
       const students = await prisma.student.findMany({
         where: { status: "ACTIVE" },
         select: { parentEmail: true }
       });
       students.forEach(s => {
          if (s.parentEmail) emails.push(s.parentEmail);
       });
    }

    // Deduplicate
    const uniqueEmails = Array.from(new Set(emails));

    if (uniqueEmails.length > 0 && announcement.author) {
      sendAnnouncementAlert(uniqueEmails, title, content, announcement.author.name)
        .catch(err => console.error("Async email error:", err));
    }

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error("[POST /api/announcements]", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
