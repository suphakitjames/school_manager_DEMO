import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const execs = await prisma.teacher.findMany({
    where: { isExecutive: true },
    include: { user: { select: { avatarUrl: true } } },
    orderBy: { executiveOrder: 'asc' },
  });
  for (const t of execs) {
    console.log(JSON.stringify({
      id: t.id,
      name: `${t.firstName} ${t.lastName}`,
      photoUrl: t.photoUrl,
      avatarUrl: t.user?.avatarUrl,
    }));
  }
}

main().finally(() => prisma.$disconnect());
