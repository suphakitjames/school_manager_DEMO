import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendAttendanceAlert } from "@/lib/email";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classroomId = searchParams.get("classroomId");
    const startDateParam = searchParams.get("startDate"); // Start of the week (Monday)
    const endDateParam = searchParams.get("endDate"); // End of the week (Friday)

    if (!classroomId || !startDateParam || !endDateParam) {
      return NextResponse.json(
        { message: "Missing required parameters (classroomId, startDate, endDate)" },
        { status: 400 }
      );
    }

    const cid = Number(classroomId);
    const startDate = new Date(startDateParam);
    const endDate = new Date(endDateParam);
    endDate.setHours(23, 59, 59, 999);

    // 1. Fetch Students in the Classroom
    const students = await prisma.student.findMany({
      where: { classroomId: cid, status: "ACTIVE" },
      select: {
        id: true,
        studentCode: true,
        firstName: true,
        lastName: true,
      },
      orderBy: { studentCode: "asc" },
    });

    // 2. Fetch Attendance Records for the date range
    const studentIds = students.map((s) => s.id);

    const attendances = await prisma.attendance.findMany({
      where: {
        studentId: { in: studentIds },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // We don't necessarily have scheduleIds tied right now, so we group by date and studentId
    // Transform attendances into a map for fast lookup: map[studentId][dateString] = status
    const attendanceMap: Record<number, Record<string, string>> = {};

    students.forEach((s) => {
      attendanceMap[s.id] = {};
    });

    attendances.forEach((att) => {
      // Format date to YYYY-MM-DD
      const dateKey = att.date.toISOString().split("T")[0];
      attendanceMap[att.studentId][dateKey] = att.status;
    });

    // 3. Return payload
    return NextResponse.json({
      students,
      attendanceMap,
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { message: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { records } = body;
    // records shape: [{ studentId: 1, date: "2024-02-23", status: "PRESENT" }, ...]

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { message: "Invalid payload: records array is missing or empty" },
        { status: 400 }
      );
    }

    // Upsert each record
    // We don't have a scheduleId necessarily, but the unique constraint is [studentId, scheduleId, date]. 
    // Wait, the schema says: @@unique([studentId, scheduleId, date]).
    // Since scheduleId is optional, we need to be careful. In prisma, nulls in unique constraints might act individually.
    // However Prisma now supports upserts on compounds with nulls in some DBs, or we can do findFirst and update/create.
    // Let's use a transaction to safely handle this.
    
    const alertsToSend: Array<{parentEmail: string, studentName: string, date: Date, status: string, className: string}> = [];

    await prisma.$transaction(async (tx) => {
      for (const rec of records) {
        const { studentId, date, status } = rec;
        const targetDate = new Date(date);
        targetDate.setUTCHours(0, 0, 0, 0); // ensure pure date

        const existing = await tx.attendance.findFirst({
          where: {
            studentId,
            date: targetDate,
            scheduleId: null // We assume homeroom attendance for now (no specific schedule)
          },
          include: {
            student: { include: { classroom: true } }
          }
        });

        let shouldAlert = false;
        let studentInfo = null;

        if (existing) {
          await tx.attendance.update({
            where: { id: existing.id },
            data: { status }
          });
          
          // Only alert if the status actually changed to ABSENT or LATE
          if (existing.status !== status && (status === "ABSENT" || status === "LATE")) {
            shouldAlert = true;
            studentInfo = existing.student;
          }
        } else {
          await tx.attendance.create({
            data: {
              studentId,
              date: targetDate,
              status,
              scheduleId: null
            }
          });
          
          if (status === "ABSENT" || status === "LATE") {
            shouldAlert = true;
            studentInfo = await tx.student.findUnique({ 
              where: { id: studentId },
              include: { classroom: true }
            });
          }
        }

        if (shouldAlert && studentInfo && studentInfo.parentEmail) {
          alertsToSend.push({
            parentEmail: studentInfo.parentEmail,
            studentName: `${studentInfo.firstName} ${studentInfo.lastName}`,
            date: targetDate,
            status: status,
            className: studentInfo.classroom?.name || "-"
          });
        }
      }
    });

    // Fire emails asynchronously
    Promise.all(alertsToSend.map(alert => 
      sendAttendanceAlert(alert.parentEmail, alert.studentName, alert.date, alert.status, alert.className)
    )).catch(err => console.error("Async email error:", err));


    return NextResponse.json({ message: "Attendance saved successfully" });
  } catch (error) {
    console.error("Error saving attendance:", error);
    return NextResponse.json(
      { message: "Failed to save attendance" },
      { status: 500 }
    );
  }
}
