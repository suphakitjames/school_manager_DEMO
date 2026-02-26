import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const academicYearId = searchParams.get("academicYearId");
    const classroomId = searchParams.get("classroomId");
    const teacherId = searchParams.get("teacherId");

    const whereClause: any = {};
    if (academicYearId) whereClause.academicYearId = Number(academicYearId);
    if (classroomId) whereClause.classroomId = Number(classroomId);
    if (teacherId) whereClause.teacherId = Number(teacherId);

    const schedules = await prisma.schedule.findMany({
      where: whereClause,
      include: {
        subject: { select: { name: true, code: true } },
        teacher: { select: { firstName: true, lastName: true, id: true } },
        classroom: { select: { name: true, id: true } },
      },
      orderBy: [
        { dayOfWeek: "asc" },
        { startTime: "asc" },
      ],
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("[GET /api/schedules]", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลตารางเรียน" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { classroomId, subjectId, teacherId, academicYearId, dayOfWeek, startTime, endTime, roomNumber } = body;

    if (!classroomId || !subjectId || !teacherId || !academicYearId || !dayOfWeek || !startTime || !endTime) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" }, { status: 400 });
    }

    // Checking for overlapping schedules for the teacher
    const teacherConflict = await prisma.schedule.findFirst({
      where: {
        teacherId: Number(teacherId),
        academicYearId: Number(academicYearId),
        dayOfWeek: Number(dayOfWeek),
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    });

    if (teacherConflict) {
      return NextResponse.json({ error: "ครูผู้สอนมีสอนในคาบเวลานี้แล้ว" }, { status: 400 });
    }

    // Checking for overlapping schedules for the classroom
    const classroomConflict = await prisma.schedule.findFirst({
      where: {
        classroomId: Number(classroomId),
        academicYearId: Number(academicYearId),
        dayOfWeek: Number(dayOfWeek),
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    });

    if (classroomConflict) {
      return NextResponse.json({ error: "ห้องเรียนนี้มีเรียนในคาบเวลานี้แล้ว" }, { status: 400 });
    }

    const newSchedule = await prisma.schedule.create({
      data: {
        classroomId: Number(classroomId),
        subjectId: Number(subjectId),
        teacherId: Number(teacherId),
        academicYearId: Number(academicYearId),
        dayOfWeek: Number(dayOfWeek),
        startTime,
        endTime,
        roomNumber: roomNumber || null,
      },
      include: {
        subject: { select: { name: true, code: true } },
        teacher: { select: { firstName: true, lastName: true, id: true } },
        classroom: { select: { name: true, id: true } },
      }
    });

    return NextResponse.json(newSchedule, { status: 201 });
  } catch (error) {
    console.error("[POST /api/schedules]", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างตารางเรียน" }, { status: 500 });
  }
}
