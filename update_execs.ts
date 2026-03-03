import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.teacher.update({
    where: { id: 3 },
    data: { isExecutive: true, executiveOrder: 1 }
  });

  await prisma.teacher.update({
    where: { id: 4 },
    data: { isExecutive: true, executiveOrder: 2 }
  });

  console.log('Updated executive status for teachers 3 and 4.');
}

main().finally(() => prisma.$disconnect());
