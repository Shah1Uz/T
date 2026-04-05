const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function clean() {
  console.log("Cleaning up old emoji regions...")
  try {
    const locations = await prisma.location.findMany({
      where: { type: "region" }
    });
    
    for (const loc of locations) {
      // If the region name contains an emoji (like 🟩, 🟨, 🏙️, 🦅 etc), we delete it or update it.
      // Since it's easier to just strip them, let's update.
      const cleanedName = loc.name.replace(/^[\u2B1C-\u2B1F\u27A1\uFE0F\u1F7E5-\u1F7EB\u1F3D9\uFE0F\u1F985\s]+/, '').trim();
      if (cleanedName !== loc.name) {
          await prisma.location.update({
             where: { id: loc.id },
             data: { name: cleanedName }
          })
          console.log(`Updated ${loc.name} -> ${cleanedName}`);
      }
    }
    console.log("Cleanup complete.");
  } catch(e) {
    console.error(e)
  }
}

clean().finally(() => prisma.$disconnect())
