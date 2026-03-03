import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const role = searchParams.get("role");

    // Build the where clause based on query params
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }
    
    if (role && role !== "ทุก Role") {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        phone: true,
        teacher: {
          select: {
            isExecutive: true,
            executiveOrder: true,
          }
        }
      },
    });

    // Flatten teacher properties for the frontend
    const formattedUsers = users.map(user => ({
      ...user,
      isExecutive: user.teacher?.isExecutive || false,
      executiveOrder: user.teacher?.executiveOrder || 99,
      teacher: undefined // remove nested object
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role, isActive, isExecutive, executiveOrder } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        isActive: isActive !== undefined ? isActive : true,
        // If role is TEACHER or ADMIN, create the Teacher record
        ...( (role === "TEACHER" || role === "ADMIN") && {
          teacher: {
            create: {
              teacherCode: `T${Date.now()}`, // Temporary fallback code
              firstName: name.split(' ')[0] || name,
              lastName: name.split(' ')[1] || "",
              isExecutive: isExecutive || false,
              executiveOrder: executiveOrder || 99,
            }
          }
        }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
