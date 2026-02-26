import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 1. Get Top Level Stats
    const totalStudents = await prisma.student.count({ where: { status: "ACTIVE" } });
    const totalTeachers = await prisma.teacher.count({ where: { isActive: true } });
    const totalSubjects = await prisma.subject.count({ where: { isActive: true } });
    
    // Revenue (Sum of all payments for the year)
    // For simplicity, we just sum everything, but ideally constrained by academic year
    const payments = await prisma.paymentRecord.aggregate({
      _sum: { amountPaid: true }
    });
    const totalRevenue = payments._sum.amountPaid?.toNumber() || 0;

    // 2. Attendance Overview (For today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendances = await prisma.attendance.groupBy({
      by: ['status'],
      where: { date: { gte: today } },
      _count: { id: true }
    });

    const attMap = { PRESENT: 0, ABSENT: 0, LATE: 0, LEAVE: 0 };
    let totalAtt = 0;
    attendances.forEach(a => {
      attMap[a.status] = a._count.id;
      totalAtt += a._count.id;
    });

    // 3. Recent Students
    const recentStudents = await prisma.student.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { classroom: true }
    });

    // 4. Recent Announcements
    const announcements = await prisma.announcement.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    // 5. Upcoming Events
    const upcomingEvents = await prisma.event.findMany({
      where: { startDatetime: { gte: today } },
      orderBy: { startDatetime: 'asc' },
      take: 4,
    });

    // 6. Gender Stats
    const maleStudents = await prisma.student.count({ where: { status: 'ACTIVE', gender: 'MALE' } });
    const femaleStudents = await prisma.student.count({ where: { status: 'ACTIVE', gender: 'FEMALE' } });

    return NextResponse.json({
      stats: {
        totalStudents,
        totalTeachers,
        totalSubjects,
        totalRevenue
      },
      attendance: {
        ...attMap,
        total: totalAtt
      },
      recentStudents: recentStudents.map(s => ({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        class: s.classroom?.name || "-",
        date: s.createdAt.toISOString(),
        status: s.status === "ACTIVE" ? "ใหม่" : "อื่นๆ" 
      })),
      announcements: announcements.map(a => ({
        id: a.id,
        title: a.title,
        type: a.type,
        date: a.createdAt.toISOString(),
        isPinned: a.isPinned
      })),
      upcomingEvents: upcomingEvents.map(e => ({
        id: e.id,
        title: e.title,
        date: e.startDatetime.toISOString(),
        location: e.location || 'ไม่ระบุสถานที่',
        color: e.color
      })),
      genderStats: {
        male: maleStudents,
        female: femaleStudents
      }
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
