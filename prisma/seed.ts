/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // ========================
  // School Settings
  // ========================
  await prisma.schoolSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "โรงเรียนตัวอย่าง",
      address: "123 ถนนตัวอย่าง แขวงตัวอย่าง เขตตัวอย่าง กรุงเทพมหานคร 10000",
      phone: "02-123-4567",
      email: "info@school.ac.th",
      website: "https://school.ac.th",
    },
  });

  // ========================
  // Academic Year
  // ========================
  const academicYear = await prisma.academicYear.upsert({
    where: { id: 1 },
    update: {},
    create: {
      year: "2567",
      semester: 2,
      startDate: new Date("2024-11-01"),
      endDate: new Date("2025-03-31"),
      isActive: true,
    },
  });
  console.log("✅ Academic year created");

  // ========================
  // Users
  // ========================
  const adminPassword = await bcrypt.hash("admin1234", 10);
  const teacherPassword = await bcrypt.hash("teacher1234", 10);
  const studentPassword = await bcrypt.hash("student1234", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@school.ac.th" },
    update: {},
    create: {
      email: "admin@school.ac.th",
      passwordHash: adminPassword,
      role: "SUPER_ADMIN",
      name: "ผู้ดูแลระบบ",
      phone: "081-000-0001",
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "admin2@school.ac.th" },
    update: {},
    create: {
      email: "admin2@school.ac.th",
      passwordHash: adminPassword,
      role: "ADMIN",
      name: "นาง สมใจ บริหาร",
      phone: "081-000-0002",
      isActive: true,
    },
  });

  const teacher1User = await prisma.user.upsert({
    where: { email: "teacher@school.ac.th" },
    update: {},
    create: {
      email: "teacher@school.ac.th",
      passwordHash: teacherPassword,
      role: "TEACHER",
      name: "นาย สมศักดิ์ วิชาการ",
      phone: "081-111-2222",
      isActive: true,
    },
  });

  const teacher2User = await prisma.user.upsert({
    where: { email: "teacher2@school.ac.th" },
    update: {},
    create: {
      email: "teacher2@school.ac.th",
      passwordHash: teacherPassword,
      role: "TEACHER",
      name: "นาง วิไล งามเลิศ",
      phone: "085-555-6666",
      isActive: true,
    },
  });

  const studentUser = await prisma.user.upsert({
    where: { email: "student@school.ac.th" },
    update: {},
    create: {
      email: "student@school.ac.th",
      passwordHash: studentPassword,
      role: "STUDENT",
      name: "ด.ช. สมชาย ใจดี",
      isActive: true,
    },
  });

  console.log("✅ Users created");

  // ========================
  // Teachers
  // ========================
  const teacher1 = await prisma.teacher.upsert({
    where: { teacherCode: "T001" },
    update: {},
    create: {
      teacherCode: "T001",
      userId: teacher1User.id,
      firstName: "สมศักดิ์",
      lastName: "วิชาการ",
      gender: "MALE",
      phone: "081-111-2222",
      position: "ครูวิทยาศาสตร์",
      department: "วิทยาศาสตร์",
      qualification: "ปริญญาโท",
      joinDate: new Date("2015-06-01"),
      isActive: true,
    },
  });

  const teacher2 = await prisma.teacher.upsert({
    where: { teacherCode: "T002" },
    update: {},
    create: {
      teacherCode: "T002",
      userId: teacher2User.id,
      firstName: "วิไล",
      lastName: "งามเลิศ",
      gender: "FEMALE",
      phone: "085-555-6666",
      position: "ครูภาษาอังกฤษ",
      department: "ภาษาต่างประเทศ",
      qualification: "ปริญญาโท",
      joinDate: new Date("2018-06-01"),
      isActive: true,
    },
  });

  console.log("✅ Teachers created");

  // ========================
  // Grades (ระดับชั้น)
  // ========================
  const gradeNames = [
    { name: "ป.1", level: 1 }, { name: "ป.2", level: 2 }, { name: "ป.3", level: 3 },
    { name: "ป.4", level: 4 }, { name: "ป.5", level: 5 }, { name: "ป.6", level: 6 },
    { name: "ม.1", level: 7 }, { name: "ม.2", level: 8 }, { name: "ม.3", level: 9 },
  ];

  await Promise.all(
    gradeNames.map((g) =>
      prisma.grade.upsert({
        where: { id: g.level },
        update: {},
        create: { id: g.level, name: g.name, level: g.level },
      })
    )
  );

  // ========================
  // Classrooms
  // ========================
  const classroom1 = await prisma.classroom.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "ม.2/1",
      gradeId: 8,
      academicYearId: academicYear.id,
      teacherId: teacher1.id,
      capacity: 40,
    },
  });

  const classroom2 = await prisma.classroom.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: "ป.5/1",
      gradeId: 5,
      academicYearId: academicYear.id,
      teacherId: teacher2.id,
      capacity: 40,
    },
  });

  console.log("✅ Grades & Classrooms created");

  // ========================
  // Subjects
  // ========================
  const subjectData = [
    { code: "MATH", name: "คณิตศาสตร์" },
    { code: "SCI",  name: "วิทยาศาสตร์" },
    { code: "THAI", name: "ภาษาไทย" },
    { code: "ENG",  name: "ภาษาอังกฤษ" },
    { code: "SOC",  name: "สังคมศึกษา" },
    { code: "PE",   name: "พลศึกษา" },
    { code: "ART",  name: "ศิลปะ" },
  ];

  await Promise.all(
    subjectData.map((s) =>
      prisma.subject.upsert({
        where: { code: s.code },
        update: {},
        create: { ...s, credits: 1, isActive: true },
      })
    )
  );

  console.log("✅ Subjects created");

  // ========================
  // Students
  // ========================
  await prisma.student.upsert({
    where: { studentCode: "67001" },
    update: {},
    create: {
      studentCode: "67001",
      userId: studentUser.id,
      classroomId: classroom1.id,
      firstName: "สมชาย",
      lastName: "ใจดี",
      firstNameEn: "Somchai",
      lastNameEn: "Jaidee",
      dob: new Date("2011-01-15"),
      gender: "MALE",
      bloodType: "O",
      parentName: "นาย สมศักดิ์ ใจดี",
      parentPhone: "081-234-5678",
      parentEmail: "somsak@email.com",
      enrollDate: new Date("2023-06-01"),
      status: "ACTIVE",
    },
  });

  const mockStudents = [
    { code: "67002", firstName: "สมหญิง",  lastName: "รักเรียน", gender: "FEMALE", classId: classroom1.id },
    { code: "67003", firstName: "วิชัย",   lastName: "เก่งกล้า", gender: "MALE",   classId: classroom1.id },
    { code: "67004", firstName: "มานี",    lastName: "มีสุข",    gender: "FEMALE", classId: classroom2.id },
    { code: "67005", firstName: "ธนกร",    lastName: "ทรงคุณ",   gender: "MALE",   classId: classroom1.id },
  ];

  for (const s of mockStudents) {
    await prisma.student.upsert({
      where: { studentCode: s.code },
      update: {},
      create: {
        studentCode: s.code,
        classroomId: s.classId,
        firstName: s.firstName,
        lastName: s.lastName,
        gender: s.gender,
        enrollDate: new Date("2023-06-01"),
        status: "ACTIVE",
      },
    });
  }

  console.log("✅ Students created");

  // ========================
  // Fee Types
  // ========================
  await prisma.feeType.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "ค่าเทอม 2/2567",
      amount: 8500,
      description: "ค่าธรรมเนียมการศึกษาภาคเรียนที่ 2 ปีการศึกษา 2567",
      academicYearId: academicYear.id,
      isActive: true,
    },
  });

  // ========================
  // Announcements
  // ========================
  const announcements = [
    { title: "กำหนดการสอบปลายภาค ภาคเรียนที่ 2/2567", content: "การสอบปลายภาคเรียนที่ 2 จะมีขึ้นในวันที่ 10-15 มีนาคม 2567", type: "URGENT",  isPinned: true },
    { title: "ประชุมผู้ปกครองประจำภาคเรียน",            content: "ขอเชิญผู้ปกครองเข้าร่วมประชุมในวันเสาร์ที่ 2 มีนาคม 2567",     type: "GENERAL", isPinned: false },
    { title: "กิจกรรมวันกีฬาสีประจำปี 2567",            content: "ขอเชิญเข้าร่วมกิจกรรมวันกีฬาสีในวันศุกร์ที่ 8 มีนาคม 2567",   type: "EVENT",   isPinned: false },
  ];

  for (const a of announcements) {
    await prisma.announcement.create({
      data: { ...a, authorId: adminUser.id },
    }).catch(() => {}); // skip duplicates
  }

  console.log("✅ Announcements created");

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📋 Test Accounts:");
  console.log("  Super Admin : admin@school.ac.th    / admin1234");
  console.log("  Admin       : admin2@school.ac.th   / admin1234");
  console.log("  Teacher     : teacher@school.ac.th  / teacher1234");
  console.log("  Student     : student@school.ac.th  / student1234");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
