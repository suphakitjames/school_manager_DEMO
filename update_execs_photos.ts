import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const execs = await prisma.teacher.findMany({
    where: { isExecutive: true }
  });
  
  for (const exec of execs) {
    // Determine a placeholder avatar if none exists
    if (!exec.photoUrl) {
      const initials = `${exec.firstName.charAt(0)}${exec.lastName.charAt(0)}`;
      const placeholder = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&color=fff&size=256`;
      
      await prisma.teacher.update({
        where: { id: exec.id },
        data: { photoUrl: placeholder }
      });
      console.log(`Updated executive ${exec.firstName} with placeholder image.`);
    }
  }
}

main()
  .then(() => console.log("Done updating executive photos."))
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
