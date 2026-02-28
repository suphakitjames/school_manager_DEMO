import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendGradeUpdate } from "@/lib/email";

// Helper for Thai Grade Scale
function calculateGrade(score: number): { letter: string; gpa: number } {
  if (score >= 80) return { letter: "4", gpa: 4.0 };
  if (score >= 75) return { letter: "3.5", gpa: 3.5 };
  if (score >= 70) return { letter: "3", gpa: 3.0 };
  if (score >= 65) return { letter: "2.5", gpa: 2.5 };
  if (score >= 60) return { letter: "2", gpa: 2.0 };
  if (score >= 55) return { letter: "1.5", gpa: 1.5 };
  if (score >= 50) return { letter: "1", gpa: 1.0 };
  return { letter: "0", gpa: 0.0 };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classroomId = searchParams.get("classroomId");
    const academicYearId = searchParams.get("academicYearId");

    if (!classroomId || !academicYearId) {
      return NextResponse.json({ error: "Missing classroomId or academicYearId" }, { status: 400 });
    }

    const cid = Number(classroomId);
    const yid = Number(academicYearId);

    // 1. Fetch Students in that classroom
    const students = await prisma.student.findMany({
      where: {
        classroomId: cid,
        status: "ACTIVE",
      },
      orderBy: [
        { firstName: "asc" },
      ]
    });

    const studentIds = students.map(s => s.id);

    // 2. Fetch distinct subjects directly scheduled for this classroom
    const schedules = await prisma.schedule.findMany({
      where: {
        classroomId: cid,
        academicYearId: yid,
      },
      select: {
        subject: true,
      },
      distinct: ['subjectId'],
    });

    const scheduledSubjects = schedules.map(s => s.subject);
    
    // Also, fetch subjects that have grade records but might not be in the current active schedule
    // just in case we need to show historical grades in the same academic year
    const existingRecords = await prisma.gradeRecord.findMany({
      where: {
        studentId: { in: studentIds },
        academicYearId: yid,
      },
      include: {
        subject: true,
      }
    });

    const existingGradeSubjects = existingRecords.map(r => r.subject);

    // Merge unique subjects
    const subjectsMap = new Map();
    [...scheduledSubjects, ...existingGradeSubjects].forEach(sub => {
      if (!subjectsMap.has(sub.id)) {
        subjectsMap.set(sub.id, sub);
      }
    });

    const subjects = Array.from(subjectsMap.values());
    // sort subjects by name or id
    subjects.sort((a, b) => a.name.localeCompare(b.name, 'th'));

    // 3. Return aggregated payload
    // Group records by studentId for easier frontend parsing
    const recordsMap: Record<number, any[]> = {};
    studentIds.forEach(id => recordsMap[id] = []);
    
    existingRecords.forEach(record => {
      recordsMap[record.studentId].push(record);
    });

    return NextResponse.json({
      students,
      subjects,
      records: recordsMap
    });

  } catch (error) {
    console.error("[GET /api/grade-records]", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { classroomId, academicYearId, records } = body;

    if (!classroomId || !academicYearId || !Array.isArray(records)) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    const yid = Number(academicYearId);

    // 1. Fetch info for emails
    const academicYear = await prisma.academicYear.findUnique({ where: { id: yid } });
    const academicYearStr = academicYear ? `${academicYear.semester}/${academicYear.year}` : String(yid);

    const studentIds = Array.from(new Set(records.map((r: any) => Number(r.studentId))));
    const subjectIds = Array.from(new Set(records.map((r: any) => Number(r.subjectId))));

    const [studentsData, subjectsData, existingRecords] = await Promise.all([
      prisma.student.findMany({ where: { id: { in: studentIds } } }),
      prisma.subject.findMany({ where: { id: { in: subjectIds } } }),
      prisma.gradeRecord.findMany({
        where: {
          academicYearId: yid,
          studentId: { in: studentIds },
          subjectId: { in: subjectIds }
        }
      })
    ]);

    const studentMap = new Map(studentsData.map(s => [s.id, s]));
    const subjectMap = new Map(subjectsData.map(s => [s.id, s]));
    const existingMap = new Map(existingRecords.map(r => [`${r.studentId}_${r.subjectId}`, r]));

    const alertsToSend: Array<{parentEmail: string, studentName: string, subjectName: string, academicYearStr: string, totalScore: number, gradeLetter: string}> = [];

    // We use a transaction to upsert all grade records safely
    const operations = records.map((rec: any) => {
      let updateData: any = {};
      const sId = Number(rec.studentId);
      const subId = Number(rec.subjectId);
      
      const parsedScore = parseFloat(rec.totalScore);
      let newGradeLetter = null;

      if (!isNaN(parsedScore)) {
        const { letter, gpa } = calculateGrade(parsedScore);
        newGradeLetter = letter;
        updateData = {
          totalScore: parsedScore,
          gradeLetter: letter,
          gpa: gpa,
        };
      } else if (rec.totalScore === "" || rec.totalScore === null) {
        // Clear logic
        updateData = {
          totalScore: null,
          gradeLetter: null,
          gpa: null,
        };
      }

      // Check if it changed to send alert
      if (newGradeLetter !== null) {
         const existing = existingMap.get(`${sId}_${subId}`);
         if (!existing || existing.totalScore !== parsedScore) {
            const student = studentMap.get(sId);
            const subject = subjectMap.get(subId);
            if (student && student.parentEmail && subject) {
               alertsToSend.push({
                 parentEmail: student.parentEmail,
                 studentName: `${student.firstName} ${student.lastName}`,
                 subjectName: subject.name,
                 academicYearStr,
                 totalScore: parsedScore,
                 gradeLetter: newGradeLetter
               });
            }
         }
      }

      return prisma.gradeRecord.upsert({
        where: {
          studentId_subjectId_academicYearId: {
            studentId: sId,
            subjectId: subId,
            academicYearId: yid,
          }
        },
        update: updateData,
        create: {
          studentId: sId,
          subjectId: subId,
          academicYearId: yid,
          ...updateData
        }
      });
    });

    await prisma.$transaction(operations);

    // Fire emails asynchronously
    if (alertsToSend.length > 0) {
      Promise.all(alertsToSend.map(alert => 
        sendGradeUpdate(alert.parentEmail, alert.studentName, alert.subjectName, alert.academicYearStr, alert.totalScore, alert.gradeLetter)
      )).catch(err => console.error("Async email error:", err));
    }

    return NextResponse.json({ success: true, message: "บันทึกเกรดสำเร็จ" }, { status: 200 });

  } catch (error) {
    console.error("[POST /api/grade-records]", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการบันทึกเกรด" }, { status: 500 });
  }
}
