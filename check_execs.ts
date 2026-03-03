import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const allTeachers = await prisma.teacher.findMany();
  console.log('Total teachers:', allTeachers.length);
  const executives = await prisma.teacher.findMany({ where: { isExecutive: true } });
  console.log('Executives:', executives);
}

main().finally(() => prisma.$disconnect());
