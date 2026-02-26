import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "";

    const teachers = await prisma.teacher.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { firstName: { contains: search } },
                  { lastName: { contains: search } },
                  { teacherCode: { contains: search } },
                ],
              }
            : {},
          department ? { department: { contains: department } } : {},
        ],
      },
      include: {
        user: { select: { email: true, isActive: true } },
        classrooms: true,
      },
      orderBy: { teacherCode: "asc" },
    });

    return NextResponse.json(teachers);
  } catch (error) {
    console.error("[GET /api/teachers]", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      teacherCode, firstName, lastName, gender, phone,
      position, department, qualification, joinDate,
      email, password,
    } = body;

    if (!teacherCode || !firstName || !lastName || !email) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลที่จำเป็น" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password || "teacher1234", 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        role: "TEACHER",
        name: `${firstName} ${lastName}`,
        phone: phone || null,
        isActive: true,
      },
    });

    const teacher = await prisma.teacher.create({
      data: {
        teacherCode,
        userId: user.id,
        firstName,
        lastName,
        gender: gender || null,
        phone: phone || null,
        position: position || null,
        department: department || null,
        qualification: qualification || null,
        joinDate: joinDate ? new Date(joinDate) : null,
        isActive: true,
      },
    });

    return NextResponse.json(teacher, { status: 201 });
  } catch (error: unknown) {
    console.error("[POST /api/teachers]", error);
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "รหัสครูหรืออีเมลซ้ำ" }, { status: 400 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
