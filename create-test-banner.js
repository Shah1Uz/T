const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const banner = await prisma.banner.create({
    data: {
      imageUrl: '/uploads/test-speaker.png',
      title: 'Aqlli kalonka',
      subtext: 'Sizning ovozli yordamchingiz allaqachon sotuvda!',
      buttonText: 'Modelni tanlash',
      bgColor: '#f8f9fa',
      bgPattern: 'grid',
      link: '/home',
      order: 0,
      isActive: true,
      height: '500px'
    }
  });
  console.log('Test banner created:', banner);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
