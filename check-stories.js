const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStories() {
  const now = new Date();
  const allStories = await prisma.story.findMany({
    include: { user: true }
  });
  
  console.log("Total stories in DB:", allStories.length);
  allStories.forEach(s => {
    console.log(`Story ID: ${s.id}, CreatedAt: ${s.createdAt}, ExpiresAt: ${s.expiresAt}, UserBlocked: ${s.user.isBlocked}`);
  });

  const activeStories = await prisma.story.findMany({
    where: {
      expiresAt: { gt: now },
      user: { isBlocked: false }
    }
  });
  console.log("Active stories count:", activeStories.length);
  process.exit(0);
}

checkStories();
