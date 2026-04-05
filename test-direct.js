const { PrismaClient } = require('@prisma/client');

const directUrl = "postgresql://neondb_owner:npg_MvPu2cSm5VZK@ep-square-fire-a12i7oq6.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: directUrl,
      },
    },
  });

  try {
    console.log('Attempting to connect to DIRECT database URL...');
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log('Connection successful:', result);
  } catch (error) {
    console.error('Connection failed:');
    console.error(error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
